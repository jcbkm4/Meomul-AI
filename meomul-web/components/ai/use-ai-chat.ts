import { useCallback, useEffect, useRef, useState } from "react";
import { env } from "@/lib/config/env";

export interface AiStayCard {
  hotelId: string;
  title: string;
  image?: string;
  location?: string;
  district?: string;
  rating?: number;
  reviews?: number;
  roomId?: string;
  roomName?: string;
  pricePerNight?: number;
  fitScore: number;
}

export interface AiStatus {
  step: "search" | "details";
  city?: string;
}

export interface AiMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  hotels?: AiStayCard[];
  /** What Meomul AI is doing right now: searching (in a city) or reading a hotel's details. */
  status?: AiStatus | null;
  pending?: boolean;
  error?: string | null;
}

type StreamEvent =
  | { type: "status"; step: AiStatus["step"]; city?: string }
  | { type: "delta"; text: string }
  | { type: "hotels"; items: AiStayCard[] }
  | { type: "done" }
  | { type: "error"; code: string; message: string };

const STORAGE_KEY = "meomul.ai.v2";
const MAX_SENT_TURNS = 20;
/** The server sends a heartbeat every 15 s, so this much silence means the connection is gone. */
const CLIENT_IDLE_MS = 75_000;

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const loadStored = (): AiMessage[] => {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as AiMessage[]) : [];
    return Array.isArray(parsed) ? parsed.filter((message) => !message.pending) : [];
  } catch {
    return [];
  }
};

/** What goes back to the model: the visible transcript, as text only. */
const toApiTurns = (messages: AiMessage[]) =>
  messages
    .filter((message) => !message.error && message.text.trim())
    .map((message) => ({ role: message.role, content: message.text.trim().slice(0, 3900) }))
    .slice(-MAX_SENT_TURNS);

/**
 * Stays already shown as cards, newest first, so follow-ups like "tell me more about the
 * second one" still work. Sent beside the transcript, never inside it.
 */
const toShownStays = (messages: AiMessage[]) => {
  const seen = new Map<string, string>();
  for (const message of [...messages].reverse()) {
    for (const hotel of message.hotels ?? []) {
      if (!seen.has(hotel.hotelId)) seen.set(hotel.hotelId, hotel.title.slice(0, 120));
    }
  }
  return [...seen].slice(0, 12).map(([hotelId, title]) => ({ hotelId, title }));
};

/** Streams Meomul AI replies from POST /ai/chat (Server-Sent Events) and keeps the transcript for the tab. */
export function useAiChat({ locale, pagePath }: { locale: string; pagePath: string }) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<AiMessage[]>([]);
  const loadedRef = useRef(false);

  useEffect(() => {
    const stored = loadStored();
    messagesRef.current = stored;
    setMessages(stored);
    loadedRef.current = true;
    setReady(true);
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
    if (!loadedRef.current) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.filter((message) => !message.pending)));
    } catch {
      // Storage can be unavailable (private mode); the chat still works for this page view.
    }
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const patch = useCallback((id: string, update: (message: AiMessage) => AiMessage) => {
    setMessages((previous) => previous.map((message) => (message.id === id ? update(message) : message)));
  }, []);

  const stream = useCallback(
    async (history: AiMessage[], assistantId: string) => {
      const controller = new AbortController();
      abortRef.current = controller;
      setBusy(true);
      let finished = false;
      let timedOut = false;
      let idleTimer: number | undefined;
      const armIdle = () => {
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(() => {
          timedOut = true;
          controller.abort();
        }, CLIENT_IDLE_MS);
      };
      armIdle();

      const handle = (event: StreamEvent) => {
        if (event.type === "status") {
          patch(assistantId, (message) => ({ ...message, status: { step: event.step, city: event.city } }));
        } else if (event.type === "delta") {
          patch(assistantId, (message) => ({ ...message, status: null, text: message.text + event.text }));
        } else if (event.type === "hotels") {
          // A stay shown earlier keeps the card it had then (same room and price), so the
          // conversation never shows two different prices for one hotel.
          const earlier = new Map<string, AiStayCard>();
          for (const message of history) {
            for (const hotel of message.hotels ?? []) earlier.set(hotel.hotelId, hotel);
          }
          const items = event.items.map((item) => earlier.get(item.hotelId) ?? item);
          patch(assistantId, (message) => ({ ...message, hotels: items }));
        } else if (event.type === "error") {
          finished = true;
          patch(assistantId, (message) => ({ ...message, pending: false, status: null, error: event.message }));
        } else if (event.type === "done") {
          finished = true;
          patch(assistantId, (message) => ({ ...message, pending: false, status: null }));
        }
      };

      try {
        const response = await fetch(`${env.apiUrl}/ai/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: toApiTurns(history),
            shownStays: toShownStays(history),
            pagePath: pagePath.slice(0, 200),
            locale,
          }),
          signal: controller.signal,
        });
        if (!response.ok || !response.body) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          armIdle();
          buffer += decoder.decode(value, { stream: true });
          let boundary = buffer.indexOf("\n\n");
          while (boundary !== -1) {
            const block = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            const data = block
              .split("\n")
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.slice(5).trimStart())
              .join("\n");
            if (data) {
              try {
                handle(JSON.parse(data) as StreamEvent);
              } catch {
                // Ignore a malformed event rather than dropping the whole reply.
              }
            }
            boundary = buffer.indexOf("\n\n");
          }
        }
        if (!finished) {
          patch(assistantId, (message) => ({ ...message, pending: false, status: null }));
        }
      } catch {
        if (controller.signal.aborted && !timedOut) {
          patch(assistantId, (message) => ({ ...message, pending: false, status: null }));
        } else {
          patch(assistantId, (message) => ({ ...message, pending: false, status: null, error: "network" }));
        }
      } finally {
        window.clearTimeout(idleTimer);
        if (abortRef.current === controller) abortRef.current = null;
        setBusy(false);
      }
    },
    [locale, pagePath, patch],
  );

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || abortRef.current) return;
      const user: AiMessage = { id: newId(), role: "user", text: trimmed };
      const assistant: AiMessage = { id: newId(), role: "assistant", text: "", pending: true, status: null };
      const history = [...messagesRef.current, user];
      setMessages([...history, assistant]);
      void stream(history, assistant.id);
    },
    [stream],
  );

  /** Re-asks the last question after a failed reply. */
  const retry = useCallback(() => {
    if (abortRef.current) return;
    const current = messagesRef.current;
    const last = current[current.length - 1];
    if (!last || last.role !== "assistant" || !last.error) return;
    const history = current.slice(0, -1);
    const assistant: AiMessage = { id: newId(), role: "assistant", text: "", pending: true, status: null };
    setMessages([...history, assistant]);
    void stream(history, assistant.id);
  }, [stream]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
  }, []);

  return { messages, busy, ready, send, retry, stop, reset };
}
