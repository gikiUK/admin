// Polyfill structuredClone for jsdom environment (Node < 17)
if (typeof globalThis.structuredClone === "undefined") {
  globalThis.structuredClone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
}
