import { useMutation } from "@apollo/client/react";
import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpRight,
  BadgeCheck,
  BrainCircuit,
  Coins,
  Hotel,
  Loader2,
  MessageSquareText,
  Route,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { ASK_STAY_CONCIERGE_MUTATION } from "@/graphql/ai-concierge.gql";
import { START_SUPPORT_CHAT_MUTATION } from "@/graphql/chat.gql";
import { getErrorMessage } from "@/lib/utils/error";
import type {
  AskStayConciergeMutationData,
  AskStayConciergeMutationVars,
  StayCandidateDto,
  StayConciergeResultDto,
} from "@/types/ai-concierge";
import type {
  StartSupportChatMutationData,
  StartSupportChatMutationVars,
} from "@/types/chat";

interface AskMeomulDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXAMPLE_PROMPTS = [
  "Quiet business hotel in Seoul under 200,000 KRW with workspace and subway access",
  "Couple stay with spa and romantic view in Busan",
  "Family room for 4 guests with parking and breakfast",
  "Last-minute staycation with pool and late check-in",
];

const formatKrw = (value?: number | null): string => {
  if (!value) {
    return "Price not listed";
  }
  return `${new Intl.NumberFormat("en-US").format(value)} KRW`;
};

const formatConfidence = (value: number): string => `${Math.round(value * 100)}%`;

