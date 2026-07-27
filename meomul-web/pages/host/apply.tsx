import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  FileClock,
  Headset,
  Heart,
  Hotel,
  Mail,
  MapPin,
  Palmtree,
  ShieldAlert,
  Stethoscope,
  Sparkles,
  User,
  Users,
  CalendarHeart,
} from "lucide-react";
import { AppLogo } from "@/components/brand/app-logo";
import { ErrorNotice } from "@/components/ui/error-notice";
import {
  GET_MY_HOST_APPLICATION_QUERY,
  REQUEST_HOST_APPLICATION_MUTATION,
} from "@/graphql/member.gql";
import { getSessionMember, silentRefreshAccessToken } from "@/lib/auth/session";
import { errorAlert, successAlert } from "@/lib/ui/alerts";
import { getErrorMessage } from "@/lib/utils/error";
import type {
  GetMyHostApplicationQueryData,
  HostApplicationInput,
  HotelType,
  RequestHostApplicationMutationData,
  RequestHostApplicationMutationVars,
  StayPurpose,
} from "@/types/auth";
import type { NextPageWithAuth } from "@/types/page";

const LOCATION_OPTIONS = [
  "SEOUL",
  "BUSAN",
  "INCHEON",
  "DAEGU",
  "DAEJON",
  "GWANGJU",
  "JEJU",
  "GYEONGJU",
  "GANGNEUNG",
] as const;

const PROPERTY_OPTIONS = [
  { value: "HOTEL", label: "Hotel", desc: "Full-service or standard hotel operation.", icon: Hotel },
  { value: "MOTEL", label: "Motel", desc: "Short-stay roadside or urban motel format.", icon: Building2 },
  { value: "RESORT", label: "Resort", desc: "Destination-focused property with leisure amenities.", icon: Palmtree },
  { value: "GUESTHOUSE", label: "Guesthouse", desc: "Smaller hospitality operation with managed rooms.", icon: User },
  { value: "HANOK", label: "Hanok", desc: "Traditional Korean stay with a heritage feel.", icon: Sparkles },
  { value: "PENSION", label: "Pension", desc: "Casual leisure stay, often for families or groups.", icon: Users },
] as const;

const PURPOSE_OPTIONS = [
  {
    value: "BUSINESS",
    title: "Business",
    description: "Designed for work trips, meetings, and business travelers.",
    icon: BriefcaseBusiness,
  },
  {
    value: "ROMANTIC",
    title: "Romantic",
    description: "Best for couples, private getaways, and special dates.",
    icon: Heart,
  },
  {
    value: "FAMILY",
    title: "Family",
    description: "Suited for family trips with more flexible guest needs.",
    icon: Users,
  },
  {
    value: "SOLO",
    title: "Solo",
    description: "Useful for independent travelers and short solo stays.",
    icon: User,
  },
  {
    value: "STAYCATION",
    title: "Staycation",
    description: "Focused on local escapes, comfort, and leisure stays.",
    icon: Sparkles,
  },
  {
    value: "EVENT",
    title: "Event",
    description: "Designed for concerts, festivals, weddings, or local events.",
    icon: CalendarHeart,
  },
  {
    value: "MEDICAL",
    title: "Medical",
    description: "Supports treatment trips, recovery stays, or clinic access.",
    icon: Stethoscope,
  },
  {
    value: "LONG_TERM",
    title: "Long-term",
    description: "Good for extended stays and repeat operational demand.",
    icon: Building2,
  },
] as const;

const TOTAL_STEPS = 5;

function formatDate(value?: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Seoul",
  });
}

