globalThis.process ??= {};
globalThis.process.env ??= {};
const COLS = "id,label,connector,address,enabled,created_at,updated_at";
function listConnectors(db) {
  return db.all(`SELECT ${COLS} FROM connectors ORDER BY created_at`);
}
function getConnector(db, id) {
  return db.first(`SELECT ${COLS} FROM connectors WHERE id=?`, [id]);
}
async function resolveChannel(db, id) {
  const row = await getConnector(db, id);
  if (!row || !row.enabled) return null;
  return { connector: row.connector, address: row.address };
}
async function upsertConnector(db, c) {
  await db.run(
    `INSERT INTO connectors (${COLS}) VALUES (?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       label=excluded.label, connector=excluded.connector, address=excluded.address,
       enabled=excluded.enabled, updated_at=excluded.updated_at`,
    [c.id, c.label, c.connector, c.address, c.enabled === false ? 0 : 1, c.now, c.now]
  );
}
async function removeConnector(db, id) {
  await db.run("DELETE FROM connectors WHERE id=?", [id]);
}
export {
  resolveChannel as a,
  listConnectors as l,
  removeConnector as r,
  upsertConnector as u
};
