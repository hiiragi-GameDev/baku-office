globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { nowSec } from "./client_F4fksau0.mjs";
async function isBlocked(ctx, fromLicense) {
  return !!await ctx.db.first("SELECT from_license FROM a2a_blocks WHERE from_license=?", [fromLicense]);
}
async function addBlock(ctx, fromLicense, reason) {
  await ctx.db.run("INSERT INTO a2a_blocks (from_license,reason,created_at) VALUES (?,?,?) ON CONFLICT(from_license) DO UPDATE SET reason=excluded.reason", [fromLicense, reason, nowSec()]);
}
async function addInquiry(ctx, i) {
  const id = randomId(8);
  await ctx.db.run(
    "INSERT INTO a2a_inquiries (id,from_license,from_name,action,args,message,trust,status,created_at) VALUES (?,?,?,?,?,?,?,'pending',?)",
    [id, i.fromLicense, i.fromName ?? null, i.action ?? null, i.args !== void 0 ? JSON.stringify(i.args) : null, i.message ?? null, i.trust !== void 0 ? JSON.stringify(i.trust) : null, nowSec()]
  );
  return id;
}
async function listInquiries(ctx, status) {
  const sql = "SELECT * FROM a2a_inquiries" + (status ? " WHERE status=?" : "") + " ORDER BY created_at DESC LIMIT 100";
  return await ctx.db.all(sql, status ? [status] : []);
}
async function getInquiry(ctx, id) {
  return await ctx.db.first("SELECT * FROM a2a_inquiries WHERE id=?", [id]);
}
async function decideInquiry(ctx, id, status) {
  await ctx.db.run("UPDATE a2a_inquiries SET status=?, decided_at=? WHERE id=?", [status, nowSec(), id]);
}
export {
  addBlock,
  addInquiry,
  decideInquiry,
  getInquiry,
  isBlocked,
  listInquiries
};
