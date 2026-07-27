type DateInput = Date | string | number;

const NUMBER_FORMATTER = new Intl.NumberFormat("ko-KR");
const DATE_FORMATTER_KST = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const DATETIME_FORMATTER_KST = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const toDate = (value: DateInput): Date | null => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
};

const getParts = (formatter: Intl.DateTimeFormat, date: Date): Record<string, string> => {
  return formatter.formatToParts(date).reduce<Record<string, string>>((accumulator, part) => {
    if (part.type !== "literal") {
      accumulator[part.type] = part.value;
    }
    return accumulator;
  }, {});
};

export const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return NUMBER_FORMATTER.format(value);
};

export const formatCurrencyKrw = (value: number): string => `₩ ${formatNumber(value)}`;

export const formatDateKst = (value: DateInput): string => {
  const date = toDate(value);
  if (!date) {
    return "-";
  }

  const parts = getParts(DATE_FORMATTER_KST, date);
  return `${parts.year ?? "0000"}-${parts.month ?? "00"}-${parts.day ?? "00"}`;
};

export const timeAgo = (value: DateInput): string => {
  const date = toDate(value);
  if (!date) return "—";
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export const formatDateTimeKst = (value: DateInput): string => {
  const date = toDate(value);
  if (!date) {
    return "-";
  }

  const parts = getParts(DATETIME_FORMATTER_KST, date);
  return `${parts.year ?? "0000"}-${parts.month ?? "00"}-${parts.day ?? "00"} ${parts.hour ?? "00"}:${
    parts.minute ?? "00"
  }:${parts.second ?? "00"}`;
};
