import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { ErrorNotice } from "@/components/ui/error-notice";
import {
  APPROVE_SUBSCRIPTION_MUTATION,
  DENY_SUBSCRIPTION_MUTATION,
} from "@/graphql/member.gql";
import { GET_SUBSCRIPTION_REQUESTS_QUERY } from "@/graphql/notification.gql";
import { getSessionMember } from "@/lib/auth/session";
import { errorAlert, successAlert } from "@/lib/ui/alerts";
import { getErrorMessage } from "@/lib/utils/error";
import { timeAgo } from "@/lib/utils/format";
import { Check, Crown, RefreshCw, X } from "lucide-react";
import type { NextPageWithAuth } from "@/types/page";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubscriptionRequestNotif {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

interface GetSubscriptionRequestsData {
  getSubscriptionRequests: SubscriptionRequestNotif[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIER_DURATION_DEFAULT: Record<string, number> = {
  BASIC: 30,
  PREMIUM: 30,
  ELITE: 30,
};

const TIER_COLOR: Record<string, string> = {
  BASIC: "bg-sky-50 text-sky-700 border-sky-200",
  PREMIUM: "bg-violet-50 text-violet-700 border-violet-200",
  ELITE: "bg-amber-50 text-amber-700 border-amber-200",
  FREE: "bg-slate-50 text-slate-600 border-slate-200",
};

/** Extract tier from message e.g. "Nick requested PREMIUM subscription" */
function parseTierFromMessage(message: string): string {
  const match = message.match(/requested (\w+) subscription/i);
  return match?.[1]?.toUpperCase() ?? "BASIC";
}

/** Extract memberId from link e.g. "/admin/members/abc123" */
function parseMemberIdFromLink(link?: string | null): string {
  if (!link) return "";
  return link.split("/").pop() ?? "";
}


// ─── Approve modal ─────────────────────────────────────────────────────────────

function ApproveModal({
  request,
  onClose,
  onApproved,
}: {
  request: SubscriptionRequestNotif;
  onClose: () => void;
  onApproved: () => void;
}) {
  const tier = parseTierFromMessage(request.message);
  const memberId = parseMemberIdFromLink(request.link);
  const [selectedTier, setSelectedTier] = useState(
    ["BASIC", "PREMIUM", "ELITE"].includes(tier) ? tier : "BASIC",
  );
  const [durationDays, setDurationDays] = useState(
    TIER_DURATION_DEFAULT[tier] ?? 30,
  );

  const [approveSubscription, { loading }] = useMutation(
    APPROVE_SUBSCRIPTION_MUTATION,
    {
      refetchQueries: [{ query: GET_SUBSCRIPTION_REQUESTS_QUERY }],
    },
  );

  const handleApprove = async () => {
    if (!memberId) {
      await errorAlert("No member found", "This request is missing the member link needed for approval.", {
        variant: "subscription",
      });
      return;
    }
    try {
      await approveSubscription({
        variables: { memberId, tier: selectedTier, durationDays },
      });
      await successAlert(
        "Subscription activated",
        `${selectedTier} is now active for ${durationDays} days.`,
        { variant: "subscription" },
      );
      onApproved();
    } catch (err) {
      await errorAlert("We couldn’t activate this subscription", getErrorMessage(err), {
        variant: "subscription",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Approve
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900 font-[family-name:var(--font-display)]">
          Subscription
        </h3>
        <p className="mt-1 text-sm text-slate-500">{request.message}</p>

        <div className="mt-5 space-y-4">
          {/* Tier select */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Tier (from request)
            </label>
            <p className="mb-2 text-[11px] text-amber-600">Verify tier before approving</p>
            <div className="flex gap-2">
              {["BASIC", "PREMIUM", "ELITE"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setSelectedTier(t);
                    setDurationDays(TIER_DURATION_DEFAULT[t] ?? 30);
                  }}
                  className={`flex-1 rounded-xl border py-2 text-sm font-semibold transition ${
                    selectedTier === t
                      ? TIER_COLOR[t]
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Duration (days)
            </label>
            <div className="flex gap-2">
              {[30, 90, 180, 365].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDurationDays(d)}
                  className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                    durationDays === d
                      ? "bg-slate-900 text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {d === 365 ? "1y" : d === 180 ? "6m" : d === 90 ? "3m" : "1m"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              void handleApprove();
            }}
            disabled={loading || !memberId}
            title={!memberId ? "Cannot approve: no member ID found in request link" : undefined}
            className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Approving..." : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Deny modal ────────────────────────────────────────────────────────────────

function DenyModal({
  request,
  onClose,
  onDenied,
}: {
  request: SubscriptionRequestNotif;
  onClose: () => void;
  onDenied: () => void;
}) {
  const memberId = parseMemberIdFromLink(request.link);
  const [reason, setReason] = useState("");

  const [denySubscription, { loading }] = useMutation(
    DENY_SUBSCRIPTION_MUTATION,
    {
      refetchQueries: [{ query: GET_SUBSCRIPTION_REQUESTS_QUERY }],
    },
  );

  const handleDeny = async () => {
    if (!memberId) {
      await errorAlert("No member found", "This request is missing the member link needed to decline it.", {
        variant: "subscription",
      });
      return;
    }
    try {
      await denySubscription({
        variables: { memberId, reason: reason.trim() || undefined },
      });
      await successAlert("Subscription request declined", "The request has been declined.", {
        variant: "subscription",
      });
      onDenied();
    } catch (err) {
      await errorAlert("We couldn’t decline this request", getErrorMessage(err), {
        variant: "subscription",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Deny
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900 font-[family-name:var(--font-display)]">
          Subscription Request
        </h3>
        <p className="mt-1 text-sm text-slate-500">{request.message}</p>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Reason{" "}
            <span className="font-normal normal-case text-slate-400">
              (optional)
            </span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="Explain why the request is denied..."
            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
          />
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              void handleDeny();
            }}
            disabled={loading || !memberId}
            className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
          >
            {loading ? "Denying..." : "Deny"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const AdminSubscriptionsPage: NextPageWithAuth = () => {
  const router = useRouter();
  const member = useMemo(() => getSessionMember(), []);
  const [approving, setApproving] = useState<SubscriptionRequestNotif | null>(
    null,
  );
  const [denying, setDenying] = useState<SubscriptionRequestNotif | null>(null);

  const { data, loading, error, refetch } =
    useQuery<GetSubscriptionRequestsData>(GET_SUBSCRIPTION_REQUESTS_QUERY, {
      skip: !member,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
    });

  const requests = data?.getSubscriptionRequests ?? [];

  if (!member) {
    void router.replace("/auth/login");
    return null;
  }

  return (
    <>
      {approving && (
        <ApproveModal
          request={approving}
          onClose={() => setApproving(null)}
          onApproved={() => setApproving(null)}
        />
      )}
      {denying && (
        <DenyModal
          request={denying}
          onClose={() => setDenying(null)}
          onDenied={() => setDenying(null)}
        />
      )}

      <main className="w-full space-y-6 pb-12">
        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-50 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Admin Panel
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900 font-[family-name:var(--font-display)]">
                Subscription Requests
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                {requests.length > 0
                  ? `${requests.length} pending request${requests.length !== 1 ? "s" : ""} awaiting review.`
                  : "No pending requests at this time."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                void refetch();
              }}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 disabled:opacity-60"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </section>

        {error && <ErrorNotice message={getErrorMessage(error)} />}

        {/* Loading skeleton */}
        {loading && requests.length === 0 && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]"
              >
                <div className="h-10 w-10 animate-pulse rounded-full bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-3 w-1/3 animate-pulse rounded-full bg-slate-50" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && requests.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">
              <Crown size={24} className="text-violet-400" />
            </div>
            <p className="mt-4 text-base font-semibold text-slate-700 font-[family-name:var(--font-display)]">
              All caught up
            </p>
            <p className="mt-1 text-sm text-slate-400">
              No pending subscription requests.
            </p>
          </div>
        )}

        {/* Request list */}
        {requests.length > 0 && (
          <div className="space-y-3">
            {requests.map((req) => {
              const tier = parseTierFromMessage(req.message);
              const tierCls = TIER_COLOR[tier] ?? TIER_COLOR.BASIC;
              return (
                <div
                  key={req._id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)] transition hover:border-slate-300"
                >
                  {/* Icon */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-50">
                    <Crown size={18} className="text-violet-500" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {req.message}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tierCls}`}
                      >
                        {tier}
                      </span>
                      <span className="text-xs text-slate-400">
                        {timeAgo(req.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setDenying(req)}
                      className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      <X size={13} />
                      Deny
                    </button>
                    <button
                      type="button"
                      onClick={() => setApproving(req)}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                    >
                      <Check size={13} />
                      Approve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
};

AdminSubscriptionsPage.auth = {
  roles: ["ADMIN", "ADMIN_OPERATOR"],
};

export default AdminSubscriptionsPage;
