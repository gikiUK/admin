// Polyfill structuredClone for jsdom environment (Node < 17)
if (typeof globalThis.structuredClone === "undefined") {
  globalThis.structuredClone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
}

// Radix UI primitives (Select, Popover, etc.) read ResizeObserver during layout effects;
// jsdom doesn't ship it.
if (typeof globalThis.ResizeObserver === "undefined") {
  class NoopResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // biome-ignore lint/suspicious/noExplicitAny: jsdom polyfill shim
  (globalThis as any).ResizeObserver = NoopResizeObserver;
}
