import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ui/error-boundary";

// ESM namespaces are frozen, so Sentry cannot be spied on after import — the module has
// to be replaced before the component under test pulls it in.
const captureException = vi.fn();
vi.mock("@sentry/nextjs", () => ({
  captureException: (...args: unknown[]) => captureException(...args),
}));

/**
 * The app has a single top-level error boundary, so this component is the difference
 * between a render crash showing a recovery screen and showing a blank page.
 *
 * The Sentry reporting is asserted deliberately: it is the only way a client-side crash
 * becomes visible at all, and it is easy to break without noticing because the fallback
 * still renders either way.
 */
describe("ErrorBoundary", () => {
  const Boom = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error("render exploded");
    }
    return <p>healthy content</p>;
  };

  beforeEach(() => {
    captureException.mockClear();
    // React logs caught render errors; silence it so the suite output stays readable.
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children when nothing throws", () => {
    render(
      <ErrorBoundary>
        <Boom shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("healthy content")).toBeInTheDocument();
  });

  it("renders a recovery screen instead of propagating the crash", () => {
    render(
      <ErrorBoundary>
        <Boom shouldThrow />
      </ErrorBoundary>,
    );

    // The child is gone and something took its place, rather than a blank document.
    expect(screen.queryByText("healthy content")).not.toBeInTheDocument();
    expect(document.body.textContent?.trim().length ?? 0).toBeGreaterThan(0);
  });

  it("offers the user a way out of the error state", () => {
    render(
      <ErrorBoundary>
        <Boom shouldThrow />
      </ErrorBoundary>,
    );

    // A dead end is as bad as a blank page — there must be at least one action.
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
  });

  it("reports the error to Sentry with the React component stack", () => {
    render(
      <ErrorBoundary>
        <Boom shouldThrow />
      </ErrorBoundary>,
    );

    expect(captureException).toHaveBeenCalledTimes(1);

    const [error, context] = captureException.mock.calls[0] as [
      Error,
      { contexts?: { react?: { componentStack?: string } } },
    ];
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe("render exploded");
    // Without the component stack a minified production trace is close to useless.
    expect(context?.contexts?.react?.componentStack).toBeTruthy();
  });

  it("does not report anything when children render normally", () => {
    render(
      <ErrorBoundary>
        <Boom shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(captureException).not.toHaveBeenCalled();
  });
});
