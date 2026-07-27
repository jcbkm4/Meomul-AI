import { BadRequestException } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingStatus, PaymentStatus } from '../../libs/enums/booking.enum';
import { CancellationPolicy } from '../../libs/enums/hotel.enum';
import type { BookingDocument } from '../../libs/types/booking';

/**
 * booking.service.ts is the money path — refunds, cancellation eligibility, and the
 * booking status machine — and had no test coverage at all.
 *
 * These cover the pure decision logic rather than the Mongo-transaction plumbing:
 * that is where a silent arithmetic or boundary mistake costs real money, and it is
 * testable without a database.
 */
describe('BookingService', () => {
	type PrivateAccess = {
		calculateGuestRefundAmount: (booking: BookingDocument, policy: CancellationPolicy) => number;
		calculateOperatorRefundAmount: (booking: BookingDocument) => number;
		validateStatusTransition: (current: BookingStatus, next: BookingStatus) => void;
		ensureBookingIsCancellable: (status: BookingStatus) => void;
		ensureGuestCancellationBeforeCheckIn: (booking: BookingDocument) => void;
		normalizeToUtcDay: (date: Date) => Date;
	};

	const DAY_MS = 24 * 60 * 60 * 1000;

	const createService = (): PrivateAccess => {
		const service = new BookingService(
			{} as never,
			{} as never,
			{} as never,
			{} as never,
			{} as never,
			{} as never,
			{} as never,
			{} as never,
		);
		return service as unknown as PrivateAccess;
	};

	/** A booking checking in `daysAhead` days from now with `paidAmount` already paid. */
	const createBooking = (
		daysAhead: number,
		paidAmount = 100000,
		paymentStatus: PaymentStatus = PaymentStatus.PAID,
	): BookingDocument =>
		({
			checkInDate: new Date(Date.now() + daysAhead * DAY_MS),
			paidAmount,
			paymentStatus,
		}) as unknown as BookingDocument;

	describe('calculateGuestRefundAmount', () => {
		it('refunds nothing when no money was taken', () => {
			const service = createService();

			for (const status of [PaymentStatus.PENDING, PaymentStatus.REFUNDED, PaymentStatus.FAILED]) {
				const booking = createBooking(30, 100000, status);
				expect(service.calculateGuestRefundAmount(booking, CancellationPolicy.FLEXIBLE)).toBe(0);
			}
		});

		it('refunds partially paid bookings against the amount actually paid', () => {
			const service = createService();
			const booking = createBooking(30, 40000, PaymentStatus.PARTIAL);

			expect(service.calculateGuestRefundAmount(booking, CancellationPolicy.FLEXIBLE)).toBe(40000);
		});

		describe('FLEXIBLE — full refund from 1 day out', () => {
			it.each([
				[30, 100000],
				[2, 100000],
				[1, 100000],
			])('%s days before check-in refunds %s', (daysAhead, expected) => {
				const service = createService();

				expect(service.calculateGuestRefundAmount(createBooking(daysAhead), CancellationPolicy.FLEXIBLE)).toBe(
					expected,
				);
			});

			// The documented policy is "same day => 50%", but daysUntilCheckIn is computed
			// with Math.ceil, so any check-in still in the future rounds up to at least 1
			// and takes the full-refund branch. Combined with
			// ensureGuestCancellationBeforeCheckIn — which blocks cancelling once check-in
			// has passed — the 50% branch is unreachable for guests.
			//
			// This test pins the behaviour that actually ships. If the half-refund tier is
			// meant to apply, the day calculation needs to change, not this expectation.
			it('refunds in full even hours before check-in, despite the documented 50% tier', () => {
				const service = createService();
				const twelveHoursOut = createBooking(0.5);

				expect(service.calculateGuestRefundAmount(twelveHoursOut, CancellationPolicy.FLEXIBLE)).toBe(100000);
			});
		});

		describe('MODERATE — full over 7 days, half from 3, nothing under 3', () => {
			it.each([
				[10, 100000],
				[8, 100000],
				[5, 50000],
				[3, 50000],
				[2, 0],
				[0.5, 0],
			])('%s days before check-in refunds %s', (daysAhead, expected) => {
				const service = createService();

				expect(service.calculateGuestRefundAmount(createBooking(daysAhead), CancellationPolicy.MODERATE)).toBe(
					expected,
				);
			});
		});

		describe('STRICT — full over 14 days, half from 7, nothing under 7', () => {
			it.each([
				[20, 100000],
				[15, 100000],
				[10, 50000],
				[7, 50000],
				[6, 0],
				[0.5, 0],
			])('%s days before check-in refunds %s', (daysAhead, expected) => {
				const service = createService();

				expect(service.calculateGuestRefundAmount(createBooking(daysAhead), CancellationPolicy.STRICT)).toBe(expected);
			});
		});

		it('rounds half refunds to whole won rather than emitting fractions', () => {
			const service = createService();
			// 33333 / 2 = 16666.5 — money must never be stored as a fraction.
			const booking = createBooking(5, 33333, PaymentStatus.PAID);

			const refund = service.calculateGuestRefundAmount(booking, CancellationPolicy.MODERATE);

			expect(refund).toBe(16667);
			expect(Number.isInteger(refund)).toBe(true);
		});

		it('never refunds more than was paid', () => {
			const service = createService();

			for (const policy of Object.values(CancellationPolicy)) {
				for (const daysAhead of [0.5, 3, 7, 15, 40]) {
					const booking = createBooking(daysAhead, 100000);
					expect(service.calculateGuestRefundAmount(booking, policy)).toBeLessThanOrEqual(100000);
				}
			}
		});
	});

	describe('calculateOperatorRefundAmount', () => {
		it('refunds everything paid, regardless of how close check-in is', () => {
			const service = createService();

			// The guest is not at fault for an operational cancellation, so the
			// time-based penalties must not apply.
			expect(service.calculateOperatorRefundAmount(createBooking(0.1, 100000))).toBe(100000);
			expect(service.calculateOperatorRefundAmount(createBooking(0.1, 40000, PaymentStatus.PARTIAL))).toBe(40000);
		});

		it('refunds nothing when no money was taken', () => {
			const service = createService();

			expect(service.calculateOperatorRefundAmount(createBooking(5, 100000, PaymentStatus.PENDING))).toBe(0);
		});
	});

	describe('validateStatusTransition', () => {
		it.each([
			[BookingStatus.PENDING, BookingStatus.CONFIRMED],
			[BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN],
			[BookingStatus.CONFIRMED, BookingStatus.NO_SHOW],
			[BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT],
		])('allows %s -> %s', (from, to) => {
			const service = createService();

			expect(() => service.validateStatusTransition(from, to)).not.toThrow();
		});

		it.each([
			// Skipping confirmation would let an unpaid booking be checked in.
			[BookingStatus.PENDING, BookingStatus.CHECKED_IN],
			// A completed stay must not be reopened or retroactively voided.
			[BookingStatus.CHECKED_OUT, BookingStatus.CHECKED_IN],
			[BookingStatus.CHECKED_OUT, BookingStatus.CANCELLED],
			// Terminal states are terminal.
			[BookingStatus.CANCELLED, BookingStatus.CONFIRMED],
			[BookingStatus.NO_SHOW, BookingStatus.CHECKED_IN],
			// Checked-in guests cannot be marked a no-show.
			[BookingStatus.CHECKED_IN, BookingStatus.NO_SHOW],
		])('rejects %s -> %s', (from, to) => {
			const service = createService();

			expect(() => service.validateStatusTransition(from, to)).toThrow(BadRequestException);
		});

		it('rejects a transition to the same status', () => {
			const service = createService();

			expect(() => service.validateStatusTransition(BookingStatus.CONFIRMED, BookingStatus.CONFIRMED)).toThrow(
				BadRequestException,
			);
		});
	});

	describe('ensureBookingIsCancellable', () => {
		it('allows cancelling pending and confirmed bookings', () => {
			const service = createService();

			expect(() => service.ensureBookingIsCancellable(BookingStatus.PENDING)).not.toThrow();
			expect(() => service.ensureBookingIsCancellable(BookingStatus.CONFIRMED)).not.toThrow();
		});

		it.each([BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT, BookingStatus.CANCELLED, BookingStatus.NO_SHOW])(
			'rejects cancelling a %s booking',
			(status) => {
				const service = createService();

				expect(() => service.ensureBookingIsCancellable(status)).toThrow(BadRequestException);
			},
		);
	});

	describe('ensureGuestCancellationBeforeCheckIn', () => {
		it('allows cancellation while check-in is still ahead', () => {
			const service = createService();

			expect(() => service.ensureGuestCancellationBeforeCheckIn(createBooking(1))).not.toThrow();
		});

		it('rejects cancellation once check-in time has passed', () => {
			const service = createService();

			expect(() => service.ensureGuestCancellationBeforeCheckIn(createBooking(-1))).toThrow(BadRequestException);
		});
	});

	describe('normalizeToUtcDay', () => {
		it('strips the time component without shifting the date', () => {
			const service = createService();

			const normalized = service.normalizeToUtcDay(new Date('2026-03-15T18:45:12.345Z'));

			expect(normalized.toISOString()).toBe('2026-03-15T00:00:00.000Z');
		});

		it('is idempotent', () => {
			const service = createService();
			const once = service.normalizeToUtcDay(new Date('2026-03-15T18:45:12.345Z'));

			expect(service.normalizeToUtcDay(once).toISOString()).toBe(once.toISOString());
		});
	});
});
