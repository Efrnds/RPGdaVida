"use client";

import { useEffect, useState } from "react";
import { getDeviceId } from "../../../lib/deviceId";
import ConfirmModal from "../../../components/ConfirmModal";
import ModuleScreen from "../../../components/ModuleScreen";
import FormModal from "../../../components/FormModal";

const defaultForm = {
  title: "",
  invested_coins: 0,
  current_value: 0,
  monthly_yield_percent: 0.8,
  notes: "",
};

export default function FinancasInvestimentosPage() {
  const [deviceId, setDeviceId] = useState("anonymous-device");
  const [items, setItems] = useState([]);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState("");
  const [investmentToDelete, setInvestmentToDelete] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const notify = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2200);
  };

  const fetchData = async (id) => {
    const [itemsRes, profileRes] = await Promise.all([
      fetch("/api/investments", { headers: { "x-device-id": id }, cache: "no-store" }),
      fetch("/api/profile", { headers: { "x-device-id": id }, cache: "no-store" }),
    ]);

    if (itemsRes.ok) {
      const itemsData = await itemsRes.json();
      setItems(itemsData?.data || []);
    }

    if (profileRes.ok) {
      const profileData = await profileRes.json();
      setProfile(profileData?.data || null);
    }
  };

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    fetchData(id);
  }, []);

  const createInvestment = async () => {
    if (!form.title.trim()) {
      notify("Informe o nome do investimento.");
      return;
    }

    await fetch("/api/investments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify(form),
    });

    setForm(defaultForm);
    fetchData(deviceId);
    setCreateModalOpen(false);
    notify("Investimento criado.");
  };

  const contribute = async (id, coinsAmount) => {
    const response = await fetch(`/api/investments/${id}/contribute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify({ coinsAmount }),
    });

    if (!response.ok) {
      notify("Moedas insuficientes para aporte.");
      return;
    }

    fetchData(deviceId);
    notify("Aporte realizado.");
  };

  const applyYield = async (id) => {
    await fetch(`/api/investments/${id}/yield`, {
      method: "POST",
      headers: { "x-device-id": deviceId },
    });

    fetchData(deviceId);
    notify("Rendimento aplicado.");
  };

  const removeInvestment = async (id) => {
    await fetch(`/api/investments/${id}`, {
      method: "DELETE",
      headers: { "x-device-id": deviceId },
    });

    fetchData(deviceId);
    notify("Investimento removido.");
    setInvestmentToDelete(null);
  };

  return (
    <ModuleScreen
      title="📈 Finanças - Investimentos"
      subtitle="Faça seu ouro render"
      description="Acompanhe aportes, crescimento e rendimento dos seus investimentos."
      icon="💹"
    >

      {message ? <p className="p-2 text-sm text-green-700 bg-green-100 rounded-md">{message}</p> : null}

      <section className="max-w-5xl p-3 mx-auto border rounded-md border-graySm bg-white">
        <p className="text-sm">Moedas disponíveis para aporte: <strong>{profile?.coins ?? 0}</strong></p>
      </section>

      <section className="max-w-5xl mx-auto">
        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-3 py-2 text-sm text-white rounded-md bg-primary"
        >
          Novo investimento +
        </button>
      </section>

      <section className="max-w-5xl mx-auto space-y-2">
        {items.map((item) => (
          <article key={item.id} className="p-3 border rounded-md border-graySm">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-xs text-grayMd">Aportado: {item.invested_coins} • Atual: {item.current_value}</p>
                <p className="text-xs text-grayMd">Rendimento mensal: {item.monthly_yield_percent}%</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <button className="px-2 py-1 text-white rounded-md bg-primary" onClick={() => contribute(item.id, 10)}>Aportar 10</button>
                <button className="px-2 py-1 border rounded-md border-graySm" onClick={() => applyYield(item.id)}>Aplicar rendimento</button>
                <button className="px-2 py-1 text-white bg-red-500 rounded-md" onClick={() => setInvestmentToDelete(item)}>Excluir</button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <ConfirmModal
        open={Boolean(investmentToDelete)}
        title="Excluir investimento"
        description={`Deseja excluir "${investmentToDelete?.title || ""}"?`}
        confirmLabel="Excluir"
        onCancel={() => setInvestmentToDelete(null)}
        onConfirm={() => removeInvestment(investmentToDelete.id)}
      />

      <FormModal
        open={createModalOpen}
        title="Novo investimento"
        onClose={() => setCreateModalOpen(false)}
      >
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <input className="p-2 border rounded-md border-graySm" placeholder="Nome do investimento" value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} />
          <input className="p-2 border rounded-md border-graySm" type="number" value={form.monthly_yield_percent} onChange={(e) => setForm((c) => ({ ...c, monthly_yield_percent: Number(e.target.value) || 0 }))} />
          <input className="p-2 border rounded-md border-graySm" type="number" value={form.invested_coins} onChange={(e) => setForm((c) => ({ ...c, invested_coins: Number(e.target.value) || 0 }))} />
          <input className="p-2 border rounded-md border-graySm" type="number" value={form.current_value} onChange={(e) => setForm((c) => ({ ...c, current_value: Number(e.target.value) || 0 }))} />
          <textarea className="p-2 border rounded-md md:col-span-2 border-graySm" rows={2} placeholder="Notas" value={form.notes} onChange={(e) => setForm((c) => ({ ...c, notes: e.target.value }))} />
          <button onClick={createInvestment} className="p-2 text-white rounded-md md:col-span-2 bg-primary">Criar investimento</button>
        </div>
      </FormModal>
    </ModuleScreen>
  );
}
