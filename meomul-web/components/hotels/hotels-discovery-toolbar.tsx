import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HotelsDatePanel } from "@/components/hotels/toolbar/hotels-date-panel";
import { HotelsGuestsPanel } from "@/components/hotels/toolbar/hotels-guests-panel";
import { HotelsLocationPanel } from "@/components/hotels/toolbar/hotels-location-panel";
import { HotelsQuickFiltersRow } from "@/components/hotels/toolbar/hotels-quick-filters-row";
import { HotelsSearchRow } from "@/components/hotels/toolbar/hotels-search-row";
import type { HotelsPageQueryState } from "@/lib/hooks/use-hotels-page-query-state";
import {
  formatCompactHotelDateLocalized,
  formatHotelDateSummaryLocalized,
  formatHotelGuestSummaryLocalized,
  getHotelLocationLabelLocalized,
} from "@/lib/hotels/hotels-i18n";
import { useI18n } from "@/lib/i18n/provider";
import type { HotelLocation } from "@/types/hotel";

interface HotelsDiscoveryToolbarProps {
  state: HotelsPageQueryState;
  total: number;
  loading: boolean;
  onOpenFilters: () => void;
}

type OpenPanel = "location" | "dates" | "guests" | null;

interface CalendarCell {
  date: Date | null;
  key: string;
}

const isIsoDateInput = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value);

const createUtcDate = (year: number, monthIndex: number, day: number): Date =>
  new Date(Date.UTC(year, monthIndex, day));

const parseIsoDate = (value: string): Date | null => {
  if (!isIsoDateInput(value)) {
    return null;
  }

  const [yearText, monthText, dayText] = value.split("-");
  return createUtcDate(
    Number(yearText),
    Number(monthText) - 1,
    Number(dayText),
  );
};

const toIsoDate = (value: Date): string => {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const startOfUtcMonth = (value: Date): Date =>
  createUtcDate(value.getUTCFullYear(), value.getUTCMonth(), 1);

const addUtcMonths = (value: Date, amount: number): Date =>
  createUtcDate(value.getUTCFullYear(), value.getUTCMonth() + amount, 1);

const isSameUtcDay = (first: Date | null, second: Date | null): boolean =>
  Boolean(first && second && first.getTime() === second.getTime());

const isBeforeUtcDay = (first: Date, second: Date): boolean =>
  first.getTime() < second.getTime();

const parseGuestCount = (value: string): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 2;
};

const getInitialVisibleMonth = (checkInInput: string): Date => {
  const selected = parseIsoDate(checkInInput);
  if (selected) {
    return startOfUtcMonth(selected);
  }

  const now = new Date();
  return createUtcDate(now.getFullYear(), now.getMonth(), 1);
};

const buildMonthCells = (monthStart: Date): CalendarCell[] => {
  const year = monthStart.getUTCFullYear();
  const month = monthStart.getUTCMonth();
  const firstWeekday = monthStart.getUTCDay();
  const daysInCurrentMonth = createUtcDate(year, month + 1, 0).getUTCDate();

  const cells: CalendarCell[] = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push({
      date: null,
      key: `leading-${year}-${month}-${index}`,
    });
  }

  for (let day = 1; day <= daysInCurrentMonth; day += 1) {
    cells.push({
      date: createUtcDate(year, month, day),
      key: `day-${year}-${month}-${day}`,
    });
  }

  while (cells.length < 42) {
    cells.push({
      date: null,
      key: `trailing-${year}-${month}-${cells.length}`,
    });
  }

  return cells;
};

const getNightCount = (checkIn: Date | null, checkOut: Date | null): number => {
  if (!checkIn || !checkOut) {
    return 0;
  }

  return Math.round(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
  );
};

