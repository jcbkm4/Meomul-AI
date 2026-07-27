export type PaymentMethod = "AT_HOTEL" | "CREDIT_CARD" | "DEBIT_CARD" | "KAKAOPAY" | "NAVERPAY" | "TOSS";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "NO_SHOW";
export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "FAILED" | "REFUNDED";
export type CancellationFlow = "GUEST" | "OPERATOR";

export interface PaginationInput {
  page: number;
  limit: number;
  sort: string;
  direction: 1 | -1;
}

export interface MetaCounterDto {
  total: number;
}

export interface BookedRoomInput {
  roomId: string;
  roomType: string;
  quantity: number;
  pricePerNight: number;
  guestName?: string;
}

export interface BookingInput {
  guestId?: string;
  hotelId: string;
  checkInDate: string;
  checkOutDate: string;
  adultCount: number;
  childCount?: number;
  paymentMethod: PaymentMethod;
  rooms: BookedRoomInput[];
  specialRequests?: string;
  earlyCheckIn?: boolean;
  lateCheckOut?: boolean;
}

export interface BookedRoomDto {
  roomId: string;
  roomType: string;
  quantity: number;
  pricePerNight: number;
  guestName?: string | null;
}

export interface BookingDto {
  _id: string;
  bookingCode: string;
  bookingStatus: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  totalPrice: number;
  subtotal: number;
  taxes: number;
  serviceFee: number;
  weekendSurcharge: number;
  earlyCheckInFee: number;
  lateCheckOutFee: number;
  discount: number;
  rooms: BookedRoomDto[];
}

export interface BookingDetailDto extends BookingDto {
  paidAmount: number;
  adultCount: number;
  childCount: number;
  specialRequests?: string | null;
  guestId: string;
  hotelId: string;
  createdAt: string;
  cancellationDate?: string | null;
  cancellationFlow?: CancellationFlow | null;
  cancellationReason?: string | null;
  refundAmount?: number | null;
  refundDate?: string | null;
}

export interface CreateBookingMutationData {
  createBooking: BookingDto;
}

export interface CreateBookingMutationVars {
  input: BookingInput;
}

export interface BookingListItem {
  _id: string;
  bookingCode: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  totalPrice: number;
  checkInDate: string;
  checkOutDate: string;
  createdAt: string;
  guestId: string;
  hotelId: string;
  hotelTitle?: string | null;
  hotelLocation?: string | null;
  hotelType?: string | null;
  hotelImages?: string[] | null;
  rooms: Array<Pick<BookedRoomDto, "roomType" | "quantity" | "guestName">>;
}

export interface BookingsDto {
  list: BookingListItem[];
  metaCounter: MetaCounterDto;
}

export interface GetMyBookingsQueryData {
  getMyBookings: BookingsDto;
}

export interface GetMyBookingsQueryVars {
  input: PaginationInput;
  statusFilter?: BookingStatus;
}

export interface GetAgentBookingsQueryData {
  getAgentBookings: BookingsDto;
}

export interface GetAgentBookingsQueryVars {
  hotelId: string;
  input: PaginationInput;
}

export interface GetAllBookingsAdminQueryData {
  getAllBookingsAdmin: BookingsDto;
}

export interface GetAllBookingsAdminQueryVars {
  input: PaginationInput;
  statusFilter?: BookingStatus;
}

export interface GetBookingQueryData {
  getBooking: BookingDetailDto;
}

export interface GetBookingQueryVars {
  bookingId: string;
}

export interface UpdateBookingStatusMutationData {
  updateBookingStatus: BookingListItem;
}

export interface UpdateBookingStatusMutationVars {
  bookingId: string;
  status: BookingStatus;
}

export interface UpdatePaymentStatusMutationData {
  updatePaymentStatus: BookingListItem;
}

export interface UpdatePaymentStatusMutationVars {
  bookingId: string;
  paymentStatus: PaymentStatus;
  paidAmount: number;
}

export interface CancelBookingMutationData {
  cancelBooking: BookingDetailDto;
}

export interface CancelBookingMutationVars {
  bookingId: string;
  reason: string;
  evidencePhotos?: string[];
}

export interface CancelBookingByOperatorMutationData {
  cancelBookingByOperator: BookingDetailDto;
}

export interface CancelBookingByOperatorMutationVars {
  bookingId: string;
  reason: string;
  evidencePhotos?: string[];
}

export interface BookingGuestCandidate {
  _id: string;
  memberNick: string;
  memberFullName?: string | null;
  memberPhone: string;
}

export interface SearchMembersForBookingQueryData {
  searchMembersForBooking: BookingGuestCandidate[];
}

export interface SearchMembersForBookingQueryVars {
  keyword: string;
  limit?: number;
}
