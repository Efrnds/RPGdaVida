"use client";

import { useEffect, useState } from "react";
import { getDeviceId } from "../../../lib/deviceId";
import ModuleScreen from "../../../components/ModuleScreen";
import { applyThemePreference } from "../../../lib/theme";

const CONFIG_KEYS = {
  theme: "app-theme",
  notifications: "daily-notifications",
  xpBoost: "xp-boost-enabled",
  reducedMotion: "reduced-motion",
  compactUi: "compact-ui",
  startPage: "start-page",
};

const defaultProfile = {
  username: "",
  level: 1,
  coins: 0,
  hp_total: 100,
  hp_current: 100,
  main_objective: "",
  secondary_objective: "",
  strengths: "",
  weaknesses: "",
  goals_completion: 0,
  xp_current: 0,
  xp_target: 100,
};

export default function ConfiguracoesPage() {
  const [deviceId, setDeviceId] = useState("anonymous-device");
  const [theme, setTheme] = useState("auto");
  const [notifications, setNotifications] = useState(true);
  const [xpBoost, setXpBoost] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [compactUi, setCompactUi] = useState(false);
  const [startPage, setStartPage] = useState("/home");
  const [profile, setProfile] = useState(defaultProfile);
  const [message, setMessage] = useState("");

  const fetchSetting = async (id, key, fallback) => {
    const response = await fetch(`/api/settings/${key}`, {
      headers: { "x-device-id": id },
      cache: "no-store",
    });
    if (!response.ok) return fallback;
    const data = await response.json();
    return data?.value ?? fallback;
  };

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);

    async function load() {
      setTheme(await fetchSetting(id, CONFIG_KEYS.theme, "auto"));
      setNotifications(await fetchSetting(id, CONFIG_KEYS.notifications, true));
      setXpBoost(await fetchSetting(id, CONFIG_KEYS.xpBoost, false));
      setReducedMotion(
        await fetchSetting(id, CONFIG_KEYS.reducedMotion, false),
      );
      setCompactUi(await fetchSetting(id, CONFIG_KEYS.compactUi, false));
      setStartPage(await fetchSetting(id, CONFIG_KEYS.startPage, "/home"));

      const profileResponse = await fetch("/api/profile", {
        headers: { "x-device-id": id },
        cache: "no-store",
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData?.data || defaultProfile);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.compactUi = compactUi ? "1" : "0";
  }, [compactUi]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.reducedMotion = reducedMotion ? "1" : "0";
  }, [reducedMotion]);

  const patchProfile = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const save = async () => {
    const payloads = [
      [CONFIG_KEYS.theme, theme],
      [CONFIG_KEYS.notifications, notifications],
      [CONFIG_KEYS.xpBoost, xpBoost],
      [CONFIG_KEYS.reducedMotion, reducedMotion],
      [CONFIG_KEYS.compactUi, compactUi],
      [CONFIG_KEYS.startPage, startPage],
    ];

    await Promise.all(
      payloads.map(([key, value]) =>
        fetch(`/api/settings/${key}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-device-id": deviceId,
          },
          body: JSON.stringify({ value }),
        }),
      ),
    );

    await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify(profile),
    });

    applyThemePreference(theme);
    window.dispatchEvent(
      new CustomEvent("rpg-theme-change", { detail: theme }),
    );

    setMessage("Configurações salvas.");
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <ModuleScreen
      title="⚙️ Configurações"
      subtitle="Ajuste seu painel"
      description="Personalize preferências para deixar seu RPG da Vida do seu jeito."
      icon="🎛️"
      maxWidth="max-w-3xl"
    >
      {message ? (
        <p className="p-2 text-sm text-green-700 bg-green-100 rounded-md">
          {message}
        </p>
      ) : null}

      <section className="grid max-w-3xl gap-3 p-3 mx-auto border rounded-md border-graySm bg-white">
        <label className="grid gap-1 text-sm bg-blue-50/50 p-3 rounded-md border border-blue-100">
          <span className="font-semibold text-blue-900 flex items-center gap-2">
            🔑 Sua Chave do RPG (Device/API Key)
          </span>
          <span className="text-xs text-blue-700 mb-1">
            Use esta chave como o header <b>x-device-id</b> para integrar
            atalhos do iPhone ou outras automações.
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              className="flex-1 p-2 text-xs font-mono bg-white border rounded-md border-blue-200 text-grayMd select-all"
              value={deviceId}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(deviceId);
                setMessage("Chave copiada para a área de transferência!");
                setTimeout(() => setMessage(""), 2200);
              }}
              className="px-3 py-2 text-xs font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Copiar
            </button>
          </div>
        </label>

        <hr className="my-2 border-graySm/50" />

        <label className="grid gap-1 text-sm pt-2">
          Tema
          <select
            className="p-2 border rounded-md border-graySm"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="auto">Automático</option>
            <option value="dark">Escuro</option>
            <option value="light">Claro</option>
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          Página inicial
          <select
            className="p-2 border rounded-md border-graySm"
            value={startPage}
            onChange={(e) => setStartPage(e.target.value)}
          >
            <option value="/home">Menu principal</option>
            <option value="/home/skills">Skills</option>
            <option value="/home/dinheiro">Loja</option>
            <option value="/home/brain-dump">Brain Dump</option>
            <option value="/home/atividades">Atividades</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
          />
          Notificações diárias
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={xpBoost}
            onChange={(e) => setXpBoost(e.target.checked)}
          />
          Boost de XP (modo foco)
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => setReducedMotion(e.target.checked)}
          />
          Reduzir animações
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={compactUi}
            onChange={(e) => setCompactUi(e.target.checked)}
          />
          Interface compacta
        </label>

        <hr className="my-1 border-graySm" />

        <h3 className="text-sm font-semibold">Editar perfil</h3>

        <div className="grid gap-2 md:grid-cols-2">
          <input
            className="p-2 border rounded-md border-graySm"
            placeholder="Nome"
            value={profile.username || ""}
            onChange={(e) => patchProfile("username", e.target.value)}
          />
          <input
            className="p-2 border rounded-md border-graySm"
            type="number"
            min="1"
            placeholder="Nível"
            value={profile.level}
            onChange={(e) => patchProfile("level", Number(e.target.value) || 1)}
          />
          <input
            className="p-2 border rounded-md border-graySm"
            placeholder="Objetivo principal"
            value={profile.main_objective || ""}
            onChange={(e) => patchProfile("main_objective", e.target.value)}
          />
          <input
            className="p-2 border rounded-md border-graySm"
            placeholder="Objetivo secundário"
            value={profile.secondary_objective || ""}
            onChange={(e) =>
              patchProfile("secondary_objective", e.target.value)
            }
          />
          <input
            className="p-2 border rounded-md border-graySm"
            placeholder="Forças"
            value={profile.strengths || ""}
            onChange={(e) => patchProfile("strengths", e.target.value)}
          />
          <input
            className="p-2 border rounded-md border-graySm"
            placeholder="Fraquezas"
            value={profile.weaknesses || ""}
            onChange={(e) => patchProfile("weaknesses", e.target.value)}
          />
        </div>

        <button onClick={save} className="p-2 text-white rounded-md bg-primary">
          Salvar
        </button>
      </section>
    </ModuleScreen>
  );
}