export function HotelsDiscoveryToolbar({
  state,
  total,
  loading,
  onOpenFilters,
}: HotelsDiscoveryToolbarProps) {
  const { locale, t } = useI18n();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const desktopPanelRef = useRef<HTMLDivElement | null>(null);
  const mobilePanelRef = useRef<HTMLDivElement | null>(null);
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [draftText, setDraftText] = useState(state.textInput);
  const [draftCheckIn, setDraftCheckIn] = useState(state.checkInInput);
  const [draftCheckOut, setDraftCheckOut] = useState(state.checkOutInput);
  const [draftGuests, setDraftGuests] = useState<number>(
    parseGuestCount(state.guestCountInput),
  );
  const [visibleMonthStart, setVisibleMonthStart] = useState<Date | null>(null);
  const [todayDate, setTodayDate] = useState<Date | null>(null);

  useEffect(() => {
    setDraftText(state.textInput);
  }, [state.textInput]);

  useEffect(() => {
    const now = new Date();
    setTodayDate(
      createUtcDate(now.getFullYear(), now.getMonth(), now.getDate()),
    );
  }, []);

  useEffect(() => {
    if (!openPanel) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const targetNode = event.target as Node;

      if (
        mobilePanelRef.current?.contains(targetNode) ||
        desktopPanelRef.current?.contains(targetNode)
      ) {
        return;
      }

      if (!containerRef.current) {
        return;
      }

      if (!containerRef.current.contains(targetNode)) {
        setOpenPanel(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [openPanel]);

  useEffect(() => {
    if (!openPanel) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [openPanel]);

  const hiddenFilterCount = useMemo(() => {
    const quickFilterCount =
      (state.textInput.trim() ? 1 : 0) +
      (state.selectedLocation ? 1 : 0) +
      (state.checkInInput || state.checkOutInput ? 1 : 0) +
      (state.guestCountInput ? 1 : 0);

    return Math.max(0, state.activeFilterCount - quickFilterCount);
  }, [
    state.activeFilterCount,
    state.checkInInput,
    state.checkOutInput,
    state.guestCountInput,
    state.selectedLocation,
    state.textInput,
  ]);

  const selectedCheckInDate = useMemo(
    () => parseIsoDate(draftCheckIn),
    [draftCheckIn],
  );
  const selectedCheckOutDate = useMemo(
    () => parseIsoDate(draftCheckOut),
    [draftCheckOut],
  );
  const hasDraftDateError = Boolean(
    selectedCheckInDate &&
    selectedCheckOutDate &&
    !isBeforeUtcDay(selectedCheckInDate, selectedCheckOutDate),
  );

  const primaryMonth = visibleMonthStart;
  const secondaryMonth = primaryMonth ? addUtcMonths(primaryMonth, 1) : null;
  const minimumVisibleMonth = todayDate ? startOfUtcMonth(todayDate) : null;
  const canGoToPreviousMonth = Boolean(
    primaryMonth &&
    minimumVisibleMonth &&
    isBeforeUtcDay(minimumVisibleMonth, primaryMonth),
  );

  const locationSummary = state.selectedLocation
    ? getHotelLocationLabelLocalized(state.selectedLocation, t)
    : t("hotels_summary_anywhere");
  const dateSummary = formatHotelDateSummaryLocalized(
    state.checkInInput,
    state.checkOutInput,
    locale,
    t,
  );
  const guestSummary = formatHotelGuestSummaryLocalized(state.guestCountInput, t);
  const stayNightCount = getNightCount(
    selectedCheckInDate,
    selectedCheckOutDate,
  );
  const weekdayLabels = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, index) =>
        new Intl.DateTimeFormat(locale, {
          weekday: "short",
          timeZone: "UTC",
        }).format(createUtcDate(2026, 1, index + 1)),
      ),
    [locale],
  );

  const applySearch = (
    additionalPatch?: Record<string, string | undefined>,
  ) => {
    state.patchQuery({
      q: draftText.trim() || undefined,
      ...additionalPatch,
    });
  };

  const handleRestoreHistory = (item: {
    text?: string | null;
    location?: string | null;
    hotelTypes?: string[] | null;
    priceMin?: number | null;
    priceMax?: number | null;
    purpose?: string | null;
    amenities?: string[] | null;
    starRatings?: number[] | null;
    guestCount?: number | null;
  }) => {
    const patch: Record<string, string | undefined> = {
      q: item.text || undefined,
      location: item.location || undefined,
      types: item.hotelTypes?.length ? item.hotelTypes.join(",") : undefined,
      min: item.priceMin != null ? String(item.priceMin) : undefined,
      max: item.priceMax != null ? String(item.priceMax) : undefined,
      purpose: item.purpose || undefined,
      amenities: item.amenities?.length ? item.amenities.join(",") : undefined,
      stars: item.starRatings?.length ? item.starRatings.join(",") : undefined,
      guests: item.guestCount != null ? String(item.guestCount) : undefined,
    };
    setDraftText(item.text || "");
    state.patchQuery(patch, true);
  };

  const togglePanel = (nextPanel: Exclude<OpenPanel, null>) => {
    setOpenPanel((current) => (current === nextPanel ? null : nextPanel));
  };

  const openLocationPanel = () => {
    togglePanel("location");
  };

  const openDatesPanel = () => {
    if (openPanel === "dates") {
      setOpenPanel(null);
      return;
    }

    setDraftCheckIn(state.checkInInput);
    setDraftCheckOut(state.checkOutInput);
    setVisibleMonthStart(getInitialVisibleMonth(state.checkInInput));
    setOpenPanel("dates");
  };

  const openGuestsPanel = () => {
    if (openPanel === "guests") {
      setOpenPanel(null);
      return;
    }

    setDraftGuests(parseGuestCount(state.guestCountInput));
    setOpenPanel("guests");
  };

  const applyDateDraft = () => {
    if (hasDraftDateError) {
      return;
    }

    applySearch({
      checkIn: draftCheckIn || undefined,
      checkOut: draftCheckOut || undefined,
    });
    setOpenPanel(null);
  };

  const clearDateDraft = () => {
    setDraftCheckIn("");
    setDraftCheckOut("");
    applySearch({
      checkIn: undefined,
      checkOut: undefined,
    });
  };

  const applyGuestDraft = () => {
    applySearch({
      guests: String(draftGuests),
    });
    setOpenPanel(null);
  };

  const clearGuestDraft = () => {
    setDraftGuests(2);
    applySearch({
      guests: undefined,
    });
  };

  const handleSearch = () => {
    if (openPanel === "dates" && hasDraftDateError) {
      applySearch();
      return;
    }

    if (openPanel === "dates") {
      applySearch({
        checkIn: draftCheckIn || undefined,
        checkOut: draftCheckOut || undefined,
      });
      setOpenPanel(null);
      return;
    }

    if (openPanel === "guests") {
      applySearch({
        guests: String(draftGuests),
      });
      setOpenPanel(null);
      return;
    }

    applySearch();
    setOpenPanel(null);
  };

  const handleCalendarDayClick = (date: Date) => {
    if (todayDate && isBeforeUtcDay(date, todayDate)) {
      return;
    }

    const isoDate = toIsoDate(date);

    if (!selectedCheckInDate || (selectedCheckInDate && selectedCheckOutDate)) {
      setDraftCheckIn(isoDate);
      setDraftCheckOut("");
      return;
    }

    if (!selectedCheckOutDate) {
      if (!isBeforeUtcDay(selectedCheckInDate, date)) {
        setDraftCheckIn(isoDate);
        setDraftCheckOut("");
        return;
      }

      setDraftCheckOut(isoDate);
    }
  };

  const renderCalendarMonth = (monthStart: Date) => {
    const cells = buildMonthCells(monthStart);
    const monthTitle = new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(monthStart);

    return (
      <div
        key={monthStart.toISOString()}
        className="rounded-[1.15rem] border border-slate-200 bg-white/90 p-2 shadow-[0_16px_30px_-26px_rgba(15,23,42,0.4)]"
      >
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">
            {monthTitle}
          </p>
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {t("hotels_date_exact_dates")}
          </p>
        </div>

        <div className="grid grid-cols-7 gap-0.5 text-center text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          {weekdayLabels.map((label) => (
            <span
              key={`${monthStart.toISOString()}-${label}`}
              className="py-0.5"
            >
              {label}
            </span>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-0.5">
          {cells.map((cell) => {
            const cellDate = cell.date;

            if (!cellDate) {
              return (
                <div
                  key={cell.key}
                  className="h-8 rounded-md border border-transparent"
                  aria-hidden="true"
                />
              );
            }

            const isPastDate = Boolean(
              todayDate && isBeforeUtcDay(cellDate, todayDate),
            );
            const isStart = isSameUtcDay(selectedCheckInDate, cellDate);
            const isEnd = isSameUtcDay(selectedCheckOutDate, cellDate);
            const isBoundary = isStart || isEnd;
            const isInRange = Boolean(
              selectedCheckInDate &&
              selectedCheckOutDate &&
              isBeforeUtcDay(selectedCheckInDate, cellDate) &&
              isBeforeUtcDay(cellDate, selectedCheckOutDate),
            );

            return (
              <button
                key={cell.key}
                type="button"
                disabled={isPastDate}
                onClick={() => {
                  handleCalendarDayClick(cellDate);
                }}
                className={`flex h-8 items-center justify-center rounded-md border text-[12px] font-semibold transition ${
                  isBoundary
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-[0_12px_24px_-16px_rgba(79,70,229,0.8)]"
                    : isInRange
                      ? "border-slate-300 bg-slate-200 text-slate-900"
                      : isPastDate
                        ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
                        : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {cellDate.getUTCDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const months = [primaryMonth, secondaryMonth]
    .filter((month): month is Date => Boolean(month))
    .map((month) => renderCalendarMonth(month));

  const selectedDateSummary = selectedCheckInDate
    ? selectedCheckOutDate
      ? `${formatCompactHotelDateLocalized(draftCheckIn, locale)} - ${formatCompactHotelDateLocalized(draftCheckOut, locale)}`
      : t("hotels_date_checkin_only", {
          date: formatCompactHotelDateLocalized(draftCheckIn, locale),
        })
    : t("hotels_date_none_selected");
  const selectedDateHint =
    stayNightCount > 0
      ? t("hotels_date_nights", {
          count: stayNightCount,
          suffix: stayNightCount === 1 ? "" : "s",
        })
      : t("hotels_date_hint");

  const panelContent =
    openPanel === "location" ? (
      <HotelsLocationPanel
        selectedLocation={state.selectedLocation}
        onClear={() => {
          state.patchQuery({ location: undefined });
          setOpenPanel(null);
        }}
        onSelectLocation={(location: HotelLocation) => {
          state.patchQuery({ location });
          setOpenPanel(null);
        }}
      />
    ) : openPanel === "dates" ? (
      <HotelsDatePanel
        canGoToPreviousMonth={canGoToPreviousMonth}
        months={months}
        selectedSummary={selectedDateSummary}
        selectedHint={selectedDateHint}
        hasDateRangeError={hasDraftDateError}
        onPreviousMonth={() => {
          if (primaryMonth && canGoToPreviousMonth) {
            setVisibleMonthStart(addUtcMonths(primaryMonth, -1));
          }
        }}
        onNextMonth={() => {
          if (primaryMonth) {
            setVisibleMonthStart(addUtcMonths(primaryMonth, 1));
          }
        }}
        onClearDates={clearDateDraft}
        onApplyDates={applyDateDraft}
      />
    ) : openPanel === "guests" ? (
      <HotelsGuestsPanel
        guestCount={draftGuests}
        onClear={clearGuestDraft}
        onDecrease={() => {
          setDraftGuests((current) => Math.max(1, current - 1));
        }}
        onIncrease={() => {
          setDraftGuests((current) => Math.min(20, current + 1));
        }}
        onApply={applyGuestDraft}
      />
    ) : null;

  const desktopPanelClass =
    openPanel === "dates"
      ? "left-0 right-0 md:left-1/2 md:right-auto md:w-full md:max-w-4xl md:-translate-x-1/2"
      : openPanel === "location"
        ? "left-0 right-0 md:right-auto md:w-full md:max-w-4xl"
        : "left-0 right-0 md:left-auto md:w-full md:max-w-2xl";

  const mobilePanelTitle =
    openPanel === "location"
      ? t("hotels_quick_location_title")
      : openPanel === "dates"
        ? t("hotels_quick_dates_title")
        : t("hotels_quick_guests_title");

  const mobileQuickFilterLayer =
    openPanel && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[90] flex items-end md:hidden">
              <button
                type="button"
                aria-label={t("hotels_drawer_close_filters")}
                onClick={() => {
                  setOpenPanel(null);
                }}
              className="absolute inset-0 bg-slate-900/20"
            />

            <div
              ref={mobilePanelRef}
              className="relative flex h-[min(76vh,38rem)] w-full flex-col overflow-hidden rounded-t-[1.6rem] border border-slate-200 bg-[#fcfcfb] shadow-[0_-20px_56px_-34px_rgba(15,23,42,0.34)] overscroll-contain"
            >
              <div className="border-b border-slate-200 bg-[#fcfcfb] px-4 pb-2.5 pt-2.5">
                <div className="mx-auto mb-2.5 h-1.5 w-9 rounded-full bg-slate-200" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {t("hotels_quick_filter_label")}
                    </p>
                    <p className="mt-0.5 text-[15px] font-semibold text-slate-900">
                      {mobilePanelTitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenPanel(null);
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                    aria-label={t("hotels_drawer_close")}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 pb-[max(0.9rem,env(safe-area-inset-bottom))]">
                {panelContent}
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={containerRef} className="relative z-30">
      <div className="hover-lift rounded-[1.35rem] border border-slate-200/90 bg-white/95 p-2 sm:rounded-[2rem] sm:p-3 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.42)]">
        <HotelsSearchRow
          draftText={draftText}
          sortBy={state.sortBy}
          onDraftTextChange={setDraftText}
          onSearch={handleSearch}
          onSortChange={(value) => {
            state.patchQuery({ sort: value });
          }}
          onRestoreHistory={handleRestoreHistory}
        />

        <HotelsQuickFiltersRow
          activePanel={openPanel}
          locationSummary={locationSummary}
          dateSummary={dateSummary}
          guestSummary={guestSummary}
          hiddenFilterCount={hiddenFilterCount}
          total={total}
          loading={loading}
          onOpenLocation={openLocationPanel}
          onOpenDates={openDatesPanel}
          onOpenGuests={openGuestsPanel}
          onOpenFilters={onOpenFilters}
        />
      </div>

      {openPanel ? (
        <>
          {mobileQuickFilterLayer}

          <div
            ref={desktopPanelRef}
            className={`hover-lift absolute top-full z-40 mt-3 hidden rounded-[1.75rem] border border-slate-200 bg-[#fcfcfb] p-4 shadow-[0_24px_48px_-34px_rgba(15,23,42,0.3)] md:block md:p-5 ${desktopPanelClass}`}
          >
            {panelContent}
          </div>
        </>
      ) : null}
    </div>
  );
}
