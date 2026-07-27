import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ErrorNotice } from "@/components/ui/error-notice";
import { GET_MY_LIKES_QUERY } from "@/graphql/like.gql";
import {
  GET_HOTEL_CARDS_QUERY,
  TOGGLE_LIKE_MUTATION,
} from "@/graphql/hotel.gql";
import { getSessionMember } from "@/lib/auth/session";
import { useI18n } from "@/lib/i18n/provider";
import { confirmDanger, errorAlert, successAlert } from "@/lib/ui/alerts";
import {
  formatProfileTimeAgo,
  getProfileCopy,
} from "@/lib/profile/profile-i18n";
import { getErrorMessage } from "@/lib/utils/error";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import { Heart } from "lucide-react";
import type { HotelListItem } from "@/types/hotel";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LikeDto {
  _id: string;
  likeRefId: string;
  likeGroup: string;
  createdAt: string;
}

interface GetMyLikesData {
  getMyLikes: LikeDto[];
}

interface GetHotelCardData {
  getHotelsByIds: HotelListItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatLocation = (loc: string) =>
  loc ? loc.charAt(0).toUpperCase() + loc.slice(1).toLowerCase() : "";

// ─── LikedHotelItem ───────────────────────────────────────────────────────────

function LikedHotelItem({
  hotel,
  likedAt,
  onUnliked,
}: {
  hotel: HotelListItem;
  likedAt: string;
  onUnliked: (hotelId: string) => void;
}) {
  const { locale } = useI18n();
  const copy = getProfileCopy(locale);
  const [toggleLike, { loading: unliking }] = useMutation(TOGGLE_LIKE_MUTATION);
  const coverImage = resolveMediaUrl(hotel?.hotelImages[0]);

  const handleUnlike = async () => {
    const confirmed = await confirmDanger({
      title: copy.removeSavedConfirmTitle,
      text: hotel.hotelTitle,
      warningText: copy.removeSavedConfirmText,
      confirmText: copy.removeSavedConfirmButton,
      cancelText: copy.cancel,
    });

    if (!confirmed) return;

    try {
      await toggleLike({
        variables: { input: { likeGroup: "HOTEL", likeRefId: hotel._id } },
      });
      onUnliked(hotel._id);
      await successAlert(copy.removeSavedSuccess, undefined, {
        variant: "saved",
      });
    } catch (err) {
      await errorAlert(copy.removeFromSaved, getErrorMessage(err), {
        variant: "saved",
      });
    }
  };

  return (
    <div className="hover-lift group relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-8px_rgba(15,23,42,0.12)] transition duration-300 hover:border-slate-300 hover:shadow-[0_22px_46px_-34px_rgba(15,23,42,0.25)]">
      <Link href={`/hotels/${hotel._id}`} className="block focus:outline-none">
        <div className="relative h-56 w-full overflow-hidden bg-slate-200 sm:h-64">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={hotel.hotelTitle}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-200 via-slate-100 to-white text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
              {copy.curatedStay}
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="line-clamp-2 text-base font-semibold leading-tight text-white">
              {hotel.hotelTitle}
            </p>
            <p className="mt-1 text-xs text-white/80">
              {formatLocation(hotel.hotelLocation)} · {hotel.hotelType}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-3.5 w-3.5 text-amber-400"
              aria-hidden
            >
              <path d="M12 2l2.95 6.08 6.72.98-4.86 4.67 1.15 6.6L12 17.2l-5.96 3.13 1.15-6.6L2.33 9.06l6.72-.98L12 2z" />
            </svg>
            <span className="font-medium text-slate-600">
              {hotel.hotelRating.toFixed(1)}
            </span>
            <span>·</span>
            <span>
              {hotel.hotelLikes.toLocaleString(locale)} {copy.likes}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            {copy.saved} {formatProfileTimeAgo(locale, likedAt)}
          </span>
        </div>
      </Link>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          void handleUnlike();
        }}
        disabled={unliking}
        aria-label={copy.removeFromSaved}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition hover:bg-white hover:scale-110 disabled:opacity-60"
      >
        <Heart size={16} className="fill-rose-500 text-rose-500" />
      </button>
    </div>
  );
}

// ─── LikesTab ─────────────────────────────────────────────────────────────────

export function LikesTab() {
  const { locale } = useI18n();
  const copy = getProfileCopy(locale);
  const member = useMemo(() => getSessionMember(), []);
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const { data, loading, error, refetch } = useQuery<GetMyLikesData>(
    GET_MY_LIKES_QUERY,
    {
      skip: !member,
      variables: { likeGroup: "HOTEL" },
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
    },
  );

  const allLikes = data?.getMyLikes ?? [];
  const likes = allLikes.filter((l) => !removed.has(l.likeRefId));
  const likedHotelIds = useMemo(
    () => likes.map((like) => like.likeRefId),
    [likes],
  );
  const { data: hotelsData, loading: hotelsLoading } = useQuery<GetHotelCardData>(
    GET_HOTEL_CARDS_QUERY,
    {
      skip: likedHotelIds.length === 0,
      variables: { hotelIds: likedHotelIds },
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    },
  );
  const hotelMap = useMemo(
    () =>
      new Map((hotelsData?.getHotelsByIds ?? []).map((hotel) => [hotel._id, hotel])),
    [hotelsData],
  );

  const handleUnliked = (hotelId: string) => {
    setRemoved((prev) => new Set(prev).add(hotelId));
    // Also refetch the likes list to keep the Apollo cache in sync.
    // The optimistic `removed` set ensures instant UI feedback.
    void refetch();
  };

  return (
    <div className="space-y-5">
      {error && <ErrorNotice message={getErrorMessage(error)} />}

      {/* Loading skeleton */}
      {(loading || hotelsLoading) && likes.length === 0 && (
        <div className="grid gap-5 sm:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white"
            >
              <div className="h-56 animate-pulse bg-slate-100 sm:h-64" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-100" />
                <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-50" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && likes.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
            <Heart size={24} className="text-rose-300" />
          </div>
          <p className="mt-4 text-base font-semibold text-slate-700">
            {copy.noSavedHotels}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {copy.saveHotelHint}
          </p>
          <Link
            href="/hotels"
            className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            {copy.browseHotels}
          </Link>
        </div>
      )}

      {/* Grid of liked hotels */}
      {likes.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2">
          {likes.map((like, i) => (
            <div
              key={like._id}
              className="motion-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {hotelMap.get(like.likeRefId) ? (
                <LikedHotelItem
                  hotel={hotelMap.get(like.likeRefId)!}
                  likedAt={like.createdAt}
                  onUnliked={handleUnliked}
                />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
