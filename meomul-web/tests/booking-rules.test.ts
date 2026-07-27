import { describe, expect, it } from "vitest";
import {
  diffNights,
  formatTodayDate,
  getBookingValidationMessage,
  isDateKey,
  parseNonNegativeInt,
  parsePositiveInt,
  resolveEffectiveNightPrice,
} from "../lib/booking/booking-rules";

describe("booking-rules", () => {
  describe("parsePositiveInt", () => {
    it("parses valid positive integer strings", () => {
      expect(parsePositiveInt("1")).toBe(1);
      expect(parsePositiveInt("27")).toBe(27);
    });

    it("returns null for invalid values", () => {
      expect(parsePositiveInt("")).toBeNull();
      expect(parsePositiveInt("0")).toBeNull();
      expect(parsePositiveInt("-1")).toBeNull();
      expect(parsePositiveInt("2.5")).toBeNull();
      expect(parsePositiveInt("abc")).toBeNull();
    });
  });

  describe("parseNonNegativeInt", () => {
    it("accepts zero and positive integer", () => {
      expect(parseNonNegativeInt("0")).toBe(0);
      expect(parseNonNegativeInt("2")).toBe(2);
    });

    it("returns null for invalid values", () => {
      expect(parseNonNegativeInt("")).toBeNull();
      expect(parseNonNegativeInt("-1")).toBeNull();
      expect(parseNonNegativeInt("1.5")).toBeNull();
      expect(parseNonNegativeInt("abc")).toBeNull();
    });
  });

  describe("diffNights", () => {
    it("returns 0 when dates are missing", () => {
      expect(diffNights("", "")).toBe(0);
      expect(diffNights("2026-02-24", "")).toBe(0);
    });

    it("calculates nights correctly", () => {
      expect(diffNights("2026-02-24", "2026-02-25")).toBe(1);
      expect(diffNights("2026-02-24", "2026-02-28")).toBe(4);
    });
  });

  describe("date helpers", () => {
    it("validates date key format", () => {
      expect(isDateKey("2026-02-24")).toBe(true);
      expect(isDateKey("2026/02/24")).toBe(false);
      expect(isDateKey("24-02-2026")).toBe(false);
    });

    it("formats today from provided date", () => {
      expect(formatTodayDate(new Date("2026-02-24T12:00:00.000Z"))).toBe("2026-02-24");
    });
  });

  describe("resolveEffectiveNightPrice", () => {
    it("prioritizes lock price when allowed", () => {
      const result = resolveEffectiveNightPrice({
        basePrice: 100000,
        allowPriceLock: true,
        lockedPrice: 82000,
        lastMinuteDeal: { isActive: true, dealPrice: 90000 },
      });

      expect(result).toEqual({ price: 82000, source: "PRICE_LOCK" });
    });

    it("uses deal for staff when lock is not allowed", () => {
      const result = resolveEffectiveNightPrice({
        basePrice: 100000,
        allowPriceLock: false,
        lockedPrice: 82000,
        lastMinuteDeal: { isActive: true, dealPrice: 90000 },
      });

      expect(result).toEqual({ price: 90000, source: "LAST_MINUTE_DEAL" });
    });

    it("falls back to base rate", () => {
      const result = resolveEffectiveNightPrice({
        basePrice: 100000,
        allowPriceLock: true,
        lockedPrice: null,
        lastMinuteDeal: null,
      });

      expect(result).toEqual({ price: 100000, source: "BASE_RATE" });
    });
  });

  describe("getBookingValidationMessage", () => {
    const baseInput = {
      hotelId: "hotel-1",
      roomId: "room-1",
      canCreateBooking: true,
      isStaffCreator: false,
      targetGuestId: "",
      hasHotel: true,
      hasRoom: true,
      guestCount: 2,
      childCount: 0,
      quantity: 1,
      roomStatus: "AVAILABLE",
      roomMaxOccupancy: 2,
      roomAvailableRooms: 3,
      checkInDate: "2026-02-25",
      checkOutDate: "2026-02-27",
      todayDate: "2026-02-24",
      nights: 2,
    } as const;

    it("returns null when input is valid", () => {
      expect(getBookingValidationMessage(baseInput)).toBeNull();
    });

    it("rejects missing staff guest", () => {
      expect(
        getBookingValidationMessage({
          ...baseInput,
          isStaffCreator: true,
          targetGuestId: "",
        }),
      ).toContain("target guestId");
    });

    it("rejects non-available room", () => {
      expect(
        getBookingValidationMessage({
          ...baseInput,
          roomStatus: "MAINTENANCE",
        }),
      ).toContain("cannot be booked");
    });

    it("rejects capacity overflow", () => {
      expect(
        getBookingValidationMessage({
          ...baseInput,
          guestCount: 5,
          childCount: 0,
          roomMaxOccupancy: 2,
          quantity: 2,
        }),
      ).toContain("exceed room capacity");
    });

    it("rejects when adults + children exceed capacity", () => {
      expect(
        getBookingValidationMessage({
          ...baseInput,
          guestCount: 2,
          childCount: 2,
          roomMaxOccupancy: 3,
          quantity: 1,
        }),
      ).toContain("exceed room capacity");
    });

    it("rejects past check-in", () => {
      expect(
        getBookingValidationMessage({
          ...baseInput,
          checkInDate: "2026-02-20",
          checkOutDate: "2026-02-22",
          nights: 2,
        }),
      ).toContain("cannot be in the past");
    });
  });
});
