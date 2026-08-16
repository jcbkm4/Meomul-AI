import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearPersistedApolloCache,
  persistApolloCache,
  restorePersistedApolloCache,
} from "@/lib/apollo/cache-storage";

/**
 * The Apollo cache is persisted to localStorage and restored on load, which means a bug
 * here shows up as users being served data from before a deploy — with no error anywhere.
 *
 * Two guards make that safe: a version key that includes the build id, and a 30-minute
 * age limit. Both are exercised below, along with the corrupt-payload paths, since
 * localStorage is writable by anything running on the origin and must never be trusted.
 *
 * These could not be tested at all until the test environment moved from node to jsdom.
 */
describe("persisted Apollo cache", () => {
  const KEY = "meomul.apollo_cache";

  /** Minimal stand-in for the parts of ApolloCache this module touches. */
  const fakeCache = (data: Record<string, unknown> = { ROOT_QUERY: { hi: 1 } }) => {
    const restore = vi.fn();
    return {
      cache: { extract: () => data, restore } as never,
      restore,
      data,
    };
  };

  beforeEach(() => {
    window.localStorage.clear();
  });

  describe("persist", () => {
    it("writes the cache with a version and a timestamp", () => {
      const { cache, data } = fakeCache();

      persistApolloCache(cache);

      const stored = JSON.parse(window.localStorage.getItem(KEY) as string) as Record<string, unknown>;
      expect(stored.data).toEqual(data);
      expect(typeof stored.version).toBe("string");
      expect(typeof stored.savedAt).toBe("number");
    });

    it("does not throw when storage rejects the write", () => {
      // Private browsing and quota-exceeded both surface as a throwing setItem. Losing
      // the cache is acceptable; taking the page down with it is not.
      const { cache } = fakeCache();
      vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

      expect(() => persistApolloCache(cache)).not.toThrow();
      vi.restoreAllMocks();
    });
  });

  describe("restore", () => {
    it("round-trips a cache written by this same build", () => {
      const written = fakeCache({ ROOT_QUERY: { hotels: ["a", "b"] } });
      persistApolloCache(written.cache);

      const read = fakeCache();
      restorePersistedApolloCache(read.cache);

      expect(read.restore).toHaveBeenCalledWith(written.data);
    });

    it("ignores and clears a cache written by a different build", () => {
      // The version embeds the build id, so a deploy invalidates old cached data. Without
      // this, a schema change would feed stale shapes into a new client.
      window.localStorage.setItem(
        KEY,
        JSON.stringify({ version: "1:some-older-build", savedAt: Date.now(), data: { ROOT_QUERY: {} } }),
      );
      const { cache, restore } = fakeCache();

      restorePersistedApolloCache(cache);

      expect(restore).not.toHaveBeenCalled();
      expect(window.localStorage.getItem(KEY)).toBeNull();
    });

    it("ignores and clears a cache older than 30 minutes", () => {
      const written = fakeCache();
      persistApolloCache(written.cache);

      const stored = JSON.parse(window.localStorage.getItem(KEY) as string) as Record<string, unknown>;
      stored.savedAt = Date.now() - 31 * 60 * 1000;
      window.localStorage.setItem(KEY, JSON.stringify(stored));

      const read = fakeCache();
      restorePersistedApolloCache(read.cache);

      expect(read.restore).not.toHaveBeenCalled();
      expect(window.localStorage.getItem(KEY)).toBeNull();
    });

    it("accepts a cache just inside the age limit", () => {
      const written = fakeCache();
      persistApolloCache(written.cache);

      const stored = JSON.parse(window.localStorage.getItem(KEY) as string) as Record<string, unknown>;
      stored.savedAt = Date.now() - 29 * 60 * 1000;
      window.localStorage.setItem(KEY, JSON.stringify(stored));

      const read = fakeCache();
      restorePersistedApolloCache(read.cache);

      expect(read.restore).toHaveBeenCalled();
    });

    it.each([
      ["malformed JSON", "{not json"],
      ["a JSON primitive", '"a string"'],
      ["null", "null"],
      ["a payload missing fields", JSON.stringify({ version: "1:x" })],
      ["a payload with non-object data", JSON.stringify({ version: "1:x", savedAt: Date.now(), data: 5 })],
    ])("discards %s without throwing", (_label, raw) => {
      window.localStorage.setItem(KEY, raw);
      const { cache, restore } = fakeCache();

      expect(() => restorePersistedApolloCache(cache)).not.toThrow();
      expect(restore).not.toHaveBeenCalled();
      expect(window.localStorage.getItem(KEY)).toBeNull();
    });

    it("does nothing when there is no cached entry", () => {
      const { cache, restore } = fakeCache();

      restorePersistedApolloCache(cache);

      expect(restore).not.toHaveBeenCalled();
    });
  });

  it("clear removes the entry", () => {
    const { cache } = fakeCache();
    persistApolloCache(cache);
    expect(window.localStorage.getItem(KEY)).not.toBeNull();

    clearPersistedApolloCache();

    expect(window.localStorage.getItem(KEY)).toBeNull();
  });
});
