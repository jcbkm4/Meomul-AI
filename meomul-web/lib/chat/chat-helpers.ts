import type { ChatDto } from "@/types/chat";

// ─── Constants ────────────────────────────────────────────────────────────────

export const AVATAR_COLORS = [
  "bg-sky-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-teal-500",
] as const;

export const SUPPORT_CHAT_TITLE = "Meomul Support";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function avatarBg(id: string): string {
  if (!id) return AVATAR_COLORS[0];
  return AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];
}

export function getGuestDisplayName(chat: ChatDto, fallback = "Guest"): string {
  return chat.guestNick?.trim() || fallback;
}

export function getGuestAvatarLetter(chat: ChatDto, fallback = "G"): string {
  const label = getGuestDisplayName(chat, fallback);
  return label.charAt(0).toUpperCase() || fallback;
}

export function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diffMs / 60000);
  const h = Math.floor(diffMs / 3600000);
  const d = Math.floor(diffMs / 86400000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  if (d === 1) return "Yesterday";
  if (d < 7)
    return (
      ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
        new Date(dateStr).getDay()
      ] ?? "—"
    );
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function fmtTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Seoul",
  });
}

export function getLastPreview(chat: ChatDto): string {
  const msg = (chat.messages ?? []).at(-1);
  if (!msg) return "Start the conversation";
  if (msg.messageType === "IMAGE") return "📷 Photo";
  if (msg.messageType === "FILE") return "📎 Attachment";
  return msg.content?.trim() || "Message";
}
