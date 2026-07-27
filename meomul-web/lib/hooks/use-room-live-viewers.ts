import { useEffect, useRef, useState } from "react";
import { getAccessToken, getSessionMember } from "@/lib/auth/session";
import { usePageVisible } from "@/lib/hooks/use-page-visible";
import { createRoomViewersSocket } from "@/lib/socket/room-viewers";

interface UseRoomLiveViewersInput {
  roomId: string;
}

interface UseRoomLiveViewersResult {
  viewerCount: number;
  connected: boolean;
}

interface ViewerCountPayload {
  roomId?: string;
  count?: number;
  viewerCount?: number;
}

const VIEWER_SESSION_STORAGE_KEY = "meomul.viewer_session_id";

const createViewerSessionId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `viewer-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
};

const getOrCreateViewerSessionId = (): string => {
  if (typeof window === "undefined") {
    return "viewer-ssr";
  }

  try {
    const existing = window.localStorage.getItem(VIEWER_SESSION_STORAGE_KEY);
    if (existing) {
      return existing;
    }

    const created = createViewerSessionId();
    window.localStorage.setItem(VIEWER_SESSION_STORAGE_KEY, created);
    return created;
  } catch {
    return createViewerSessionId();
  }
};

const toSafeCount = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.floor(value));
};

const extractCount = (payload: ViewerCountPayload | null | undefined): number | null => {
  if (!payload) {
    return null;
  }
  if (typeof payload.count === "number") {
    return toSafeCount(payload.count);
  }
  if (typeof payload.viewerCount === "number") {
    return toSafeCount(payload.viewerCount);
  }
  return null;
};

export const useRoomLiveViewers = ({ roomId }: UseRoomLiveViewersInput): UseRoomLiveViewersResult => {
  const [viewerCount, setViewerCount] = useState<number>(0);
  const [connected, setConnected] = useState(false);
  const joinedRef = useRef(false);
  const isPageVisible = usePageVisible();

  useEffect(() => {
    setViewerCount(0);
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !isPageVisible) {
      setConnected(false);
      joinedRef.current = false;
      return;
    }

    const token = getAccessToken();
    const member = getSessionMember();
    const viewerSessionId = getOrCreateViewerSessionId();
    const socket = createRoomViewersSocket(token);

    const applyPayload = (payload: ViewerCountPayload | null | undefined): void => {
      if (!payload || payload.roomId !== roomId) {
        return;
      }

      const count = extractCount(payload);
      if (count === null) {
        return;
      }
      setViewerCount(count);
    };

    const joinRoom = (): void => {
      if (!socket.connected || joinedRef.current) {
        return;
      }
      joinedRef.current = true;
      socket.emit("joinRoom", { roomId, userId: member?._id, viewerSessionId }, (payload?: ViewerCountPayload) => {
        applyPayload(payload);
      });
    };

    const handleViewerCountUpdated = (payload: ViewerCountPayload): void => {
      applyPayload(payload);
    };

    const handleConnect = (): void => {
      setConnected(true);
      joinRoom();
    };

    const handleDisconnect = (): void => {
      setConnected(false);
      joinedRef.current = false;
    };

    socket.on("viewerCountUpdated", handleViewerCountUpdated);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("viewerCountUpdated", handleViewerCountUpdated);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
    };
  }, [isPageVisible, roomId]);

  return {
    viewerCount,
    connected,
  };
};
