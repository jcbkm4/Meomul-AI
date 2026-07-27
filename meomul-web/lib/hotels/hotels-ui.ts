import type { HotelLocation } from "@/types/hotel";

const SHORT_MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const isIsoDateInput = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);

const createUtcDate = (year: number, monthIndex: number, day: number): Date => new Date(Date.UTC(year, monthIndex, day));

const parseIsoDate = (value: string): Date | null => {
  if (!isIsoDateInput(value)) {
    return null;
  }

  const [yearText, monthText, dayText] = value.split("-");
  return createUtcDate(Number(yearText), Number(monthText) - 1, Number(dayText));
};

export const formatHotelLocationLabel = (value: HotelLocation | string): string =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const formatCompactHotelDate = (value: string): string => {
  const parsed = parseIsoDate(value);
  if (!parsed) {
    return "";
  }

  const month = SHORT_MONTH_LABELS[parsed.getUTCMonth()] ?? "";
  return `${month} ${parsed.getUTCDate()}`;
};

export const formatHotelDateSummary = (checkIn: string, checkOut: string): string => {
  const start = formatCompactHotelDate(checkIn);
  const end = formatCompactHotelDate(checkOut);

  if (start && end) {
    return `${start} - ${end}`;
  }
  if (start) {
    return `From ${start}`;
  }
  if (end) {
    return `Until ${end}`;
  }

  return "Add dates";
};

export const formatHotelGuestSummary = (value: string): string =>
  value ? `${value} guest${value === "1" ? "" : "s"}` : "Add guests";

export const formatStayCountLabel = (total: number, noun = "stay"): string =>
  `${total.toLocaleString()} ${noun}${total === 1 ? "" : "s"}`;

export const formatHotelsPaginationSummary = (page: number, totalPages: number, total: number): string =>
  `Page ${page} of ${totalPages} · ${formatStayCountLabel(total, "hotel")}`;

export const buildHotelsArraySummary = (items: string[], label: string): string => {
  if (items.length === 0) {
    return "";
  }

  if (items.length <= 2) {
    return `${label}: ${items.join(", ")}`;
  }

  return `${label}: ${items.slice(0, 2).join(", ")} +${items.length - 2}`;
};
