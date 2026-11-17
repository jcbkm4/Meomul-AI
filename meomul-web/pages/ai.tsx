import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useLayoutEffect, useRef } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { AiComposer, type AiComposerHandle } from "@/components/ai/ai-composer";
import { AiRichText } from "@/components/ai/ai-rich-text";
import { AiStayList, AiStayListSkeleton } from "@/components/ai/ai-stay-list";
import { MeomulAiAvatar } from "@/components/ai/meomul-ai-mark";
import { type AiMessage, useAiChat } from "@/components/ai/use-ai-chat";
import { useI18n } from "@/lib/i18n/provider";
import type { TranslationKey } from "@/lib/i18n/messages";

const SUGGESTIONS: TranslationKey[] = ["chat_suggest_1", "chat_suggest_2", "chat_suggest_3", "chat_suggest_4"];
/** Quick follow-ups: a short label on the button, a precise request sent to Meomul AI. */
const FOLLOW_UPS: Array<{ label: TranslationKey; prompt: TranslationKey }> = [
  { label: "ai_followup_compare", prompt: "ai_followup_compare_prompt" },
  { label: "ai_followup_cheaper", prompt: "ai_followup_cheaper_prompt" },
  { label: "ai_followup_breakfast", prompt: "ai_followup_breakfast_prompt" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function StatusLine({ message }: { message: AiMessage }) {
  const { t } = useI18n();
  const status = message.status;
  const label =
    status?.step === "search"
      ? status.city
        ? t("ai_status_search_city", { city: status.city })
        : t("ai_status_search")
      : status?.step === "details"
        ? t("ai_status_details")
        : t("chat_thinking");
  return (
    <p role="status" className="flex items-center gap-2 text-[15px] text-quiet">
      <Loader2 size={16} className="animate-spin text-brand motion-reduce:animate-none" aria-hidden="true" />
      {label}
    </p>
  );
}

function AssistantTurn({
  message,
  isLast,
  busy,
  onRetry,
  onFollowUp,
}: {
  message: AiMessage;
  isLast: boolean;
  busy: boolean;
  onRetry: () => void;
  onFollowUp: (text: string) => void;
}) {
  const { t } = useI18n();
  const working = Boolean(message.pending);
  const searching = working && !message.text && message.status?.step === "search";
  const stays = !working && message.hotels && message.hotels.length > 0 ? message.hotels : null;

  return (
    <li className="flex gap-3">
      <MeomulAiAvatar />
      <div className="min-w-0 flex-1 space-y-4 pt-0.5">
        {message.text ? (
          <div className="max-w-[65ch] text-base leading-7 text-body">
            <AiRichText text={message.text} />
          </div>
        ) : null}

        {working && !message.text ? <StatusLine message={message} /> : null}
        {searching ? <AiStayListSkeleton /> : null}

        {stays ? <AiStayList stays={stays} /> : null}

        {message.error ? (
          <div className="rounded-2xl bg-danger-soft px-4 py-3 text-[15px] leading-6 text-danger-ink">
            <p>{message.error === "network" ? t("chat_error_generic") : message.error}</p>
            {isLast && !busy ? (
              <button
                type="button"
                onClick={onRetry}
                className={`mt-1 font-semibold underline underline-offset-4 active:opacity-70 ${focusRing}`}
              >
                {t("chat_retry")}
              </button>
            ) : null}
          </div>
        ) : null}

        {isLast && stays && !busy ? (
          <div className="flex flex-wrap gap-2">
            {FOLLOW_UPS.map(({ label, prompt }) => (
              <button
                key={label}
                type="button"
                onClick={() => onFollowUp(t(prompt))}
                className={`rounded-full border border-line bg-paper px-3.5 py-2 text-sm text-body transition-colors hover:border-harbor-line hover:text-ink active:scale-[0.98] ${focusRing}`}
              >
                {t(label)}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </li>
  );
}

export default function MeomulAiPage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const hotelParam = typeof router.query.hotel === "string" ? router.query.hotel : "";
  const hotelContext = /^[a-f0-9]{24}$/i.test(hotelParam) ? hotelParam : null;
  const chat = useAiChat({ locale, pagePath: hotelContext ? `/hotels/${hotelContext}` : "/ai" });
  const composerRef = useRef<AiComposerHandle>(null);
  const followBottom = useRef(true);
  const handledQuery = useRef(false);

  const send = (text: string) => {
    followBottom.current = true;
    chat.send(text);
  };

  // A question passed in the link (/ai?q=...) is asked once, then dropped from the URL.
  useEffect(() => {
    if (!router.isReady || !chat.ready || handledQuery.current) return;
    handledQuery.current = true;
    const question = typeof router.query.q === "string" ? router.query.q.trim() : "";
    if (!question) return;
    send(question.slice(0, 2000));
    const rest = { ...router.query };
    delete rest.q;
    void router.replace({ pathname: "/ai", query: rest }, undefined, { shallow: true, scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, chat.ready]);

  useEffect(() => {
    const onScroll = () => {
      const root = document.documentElement;
      followBottom.current = root.scrollHeight - window.scrollY - window.innerHeight < 160;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    if (followBottom.current && chat.messages.length > 0) {
      window.scrollTo({ top: document.documentElement.scrollHeight });
    }
  }, [chat.messages]);

  const empty = chat.messages.length === 0;
  const lastId = chat.messages[chat.messages.length - 1]?.id;

  return (
    <>
      <Head>
        <title>Meomul AI</title>
        <meta name="description" content={t("ai_meta_description")} />
      </Head>

      <main className="meomul-ai mx-auto flex min-h-[calc(100dvh-73px)] w-full max-w-[46rem] flex-col">
        {empty ? (
          <section className="flex flex-1 flex-col justify-center pb-16 pt-10 sm:pb-24">
            <MeomulAiAvatar size="lg" />
            <h1 className="mt-6 max-w-[22ch] font-editorial text-[clamp(2.1rem,5vw,3rem)] leading-[1.08] tracking-[-0.015em] text-ink [overflow-wrap:break-word] [text-wrap:balance]">
              {t("ai_welcome_title")}
            </h1>
            <p className="mt-3 max-w-[34rem] text-[17px] leading-7 text-body">{t("ai_welcome_sub")}</p>

            <div className="mt-8">
              <AiComposer ref={composerRef} busy={chat.busy} onSend={send} onStop={chat.stop} size="large" autoFocus />
            </div>

            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((key) => (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => send(t(key))}
                    className={`h-full w-full rounded-2xl border border-line bg-paper/70 px-4 py-3 text-left text-[15px] leading-6 text-body transition-colors hover:border-harbor-line hover:bg-paper hover:text-ink active:scale-[0.99] ${focusRing}`}
                  >
                    {t(key)}
                  </button>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-sm leading-6 text-quiet">{t("ai_powered")}</p>
          </section>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 py-4 sm:py-5">
              <div className="flex items-center gap-2.5">
                <MeomulAiAvatar size="md" />
                <h1 className="text-base font-semibold text-ink">Meomul AI</h1>
              </div>
              {chat.messages.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    chat.reset();
                    window.scrollTo({ top: 0 });
                  }}
                  className={`inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-2 text-sm font-medium text-body transition-colors hover:border-line-strong hover:text-ink active:scale-[0.98] ${focusRing}`}
                >
                  <RotateCcw size={15} aria-hidden="true" />
                  {t("chat_new")}
                </button>
              ) : null}
            </div>

            <ol className="flex-1 space-y-9 pb-8 pt-2" aria-live="polite" aria-busy={chat.busy}>
              {chat.messages.map((message) =>
                message.role === "user" ? (
                  <li key={message.id} className="flex justify-end">
                    <p className="max-w-[85%] whitespace-pre-wrap rounded-[1.25rem] rounded-br-md bg-ink px-4 py-2.5 text-base leading-6 text-paper">
                      {message.text}
                    </p>
                  </li>
                ) : (
                  <AssistantTurn
                    key={message.id}
                    message={message}
                    isLast={message.id === lastId}
                    busy={chat.busy}
                    onRetry={chat.retry}
                    onFollowUp={send}
                  />
                ),
              )}
            </ol>

            <div className="sticky bottom-0 z-10 -mx-3 bg-gradient-to-t from-background from-70% to-transparent px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-8 sm:-mx-6 sm:px-6">
              <AiComposer ref={composerRef} busy={chat.busy} onSend={send} onStop={chat.stop} />
              <p className="mt-2 text-center text-xs leading-5 text-quiet">{t("ai_disclaimer")}</p>
            </div>
          </>
        )}
      </main>
    </>
  );
}
