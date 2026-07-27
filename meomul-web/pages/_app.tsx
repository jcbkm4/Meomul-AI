import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client/react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { SiteFrame } from "@/components/layout/site-frame";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ToastProvider } from "@/components/ui/toast-provider";
import { I18nProvider, useI18n } from "@/lib/i18n/provider";
import { persistApolloCache } from "@/lib/apollo/cache-storage";
import { createApolloClient } from "@/lib/apollo/client";
import { resolveGuardRedirect } from "@/lib/auth/route-guard";
import {
  clearAuthSession,
  getSessionMember,
  getTokenRemainingMs,
  isAuthenticated,
  silentRefreshAccessToken,
} from "@/lib/auth/session";
import { infoAlert } from "@/lib/ui/alerts";
import type { NextPageWithAuth } from "@/types/page";

type AppPropsWithAuth = AppProps & {
  Component: NextPageWithAuth;
};

interface GuardState {
  key: string;
  ready: boolean;
}

const APOLLO_CACHE_PERSIST_INTERVAL_MS = 60_000;

function AppInner({ Component, pageProps }: AppPropsWithAuth) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [client] = useState(() => createApolloClient());

  const guestOnly = Boolean(Component.auth?.guestOnly);
  const rolesKey = useMemo(
    () => Component.auth?.roles?.join(",") ?? "",
    [Component.auth?.roles],
  );
  const requiresGuard = guestOnly || rolesKey.length > 0;
  const guardKey = `${router.asPath}|guest:${guestOnly}|roles:${rolesKey}`;

  const [guardState, setGuardState] = useState<GuardState>(() => ({
    key: guardKey,
    ready: !requiresGuard,
  }));

  useEffect(() => {
    let isCancelled = false;

    const runGuard = async (): Promise<void> => {
      if (!requiresGuard) {
        if (!isCancelled) {
          setGuardState({ key: guardKey, ready: true });
        }
        return;
      }

      if (!isCancelled) {
        setGuardState({ key: guardKey, ready: false });
      }

      const redirectPath = await resolveGuardRedirect(
        Component.auth,
        getSessionMember(),
        router.asPath,
      );
      if (isCancelled) {
        return;
      }

      if (redirectPath && redirectPath !== router.asPath) {
        void router.replace(redirectPath);
        return;
      }

      setGuardState({ key: guardKey, ready: true });
    };

    void runGuard();

    return () => {
      isCancelled = true;
    };
  }, [Component.auth, guardKey, requiresGuard, router]);

  useEffect(() => {
    let intervalId: number | null = null;

    const persistNow = (useIdleCallback: boolean) => {
      const runPersist = () => {
        persistApolloCache(client.cache);
      };

      if (
        useIdleCallback &&
        typeof window !== "undefined" &&
        "requestIdleCallback" in window &&
        typeof window.requestIdleCallback === "function"
      ) {
        window.requestIdleCallback(runPersist, { timeout: 2000 });
        return;
      }

      persistApolloCache(client.cache);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        persistNow(false);
        if (intervalId !== null) {
          window.clearInterval(intervalId);
          intervalId = null;
        }
        return;
      }

      if (intervalId === null) {
        intervalId = window.setInterval(() => {
          if (document.visibilityState !== "visible") {
            return;
          }

          persistNow(true);
        }, APOLLO_CACHE_PERSIST_INTERVAL_MS);
      }
    };

    intervalId = window.setInterval(() => {
      if (document.visibilityState !== "visible") {
        return;
      }

      persistNow(true);
    }, APOLLO_CACHE_PERSIST_INTERVAL_MS);

    const persistImmediately = () => {
      persistNow(false);
    };

    window.addEventListener("pagehide", persistImmediately);
    window.addEventListener("beforeunload", persistImmediately);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
      window.removeEventListener("pagehide", persistImmediately);
      window.removeEventListener("beforeunload", persistImmediately);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [client]);

  // ─── Session expiry watcher ──────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SESSION_CHECK_INTERVAL = 60_000; // check every minute
    const WARNING_THRESHOLD = 5 * 60_000; // warn at 5 minutes remaining
    let warned = false;

    const checkSession = async () => {
      if (!isAuthenticated()) {
        warned = false;
        return;
      }

      const remaining = getTokenRemainingMs();

      if (remaining === 0) {
        const refreshed = await silentRefreshAccessToken();
        if (refreshed) {
          warned = false;
          return;
        }

        // Token already expired and refresh failed — clear and redirect
        clearAuthSession();
        await infoAlert(
          t("shell_session_expired_title"),
          t("shell_session_expired_body"),
        );
        void router.push(
          `/auth/login?next=${encodeURIComponent(router.asPath)}`,
        );
        warned = false;
        return;
      }

      if (remaining <= WARNING_THRESHOLD) {
        const refreshed = await silentRefreshAccessToken();
        if (refreshed) {
          warned = false;
          return;
        }
      }

      if (remaining <= WARNING_THRESHOLD && !warned) {
        warned = true;
        const mins = Math.ceil(remaining / 60_000);
        await infoAlert(
          t("shell_session_expiring_title"),
          t("shell_session_expiring_body", {
            minutes: mins,
            suffix: mins !== 1 ? "s" : "",
          }),
        );
      }
    };

    void checkSession();
    const id = window.setInterval(
      () => void checkSession(),
      SESSION_CHECK_INTERVAL,
    );

    return () => window.clearInterval(id);
  }, [router, t]);

  const isGuardReady = guardState.key === guardKey && guardState.ready;
  const showGuardLoading = requiresGuard && !isGuardReady;

  return (
    <ErrorBoundary>
      <ApolloProvider client={client}>
        <ToastProvider>
          <div>
            <SiteFrame>
              {showGuardLoading ? (
                <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-slate-200 bg-white/80">
                  <p className="text-sm font-medium text-slate-600">
                    {t("shell_checking_access")}
                  </p>
                </div>
              ) : (
                <Component {...pageProps} />
              )}
            </SiteFrame>
          </div>
        </ToastProvider>
      </ApolloProvider>
    </ErrorBoundary>
  );
}

export default function App(props: AppPropsWithAuth) {
  const locale = props.pageProps?.locale ?? props.router.locale ?? "en";

  return (
    <I18nProvider locale={locale}>
      <AppInner {...props} />
    </I18nProvider>
  );
}
