"use client";

import { useEffect, useState } from "react";
import { getDeviceId } from "../../../lib/deviceId";
import ModuleScreen from "../../../components/ModuleScreen";

export default function MetricasPage() {
  const [days, setDays] = useState(30);
  const [metrics, setMetrics] = useState(null);

  const fetchMetrics = async (id, periodDays) => {
    const response = await fetch(`/api/metrics?days=${periodDays}`, {
      headers: { "x-device-id": id },
      cache: "no-store",
    });

    if (!response.ok) return;
    const data = await response.json();
    setMetrics(data?.data || null);
  };

  useEffect(() => {
    const id = getDeviceId();
    fetchMetrics(id, days);
  }, [days]);

  return (
    <ModuleScreen
      title="📊 Métricas"
      subtitle="Leia seus números"
      description="Veja desempenho por período e identifique padrões da sua evolução."
      icon="🧮"
      maxWidth="max-w-4xl"
    >
      <section className="flex flex-wrap max-w-4xl gap-2 mx-auto">
        {[7, 30, 90].map((period) => (
          <button
            key={period}
            onClick={() => setDays(period)}
            className="px-3 py-1 text-sm border rounded-md border-graySm"
          >
            {period} dias
          </button>
        ))}
      </section>

      <section className="grid max-w-4xl grid-cols-1 gap-3 mx-auto sm:grid-cols-2">
        <article className="p-3 border rounded-md border-graySm bg-white">
          <h2 className="font-semibold">Bom hábito concluído</h2>
          <p className="text-2xl">{metrics?.goodHabitsCompleted ?? 0}</p>
        </article>
        <article className="p-3 border rounded-md border-graySm bg-white">
          <h2 className="font-semibold">Mau hábito registrado</h2>
          <p className="text-2xl">{metrics?.badHabitsLogged ?? 0}</p>
        </article>
        <article className="p-3 border rounded-md border-graySm bg-white">
          <h2 className="font-semibold">Moedas ganhas</h2>
          <p className="text-2xl">{metrics?.coinsEarned ?? 0}</p>
        </article>
        <article className="p-3 border rounded-md border-graySm bg-white">
          <h2 className="font-semibold">HP perdido</h2>
          <p className="text-2xl">{metrics?.hpLost ?? 0}</p>
        </article>
        <article className="p-3 border rounded-md border-graySm bg-white">
          <h2 className="font-semibold">Resgates no mercado</h2>
          <p className="text-2xl">{metrics?.redemptionsCount ?? 0}</p>
        </article>
        <article className="p-3 border rounded-md border-graySm bg-white">
          <h2 className="font-semibold">Moedas gastas</h2>
          <p className="text-2xl">{metrics?.coinsSpent ?? 0}</p>
        </article>
      </section>

      <section className="max-w-4xl p-3 mx-auto border rounded-md border-graySm bg-white">
        <p className="text-sm">
          Saldo atual: {metrics?.profile?.coins ?? 0} moedas
        </p>
        <p className="text-sm">
          Vida atual: {metrics?.profile?.hp_current ?? 0} /{" "}
          {metrics?.profile?.hp_total ?? 0}
        </p>
      </section>
    </ModuleScreen>
  );
}
