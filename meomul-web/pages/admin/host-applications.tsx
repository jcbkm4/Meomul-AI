import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Building2, Check, RefreshCcw, ShieldAlert, X } from "lucide-react";
import { ErrorNotice } from "@/components/ui/error-notice";
import {
  GET_HOST_APPLICATIONS_BY_ADMIN_QUERY,
  REVIEW_HOST_APPLICATION_MUTATION,
} from "@/graphql/member.gql";
import { lockBodyScroll } from "@/lib/ui/body-scroll-lock";
import { getErrorMessage } from "@/lib/utils/error";
import { confirmAction, errorAlert, successAlert } from "@/lib/ui/alerts";
import { timeAgo } from "@/lib/utils/format";
import type {
  GetHostApplicationsByAdminQueryData,
  GetHostApplicationsByAdminQueryVars,
  HostApplication,
  HostApplicationStatus,
  ReviewHostApplicationMutationData,
  ReviewHostApplicationMutationVars,
} from "@/types/auth";
import type { NextPageWithAuth } from "@/types/page";

const FILTERS: Array<{ label: string; value: HostApplicationStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

interface RejectModalState {
  application: HostApplication;
  note: string;
}

const MIN_REJECTION_NOTE_LENGTH = 12;

function isHostApplicationStatus(value: string): value is HostApplicationStatus {
  return value === "PENDING" || value === "APPROVED" || value === "REJECTED";
}

const HOTEL_TYPE_LABEL: Record<HostApplication["hotelType"], string> = {
  HOTEL: "Hotel",
  MOTEL: "Motel",
  RESORT: "Resort",
  GUESTHOUSE: "Guesthouse",
  HANOK: "Hanok",
  PENSION: "Pension",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Seoul",
  });
}

