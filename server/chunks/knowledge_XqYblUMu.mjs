globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
async function saveKnowledge(ctx, owner, a) {
  await ctx.db.run(
    "INSERT INTO knowledge (id,title,body,file_ref,tags,created_by,created_at) VALUES (?,?,?,?,?,?,?)",
    [randomId(), a.title, a.body, null, "agent", owner, nowSec()]
  );
  return `ナレッジを保存：${a.title}`;
}
async function searchKnowledge(ctx, a) {
  const q = `%${a.query}%`;
  const results = await ctx.db.all("SELECT title,body FROM knowledge WHERE deleted_at IS NULL AND (title LIKE ? OR body LIKE ?) ORDER BY created_at DESC LIMIT 5", [q, q]);
  if (!results.length) return "該当するナレッジは見つかりませんでした。";
  return results.map((r) => `■ ${r.title}
${(r.body ?? "").slice(0, 200)}`).join("\n\n");
}
const knowledgePart = {
  id: "knowledge",
  name: "組織ナレッジ",
  version: "1.0.0",
  category: "庶務",
  description: "組織のナレッジを保存・検索。他アプリから検索操作を呼べる。",
  permissions: ["db:read", "db:write"],
  // アプリ間連動：他アプリは ctx.apps.call("knowledge","search",{query}) で検索できる（要 db:read）。
  actions: [
    { name: "search", description: "ナレッジ検索", requiredPermission: "db:read", run: (ctx, a) => searchKnowledge(ctx, { query: String(a.query ?? "") }) }
  ],
  agentTools: [
    {
      name: "save_knowledge",
      description: "組織ナレッジを保存",
      parameters: { type: "object", properties: { title: { type: "string" }, body: { type: "string" } }, required: ["title", "body"] },
      run: (ctx, owner, _baseUrl, a) => saveKnowledge(ctx, owner, { title: String(a.title), body: String(a.body) })
    },
    {
      name: "search_knowledge",
      description: "組織ナレッジを検索",
      parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
      run: (ctx, _owner, _baseUrl, a) => searchKnowledge(ctx, { query: String(a.query) })
    }
  ]
};
export {
  saveKnowledge as a,
  knowledgePart as k,
  searchKnowledge as s
};
