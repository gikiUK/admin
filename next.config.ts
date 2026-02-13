import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  reactCompiler: true
};

// Only use Sentry build wrapper in production to avoid build overhead in dev/test
let config: NextConfig = nextConfig;

if (process.env.NODE_ENV === "production") {
  config = withSentryConfig(nextConfig, {
    org: "thalamus-ai",
    project: "giki-admin",
    silent: !process.env.CI,
    widenClientFileUpload: true,

    webpack: {
      automaticVercelMonitors: false,

      // Disable server-side auto-instrumentation for Cloudflare Workers compatibility
      // These prevent Node.js-only packages (require-in-the-middle) from being bundled
      autoInstrumentServerFunctions: false,
      autoInstrumentMiddleware: false,
      autoInstrumentAppDirectory: false,

      treeshake: {
        removeDebugLogging: true
      }
    }
  });
}

export default config;
