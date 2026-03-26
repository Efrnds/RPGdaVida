"use client";

import { useEffect, useState } from "react";
import { getDeviceId } from "../../../lib/deviceId";
import ModuleScreen from "../../../components/ModuleScreen";

export default function VidaPage() {
  const [deviceId, setDeviceId] = useState("anonymous-device");
  const [profile, setProfile] = useState(null);

  const fetchProfile = async (id) => {
    const response = await fetch("/api/profile", {
      headers: { "x-device-id": id },
      cache: "no-store",
    });

    if (!response.ok) return;
    const data = await response.json();
    setProfile(data?.data || null);
  };

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    fetchProfile(id);
  }, []);

  const patchHp = async (delta) => {
    if (!profile) return;
    const hpCurrent = Math.max(0, Math.min(profile.hp_total, profile.hp_current + delta));

    await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify({ ...profile, hp_current: hpCurrent }),
    });

    await fetchProfile(deviceId);
  };

  const hpPercentage = profile
    ? Math.max(0, Math.min(100, Math.round((profile.hp_current / profile.hp_total) * 100)))
    : 0;

  return (
    <ModuleScreen
      title="❤️ Vida"
      subtitle="Gerencie sua barra de HP"
      description="Acompanhe sua vida e ajuste os pontos para simular o estado do personagem."
      icon="🫀"
      maxWidth="max-w-3xl"
    >

      <section className="max-w-3xl p-4 mx-auto space-y-3 border rounded-md border-graySm bg-white">
        <p className="text-lg font-semibold">
          HP: {profile?.hp_current ?? 0} / {profile?.hp_total ?? 0}
        </p>
        <div className="w-full h-3 rounded-full bg-graySm">
          <div
            className="h-3 rounded-full bg-primary"
            style={{ width: `${hpPercentage}%` }}
          />
        </div>
        <p className="text-sm text-grayMd">{hpPercentage}% da vida total.</p>

        <div className="flex gap-2">
          <button
            onClick={() => patchHp(10)}
            className="px-3 py-2 text-sm text-white rounded-md bg-primary"
          >
            +10 HP
          </button>
          <button
            onClick={() => patchHp(-10)}
            className="px-3 py-2 text-sm text-white bg-red-500 rounded-md"
          >
            -10 HP
          </button>
        </div>

        <p className="text-sm text-grayMd">
          Dica: os hábitos ruins também drenam HP automaticamente no módulo de mau hábito.
        </p>
      </section>
    </ModuleScreen>
  );
}
