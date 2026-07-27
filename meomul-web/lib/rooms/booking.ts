import type { DayPriceDto } from "@/types/hotel";

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const parseDateKeyParts = (value: string): { year: number; month: number; day: number } | null => {
  const match = DATE_KEY_PATTERN.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }
  if (month < 1 || month > 12) {
    return null;
  }

  const maxDay = new Date(year, month, 0).getDate();
  if (day < 1 || day > maxDay) {
    return null;
  }

  return { year, month, day };
};

export const formatDateKeyUtc = (value: Date): string => {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateInput = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const toLocalDateFromDateKey = (dateKey: string): Date | null => {
  const parts = parseDateKeyParts(dateKey);
  if (!parts) {
    return null;
  }

  return new Date(parts.year, parts.month - 1, parts.day);
};

export const addDays = (dateInput: string, days: number): string => {
  const parts = parseDateKeyParts(dateInput);
  if (!parts) {
    return dateInput;
  }

  const baseUtc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 0, 0, 0, 0));
  baseUtc.setUTCDate(baseUtc.getUTCDate() + days);
  return formatDateKeyUtc(baseUtc);
};

export const buildStayDates = (checkInDate: string, checkOutDate: string): string[] => {
  if (!checkInDate || !checkOutDate || checkOutDate <= checkInDate) {
    return [];
  }

  const dates: string[] = [];
  let cursor = checkInDate;
  while (cursor < checkOutDate) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return dates;
};

export const isCalendarDayBookable = (day: DayPriceDto | undefined): boolean => {
  if (!day) {
    return false;
  }
  if (day.localEvent === "Closed") {
    return false;
  }
  return (day.availableRooms ?? 0) > 0;
};

export const isStayRangeAvailable = (checkInDate: string, checkOutDate: string, availabilityByDate: Map<string, DayPriceDto>): boolean => {
  const stayDates = buildStayDates(checkInDate, checkOutDate);
  if (stayDates.length === 0) {
    return false;
  }
  return stayDates.every((date) => isCalendarDayBookable(availabilityByDate.get(date)));
};

export const hasStayDatesLoaded = (checkInDate: string, checkOutDate: string, availabilityByDate: Map<string, DayPriceDto>): boolean => {
  const stayDates = buildStayDates(checkInDate, checkOutDate);
  if (stayDates.length === 0) {
    return false;
  }
  return stayDates.every((date) => availabilityByDate.has(date));
};

export const toMonthKey = (value: Date): string => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;

export const formatIsoDate = (value: string): string => {
  if (!value) {
    return "-";
  }
  return value.slice(0, 10);
};

export const formatEnumLabel = (value: string): string =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const formatAmenityLabel = (value: string): string =>
  value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const formatCompactKrw = (price: number): string => {
  if (!Number.isFinite(price)) {
    return "-";
  }
  if (price >= 1_000_000) {
    return `${(price / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  }
  if (price >= 1_000) {
    return `${Math.round(price / 1_000)}k`;
  }
  return `${Math.round(price)}`;
};
