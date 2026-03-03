/**
 * Worker wrapper for Cloudflare deployment
 *
 * Simple passthrough to OpenNext worker for the admin dashboard.
 */

// @ts-expect-error: Will be resolved by wrangler build
import openNextWorker from "./.open-next/worker.js";

// CRITICAL: Re-export Durable Objects or deployment will fail
// @ts-expect-error: Will be resolved by wrangler build
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";

export default openNextWorker;