function DetailList({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: ReactNode;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {icon}
        <span>{title}</span>
      </div>
      <div className="space-y-1.5">
        {items.slice(0, 4).map((item) => (
          <p
            key={item}
            className="text-sm leading-5 text-slate-700"
          >
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function CandidateCard({ candidate, index }: { candidate: StayCandidateDto; index: number }) {
  return (
    <article className="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_20px_70px_-46px_rgba(15,23,42,0.45)]">
      <div className="border-b border-slate-100 bg-slate-950 px-4 py-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200">
              Match {index + 1}
            </p>
            <h3 className="mt-1 text-base font-bold leading-6">{candidate.hotelTitle}</h3>
            {candidate.roomName ? (
              <p className="mt-1 text-sm text-slate-300">{candidate.roomName}</p>
            ) : null}
          </div>
          <div className="shrink-0 rounded-2xl bg-white px-3 py-2 text-center text-slate-950">
            <p className="text-lg font-black leading-none">{candidate.fitScore}</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              fit
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-emerald-50 px-3 py-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">
              Estimate
            </p>
            <p className="mt-1 text-sm font-bold text-emerald-950">
              {formatKrw(candidate.estimatedPrice)}
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50 px-3 py-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700">
              Best date
            </p>
            <p className="mt-1 text-sm font-bold text-amber-950">
              {candidate.cheapestDate ?? "Check calendar"}
            </p>
          </div>
        </div>

        <DetailList
          title="Why it fits"
          items={candidate.reasons}
          icon={<BadgeCheck size={14} />}
        />
        <DetailList
          title="Trust"
          items={candidate.trustSignals}
          icon={<ShieldCheck size={14} />}
        />
        <DetailList
          title="Price timing"
          items={candidate.priceInsights}
          icon={<Coins size={14} />}
        />
        <DetailList
          title="Tradeoffs"
          items={candidate.tradeoffs}
          icon={<Route size={14} />}
        />

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            href={`/hotels/${candidate.hotelId}`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <Hotel size={16} />
            Hotel
          </Link>
          {candidate.roomId ? (
            <Link
              href={`/rooms/${candidate.roomId}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:border-slate-500"
            >
              Room
              <ArrowUpRight size={16} />
            </Link>
          ) : (
            <Link
              href={`/hotels/${candidate.hotelId}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:border-slate-500"
            >
              Details
              <ArrowUpRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function IntentPanel({ result }: { result: StayConciergeResultDto }) {
  const intent = result.intent;
  const chips = [
    intent.location,
    intent.purpose,
    intent.guests ? `${intent.guests} guests` : null,
    intent.budgetMax ? `Under ${formatKrw(intent.budgetMax)}` : null,
    ...intent.amenities.slice(0, 5),
    ...intent.transportPreferences.slice(0, 2),
  ].filter(Boolean) as string[];

  return (
    <div className="rounded-[1.35rem] border border-slate-200 bg-white/75 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Parsed intent
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Confidence {formatConfidence(intent.confidence)} · {result.provider}
          </p>
        </div>
        <BrainCircuit
          size={22}
          className="text-teal-700"
        />
      </div>
      {chips.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800"
            >
              {chip}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AskMeomulDrawer({ isOpen, onClose }: AskMeomulDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState(EXAMPLE_PROMPTS[0]);
  const [result, setResult] = useState<StayConciergeResultDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supportError, setSupportError] = useState<string | null>(null);
  const [supportChatId, setSupportChatId] = useState<string | null>(null);
  const [askStayConcierge, { loading }] = useMutation<
    AskStayConciergeMutationData,
    AskStayConciergeMutationVars
  >(ASK_STAY_CONCIERGE_MUTATION);
  const [startSupportChat, { loading: startingSupportChat }] = useMutation<
    StartSupportChatMutationData,
    StartSupportChatMutationVars
  >(START_SUPPORT_CHAT_MUTATION);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = message.trim();
    setError(null);

    if (trimmed.length < 4) {
      setError("Describe the stay in a little more detail.");
      return;
    }

    try {
      const response = await askStayConcierge({
        variables: {
          input: {
            message: trimmed,
            language: /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(trimmed) ? "ko" : "en",
          },
        },
      });
      setResult(response.data?.askStayConcierge ?? null);
      setSupportError(null);
      setSupportChatId(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleSupportHandoff = async () => {
    if (!result) {
      return;
    }

    setSupportError(null);
    const topCandidates = result.candidates
      .slice(0, 3)
      .map((candidate, index) => `${index + 1}. ${candidate.hotelTitle} (${candidate.fitScore}/100)`)
      .join("\n");

    try {
      const response = await startSupportChat({
        variables: {
          input: {
            topic: "AI concierge",
            sourcePath: "/hotels",
            initialMessage: [
              "AI concierge context",
              "",
              `Request: ${message.trim()}`,
              `Summary: ${result.summary}`,
              `Next action: ${result.nextAction}`,
              topCandidates ? `Top candidates:\n${topCandidates}` : "Top candidates: none",
            ].join("\n"),
          },
        },
      });
      setSupportChatId(response.data?.startSupportChat._id ?? null);
    } catch (err) {
      setSupportError(getErrorMessage(err));
    }
  };

  if (!mounted || !isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        aria-label="Close Ask Meomul"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[760px] flex-col overflow-hidden bg-[#f7f3ec] shadow-[-30px_0_80px_-50px_rgba(15,23,42,0.55)]">
        <div className="border-b border-slate-200 bg-[#f7f3ec]/95 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-teal-800 shadow-sm">
                <Sparkles size={14} />
                Ask Meomul
              </div>
              <h2 className="mt-3 font-display text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Find the stay that actually fits.
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <form
            onSubmit={handleSubmit}
            className="rounded-[1.35rem] border border-slate-200 bg-white p-3 shadow-[0_20px_70px_-52px_rgba(15,23,42,0.5)]"
          >
            <textarea
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
              }}
              rows={4}
              className="min-h-28 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:bg-white"
              placeholder="Quiet business hotel in Seoul under 200,000 KRW with workspace and subway access"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    setMessage(prompt);
                  }}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
                >
                  {prompt.split(" ").slice(0, 5).join(" ")}
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs leading-5 text-slate-500">
                Uses active hotels, rooms, trust signals, and price timing.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                Analyze
              </button>
            </div>
          </form>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {result ? (
            <div className="mt-4 space-y-4">
              <IntentPanel result={result} />

              <div className="rounded-[1.35rem] border border-slate-200 bg-white/75 p-4">
                <div className="flex items-start gap-3">
                  <MessageSquareText
                    size={20}
                    className="mt-0.5 shrink-0 text-teal-700"
                  />
                  <div>
                    <p className="text-sm leading-6 text-slate-800">{result.summary}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {result.nextAction}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSupportHandoff}
                        disabled={startingSupportChat}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 transition hover:border-teal-300 hover:text-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {startingSupportChat ? (
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />
                        ) : (
                          <MessageSquareText size={14} />
                        )}
                        Ask support with this context
                      </button>
                      {supportChatId ? (
                        <Link
                          href={`/chats/${supportChatId}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-teal-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-teal-800"
                        >
                          Open chat
                          <ArrowUpRight size={14} />
                        </Link>
                      ) : null}
                    </div>
                    {supportError ? (
                      <p className="mt-2 text-xs leading-5 text-red-600">{supportError}</p>
                    ) : null}
                  </div>
                </div>
              </div>

              {result.clarifyingQuestions.length > 0 ? (
                <div className="rounded-[1.35rem] border border-amber-100 bg-amber-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
                    Useful refinements
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {result.clarifyingQuestions.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => {
                          setMessage(`${message.trim()}\n${question} `);
                        }}
                        className="block w-full rounded-xl px-2 py-1.5 text-left text-sm leading-5 text-amber-950 transition hover:bg-amber-100"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="space-y-3">
                {result.candidates.map((candidate, index) => (
                  <CandidateCard
                    key={candidate.hotelId}
                    candidate={candidate}
                    index={index}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
