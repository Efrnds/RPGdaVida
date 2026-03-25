import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "rpg-da-vida.sqlite");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    device_id TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (device_id, key)
  )
`);

export function getSetting(deviceId, key) {
  const stmt = db.prepare(
    "SELECT value FROM settings WHERE device_id = ? AND key = ?"
  );
  const row = stmt.get(deviceId, key);

  if (!row) return null;

  try {
    return JSON.parse(row.value);
  } catch {
    return row.value;
  }
}

export function setSetting(deviceId, key, value) {
  const stmt = db.prepare(`
    INSERT INTO settings (device_id, key, value, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(device_id, key)
    DO UPDATE SET
      value = excluded.value,
      updated_at = excluded.updated_at
  `);

  stmt.run(deviceId, key, JSON.stringify(value), Date.now());
}