function StatusPill({ status }: { status: HostApplicationStatus }) {
  const tone =
    status === "PENDING"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : status === "APPROVED"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tone}`}>
      {status}
    </span>
  );
}

function ApplicationCard({
  application,
  onApprove,
  onReject,
}: {
  application: HostApplication;
  onApprove: (application: HostApplication) => void;
  onReject: (application: HostApplication) => void;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold text-slate-900">
              {application.businessName}
            </p>
            <StatusPill status={application.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Applicant:{" "}
            <span className="font-medium text-slate-700">
              {application.applicantMemberNick || application.applicantMemberId}
            </span>
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Submitted {timeAgo(application.createdAt)}
            {application.intendedHotelLocation ? ` · ${application.intendedHotelLocation}` : ""}
            {application.intendedHotelName ? ` · ${application.intendedHotelName}` : ""}
          </p>
        </div>

        {application.status === "PENDING" ? (
          <div className="flex flex-shrink-0 gap-2">
            <button
              type="button"
              onClick={() => onReject(application)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <X size={14} />
              Reject
            </button>
            <button
              type="button"
              onClick={() => onApprove(application)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <Check size={14} />
              Approve
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Property Plan
          </p>
          <div className="mt-2 space-y-1.5 text-sm text-slate-700">
            <p>{HOTEL_TYPE_LABEL[application.hotelType]}</p>
            <p>
              {application.suitableFor.length > 0
                ? application.suitableFor.join(", ")
                : "No target trip purpose provided"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Business Description
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            {application.businessDescription}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 md:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Contact
          </p>
          <div className="mt-2 space-y-1.5 text-sm text-slate-700">
            <p>{application.contactPhone || "No contact phone"}</p>
            <p>{application.businessEmail || "No business email"}</p>
            {application.notes ? <p className="pt-2 text-slate-500">{application.notes}</p> : null}
          </div>
        </div>
      </div>

      {application.status !== "PENDING" ? (
        <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Review
          </p>
          <p className="mt-2 text-sm text-slate-700">
            {application.status} on {formatDate(application.reviewedAt ?? application.updatedAt)}
            {application.reviewedByMemberNick ? ` by ${application.reviewedByMemberNick}` : ""}
          </p>
          {application.reviewNote ? (
            <p className="mt-2 text-sm text-slate-500">{application.reviewNote}</p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

const AdminHostApplicationsPage: NextPageWithAuth = () => {
  const router = useRouter();
  const [filter, setFilter] = useState<HostApplicationStatus | "ALL">("PENDING");
  const [rejectModal, setRejectModal] = useState<RejectModalState | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const statusParam = Array.isArray(router.query.status)
      ? router.query.status[0]
      : router.query.status;
    if (!statusParam) return;
    const normalized = statusParam.toUpperCase();
    if (normalized === "ALL" || isHostApplicationStatus(normalized)) {
      setFilter(normalized);
    }
  }, [router.isReady, router.query.status]);

  const { data, loading, error, refetch } = useQuery<
    GetHostApplicationsByAdminQueryData,
    GetHostApplicationsByAdminQueryVars
  >(GET_HOST_APPLICATIONS_BY_ADMIN_QUERY, {
    variables: {
      statusFilter: filter === "ALL" ? undefined : filter,
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });

  const [reviewHostApplication, { loading: reviewing }] = useMutation<
    ReviewHostApplicationMutationData,
    ReviewHostApplicationMutationVars
  >(REVIEW_HOST_APPLICATION_MUTATION);

  const applications = data?.getHostApplicationsByAdmin ?? [];
  const pendingCount = useMemo(
    () => applications.filter((application) => application.status === "PENDING").length,
    [applications],
  );

  useEffect(() => {
    if (!rejectModal) return;
    return lockBodyScroll();
  }, [rejectModal]);

  const handleApprove = async (application: HostApplication) => {
    const confirmed = await confirmAction({
      title: "Approve this host application",
      text: `${application.businessName} will move from pending to approved host access.`,
      confirmText: "Approve application",
      variant: "subscription",
    });
    if (!confirmed) return;

    try {
      await reviewHostApplication({
        variables: {
          input: {
            applicationId: application._id,
            status: "APPROVED",
          },
        },
      });
      await refetch();
      await successAlert(
        "Host application approved",
        `${application.businessName} now has approved host access.`,
        { variant: "subscription" },
      );
    } catch (mutationError) {
      await errorAlert("We couldn’t approve this application", getErrorMessage(mutationError), {
        variant: "subscription",
      });
    }
  };

  const submitReject = async () => {
    if (!rejectModal) return;
    const trimmedNote = rejectModal.note.trim();
    if (trimmedNote.length < MIN_REJECTION_NOTE_LENGTH) {
      await errorAlert(
        "Rejection note required",
        `Write at least ${MIN_REJECTION_NOTE_LENGTH} characters so the applicant knows what to fix.`,
      );
      return;
    }
    try {
      await reviewHostApplication({
        variables: {
          input: {
            applicationId: rejectModal.application._id,
            status: "REJECTED",
            reviewNote: trimmedNote,
          },
        },
      });
      setRejectModal(null);
      await refetch();
      await successAlert(
        "Host application declined",
        `${rejectModal.application.businessName} was declined.`,
        { variant: "subscription" },
      );
    } catch (mutationError) {
      await errorAlert("We couldn’t decline this application", getErrorMessage(mutationError), {
        variant: "subscription",
      });
    }
  };

  return (
    <main className="w-full space-y-6 pb-12">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-sky-50 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Admin Panel
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 font-[family-name:var(--font-display)]">
              Host Applications
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Review member requests from pending agents who want approved hotel-host access.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
              {pendingCount} pending
            </div>
            <button
              type="button"
              onClick={() => {
                void refetch();
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCcw size={14} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((tab) => {
            const active = filter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilter(tab.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {error ? <ErrorNotice message={getErrorMessage(error)} /> : null}

      {loading && applications.length === 0 ? (
        <section className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </section>
      ) : applications.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <ShieldAlert size={24} />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">No host applications</h2>
          <p className="mt-2 text-sm text-slate-500">
            There are no applications in this filter right now.
          </p>
        </section>
      ) : (
        <section className="space-y-4">
          {applications.map((application) => (
            <ApplicationCard
              key={application._id}
              application={application}
              onApprove={(item) => {
                if (!reviewing) void handleApprove(item);
              }}
              onReject={(item) => {
                if (!reviewing) {
                  setRejectModal({
                    application: item,
                    note: item.reviewNote ?? "",
                  });
                }
              }}
            />
          ))}
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Current contract</p>
            <p className="mt-1 text-sm text-slate-600">
              Public signup creates USER only. Host application submission makes the account a pending agent, and approval unlocks hotel creation.
            </p>
          </div>
        </div>
      </section>

      {rejectModal ? (
        <div className="fixed inset-0 z-[140] flex items-end justify-center bg-slate-950/35 p-4 sm:items-center">
          <div className="w-full max-w-xl rounded-[1.75rem] bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.38)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-lg font-semibold text-slate-900">Reject host application?</p>
                <p className="mt-1 text-sm text-slate-500">
                  {rejectModal.application.businessName} will remain a USER account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close reject review"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                This denies host access. Add a review note so the applicant understands what to fix.
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="host-application-reject-note"
                  className="text-sm font-semibold text-slate-800"
                >
                  Rejection note
                </label>
                <textarea
                  id="host-application-reject-note"
                  value={rejectModal.note}
                  onChange={(event) =>
                    setRejectModal((current) =>
                      current ? { ...current, note: event.target.value } : current,
                    )
                  }
                  rows={5}
                  placeholder="Explain why this application is being rejected and what the applicant should improve."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
                <p className="text-xs text-slate-500">
                  Required. This note is shown in the application review history.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                className="inline-flex min-w-[8rem] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!reviewing) void submitReject();
                }}
                className="inline-flex min-w-[8rem] items-center justify-center rounded-xl border border-rose-600 bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={
                  reviewing || rejectModal.note.trim().length < MIN_REJECTION_NOTE_LENGTH
                }
              >
                Reject application
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};

AdminHostApplicationsPage.auth = {
  roles: ["ADMIN", "ADMIN_OPERATOR"],
};

export default AdminHostApplicationsPage;
