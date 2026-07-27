import { useRouter } from "next/router";
import { useCallback, useMemo } from "react";

const parsePage = (value: string | string[] | undefined): number => {
  if (typeof value !== "string") {
    return 1;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
};

const parseStatus = <TStatus extends string>(
  value: string | string[] | undefined,
  allowedStatuses: readonly TStatus[],
): TStatus | "ALL" => {
  if (typeof value !== "string") {
    return "ALL";
  }

  if (allowedStatuses.includes(value as TStatus)) {
    return value as TStatus;
  }

  return "ALL";
};

interface QueryPatch<TStatus extends string> {
  page?: number;
  status?: TStatus | "ALL";
  extra?: Record<string, string | undefined>;
}

interface UsePaginationQueryStateOptions<TStatus extends string> {
  pathname: string;
  statusValues: readonly TStatus[];
}

interface UsePaginationQueryStateResult<TStatus extends string> {
  page: number;
  statusFilter: TStatus | "ALL";
  getParam: (key: string) => string;
  pushQuery: (patch: QueryPatch<TStatus>) => void;
  replaceQuery: (patch: QueryPatch<TStatus>) => void;
}

export function usePaginationQueryState<TStatus extends string>(
  options: UsePaginationQueryStateOptions<TStatus>,
): UsePaginationQueryStateResult<TStatus> {
  const router = useRouter();
  const page = useMemo(() => parsePage(router.query.page), [router.query.page]);
  const statusFilter = useMemo(
    () => parseStatus(router.query.status, options.statusValues),
    [options.statusValues, router.query.status],
  );

  const getParam = useCallback(
    (key: string): string => {
      const value = router.query[key];
      return typeof value === "string" ? value : "";
    },
    [router.query],
  );

  const buildQuery = useCallback(
    (patch: QueryPatch<TStatus>): Record<string, string> => {
      const nextPage = patch.page ?? page;
      const nextStatus = patch.status ?? statusFilter;

      const query: Record<string, string> = {};
      if (nextPage > 1) {
        query.page = String(nextPage);
      }
      if (nextStatus !== "ALL") {
        query.status = nextStatus;
      }

      if (patch.extra) {
        Object.entries(patch.extra).forEach(([key, rawValue]) => {
          const value = rawValue?.trim();
          if (value) {
            query[key] = value;
          }
        });
      }

      return query;
    },
    [page, statusFilter],
  );

  const pushQuery = useCallback(
    (patch: QueryPatch<TStatus>) => {
      const query = buildQuery(patch);
      void router.push({ pathname: options.pathname, query }, undefined, { shallow: true });
    },
    [buildQuery, options.pathname, router],
  );

  const replaceQuery = useCallback(
    (patch: QueryPatch<TStatus>) => {
      const query = buildQuery(patch);
      void router.replace({ pathname: options.pathname, query }, undefined, { shallow: true });
    },
    [buildQuery, options.pathname, router],
  );

  return {
    page,
    statusFilter,
    getParam,
    pushQuery,
    replaceQuery,
  };
}
