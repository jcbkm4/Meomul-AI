import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  Observable,
  from,
} from "@apollo/client";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { ErrorLink } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import { restorePersistedApolloCache } from "@/lib/apollo/cache-storage";
import { clearAuthSession, silentRefreshAccessToken } from "@/lib/auth/session";
import { env } from "@/lib/config/env";

// No explicit authLink needed — the httpOnly access token cookie is sent
// automatically by the browser via credentials: "include" on every request.

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  // Handle GraphQL errors
  if (CombinedGraphQLErrors.is(error)) {
    const unauthenticated = error.errors.some(
      (graphQLError) => graphQLError.extensions?.code === "UNAUTHENTICATED",
    );

    if (unauthenticated) {
      // Skip refresh for the refreshToken mutation itself to avoid infinite loops
      if (operation.operationName === "RefreshToken") {
        clearAuthSession();
        if (typeof window !== "undefined") {
          window.location.href = `/auth/login?next=${encodeURIComponent(window.location.pathname)}`;
        }
        return;
      }

      // Attempt silent token refresh, then retry the failed operation
      return new Observable((subscriber) => {
        silentRefreshAccessToken()
          .then((refreshed) => {
            if (!refreshed) {
              clearAuthSession();
              if (typeof window !== "undefined") {
                window.location.href = `/auth/login?next=${encodeURIComponent(window.location.pathname)}`;
              }
              subscriber.complete();
              return;
            }

            // Retry — the refreshed access token cookie is set by the server,
            // so the browser sends it automatically on the next request.
            forward(operation).subscribe(subscriber);
          })
          .catch(() => {
            clearAuthSession();
            if (typeof window !== "undefined") {
              window.location.href = `/auth/login?next=${encodeURIComponent(window.location.pathname)}`;
            }
            subscriber.complete();
          });
      });
    }
    return;
  }

  // Network or other errors (connection failures, timeouts, 5xx)
  console.error(
    "[Apollo] Network/transport error:",
    (error as Error)?.message ?? error,
  );
});

const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: 5000,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error) => {
      // Retry on network errors (connection refused, timeout, etc.)
      // Do NOT retry on HTTP errors with a known status code (4xx/5xx)
      if (!error) return false;
      const statusCode = (error as { statusCode?: number }).statusCode;
      return !statusCode;
    },
  },
});

const httpLink = new HttpLink({
  uri: env.graphqlHttpUrl,
  credentials: "include",
});

export const createApolloClient = (options?: { headers?: Record<string, string> }) => {
  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getMyLikes: {
            keyArgs: ["likeGroup"],
            merge: false,
          },
          getMyNotifications: {
            keyArgs: ["unreadOnly", "limit"],
            merge: false,
          },
        },
      },
      BookingDto: { keyFields: ["_id"] },
      ChatDto: { keyFields: ["_id"] },
      Hotel: { keyFields: ["_id"] },
      HotelDto: { keyFields: ["_id"] },
      MemberDto: { keyFields: ["_id"] },
      Room: { keyFields: ["_id"] },
      RoomDto: { keyFields: ["_id"] },
      User: { keyFields: ["_id"] },
      Member: { keyFields: ["_id"] },
    },
  });
  restorePersistedApolloCache(cache);

  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    queryDeduplication: true,
    assumeImmutableResults: true,
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-and-network",
        returnPartialData: false,
      },
      query: {
        fetchPolicy: "network-only",
      },
    },
    link: from([
      errorLink,
      retryLink,
      options?.headers
        ? new HttpLink({
            uri: env.graphqlHttpUrl,
            credentials: "include",
            headers: options.headers,
          })
        : httpLink,
    ]),
  });
};
