"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getDeviceId } from "../../../lib/deviceId";
import ConfirmModal from "../../../components/ConfirmModal";
import ModuleScreen from "../../../components/ModuleScreen";
import FormModal from "../../../components/FormModal";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  ListsToggle,
  MDXEditor,
  UndoRedo,
  headingsPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";

const defaultForm = {
  title: "nova-nota.md",
  bucket: "projects",
  status: "idea",
  next_action: "",
  notes: "",
};

export default function EstagioParaPage() {
  const [deviceId, setDeviceId] = useState("anonymous-device");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) || null,
    [items, selectedId],
  );

  const fetchItems = useCallback(async (id) => {
    const response = await fetch("/api/para", {
      headers: { "x-device-id": id },
      cache: "no-store",
    });

    if (!response.ok) return;
    const data = await response.json();
    setItems(data?.data || []);
  }, []);

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    fetchItems(id);
  }, [fetchItems]);

  useEffect(() => {
    if (!items.length) {
      setSelectedId(null);
      setDraft(null);
      return;
    }

    if (!selectedId || !items.some((item) => item.id === selectedId)) {
      setSelectedId(items[0].id);
      setDraft(items[0]);
    }
  }, [items, selectedId]);

  const createItem = async () => {
    if (!form.title.trim()) return;

    const filename = form.title.trim().endsWith(".md")
      ? form.title.trim()
      : `${form.title.trim()}.md`;

    const response = await fetch("/api/para", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify({
        ...form,
        title: filename,
        notes:
          form.notes?.trim() ||
          `# ${filename.replace(/\.md$/i, "")}\n\n- Contexto\n- Próximos passos\n\n\
## Checklist\n\n- [ ] Primeiro item\n`,
      }),
    });

    if (!response.ok) return;
    const created = await response.json();

    setForm(defaultForm);
    await fetchItems(deviceId);
    if (created?.data?.id) {
      setSelectedId(created.data.id);
      setDraft(created.data);
    }
    setCreateModalOpen(false);
  };

  const saveCurrentFile = async () => {
    if (!selectedItem || !draft) return;
    setSaving(true);

    const filename = draft.title?.trim().endsWith(".md")
      ? draft.title.trim()
      : `${draft.title?.trim() || "arquivo"}.md`;

    await fetch(`/api/para/${selectedItem.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify({ ...selectedItem, ...draft, title: filename }),
    });

    await fetchItems(deviceId);
    setSaving(false);
  };

  const removeItem = async (id) => {
    await fetch(`/api/para/${id}`, {
      method: "DELETE",
      headers: { "x-device-id": deviceId },
    });

    fetchItems(deviceId);
    setItemToDelete(null);
  };

  const openItem = (item) => {
    setSelectedId(item.id);
    setDraft({ ...item });
  };

  return (
    <ModuleScreen
      title="🧭 Estágio - Método PARA"
      subtitle="Vault de arquivos estilo Notion/Obsidian"
      description="Edite e organize notas .md com live preview no mesmo editor, no estilo Obsidian."
      icon="🗺️"
    >

      <section className="max-w-5xl mx-auto">
        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-3 py-2 text-sm text-white rounded-md bg-primary"
        >
          Novo arquivo .md +
        </button>
      </section>

      <section className="grid max-w-5xl grid-cols-1 gap-3 mx-auto md:grid-cols-12">
        <aside className="p-2 bg-white border rounded-md md:col-span-4 border-graySm">
          <p className="px-1 mb-2 text-xs font-semibold text-grayMd">ARQUIVOS</p>
          <div className="space-y-1">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => openItem(item)}
                className={`w-full rounded-md border px-2 py-2 text-left text-sm transition-colors ${
                  selectedId === item.id
                    ? "border-primary bg-green-50"
                    : "border-graySm bg-white hover:bg-zinc-50"
                }`}
              >
                <p className="font-medium truncate">{item.title}</p>
                <p className="text-[11px] text-grayMd uppercase">
                  {item.bucket} • {item.status}
                </p>
              </button>
            ))}

            {!items.length ? (
              <p className="px-2 py-3 text-sm text-grayMd">Nenhum arquivo .md criado ainda.</p>
            ) : null}
          </div>
        </aside>

        <div className="p-3 bg-white border rounded-md md:col-span-8 border-graySm">
          {selectedItem && draft ? (
            <>
              <div className="grid grid-cols-1 gap-2 mb-3 md:grid-cols-3">
                <input
                  className="p-2 border rounded-md md:col-span-2 border-graySm"
                  value={draft.title || ""}
                  placeholder="arquivo.md"
                  onChange={(e) => setDraft((current) => ({ ...current, title: e.target.value }))}
                />
                <select
                  className="p-2 border rounded-md border-graySm"
                  value={draft.bucket || "projects"}
                  onChange={(e) => setDraft((current) => ({ ...current, bucket: e.target.value }))}
                >
                  <option value="projects">Projects</option>
                  <option value="areas">Areas</option>
                  <option value="resources">Resources</option>
                  <option value="archive">Archive</option>
                </select>
                <input
                  className="p-2 border rounded-md md:col-span-2 border-graySm"
                  value={draft.next_action || ""}
                  placeholder="Próxima ação"
                  onChange={(e) => setDraft((current) => ({ ...current, next_action: e.target.value }))}
                />
                <select
                  className="p-2 border rounded-md border-graySm"
                  value={draft.status || "idea"}
                  onChange={(e) => setDraft((current) => ({ ...current, status: e.target.value }))}
                >
                  <option value="idea">Ideia</option>
                  <option value="active">Ativo</option>
                  <option value="waiting">Aguardando</option>
                  <option value="done">Concluído</option>
                </select>
              </div>

              <div className="overflow-hidden border rounded-md border-graySm">
                <MDXEditor
                  markdown={draft.notes || ""}
                  onChange={(markdown) => setDraft((current) => ({ ...current, notes: markdown }))}
                  plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    linkPlugin(),
                    tablePlugin(),
                    markdownShortcutPlugin(),
                    toolbarPlugin({
                      toolbarContents: () => (
                        <>
                          <UndoRedo />
                          <BoldItalicUnderlineToggles />
                          <BlockTypeSelect />
                          <ListsToggle />
                        </>
                      ),
                    }),
                  ]}
                  contentEditableClassName="h-105 overflow-auto bg-zinc-50 px-3 py-2"
                />
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={saveCurrentFile}
                  className="px-3 py-2 text-sm text-white rounded-md bg-primary"
                >
                  {saving ? "Salvando..." : "Salvar arquivo"}
                </button>
                <button
                  onClick={() => setItemToDelete(selectedItem)}
                  className="px-3 py-2 text-sm text-white bg-red-500 rounded-md"
                >
                  Excluir arquivo
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-grayMd">Selecione um arquivo na lateral para editar.</p>
          )}
        </div>
      </section>

      <ConfirmModal
        open={Boolean(itemToDelete)}
        title="Excluir item PARA"
        description={`Deseja excluir "${itemToDelete?.title || ""}"?`}
        confirmLabel="Excluir"
        onCancel={() => setItemToDelete(null)}
        onConfirm={() => removeItem(itemToDelete.id)}
      />

      <FormModal
        open={createModalOpen}
        title="Novo arquivo .md"
        onClose={() => setCreateModalOpen(false)}
      >
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <input className="p-2 border rounded-md border-graySm" placeholder="arquivo.md" value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} />
          <select className="p-2 border rounded-md border-graySm" value={form.bucket} onChange={(e) => setForm((c) => ({ ...c, bucket: e.target.value }))}>
            <option value="projects">Projects</option>
            <option value="areas">Areas</option>
            <option value="resources">Resources</option>
            <option value="archive">Archive</option>
          </select>
          <select className="p-2 border rounded-md border-graySm" value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value }))}>
            <option value="idea">Ideia</option>
            <option value="active">Ativo</option>
            <option value="waiting">Aguardando</option>
            <option value="done">Concluído</option>
          </select>
          <input className="p-2 border rounded-md border-graySm" placeholder="Próxima ação" value={form.next_action} onChange={(e) => setForm((c) => ({ ...c, next_action: e.target.value }))} />
          <textarea className="p-2 border rounded-md md:col-span-2 border-graySm" rows={2} placeholder="Conteúdo inicial em MDX (opcional)" value={form.notes} onChange={(e) => setForm((c) => ({ ...c, notes: e.target.value }))} />
          <button onClick={createItem} className="p-2 text-white rounded-md md:col-span-2 bg-primary">Criar arquivo</button>
        </div>
      </FormModal>
    </ModuleScreen>
  );
}
