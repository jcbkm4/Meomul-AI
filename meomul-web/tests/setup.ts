import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";

/**
 * Working localStorage / sessionStorage for tests.
 *
 * jsdom implements Storage correctly, but the combination in use here (vitest 4 with
 * jsdom 29) hands the test context a bare object with no Storage methods, so anything
 * calling setItem throws "is not a function". A large part of this app's auth and cache
 * behaviour lives in localStorage, so a shim is installed rather than skipping those
 * paths — it is the behaviour under test, not an incidental dependency.
 */
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    // Real Storage coerces both arguments to strings.
    this.store.set(String(key), String(value));
  }
}

const installStorage = (name: "localStorage" | "sessionStorage") => {
  const existing = (window as unknown as Record<string, unknown>)[name];
  if (existing && typeof (existing as Storage).setItem === "function") {
    return;
  }
  Object.defineProperty(window, name, {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  });
};

beforeEach(() => {
  installStorage("localStorage");
  installStorage("sessionStorage");
  window.localStorage.clear();
  window.sessionStorage.clear();
});

// Unmount between tests so a component left rendered cannot leak into the next one.
afterEach(() => {
  cleanup();
});
