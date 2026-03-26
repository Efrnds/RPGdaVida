"use client";

import { useEffect, useMemo, useState } from "react";
import { getDeviceId } from "../../../lib/deviceId";
import ModuleScreen from "../../../components/ModuleScreen";

export default function PerfilVisaoMetasPage() {
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);
  const [metrics, setMetrics] = useState(null);

  const fetchData = async (id) => {
    const [profileRes, goalsRes, metricsRes] = await Promise.all([
      fetch("/api/profile", { headers: { "x-device-id": id }, cache: "no-store" }),
      fetch("/api/goals", { headers: { "x-device-id": id }, cache: "no-store" }),
      fetch("/api/metrics?days=30", { headers: { "x-device-id": id }, cache: "no-store" }),
    ]);

    if (profileRes.ok) {
      const profileData = await profileRes.json();
      setProfile(profileData?.data || null);
    }
    if (goalsRes.ok) {
      const goalsData = await goalsRes.json();
      setGoals(goalsData?.data || []);
    }
    if (metricsRes.ok) {
      const metricsData = await metricsRes.json();
      setMetrics(metricsData?.data || null);
    }
  };

  useEffect(() => {
    const id = getDeviceId();
    fetchData(id);
  }, []);

  const goalsProgress = useMemo(() => {
    if (!goals.length) return 0;
    const total = goals.reduce((acc, goal) => acc + (goal.target_value || 0), 0);
    const current = goals.reduce((acc, goal) => acc + (goal.current_value || 0), 0);
    if (!total) return 0;
    return Math.min(100, Math.round((current / total) * 100));
  }, [goals]);

  return (
    <ModuleScreen
      title="🧙 Perfil - Visão de metas"
      subtitle="Veja sua evolução geral"
      description="Combine perfil, metas e métricas para uma leitura completa da jornada."
      icon="🧙"
    >

      <section className="grid max-w-5xl grid-cols-1 gap-3 mx-auto md:grid-cols-2">
        <article className="p-3 border rounded-md border-graySm bg-white">
          <p className="text-sm text-grayMd">Nome</p>
          <p className="text-lg font-semibold">{profile?.username || "Sem nome"}</p>
          <p className="mt-2 text-sm">Nível {profile?.level ?? 1}</p>
          <p className="text-sm">Moedas: {profile?.coins ?? 0}</p>
          <p className="text-sm">Vida: {profile?.hp_current ?? 0}/{profile?.hp_total ?? 0}</p>
          <p className="text-sm">XP: {profile?.xp_current ?? 0}/{profile?.xp_target ?? 0}</p>
        </article>

        <article className="p-3 border rounded-md border-graySm bg-white">
          <p className="text-sm text-grayMd">Progresso total das metas</p>
          <p className="text-2xl font-bold">{goalsProgress}%</p>
          <div className="w-full h-2 mt-2 rounded-full bg-graySm">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${goalsProgress}%` }} />
          </div>
          <p className="mt-2 text-sm">Concluídas nos últimos 30 dias: {goals.filter((goal) => goal.status === "done").length}</p>
        </article>
      </section>

      <section className="grid max-w-5xl grid-cols-1 gap-3 mx-auto md:grid-cols-3">
        <article className="p-3 border rounded-md border-graySm bg-white"><p className="text-sm">Bons hábitos</p><p className="text-xl">{metrics?.goodHabitsCompleted ?? 0}</p></article>
        <article className="p-3 border rounded-md border-graySm bg-white"><p className="text-sm">Maus hábitos</p><p className="text-xl">{metrics?.badHabitsLogged ?? 0}</p></article>
        <article className="p-3 border rounded-md border-graySm bg-white"><p className="text-sm">Moedas ganhas</p><p className="text-xl">{metrics?.coinsEarned ?? 0}</p></article>
      </section>

      <section className="max-w-5xl mx-auto space-y-2">
        {goals.map((goal) => {
          const percentage = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
          return (
            <article key={goal.id} className="p-3 border rounded-md border-graySm bg-white">
              <p className="font-semibold">{goal.title}</p>
              <p className="text-xs text-grayMd">{goal.category} • {goal.status}</p>
              <div className="w-full h-2 mt-2 rounded-full bg-graySm">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${percentage}%` }} />
              </div>
            </article>
          );
        })}
      </section>
    </ModuleScreen>
  );
}
