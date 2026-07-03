// 配布クライアント（単一 Worker）の自走 cron ラッパ。
// Astro 生成の fetch（entry.mjs）に scheduled ハンドラを足し、Cron Triggers（2分毎）で自分の
// /api/cron/drain を叩く＝自動更新・停止ビルド回収・スケジュールタスク・報告送信が顧客側で自動で回る。
// 別途 scheduler Worker（当社運用の apps/scheduler）を持てない顧客インストール向けの自走化。
// drain は per-install の自動鍵で保護（src/lib/cron-auth.ts の resolveDrainKey と同じ KV キー）。
import astro from "./entry.mjs";

const KV_AUTO = "internal_key_auto";

// cron-auth.ts と同一ロジック（外部へ出さない per-install 鍵）。ラッパは bundle 外のため最小限を複製。
async function drainKey(env) {
  if (env.INTERNAL_KEY) return env.INTERNAL_KEY;
  const kv = env.LICENSE;
  if (!kv) return null;
  let k = await kv.get(KV_AUTO).catch(() => null);
  if (!k) {
    k = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    await kv.put(KV_AUTO, k).catch(() => {});
  }
  return k;
}

export default {
  fetch: (request, env, ctx) => astro.fetch(request, env, ctx),
  async scheduled(event, env, ctx) {
    ctx.waitUntil((async () => {
      try {
        const key = await drainKey(env);
        if (!key) return;
        // 自オリジンへの直 fetch は CF が遮断（1042）するため、プロセス内で astro.fetch を直呼び。
        const req = new Request("https://internal/api/cron/drain", {
          method: "POST",
          headers: { "content-type": "application/json", "x-internal-key": key },
          body: "{}",
        });
        await astro.fetch(req, env, ctx);
      } catch {
        /* best-effort：一時失敗は次 tick で再試行 */
      }
    })());
  },
};
