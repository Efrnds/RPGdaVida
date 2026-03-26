export function getDeviceId() {
  if (typeof window === "undefined") return "anonymous-device";

  const existing = window.localStorage.getItem("rpg-device-id");
  if (existing) return existing;

  const created = window.crypto?.randomUUID?.() ?? `device-${Date.now()}`;
  window.localStorage.setItem("rpg-device-id", created);
  return created;
}
