globalThis.process ??= {};
globalThis.process.env ??= {};
async function rateLimited(env, bucket, limit, windowSec) {
  const now = Math.floor(Date.now() / 1e3);
  const windowStart = now - now % windowSec;
  try {
    const row = await env.DB.prepare(
      "INSERT INTO rate_limits (bucket, window_start, count) VALUES (?,?,1) ON CONFLICT(bucket, window_start) DO UPDATE SET count = count + 1 RETURNING count"
    ).bind(bucket, windowStart).first();
    const count = Number(row?.count ?? 1);
    if (count === 1) {
      await env.DB.prepare("DELETE FROM rate_limits WHERE bucket=? AND window_start<?").bind(bucket, windowStart).run().catch(() => void 0);
    }
    return count > limit;
  } catch {
    return false;
  }
}
export {
  rateLimited as r
};
