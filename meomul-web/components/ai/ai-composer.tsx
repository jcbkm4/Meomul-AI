import type { KeyboardEvent } from "react";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { ArrowUp, Square } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export interface AiComposerHandle {
  focus: () => void;
}

/**
 * The message box: Enter sends, Shift+Enter adds a line, and while a reply is streaming the
 * send button becomes a stop button.
 */
export const AiComposer = forwardRef<
  AiComposerHandle,
  { busy: boolean; onSend: (text: string) => void; onStop: () => void; size?: "large" | "regular"; autoFocus?: boolean }
>(function AiComposer({ busy, onSend, onStop, size = "regular", autoFocus = false }, ref) {
  const { t } = useI18n();
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const large = size === "large";

  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }), []);

  useEffect(() => {
    if (autoFocus && window.matchMedia("(min-width: 640px)").matches) inputRef.current?.focus();
  }, [autoFocus]);

  const resize = () => {
    const element = inputRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, large ? 200 : 160)}px`;
  };

  const submit = () => {
    const text = draft.trim();
    if (!text || busy) return;
    onSend(text);
    setDraft("");
    window.requestAnimationFrame(resize);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className={`flex items-end gap-2 rounded-[1.6rem] border border-line bg-paper shadow-lg shadow-ink/[0.06] transition-[border-color,box-shadow] duration-200 focus-within:border-harbor-line focus-within:shadow-ink/10 ${
        large ? "p-2.5 pl-5" : "p-2 pl-4"
      }`}
    >
      <label htmlFor="meomul-ai-message" className="sr-only">
        {t("chat_placeholder")}
      </label>
      <textarea
        id="meomul-ai-message"
        ref={inputRef}
        rows={large ? 2 : 1}
        value={draft}
        maxLength={2000}
        enterKeyHint="send"
        onChange={(event) => {
          setDraft(event.target.value);
          resize();
        }}
        onKeyDown={handleKeyDown}
        placeholder={t("chat_placeholder")}
        className={`flex-1 resize-none bg-transparent text-ink outline-none placeholder:text-quiet ${
          large ? "min-h-14 py-2 text-[17px] leading-7" : "min-h-10 py-2 text-base leading-6"
        }`}
      />
      {busy ? (
        <button
          type="button"
          onClick={onStop}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition-[background-color,transform] hover:bg-ink-soft active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          aria-label={t("ai_stop")}
        >
          <Square size={12} className="fill-current" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!draft.trim()}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition-[background-color,transform] hover:bg-ink-soft active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:bg-line disabled:text-quiet"
          aria-label={t("chat_send")}
        >
          <ArrowUp size={18} aria-hidden="true" />
        </button>
      )}
    </form>
  );
});
