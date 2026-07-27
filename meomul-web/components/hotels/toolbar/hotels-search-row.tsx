import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ChangeEvent, KeyboardEvent } from "react";
import {
  CLEAR_MY_SEARCH_HISTORY_MUTATION,
  DELETE_SEARCH_HISTORY_ITEM_MUTATION,
  GET_MY_SEARCH_HISTORY_QUERY,
} from "@/graphql/search-history.gql";
import { getSessionMember } from "@/lib/auth/session";
import { getHotelAmenityLabel, getHotelLocationLabelLocalized, getHotelsSortLabel, getHotelTypeLabel, getStayPurposeLabel } from "@/lib/hotels/hotels-i18n";
import { useI18n } from "@/lib/i18n/provider";
import {
  HOTELS_SORT_OPTIONS,
  type HotelsSortBy,
} from "@/lib/hotels/hotels-filter-config";
import { Clock, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchHistoryItem {
  _id: string;
  location?: string | null;
  hotelTypes?: string[] | null;
  priceMin?: number | null;
  priceMax?: number | null;
  purpose?: string | null;
  amenities?: string[] | null;
  starRatings?: number[] | null;
  guestCount?: number | null;
  text?: string | null;
  createdAt: string;
}

interface GetMySearchHistoryData {
  getMySearchHistory: SearchHistoryItem[];
}

interface HotelsSearchRowProps {
  draftText: string;
  sortBy: HotelsSortBy;
  onDraftTextChange: (value: string) => void;
  onSearch: () => void;
  onSortChange: (value: HotelsSortBy) => void;
  onRestoreHistory?: (item: SearchHistoryItem) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function summarizeHistoryItem(
  item: SearchHistoryItem,
  locale: string,
  t: ReturnType<typeof useI18n>["t"],
): string {
  const parts: string[] = [];

  if (item.text) parts.push(`"${item.text}"`);
  if (item.location) parts.push(getHotelLocationLabelLocalized(item.location, t));
  if (item.hotelTypes?.length) {
    parts.push(item.hotelTypes.map((type) => getHotelTypeLabel(type, t)).join(", "));
  }
  if (item.purpose) parts.push(getStayPurposeLabel(item.purpose, t));
  if (item.guestCount)
    parts.push(
      t("hotels_summary_guests", {
        count: item.guestCount,
        suffix: item.guestCount > 1 ? "s" : "",
      }),
    );
  if (item.priceMin != null || item.priceMax != null) {
    const min =
      item.priceMin != null ? `₩${item.priceMin.toLocaleString()}` : "";
    const max =
      item.priceMax != null ? `₩${item.priceMax.toLocaleString()}` : "";
    if (min && max) parts.push(`${min}–${max}`);
    else if (min) parts.push(t("hotels_summary_from", { date: min }));
    else if (max) parts.push(t("hotels_summary_until", { date: max }));
  }
  if (item.starRatings?.length) parts.push(`${item.starRatings.join(",")}★`);
  if (item.amenities?.length) {
    parts.push(
      item.amenities
        .slice(0, 2)
        .map((amenity) => getHotelAmenityLabel(amenity, t))
        .join(", "),
    );
  }

  return parts.length > 0 ? parts.join(" · ") : t("hotels_all_hotels");
}

function timeAgo(dateStr: string, locale: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diffMs / 60000);
  const h = Math.floor(diffMs / 3600000);
  const d = Math.floor(diffMs / 86400000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  if (d < 7) return `${d}d`;
  return new Date(dateStr).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HotelsSearchRow({
  draftText,
  sortBy,
  onDraftTextChange,
  onSearch,
  onSortChange,
  onRestoreHistory,
}: HotelsSearchRowProps) {
  const { locale, t } = useI18n();
  const member = useRef(getSessionMember());
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const [fetchHistory, { data: historyData, loading: historyLoading }] =
    useLazyQuery<GetMySearchHistoryData>(GET_MY_SEARCH_HISTORY_QUERY, {
      fetchPolicy: "network-only",
    });

  const [deleteItem] = useMutation(DELETE_SEARCH_HISTORY_ITEM_MUTATION, {
    refetchQueries: [
      { query: GET_MY_SEARCH_HISTORY_QUERY, variables: { limit: 5 } },
    ],
  });

  const [clearAll] = useMutation(CLEAR_MY_SEARCH_HISTORY_MUTATION, {
    refetchQueries: [
      { query: GET_MY_SEARCH_HISTORY_QUERY, variables: { limit: 5 } },
    ],
  });

  const historyItems = historyData?.getMySearchHistory ?? [];

  const updateDropdownPosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, []);

  const handleFocus = useCallback(() => {
    if (!member.current) return;
    setShowDropdown(true);
    updateDropdownPosition();
    void fetchHistory({ variables: { limit: 5 } });
  }, [fetchHistory, updateDropdownPosition]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return;

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const inContainer = containerRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inContainer && !inDropdown) {
        setShowDropdown(false);
      }
    };

    let frameId: number | null = null;
    const schedulePositionUpdate = () => {
      if (frameId != null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updateDropdownPosition();
      });
    };

    window.addEventListener("scroll", schedulePositionUpdate, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", schedulePositionUpdate, {
      passive: true,
    });

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      if (frameId != null) {
        window.cancelAnimationFrame(frameId);
      }
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", schedulePositionUpdate, true);
      window.removeEventListener("resize", schedulePositionUpdate);
    };
  }, [showDropdown, updateDropdownPosition]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onDraftTextChange(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setShowDropdown(false);
      onSearch();
    }
    if (event.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleSelectHistory = (item: SearchHistoryItem) => {
    setShowDropdown(false);
    if (onRestoreHistory) {
      onRestoreHistory(item);
    } else if (item.text) {
      onDraftTextChange(item.text);
      // Trigger search on next tick so draft propagates
      setTimeout(onSearch, 0);
    }
  };

  const handleDeleteItem = async (e: React.MouseEvent, historyId: string) => {
    e.stopPropagation();
    try {
      await deleteItem({ variables: { historyId } });
    } catch {
      // Silently fail
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAll();
      setShowDropdown(false);
    } catch {
      // Silently fail
    }
  };

  const showHistory = showDropdown && member.current && !draftText.trim();

  return (
    <div
      ref={containerRef}
      className="relative z-20 rounded-[1.2rem] border border-slate-200 bg-white p-1.5 sm:rounded-[1.75rem] sm:p-2"
    >
      <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-2">
        <label className="flex-1 rounded-[1rem] border border-slate-200 bg-white px-3 py-2 sm:rounded-[1.3rem] sm:px-4 sm:py-3">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {t("hotels_search_title")}
          </span>
          <input
            value={draftText}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder={t("hotels_search_placeholder")}
            className="mt-0.5 w-full bg-transparent text-[13px] font-medium text-slate-900 outline-none placeholder:text-slate-400 sm:mt-1 sm:text-sm"
          />
        </label>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-1.5 md:flex md:items-center md:gap-2">
          <button
            type="button"
            onClick={() => {
              setShowDropdown(false);
              onSearch();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-[1rem] bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black md:min-w-[9.5rem] md:rounded-[1.3rem] md:px-5 md:py-4"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path d="m21 21-4.35-4.35" />
              <circle cx="11" cy="11" r="6" />
            </svg>
            {t("hotels_search_button")}
          </button>

          <label className="flex items-center gap-2 rounded-[1rem] border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 md:min-w-[13rem] md:rounded-[1.3rem] md:px-4 md:py-3">
            <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:text-[11px]">
              {t("hotels_sort_label")}
            </span>
            <select
              value={sortBy}
              onChange={(event) => {
                onSortChange(event.target.value as HotelsSortBy);
              }}
              className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none"
            >
              {HOTELS_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {getHotelsSortLabel(option.value, t)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Search history dropdown — portalled to body */}
      {showHistory &&
        createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_48px_-28px_rgba(15,23,42,0.32)]"
          >
            {historyLoading && historyItems.length === 0 ? (
              <div className="px-4 py-5 text-center">
                <div className="mx-auto h-3 w-24 animate-pulse rounded-full bg-slate-100" />
              </div>
            ) : historyItems.length === 0 ? (
              <div className="px-4 py-5 text-center text-sm text-slate-400">
                {t("hotels_no_recent_searches")}
              </div>
            ) : (
              <>
                <div className="px-3 pb-1 pt-2.5">
                  <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {t("hotels_recent_searches")}
                  </p>
                </div>

                <div className="max-h-[260px] overflow-y-auto">
                  {historyItems.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => handleSelectHistory(item)}
                      className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-slate-50 active:bg-slate-100"
                    >
                      <Clock
                        size={14}
                        className="flex-shrink-0 text-slate-300"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-700">
                          {summarizeHistoryItem(item, locale, t)}
                        </p>
                      </div>
                      <span className="flex-shrink-0 text-[11px] text-slate-300">
                        {timeAgo(item.createdAt, locale)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          void handleDeleteItem(e, item._id);
                        }}
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
                        aria-label={t("hotels_remove_search")}
                      >
                        <X size={12} />
                      </button>
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 px-4 py-2">
                  <button
                    type="button"
                    onClick={() => {
                      void handleClearAll();
                    }}
                    className="text-xs font-medium text-slate-400 transition hover:text-rose-500"
                  >
                    {t("hotels_clear_history")}
                  </button>
                </div>
              </>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
