export type EffectiveRateSource = "PRICE_LOCK" | "LAST_MINUTE_DEAL" | "BASE_RATE";

export interface ResolveEffectiveNightPriceInput {
  basePrice: number;
  allowPriceLock: boolean;
  lockedPrice?: number | null;
  lastMinuteDeal?: {
    isActive: boolean;
    dealPrice: number;
    validUntil?: string;
  } | null;
}

export interface BookingValidationInput {
  hotelId: string;
  roomId: string;
  canCreateBooking: boolean;
  isStaffCreator: boolean;
  targetGuestId: string;
  hasHotel: boolean;
  hasRoom: boolean;
  guestCount: number | null;
  childCount?: number | null;
  quantity: number | null;
  roomStatus?: string;
  roomMaxOccupancy?: number;
  roomAvailableRooms?: number;
  checkInDate: string;
  checkOutDate: string;
  todayDate: string;
  nights: number;
}

export const parsePositiveInt = (value: string): number | null => {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

export const parseNonNegativeInt = (value: string): number | null => {
  if (value === "") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
};

export const diffNights = (checkInDate: string, checkOutDate: string): number => {
  if (!checkInDate || !checkOutDate) {
    return 0;
  }

  const checkIn = new Date(`${checkInDate}T00:00:00.000Z`);
  const checkOut = new Date(`${checkOutDate}T00:00:00.000Z`);
  return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
};

export const toDateTime = (date: string): string => `${date}T00:00:00.000Z`;

export const isDateKey = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);

export const formatTodayDate = (base = new Date()): string => {
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, "0");
  const day = String(base.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const resolveEffectiveNightPrice = (input: ResolveEffectiveNightPriceInput): { price: number; source: EffectiveRateSource } => {
  if (input.allowPriceLock && input.lockedPrice && input.lockedPrice > 0) {
    return { price: input.lockedPrice, source: "PRICE_LOCK" };
  }
  if (input.lastMinuteDeal?.isActive) {
    if (input.lastMinuteDeal.validUntil) {
      const expiresAt = new Date(input.lastMinuteDeal.validUntil).getTime();
      if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
        return { price: input.basePrice, source: "BASE_RATE" };
      }
    }
    return { price: input.lastMinuteDeal.dealPrice, source: "LAST_MINUTE_DEAL" };
  }
  return { price: input.basePrice, source: "BASE_RATE" };
};

export const getBookingValidationMessage = (input: BookingValidationInput): string | null => {
  if (!input.hotelId || !input.roomId) {
    return "Missing booking context.";
  }
  if (!input.canCreateBooking) {
    return "Your role cannot create booking with current backend policy.";
  }
  if (!input.hasHotel || !input.hasRoom) {
    return "Loading booking context...";
  }
  if (input.isStaffCreator && !input.targetGuestId.trim()) {
    return "For staff booking, target guestId is required.";
  }
  if (!input.guestCount || !input.quantity) {
    return "Guest count and room quantity must be positive integers.";
  }
  if (input.childCount != null && input.childCount < 0) {
    return "Child count cannot be negative.";
  }
  if (input.roomStatus !== "AVAILABLE") {
    return `Room is currently ${(input.roomStatus ?? "unavailable").toLowerCase()} and cannot be booked.`;
  }
  if (typeof input.roomAvailableRooms === "number" && input.quantity > input.roomAvailableRooms) {
    return `Only ${input.roomAvailableRooms} room(s) currently available.`;
  }
  const totalGuests = input.guestCount + (input.childCount ?? 0);
  if (typeof input.roomMaxOccupancy === "number" && totalGuests > input.roomMaxOccupancy * input.quantity) {
    return `Total guests exceed room capacity (${input.roomMaxOccupancy} x ${input.quantity} room(s)).`;
  }
  if (!input.checkInDate || !input.checkOutDate) {
    return "Please select check-in and check-out dates.";
  }
  if (input.checkInDate < input.todayDate) {
    return "Check-in date cannot be in the past.";
  }
  if (input.nights < 1) {
    return "Check-out date must be after check-in date.";
  }
  return null;
};
