"use client";

import { useEffect, useState } from "react";
import { getDeviceId } from "../../../lib/deviceId";
import ConfirmModal from "../../../components/ConfirmModal";
import ModuleScreen from "../../../components/ModuleScreen";
import FormModal from "../../../components/FormModal";

function rewardVisual(title = "") {
  const normalized = title.toLowerCase();
  if (normalized.includes("livro")) return "📚";
  if (normalized.includes("café") || normalized.includes("cafe")) return "☕";
  if (normalized.includes("jogo")) return "🎮";
  if (normalized.includes("filme")) return "🎬";
  if (normalized.includes("descanso")) return "🛌";
  return "🎁";
}

export default function DinheiroPage() {
  const [deviceId, setDeviceId] = useState("anonymous-device");
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    title: "",
    cost_coins: 20,
    description: "",
  });
  const [message, setMessage] = useState("");
  const [itemToDelete, setItemToDelete] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2200);
  };

  const fetchData = async (id) => {
    const [profileRes, marketRes] = await Promise.all([
      fetch("/api/profile", {
        headers: { "x-device-id": id },
        cache: "no-store",
      }),
      fetch("/api/market", {
        headers: { "x-device-id": id },
        cache: "no-store",
      }),
    ]);

    if (profileRes.ok) {
      const profileData = await profileRes.json();
      setProfile(profileData?.data || null);
    }

    if (marketRes.ok) {
      const marketData = await marketRes.json();
      setItems(marketData?.data || []);
    }
  };

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    fetchData(id);
  }, []);

  const createItem = async () => {
    if (!form.title.trim()) {
      showMessage("Informe o nome da recompensa.");
      return;
    }

    await fetch("/api/market", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify(form),
    });

    setForm({ title: "", cost_coins: 20, description: "" });
    await fetchData(deviceId);
    setCreateModalOpen(false);
    showMessage("Item criado.");
  };

  const redeemItem = async (itemId) => {
    const response = await fetch("/api/market", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify({ action: "redeem", itemId }),
    });

    if (!response.ok) {
      showMessage("Moedas insuficientes ou item inválido.");
      return;
    }

    await fetchData(deviceId);
    showMessage("Recompensa resgatada.");
  };

  const deleteItem = async (itemId) => {
    await fetch(`/api/market/${itemId}`, {
      method: "DELETE",
      headers: { "x-device-id": deviceId },
    });

    await fetchData(deviceId);
    showMessage("Item removido.");
    setItemToDelete(null);
  };

  return (
    <ModuleScreen
      title="🪙 Dinheiro e Mercado"
      subtitle="Sua loja de recompensas"
      description="Troque moedas por recompensas e mantenha sua economia de jogo ativa."
      icon="🏪"
    >
      {message ? (
        <p className="p-2 text-sm text-green-700 bg-green-100 rounded-md">
          {message}
        </p>
      ) : null}

      <section className="max-w-5xl p-3 mx-auto border rounded-md border-graySm bg-white">
        <p className="text-lg font-semibold">
          Moedas atuais: {profile?.coins ?? 0}
        </p>
        <p className="text-sm text-grayMd">
          Ganhe moedas concluindo bons hábitos e troque no mercado.
        </p>
      </section>

      <section className="max-w-5xl mx-auto">
        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-3 py-2 text-sm text-white rounded-md bg-primary"
        >
          Novo item da loja +
        </button>
      </section>

      <section className="grid max-w-5xl grid-cols-1 gap-3 mx-auto sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden border rounded-md border-graySm bg-white"
          >
            <div className="grid h-32 place-items-center bg-linear-to-br from-zinc-200 to-zinc-100">
              <span className="text-6xl">{rewardVisual(item.title)}</span>
            </div>
            <div className="p-3 space-y-2">
              <p className="font-semibold truncate">{item.title}</p>
              <p className="text-sm font-bold text-primary">
                {item.cost_coins} moedas
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => redeemItem(item.id)}
                  className="flex-1 px-2 py-1 text-xs text-white rounded-md bg-primary"
                >
                  Resgatar
                </button>
                <button
                  onClick={() => setItemToDelete(item)}
                  className="px-2 py-1 text-xs text-white bg-red-500 rounded-md"
                >
                  X
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <FormModal
        open={createModalOpen}
        title="Novo item da loja"
        onClose={() => setCreateModalOpen(false)}
      >
        <div className="grid gap-2">
          <input
            className="p-2 border rounded-md border-graySm"
            placeholder="Nome da recompensa"
            value={form.title}
            onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
          />
          <input
            className="p-2 border rounded-md border-graySm"
            type="number"
            min="1"
            value={form.cost_coins}
            onChange={(e) =>
              setForm((c) => ({
                ...c,
                cost_coins: Number(e.target.value) || 1,
              }))
            }
          />
          <textarea
            className="p-2 border rounded-md border-graySm"
            rows={2}
            placeholder="Descrição (opcional)"
            value={form.description}
            onChange={(e) =>
              setForm((c) => ({ ...c, description: e.target.value }))
            }
          />
          <button
            onClick={createItem}
            className="p-2 text-white rounded-md bg-primary"
          >
            Criar item
          </button>
        </div>
      </FormModal>

      <ConfirmModal
        open={Boolean(itemToDelete)}
        title="Excluir item do mercado"
        description={`Deseja excluir "${itemToDelete?.title || ""}"?`}
        confirmLabel="Excluir"
        onCancel={() => setItemToDelete(null)}
        onConfirm={() => deleteItem(itemToDelete.id)}
      />
    </ModuleScreen>
  );
}
