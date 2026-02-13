"use client";

import { useEffect } from "react";

// biome-ignore lint/suspicious/noShadowRestrictedNames: Next.js requires this export name
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      import("@sentry/nextjs")
        .then((Sentry) => {
          Sentry.captureException(error);
        })
        .catch(() => {
          // Sentry failed to load - nothing we can do
        });
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center p-10 max-w-lg">
        <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">We encountered an unexpected error. Sorry about that!</p>
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Try again &rarr;
        </button>
      </div>
    </div>
  );
}
