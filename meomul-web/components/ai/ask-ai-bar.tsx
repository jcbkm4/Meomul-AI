import { useRouter } from "next/router";
import type { FormEvent } from "react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { MeomulAiMark } from "./meomul-ai-mark";

/**
 * One quiet line on the hotels page: describe the trip, and Meomul AI picks it up on its own
 * page (/ai?q=...). Kept to a single row so the hotel results stay the focus here.
 */
export function AskAiBar() {
  const router = useRouter();
  const { t } = useI18n();
  const [text, setText] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const question = text.trim();
    void router.push(question ? { pathname: "/ai", query: { q: question } } : "/ai");
  };

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-2 rounded-2xl border border-line bg-paper p-1.5 shadow-sm transition-[border-color,box-shadow] duration-200 focus-within:border-harbor-line focus-within:shadow-md focus-within:shadow-ink/5 sm:rounded-full sm:p-1.5 sm:pl-2"
    >
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-harbor sm:rounded-full">
        <MeomulAiMark size={16} className="text-paper" />
      </span>
      <label htmlFor="ask-ai-bar" className="sr-only">
        {t("ai_bar_placeholder")}
      </label>
      <input
        id="ask-ai-bar"
        value={text}
        onChange={(event) => setText(event.target.value)}
        maxLength={500}
        enterKeyHint="go"
        autoComplete="off"
        placeholder={t("ai_bar_placeholder")}
        className="min-w-0 flex-1 bg-transparent px-1.5 text-[15px] text-ink caret-brand outline-none placeholder:text-quiet"
      />
      <button
        type="submit"
        className="inline-flex h-9 shrink-0 items-center rounded-xl bg-ink px-4 text-sm font-semibold text-paper transition-[background-color,transform] hover:bg-ink-soft active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:rounded-full"
      >
        {t("ai_bar_submit")}
      </button>
    </form>
  );
}
