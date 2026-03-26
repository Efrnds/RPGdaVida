"use client";

import { useEffect, useState } from "react";
import { getDeviceId } from "../../../lib/deviceId";
import ConfirmModal from "../../../components/ConfirmModal";
import ModuleScreen from "../../../components/ModuleScreen";
import FormModal from "../../../components/FormModal";

const defaultForm = {
  title: "",
  category: "geral",
  target_value: 10,
  current_value: 0,
  reward_coins: 30,
  reward_xp: 20,
};

export default function MetasConquistasPage() {
  const [deviceId, setDeviceId] = useState("anonymous-device");
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState("");
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [goalDraft, setGoalDraft] = useState({});
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const notify = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2200);
  };

  const fetchGoals = async (id) => {
    const response = await fetch("/api/goals", {
      headers: { "x-device-id": id },
      cache: "no-store",
    });

    if (!response.ok) return;
    const data = await response.json();
    setGoals(data?.data || []);
  };

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    fetchGoals(id);
  }, []);

  const createGoal = async () => {
    if (!form.title.trim()) {
      notify("Informe o título da meta.");
      return;
    }

    await fetch("/api/goals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify(form),
    });

    setForm(defaultForm);
    fetchGoals(deviceId);
    setCreateModalOpen(false);
    notify("Meta criada.");
  };

  const updateProgress = async (goal, delta) => {
    const nextCurrent = Math.max(
      0,
      Math.min(goal.target_value, goal.current_value + delta),
    );
    await fetch(`/api/goals/${goal.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify({ ...goal, current_value: nextCurrent }),
    });

    fetchGoals(deviceId);
  };

  const completeGoal = async (id) => {
    await fetch(`/api/goals/${id}/complete`, {
      method: "POST",
      headers: { "x-device-id": deviceId },
    });

    fetchGoals(deviceId);
    notify("Meta concluída com recompensa.");
  };

  const removeGoal = async (id) => {
    await fetch(`/api/goals/${id}`, {
      method: "DELETE",
      headers: { "x-device-id": deviceId },
    });

    fetchGoals(deviceId);
    notify("Meta removida.");
    setGoalToDelete(null);
  };

  const startEditing = (goal) => {
    setEditingGoalId(goal.id);
    setGoalDraft({
      title: goal.title,
      category: goal.category,
      target_value: goal.target_value,
      current_value: goal.current_value,
      reward_coins: goal.reward_coins,
      reward_xp: goal.reward_xp,
    });
  };

  const saveInline = async (goal) => {
    await fetch(`/api/goals/${goal.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify({ ...goal, ...goalDraft }),
    });

    setEditingGoalId(null);
    setGoalDraft({});
    fetchGoals(deviceId);
    notify("Meta atualizada.");
  };

  return (
    <ModuleScreen
      title="🏆 Metas e Conquistas"
      subtitle="Suba de nível com objetivos"
      description="Crie metas mensuráveis, acompanhe avanço e resgate recompensas."
      icon="🎯"
    >
      {message ? (
        <p className="p-2 text-sm text-green-700 bg-green-100 rounded-md">
          {message}
        </p>
      ) : null}

      <section className="max-w-5xl mx-auto">
        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-3 py-2 text-sm text-white rounded-md bg-primary"
        >
          Nova meta +
        </button>
      </section>

      <section className="max-w-5xl mx-auto space-y-2">
        {goals.map((goal) => {
          const percentage = Math.min(
            100,
            Math.round((goal.current_value / goal.target_value) * 100),
          );
          const isEditing = editingGoalId === goal.id;
          return (
            <article
              key={goal.id}
              className="p-3 space-y-2 border rounded-md border-graySm"
            >
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  {isEditing ? (
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <input
                        className="p-1 border rounded-md border-graySm"
                        value={goalDraft.title || ""}
                        onChange={(e) =>
                          setGoalDraft((c) => ({ ...c, title: e.target.value }))
                        }
                      />
                      <input
                        className="p-1 border rounded-md border-graySm"
                        value={goalDraft.category || ""}
                        onChange={(e) =>
                          setGoalDraft((c) => ({
                            ...c,
                            category: e.target.value,
                          }))
                        }
                      />
                    </div>
                  ) : (
                    <>
                      <p className="font-semibold">{goal.title}</p>
                      <p className="text-xs text-grayMd">
                        {goal.category} • {goal.status}
                      </p>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    className="px-2 py-1 border rounded-md border-graySm"
                    onClick={() => updateProgress(goal, 1)}
                  >
                    +1
                  </button>
                  <button
                    className="px-2 py-1 border rounded-md border-graySm"
                    onClick={() => updateProgress(goal, -1)}
                  >
                    -1
                  </button>
                  <button
                    className="px-2 py-1 text-white rounded-md bg-primary"
                    onClick={() => completeGoal(goal.id)}
                  >
                    Concluir
                  </button>
                  {isEditing ? (
                    <>
                      <button
                        className="px-2 py-1 text-white rounded-md bg-primary"
                        onClick={() => saveInline(goal)}
                      >
                        Salvar
                      </button>
                      <button
                        className="px-2 py-1 border rounded-md border-graySm"
                        onClick={() => setEditingGoalId(null)}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      className="px-2 py-1 border rounded-md border-graySm"
                      onClick={() => startEditing(goal)}
                    >
                      Editar
                    </button>
                  )}
                  <button
                    className="px-2 py-1 text-white bg-red-500 rounded-md"
                    onClick={() => setGoalToDelete(goal)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-graySm">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-grayMd">
                {goal.current_value}/{goal.target_value} • recompensa: +
                {goal.reward_coins} moedas e +{goal.reward_xp} XP
              </p>
            </article>
          );
        })}
      </section>

      <ConfirmModal
        open={Boolean(goalToDelete)}
        title="Excluir meta"
        description={`Deseja excluir a meta "${goalToDelete?.title || ""}"?`}
        confirmLabel="Excluir"
        onCancel={() => setGoalToDelete(null)}
        onConfirm={() => removeGoal(goalToDelete.id)}
      />

      <FormModal
        open={createModalOpen}
        title="Nova meta"
        onClose={() => setCreateModalOpen(false)}
      >
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <input
            className="p-2 border rounded-md border-graySm"
            placeholder="Título da meta"
            value={form.title}
            onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
          />
          <input
            className="p-2 border rounded-md border-graySm"
            placeholder="Categoria"
            value={form.category}
            onChange={(e) =>
              setForm((c) => ({ ...c, category: e.target.value }))
            }
          />
          <input
            type="number"
            className="p-2 border rounded-md border-graySm"
            value={form.target_value}
            onChange={(e) =>
              setForm((c) => ({
                ...c,
                target_value: Number(e.target.value) || 1,
              }))
            }
          />
          <input
            type="number"
            className="p-2 border rounded-md border-graySm"
            value={form.current_value}
            onChange={(e) =>
              setForm((c) => ({
                ...c,
                current_value: Number(e.target.value) || 0,
              }))
            }
          />
          <input
            type="number"
            className="p-2 border rounded-md border-graySm"
            value={form.reward_coins}
            onChange={(e) =>
              setForm((c) => ({
                ...c,
                reward_coins: Number(e.target.value) || 0,
              }))
            }
          />
          <input
            type="number"
            className="p-2 border rounded-md border-graySm"
            value={form.reward_xp}
            onChange={(e) =>
              setForm((c) => ({ ...c, reward_xp: Number(e.target.value) || 0 }))
            }
          />
          <button
            onClick={createGoal}
            className="p-2 text-white rounded-md md:col-span-2 bg-primary"
          >
            Criar meta
          </button>
        </div>
      </FormModal>
    </ModuleScreen>
  );
}
