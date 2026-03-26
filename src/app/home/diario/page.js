"use client";

import { useEffect, useState } from "react";
import { getDeviceId } from "../../../lib/deviceId";
import ConfirmModal from "../../../components/ConfirmModal";
import ModuleScreen from "../../../components/ModuleScreen";
import FormModal from "../../../components/FormModal";

const defaultForm = {
  title: "",
  content: "",
  mood: "neutral",
  tags: "",
};

export default function DiarioPage() {
  const [deviceId, setDeviceId] = useState("anonymous-device");
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchEntries = async (id) => {
    const response = await fetch("/api/journal", {
      headers: { "x-device-id": id },
      cache: "no-store",
    });

    if (!response.ok) return;
    const data = await response.json();
    setEntries(data?.data || []);
  };

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    fetchEntries(id);
  }, []);

  const createEntry = async () => {
    if (!form.content.trim()) return;

    await fetch("/api/journal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify(form),
    });

    setForm(defaultForm);
    fetchEntries(deviceId);
    setCreateModalOpen(false);
  };

  const removeEntry = async (id) => {
    await fetch(`/api/journal/${id}`, {
      method: "DELETE",
      headers: { "x-device-id": deviceId },
    });
    fetchEntries(deviceId);
    setEntryToDelete(null);
  };

  const startEditing = (entry) => {
    setEditingId(entry.id);
    setDraft({
      title: entry.title || "",
      content: entry.content || "",
      mood: entry.mood || "neutral",
      tags: entry.tags || "",
    });
  };

  const saveInline = async (entry) => {
    await fetch(`/api/journal/${entry.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify({ ...entry, ...draft }),
    });

    setEditingId(null);
    setDraft({});
    fetchEntries(deviceId);
  };

  return (
    <ModuleScreen
      title="📓 Log de Atividades - Diário"
      subtitle="Registre sua história"
      description="Salve percepções do dia e acompanhe humor, contexto e aprendizados."
      icon="📝"
      maxWidth="max-w-4xl"
    >

      <section className="max-w-4xl mx-auto">
        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-3 py-2 text-sm text-white rounded-md bg-primary"
        >
          Nova entrada +
        </button>
      </section>

      <section className="max-w-4xl mx-auto space-y-2">
        {entries.map((entry) => (
          <article key={entry.id} className="p-3 border rounded-md border-graySm">
            <div className="flex items-center justify-between">
              {editingId === entry.id ? (
                <input
                  className="flex-1 p-1 mr-2 border rounded-md border-graySm"
                  value={draft.title || ""}
                  onChange={(e) => setDraft((c) => ({ ...c, title: e.target.value }))}
                />
              ) : (
                <p className="font-semibold">{entry.title || "Sem título"}</p>
              )}
              <div className="flex gap-2">
                {editingId === entry.id ? (
                  <>
                    <button className="px-2 py-1 text-xs text-white rounded-md bg-primary" onClick={() => saveInline(entry)}>Salvar</button>
                    <button className="px-2 py-1 text-xs border rounded-md border-graySm" onClick={() => setEditingId(null)}>Cancelar</button>
                  </>
                ) : (
                  <button className="px-2 py-1 text-xs border rounded-md border-graySm" onClick={() => startEditing(entry)}>Editar</button>
                )}
                <button className="px-2 py-1 text-xs text-white bg-red-500 rounded-md" onClick={() => setEntryToDelete(entry)}>Excluir</button>
              </div>
            </div>
            {editingId === entry.id ? (
              <>
                <textarea
                  className="w-full p-1 mt-2 border rounded-md border-graySm"
                  rows={3}
                  value={draft.content || ""}
                  onChange={(e) => setDraft((c) => ({ ...c, content: e.target.value }))}
                />
                <div className="grid grid-cols-1 gap-2 mt-2 md:grid-cols-2">
                  <input
                    className="p-1 border rounded-md border-graySm"
                    value={draft.mood || ""}
                    onChange={(e) => setDraft((c) => ({ ...c, mood: e.target.value }))}
                  />
                  <input
                    className="p-1 border rounded-md border-graySm"
                    value={draft.tags || ""}
                    onChange={(e) => setDraft((c) => ({ ...c, tags: e.target.value }))}
                  />
                </div>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm">{entry.content}</p>
                <p className="mt-1 text-xs text-grayMd">{entry.mood} {entry.tags ? `• ${entry.tags}` : ""}</p>
              </>
            )}
          </article>
        ))}
      </section>

      <ConfirmModal
        open={Boolean(entryToDelete)}
        title="Excluir entrada"
        description={`Deseja excluir "${entryToDelete?.title || "Sem título"}"?`}
        confirmLabel="Excluir"
        onCancel={() => setEntryToDelete(null)}
        onConfirm={() => removeEntry(entryToDelete.id)}
      />

      <FormModal
        open={createModalOpen}
        title="Nova entrada do diário"
        onClose={() => setCreateModalOpen(false)}
      >
        <div className="grid gap-2">
          <input className="p-2 border rounded-md border-graySm" placeholder="Título (opcional)" value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} />
          <textarea className="p-2 border rounded-md border-graySm" rows={4} placeholder="Escreva sobre seu dia" value={form.content} onChange={(e) => setForm((c) => ({ ...c, content: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <select className="p-2 border rounded-md border-graySm" value={form.mood} onChange={(e) => setForm((c) => ({ ...c, mood: e.target.value }))}>
              <option value="motivated">Motivado</option>
              <option value="neutral">Neutro</option>
              <option value="tired">Cansado</option>
              <option value="happy">Feliz</option>
            </select>
            <input className="p-2 border rounded-md border-graySm" placeholder="Tags (ex: foco,saude)" value={form.tags} onChange={(e) => setForm((c) => ({ ...c, tags: e.target.value }))} />
          </div>
          <button onClick={createEntry} className="p-2 text-white rounded-md bg-primary">Salvar entrada</button>
        </div>
      </FormModal>
    </ModuleScreen>
  );
}