function StepCard({
  selected,
  onClick,
  title,
  description,
  icon: Icon,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  icon: typeof Hotel;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[1.3rem] border px-4 py-4 text-left transition sm:rounded-[1.6rem] sm:px-5 sm:py-5 ${
        selected
          ? "border-slate-950 bg-white shadow-[0_20px_40px_-34px_rgba(15,23,42,0.3)]"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">{title}</p>
          <p className="mt-1.5 text-sm leading-6 text-slate-500 sm:mt-2">{description}</p>
        </div>
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800 sm:h-12 sm:w-12 sm:rounded-2xl">
          <Icon size={22} strokeWidth={1.8} />
        </div>
      </div>
    </button>
  );
}

function StatusScreen({
  tone,
  title,
  body,
  primary,
  secondary,
}: {
  tone: "emerald" | "amber" | "rose";
  title: string;
  body: string;
  primary?: { href?: string; label: string; onClick?: () => void };
  secondary?: { href: string; label: string };
}) {
  const toneStyles =
    tone === "emerald"
      ? {
          ring: "border-emerald-200 bg-emerald-50 text-emerald-600",
          icon: CheckCircle2,
        }
      : tone === "amber"
        ? {
            ring: "border-amber-200 bg-amber-50 text-amber-600",
            icon: FileClock,
          }
      : {
          ring: "border-slate-300 bg-slate-100 text-slate-700",
          icon: ShieldAlert,
        };
  const Icon = toneStyles.icon;

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-start px-4 py-10 sm:justify-center sm:px-8 sm:py-16">
      <div className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.28)] sm:rounded-[2rem] sm:p-10">
        <div className={`flex h-14 w-14 items-center justify-center rounded-[1.25rem] border ${toneStyles.ring} sm:h-16 sm:w-16 sm:rounded-[1.5rem]`}>
          <Icon size={30} />
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:mt-6 sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:mt-4 sm:text-base sm:leading-8">{body}</p>
        <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
          {primary?.href ? (
            <Link
              href={primary.href}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {primary.label}
            </Link>
          ) : primary?.onClick ? (
            <button
              type="button"
              onClick={primary.onClick}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {primary.label}
            </button>
          ) : null}
          {secondary ? (
            <Link
              href={secondary.href}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              {secondary.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

const HostApplyPage: NextPageWithAuth = () => {
  const router = useRouter();
  const [member, setMember] = useState(() => getSessionMember());
  const nextTarget = useMemo(() => {
    if (typeof router.query.next !== "string") return "/hotels/create";
    return router.query.next.startsWith("/") ? router.query.next : "/hotels/create";
  }, [router.query.next]);

  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<HostApplicationInput>({
    businessName: "",
    businessDescription: "",
    contactPhone: member?.memberPhone ?? "",
    businessEmail: "",
    intendedHotelName: "",
    intendedHotelLocation: "SEOUL",
    notes: "",
    hotelType: "HOTEL" as HotelType,
    suitableFor: [],
  });

  const { data, loading, error, refetch } = useQuery<GetMyHostApplicationQueryData>(
    GET_MY_HOST_APPLICATION_QUERY,
    {
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
    },
  );

  const [requestHostApplication, { loading: submitting }] = useMutation<
    RequestHostApplicationMutationData,
    RequestHostApplicationMutationVars
  >(REQUEST_HOST_APPLICATION_MUTATION);

  const application = data?.getMyHostApplication ?? null;
  const memberType = member?.memberType;
  const hostAccessStatus = member?.hostAccessStatus ?? "NONE";

  const canGoNext = useMemo(() => {
    if (step === 1) return Boolean(draft.hotelType);
    if (step === 2) return draft.suitableFor.length > 0;
    if (step === 3)
      return Boolean(draft.intendedHotelName?.trim()) && Boolean(draft.intendedHotelLocation?.trim());
    if (step === 4)
      return (
        Boolean(draft.businessName?.trim()) &&
        Boolean(draft.contactPhone?.trim()) &&
        Boolean(draft.businessEmail?.trim())
      );
    if (step === 5) return draft.businessDescription.trim().length >= 20;
    return false;
  }, [draft, step]);

  const onSubmit = async () => {
    if (memberType !== "USER" && memberType !== "AGENT") return;
    if (memberType === "AGENT" && hostAccessStatus === "APPROVED") return;
    if (!canGoNext) return;

    try {
      await requestHostApplication({
        variables: {
          input: {
            businessName: draft.businessName.trim(),
            businessDescription: draft.businessDescription.trim(),
            contactPhone: draft.contactPhone?.trim() || undefined,
            businessEmail: draft.businessEmail?.trim() || undefined,
            intendedHotelName: draft.intendedHotelName?.trim() || undefined,
            intendedHotelLocation:
              (draft.intendedHotelLocation?.trim() as HostApplicationInput["intendedHotelLocation"]) ||
              undefined,
            hotelType: draft.hotelType,
            suitableFor: draft.suitableFor,
            notes: draft.notes?.trim() || undefined,
          },
        },
      });
      const refreshed = await silentRefreshAccessToken();
      if (refreshed) {
        setMember(getSessionMember());
      }
      await refetch();
      await successAlert(
        "Application submitted",
        "Your account is now a pending agent and waiting for admin review.",
        { variant: "profile" },
      );
    } catch (mutationError) {
      await errorAlert("Host application", getErrorMessage(mutationError));
    }
  };

  if (memberType === "AGENT" && hostAccessStatus === "APPROVED") {
    return (
      <StatusScreen
        tone="emerald"
        title="Host access is active"
        body="Your account already has agent access. You can create hotels, manage rooms, and operate from the staff dashboard now."
        primary={{ href: "/hotels/create", label: "Create hotel" }}
        secondary={{ href: "/hotels/manage", label: "Manage hotels" }}
      />
    );
  }

  if (application?.status === "APPROVED") {
    return (
      <StatusScreen
        tone="emerald"
        title="Application approved"
        body={`Your host access was approved on ${formatDate(
          application.reviewedAt,
        )}. Refresh the page if this screen was already open during admin review, then continue into hotel setup.`}
        primary={{ href: nextTarget, label: "Continue" }}
        secondary={{ href: "/profile", label: "Back to profile" }}
      />
    );
  }

  if (hostAccessStatus === "PENDING" || application?.status === "PENDING") {
    const submittedLabel = formatDate(application?.createdAt) || "recently";
    const businessLabel = application?.businessName || "your hotel plan";
    return (
      <StatusScreen
        tone="amber"
        title="Application pending review"
        body={`Submitted on ${submittedLabel} for ${businessLabel}. Your account is already a pending agent. When admin review is finished, refresh the page to see the updated status.`}
        primary={{ href: "/profile", label: "Back to profile" }}
        secondary={{ href: "/support", label: "Questions?" }}
      />
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="flex items-center justify-between px-4 py-4 sm:px-8 sm:py-5">
        <AppLogo href="/" />
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/support"
            className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:inline-flex sm:items-center"
          >
            Questions?
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:px-4"
          >
            Save & exit
          </Link>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-11rem)] w-full max-w-6xl flex-col justify-start px-4 pb-32 pt-2 sm:justify-center sm:px-8 sm:pb-28 sm:pt-4">
        {error ? <ErrorNotice message={getErrorMessage(error)} /> : null}

        {application?.status === "REJECTED" ? (
          <div className="mb-4 rounded-[1.25rem] border border-slate-300 bg-slate-100 px-4 py-4 text-sm text-slate-700 sm:mb-6 sm:rounded-[1.6rem] sm:px-5">
            <div className="flex items-start gap-3">
              <ShieldAlert size={18} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Previous application was rejected</p>
                <p className="mt-1">
                  {application.reviewNote?.trim() ||
                    "No review note was provided. Update the details below and resubmit for another review."}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="mx-auto w-full max-w-5xl">
            <div className="mb-5 max-w-3xl sm:mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Step 1
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:mt-3 sm:text-5xl">
                Which of these best describes your hotel plan?
              </h1>
              <p className="mt-2 text-sm leading-7 text-slate-500 sm:mt-3 sm:text-base sm:leading-8">
                Choose the hotel type that matches the kind of property you plan to list on Meomul.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 sm:gap-4">
              {PROPERTY_OPTIONS.map((option) => (
                <StepCard
                  key={option.value}
                  selected={draft.hotelType === option.value}
                  onClick={() => setDraft((prev) => ({ ...prev, hotelType: option.value }))}
                  title={option.label}
                  description={option.desc}
                  icon={option.icon}
                />
              ))}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mx-auto w-full max-w-3xl">
            <div className="mb-5 text-left sm:mb-10 sm:text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Step 2
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:mt-3 sm:text-5xl">
                What kind of trips is this hotel best for?
              </h1>
              <p className="mt-2 text-sm leading-7 text-slate-500 sm:mt-3 sm:text-base sm:leading-8">
                Select the travel purposes that best fit your hotel. This mirrors your actual Meomul hotel setup.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 sm:gap-4">
              {PURPOSE_OPTIONS.map((option) => (
                <StepCard
                  key={option.value}
                  selected={draft.suitableFor.includes(option.value)}
                  onClick={() => {
                    setDraft((prev) => ({
                      ...prev,
                      suitableFor: prev.suitableFor.includes(option.value)
                        ? prev.suitableFor.filter((value) => value !== option.value)
                        : [...prev.suitableFor, option.value as StayPurpose],
                    }));
                  }}
                  title={option.title}
                  description={option.description}
                  icon={option.icon}
                />
              ))}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mx-auto w-full max-w-3xl">
            <div className="mb-5 text-left sm:mb-10 sm:text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Step 3
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:mt-3 sm:text-5xl">
                Where is your hotel located?
              </h1>
              <p className="mt-2 text-sm leading-7 text-slate-500 sm:mt-3 sm:text-base sm:leading-8">
                Start with the primary city and planned hotel name. You can add full hotel details
                after your account is approved.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.24)] sm:rounded-[2rem] sm:p-6">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Building2 size={16} />
                    Planned hotel name
                  </span>
                  <input
                    value={draft.intendedHotelName ?? ""}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, intendedHotelName: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                    placeholder="Grand Hyatt Jeju"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <MapPin size={16} />
                    Primary city
                  </span>
                  <select
                    value={draft.intendedHotelLocation ?? ""}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        intendedHotelLocation: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  >
                    {LOCATION_OPTIONS.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4 rounded-[1.3rem] bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-500 sm:mt-5 sm:rounded-[1.6rem] sm:px-5">
                Detailed address and exact map pin are not required at the host approval stage. We
                only need the primary operating city for initial review.
              </div>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="mx-auto w-full max-w-3xl">
            <div className="mb-5 text-left sm:mb-10 sm:text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Step 4
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:mt-3 sm:text-5xl">
                Tell us about your business
              </h1>
              <p className="mt-2 text-sm leading-7 text-slate-500 sm:mt-3 sm:text-base sm:leading-8">
                These details are used by the admin team to verify your host access request.
              </p>
            </div>

            <div className="grid gap-4 rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.24)] md:grid-cols-2 sm:gap-5 sm:rounded-[2rem] sm:p-6">
              <label className="block md:col-span-2">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Building2 size={16} />
                  Business or operator name
                </span>
                <input
                  value={draft.businessName}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, businessName: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  placeholder="Example Hospitality Group"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Headset size={16} />
                  Contact phone
                </span>
                <input
                  value={draft.contactPhone ?? ""}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, contactPhone: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  placeholder="01012345678"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Mail size={16} />
                  Business email
                </span>
                <input
                  value={draft.businessEmail ?? ""}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, businessEmail: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  placeholder="ops@example.com"
                />
              </label>
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="mx-auto w-full max-w-4xl">
            <div className="mb-5 text-left sm:mb-10 sm:text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Step 5
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:mt-3 sm:text-5xl">
                Finish and submit for review
              </h1>
              <p className="mt-2 text-sm leading-7 text-slate-500 sm:mt-3 sm:text-base sm:leading-8">
                Give the admin reviewer enough context to evaluate your hosting operation.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] sm:gap-6">
              <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.24)] sm:rounded-[2rem] sm:p-6">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Business description
                  </span>
                  <textarea
                    value={draft.businessDescription}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        businessDescription: event.target.value,
                      }))
                    }
                    className="min-h-[190px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                    placeholder="Describe the hospitality business, operations, staffing model, and why you want to list on Meomul."
                  />
                </label>

                <label className="mt-4 block sm:mt-5">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Extra note for reviewer
                  </span>
                  <textarea
                    value={draft.notes ?? ""}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, notes: event.target.value }))
                    }
                    className="min-h-[120px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                    placeholder="Anything else the admin should know before approving host access."
                  />
                </label>
              </div>

              <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4 sm:rounded-[2rem] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Review summary
                </p>
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-sm text-slate-500">Property format</p>
                    <p className="mt-1 text-base font-semibold text-slate-950">
                      {PROPERTY_OPTIONS.find((option) => option.value === draft.hotelType)?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Suitable for</p>
                    <p className="mt-1 text-base font-semibold text-slate-950">
                      {draft.suitableFor.length > 0 ? draft.suitableFor.join(", ") : "Not selected"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Planned property</p>
                    <p className="mt-1 text-base font-semibold text-slate-950">
                      {draft.intendedHotelName} · {draft.intendedHotelLocation}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Business</p>
                    <p className="mt-1 text-base font-semibold text-slate-950">{draft.businessName}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {draft.contactPhone} · {draft.businessEmail}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-500 sm:mt-6 sm:rounded-[1.4rem]">
                  Submitting this application switches your account into
                  <span className="font-semibold text-slate-900"> pending AGENT</span> status.
                  Hotel creation becomes available after approval.
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/96 px-4 py-3 backdrop-blur sm:px-8 sm:py-4">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full ${
                  index + 1 <= step ? "bg-slate-950" : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            <span>{`Application step ${step} of ${TOTAL_STEPS}`}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(1, current - 1))}
              disabled={step === 1}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:justify-start sm:border-0 sm:px-1 sm:py-2"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </button>

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={() => setStep((current) => Math.min(TOTAL_STEPS, current + 1))}
                disabled={!canGoNext}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-35"
              >
                Next
                <ArrowRight size={16} className="ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!submitting) void onSubmit();
                }}
                disabled={!canGoNext || submitting || loading}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-35"
              >
                {submitting ? "Submitting..." : "Submit for review"}
                <ArrowRight size={16} className="ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

HostApplyPage.auth = {
  roles: ["AGENT"],
};

export default HostApplyPage;
