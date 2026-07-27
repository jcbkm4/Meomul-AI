import { gql } from "@apollo/client";

const BOOKING_LIST_FIELDS = gql`
  fragment BookingListFields on BookingDto {
    _id
    bookingCode
    bookingStatus
    paymentStatus
    paidAmount
    totalPrice
    checkInDate
    checkOutDate
    createdAt
    guestId
    hotelId
    hotelTitle
    hotelLocation
    hotelType
    hotelImages
    rooms {
      roomType
      quantity
      guestName
    }
  }
`;

const BOOKING_DETAIL_FIELDS = gql`
  fragment BookingDetailFields on BookingDto {
    _id
    bookingCode
    bookingStatus
    paymentMethod
    paymentStatus
    paidAmount
    totalPrice
    subtotal
    taxes
    serviceFee
    weekendSurcharge
    earlyCheckInFee
    lateCheckOutFee
    discount
    checkInDate
    checkOutDate
    nights
    adultCount
    childCount
    specialRequests
    guestId
    hotelId
    createdAt
    cancellationDate
    cancellationFlow
    cancellationReason
    refundAmount
    refundDate
    rooms {
      roomId
      roomType
      quantity
      pricePerNight
      guestName
    }
  }
`;

export const SEARCH_MEMBERS_FOR_BOOKING_QUERY = gql`
  query SearchMembersForBooking($keyword: String!, $limit: Int) {
    searchMembersForBooking(keyword: $keyword, limit: $limit) {
      _id
      memberNick
      memberFullName
      memberPhone
    }
  }
`;

export const GET_MY_BOOKINGS_QUERY = gql`
  query GetMyBookings($input: PaginationInput!, $statusFilter: BookingStatus) {
    getMyBookings(input: $input, statusFilter: $statusFilter) {
      list {
        ...BookingListFields
      }
      metaCounter {
        total
      }
    }
  }
  ${BOOKING_LIST_FIELDS}
`;

export const GET_AGENT_BOOKINGS_QUERY = gql`
  query GetAgentBookings($hotelId: String!, $input: PaginationInput!) {
    getAgentBookings(hotelId: $hotelId, input: $input) {
      list {
        ...BookingListFields
      }
      metaCounter {
        total
      }
    }
  }
  ${BOOKING_LIST_FIELDS}
`;

export const GET_ALL_BOOKINGS_ADMIN_QUERY = gql`
  query GetAllBookingsAdmin($input: PaginationInput!, $statusFilter: BookingStatus) {
    getAllBookingsAdmin(input: $input, statusFilter: $statusFilter) {
      list {
        ...BookingListFields
      }
      metaCounter {
        total
      }
    }
  }
  ${BOOKING_LIST_FIELDS}
`;

export const GET_BOOKING_QUERY = gql`
  query GetBooking($bookingId: String!) {
    getBooking(bookingId: $bookingId) {
      ...BookingDetailFields
    }
  }
  ${BOOKING_DETAIL_FIELDS}
`;

export const UPDATE_BOOKING_STATUS_MUTATION = gql`
  mutation UpdateBookingStatus($bookingId: String!, $status: BookingStatus!) {
    updateBookingStatus(bookingId: $bookingId, status: $status) {
      ...BookingListFields
    }
  }
  ${BOOKING_LIST_FIELDS}
`;

export const CANCEL_BOOKING_MUTATION = gql`
  mutation CancelBooking($bookingId: String!, $reason: String!, $evidencePhotos: [String!]) {
    cancelBooking(bookingId: $bookingId, reason: $reason, evidencePhotos: $evidencePhotos) {
      ...BookingDetailFields
    }
  }
  ${BOOKING_DETAIL_FIELDS}
`;

export const CANCEL_BOOKING_BY_OPERATOR_MUTATION = gql`
  mutation CancelBookingByOperator($bookingId: String!, $reason: String!, $evidencePhotos: [String!]) {
    cancelBookingByOperator(bookingId: $bookingId, reason: $reason, evidencePhotos: $evidencePhotos) {
      ...BookingDetailFields
    }
  }
  ${BOOKING_DETAIL_FIELDS}
`;

export const UPDATE_PAYMENT_STATUS_MUTATION = gql`
  mutation UpdatePaymentStatus($bookingId: String!, $paymentStatus: PaymentStatus!, $paidAmount: Float!) {
    updatePaymentStatus(bookingId: $bookingId, paymentStatus: $paymentStatus, paidAmount: $paidAmount) {
      ...BookingListFields
    }
  }
  ${BOOKING_LIST_FIELDS}
`;

export const CREATE_BOOKING_MUTATION = gql`
  mutation CreateBooking($input: BookingInput!) {
    createBooking(input: $input) {
      _id
      bookingCode
      bookingStatus
      paymentMethod
      paymentStatus
      checkInDate
      checkOutDate
      nights
      subtotal
      taxes
      serviceFee
      weekendSurcharge
      earlyCheckInFee
      lateCheckOutFee
      discount
      totalPrice
      rooms {
        roomId
        roomType
        quantity
        pricePerNight
        guestName
      }
    }
  }
`;
