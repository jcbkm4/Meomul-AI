import { DayButton as DefaultDayButton, type DayButtonProps } from "react-day-picker";
import { useI18n } from "@/lib/i18n/provider";
import { formatCompactKrw, formatDateInput, isCalendarDayBookable } from "@/lib/rooms/booking";
import type { DayPriceDto } from "@/types/hotel";

interface PriceDayButtonProps extends DayButtonProps {
  price?: DayPriceDto;
  onHover?: (dateKey: string | null) => void;
}

export function PriceDayButton({ day, modifiers, price, onHover, ...buttonProps }: PriceDayButtonProps) {
  const { t } = useI18n();
  const dateKey = formatDateInput(day.date);
  const isUnavailable = Boolean(price) && !isCalendarDayBookable(price);
  const priceLabel = !price ? t("price_day_na") : isUnavailable ? t("price_day_sold") : `₩${formatCompactKrw(price.price)}`;
  const isSelected = Boolean(modifiers.selected);
  const isRangeStart = Boolean(modifiers.range_start);
  const isRangeEnd = Boolean(modifiers.range_end);
  const isRangeMiddle = Boolean(modifiers.range_middle);
  const isDisabled = Boolean(modifiers.disabled);
  const isSingleSelected = isSelected && !isRangeStart && !isRangeEnd && !isRangeMiddle;
  const isEdgeSelected = isSingleSelected || isRangeStart || isRangeEnd;
  const isMiddleSelected = isRangeMiddle && !isEdgeSelected;
  const isInSelectedRange = isEdgeSelected || isMiddleSelected;
  const isBookable = !isUnavailable && !isDisabled;

  return (
    <DefaultDayButton
      {...buttonProps}
      day={day}
      modifiers={modifiers}
      className={[
        buttonProps.className,
        "group inline-flex flex-col items-center justify-center gap-0 overflow-hidden",
        isEdgeSelected ? "!border-indigo-600 !bg-indigo-600 !text-white shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]" : "",
        isMiddleSelected ? "!border-slate-300 !bg-slate-200 !text-slate-900" : "",
        !isInSelectedRange && isUnavailable ? "border-slate-200 bg-slate-100 text-slate-400" : "",
        !isInSelectedRange && isBookable ? "hover:border-slate-500 hover:bg-slate-50 hover:shadow-sm" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={(event) => {
        buttonProps.onMouseEnter?.(event);
        onHover?.(dateKey);
      }}
      onMouseLeave={(event) => {
        buttonProps.onMouseLeave?.(event);
      }}
      onFocus={(event) => {
        buttonProps.onFocus?.(event);
        onHover?.(dateKey);
      }}
      onBlur={(event) => {
        buttonProps.onBlur?.(event);
      }}
    >
      <span
        className={`block text-[11px] leading-none font-bold transition ${
          isEdgeSelected ? "text-white drop-shadow-sm" : isMiddleSelected ? "text-slate-900" : "text-slate-700"
        }`}
      >
        {day.date.getDate()}
      </span>
      <span
        className={[
          "inline-flex min-w-7 items-center justify-center rounded-full px-1 py-[1px] text-[8px] leading-none font-bold transition",
          isUnavailable ? "bg-slate-300/70 text-slate-500" : "",
          !isUnavailable && isEdgeSelected ? "border border-indigo-200/60 bg-indigo-400/35 text-white" : "",
          !isUnavailable && isMiddleSelected ? "border border-slate-400 bg-slate-300 text-slate-800" : "",
          !isUnavailable && !isInSelectedRange ? "bg-slate-900/10 text-slate-600" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {priceLabel}
      </span>
    </DefaultDayButton>
  );
}
