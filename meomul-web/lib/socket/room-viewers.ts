import { io, type Socket } from "socket.io-client";
import { env } from "@/lib/config/env";

const trimTrailingSlashes = (value: string): string => value.replace(/\/+$/, "");

const resolveRoomViewersSocketBaseUrl = (): string => {
  const configured = trimTrailingSlashes(env.chatSocketUrl);
  if (configured) {
    if (configured.endsWith("/room-viewers")) {
      return configured.slice(0, -13);
    }
    if (configured.endsWith("/chat")) {
      return configured.slice(0, -5);
    }
    return configured;
  }

  return trimTrailingSlashes(env.graphqlUrl).replace(/\/graphql$/i, "");
};

export const createRoomViewersSocket = (token: string | null): Socket => {
  const baseUrl = resolveRoomViewersSocketBaseUrl();

  return io(`${baseUrl}/room-viewers`, {
    autoConnect: true,
    withCredentials: true,
    transports: ["polling", "websocket"],
    closeOnBeforeunload: true,
    ...(token ? { auth: { token: `Bearer ${token}` } } : {}),
  });
};
