import crypto from "node:crypto";

export const AUTH_COOKIE_NAME = "rpg_session";
export const AUTH_COOKIE_VALUE = "authenticated";

export const ADMIN_EMAIL =
  process.env.RPG_ADMIN_EMAIL || "eduardo.fernandes.silva13@gmail.com";
export const ADMIN_PASSWORD_HASH =
  process.env.RPG_ADMIN_PASSWORD_HASH ||
  "scrypt$rpgdavida_salt_v1$jjTrdgzdhwWja2gj6gVbHLWhr/pUzEcB26kbDG5J4zI=";

function hashPasswordScrypt(password, salt) {
  return crypto.scryptSync(password, salt, 32).toString("base64");
}

function safeEquals(a, b) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) return false;
  return crypto.timingSafeEqual(bufferA, bufferB);
}

export function validateCredentials(email, password) {
  if (email !== ADMIN_EMAIL) return false;

  const [algorithm, salt, expectedHash] = ADMIN_PASSWORD_HASH.split("$");
  if (algorithm !== "scrypt" || !salt || !expectedHash) return false;

  const currentHash = hashPasswordScrypt(password, salt);
  return safeEquals(currentHash, expectedHash);
}

export function isAuthenticatedRequest(req) {
  const cookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  return cookie === AUTH_COOKIE_VALUE;
}
