"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; fallback?: (error: Error, reset: () => void) => ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (error) {
      if (this.props.fallback) return this.props.fallback(error, this.reset);
      return (
        <div className="p-4 m-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm">
          <p className="font-semibold mb-1">Something went wrong</p>
          <pre className="whitespace-pre-wrap text-xs opacity-80">{error.message}</pre>
          <button type="button" onClick={this.reset} className="mt-2 underline text-xs">
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
