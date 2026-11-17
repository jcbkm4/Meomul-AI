import type { IncomingMessage } from "http";

/**
 * Headers a server-side render forwards to the API.
 *
 * - `cf-connecting-ip`: the visitor's address as Cloudflare saw it. Without it every SSR call
 *   reaches the API from the web container's address, so all visitors share one rate-limit
 *   bucket and a busy minute starts failing page renders.
 * - `cookie` (opt-in): for pages whose data depends on who is signed in.
 */
export function ssrForwardHeaders(
  req: IncomingMessage | undefined,
  { withCookies = false }: { withCookies?: boolean } = {},
): Record<string, string> | undefined {
  if (!req) return undefined;
  const headers: Record<string, string> = {};
  const visitorIp = req.headers["cf-connecting-ip"];
  if (typeof visitorIp === "string" && visitorIp) headers["cf-connecting-ip"] = visitorIp;
  if (withCookies && typeof req.headers.cookie === "string" && req.headers.cookie) headers.cookie = req.headers.cookie;
  return Object.keys(headers).length > 0 ? headers : undefined;
}
