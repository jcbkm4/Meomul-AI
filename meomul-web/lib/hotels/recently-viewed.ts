import type { HotelLocation, HotelType } from "@/types/hotel";

const RECENTLY_VIEWED_HOTELS_STORAGE_KEY = "meomul:recently-viewed-hotels:v1";
const RECENTLY_VIEWED_HOTELS_LIMIT = 12;

export interface RecentlyViewedHotelEntry {
  hotelId: string;
  hotelTitle: string;
  hotelLocation: HotelLocation;
  hotelType: HotelType;
  hotelRating: number;
  hotelLikes: number;
  imageUrl: string;
  viewedAt: number;
}

type RecentlyViewedHotelInput = Omit<RecentlyViewedHotelEntry, "viewedAt">;

const isBrowser = (): boolean => typeof window !== "undefined";

const isRecentlyViewedHotelEntry = (
  value: unknown,
): value is RecentlyViewedHotelEntry => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<RecentlyViewedHotelEntry>;
  return (
    typeof candidate.hotelId === "string" &&
    typeof candidate.hotelTitle === "string" &&
    typeof candidate.hotelLocation === "string" &&
    typeof candidate.hotelType === "string" &&
    typeof candidate.hotelRating === "number" &&
    typeof candidate.hotelLikes === "number" &&
    typeof candidate.imageUrl === "string" &&
    typeof candidate.viewedAt === "number"
  );
};

export const readRecentlyViewedHotels = (): RecentlyViewedHotelEntry[] => {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_HOTELS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(RECENTLY_VIEWED_HOTELS_STORAGE_KEY);
      return [];
    }

    const valid = parsed
      .filter(isRecentlyViewedHotelEntry)
      .sort((a, b) => b.viewedAt - a.viewedAt)
      .slice(0, RECENTLY_VIEWED_HOTELS_LIMIT);

    if (valid.length !== parsed.length) {
      window.localStorage.setItem(
        RECENTLY_VIEWED_HOTELS_STORAGE_KEY,
        JSON.stringify(valid),
      );
    }

    return valid;
  } catch {
    window.localStorage.removeItem(RECENTLY_VIEWED_HOTELS_STORAGE_KEY);
    return [];
  }
};

export const pushRecentlyViewedHotel = (
  input: RecentlyViewedHotelInput,
): void => {
  if (!isBrowser() || !input.hotelId) {
    return;
  }

  const current = readRecentlyViewedHotels();
  const nextEntry: RecentlyViewedHotelEntry = {
    ...input,
    viewedAt: Date.now(),
  };

  const deduped = [
    nextEntry,
    ...current.filter((hotel) => hotel.hotelId !== input.hotelId),
  ].slice(0, RECENTLY_VIEWED_HOTELS_LIMIT);

  window.localStorage.setItem(
    RECENTLY_VIEWED_HOTELS_STORAGE_KEY,
    JSON.stringify(deduped),
  );
};

export const clearRecentlyViewedHotels = (): void => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(RECENTLY_VIEWED_HOTELS_STORAGE_KEY);
};
