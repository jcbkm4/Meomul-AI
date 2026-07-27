import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to your error reporting service in production
    if (process.env.NODE_ENV === "production") {
      // TODO: integrate with Sentry / Datadog / etc.
      console.error("[ErrorBoundary]", error, errorInfo);
    } else {
      console.error("[ErrorBoundary]", error, errorInfo);
    }
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <svg
                className="h-7 w-7 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h2 className="mb-2 text-lg font-semibold text-slate-900">
              Something went wrong
            </h2>

            <p className="mb-6 text-sm text-slate-500">
              An unexpected error occurred. Please try reloading the page.
            </p>

            {process.env.NODE_ENV !== "production" && this.state.error && (
              <pre className="mb-6 max-h-32 overflow-auto rounded-lg bg-slate-50 p-3 text-left text-xs text-red-600">
                {this.state.error.message}
              </pre>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleGoHome}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Go home
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700"
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
