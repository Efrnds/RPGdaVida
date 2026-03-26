"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PropTypes } from "prop-types";
import Title from "./Title";
import Activity from "./Activity";
import ConfirmModal from "./ConfirmModal.jsx";
import FormModal from "./FormModal.jsx";
import { getDeviceId } from "../lib/deviceId";

const defaultActivity = {
  title: "",
  status: "won",
  description: "",
  values_text: "",
};

export default function Activities({ standalone = false, compact = false }) {
  const [deviceId, setDeviceId] = useState("anonymous-device");
  const [activities, setActivities] = useState([]);
  const [activityForm, setActivityForm] = useState(defaultActivity);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const pageSize = compact ? 3 : 4;

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2200);
  };

  const fetchActivities = async (id) => {
    const response = await fetch("/api/activities", {
      headers: { "x-device-id": id },
      cache: "no-store",
    });

    if (!response.ok) return;
    const data = await response.json();
    setActivities(data?.data || []);
  };

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    fetchActivities(id);
  }, []);

  const createActivity = async () => {
    if (!activityForm.description?.trim()) {
      showMessage("Descrição é obrigatória.");
      return;
    }

    await fetch("/api/activities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify(activityForm),
    });

    setActivityForm(defaultActivity);
    await fetchActivities(deviceId);
    setPage(1);
    setCreateModalOpen(false);
    showMessage("Atividade criada.");
  };

  const createQuickActivity = async () => {
    await fetch("/api/activities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify({
        title: "Nova atividade",
        status: "won",
        description: "Nova atividade registrada",
        values_text: "+0 XP",
      }),
    });

    await fetchActivities(deviceId);
    showMessage("Atividade criada.");
  };

  const updateActivity = async (id, payload) => {
    await fetch(`/api/activities/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify(payload),
    });

    await fetchActivities(deviceId);
    showMessage("Atividade atualizada.");
  };

  const deleteActivity = async (id) => {
    await fetch(`/api/activities/${id}`, {
      method: "DELETE",
      headers: { "x-device-id": deviceId },
    });

    await fetchActivities(deviceId);
    showMessage("Atividade removida.");
    setActivityToDelete(null);
  };

  const filteredActivities = activities.filter((activity) =>
    statusFilter === "ALL" ? true : activity.status === statusFilter
  );

  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className={`flex flex-col gap-2 ${compact ? "p-2" : ""}`}>
      <div className="flex items-center justify-between">
        <Title title="🔄 Atividades" />
        {!standalone ? (
          <Link href="/home/atividades" className="text-xs text-primary underline-offset-2 hover:underline">
            Ver todas
          </Link>
        ) : null}
      </div>

      {!compact && message ? (
        <p className="p-1 text-xs text-green-700 bg-green-100 rounded-md">{message}</p>
      ) : null}

      {!compact ? <div className="flex gap-2 text-xs">
        <button
          onClick={() => {
            setStatusFilter("ALL");
            setPage(1);
          }}
          className="px-2 py-1 border rounded-md border-graySm"
        >
          Todas
        </button>
        <button
          onClick={() => {
            setStatusFilter("won");
            setPage(1);
          }}
          className="px-2 py-1 border rounded-md border-graySm"
        >
          Won
        </button>
        <button
          onClick={() => {
            setStatusFilter("lost");
            setPage(1);
          }}
          className="px-2 py-1 border rounded-md border-graySm"
        >
          Lost
        </button>
        <button
          onClick={() => {
            setStatusFilter("limit");
            setPage(1);
          }}
          className="px-2 py-1 border rounded-md border-graySm"
        >
          Limit
        </button>
      </div> : null}

      <div className="flex flex-col gap-1.5">
        {paginatedActivities.map((activity) => (
          <Activity
            key={activity.id}
            title={activity.title}
            lostOrWon={activity.status}
            desc={activity.description}
            values={activity.values_text}
            compact={compact}
            onDelete={() => setActivityToDelete(activity)}
            onToggleStatus={() =>
              updateActivity(activity.id, {
                ...activity,
                status:
                  activity.status === "won"
                    ? "lost"
                    : activity.status === "lost"
                    ? "limit"
                    : "won",
              })
            }
          />
        ))}

        {compact && paginatedActivities.length === 0 ? (
          <p className="text-xs text-grayMd">Nenhuma atividade registrada.</p>
        ) : null}
      </div>

      {!compact ? <div className="flex items-center justify-between text-xs text-grayMd">
        <button
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          className="px-2 py-1 border rounded-md border-graySm"
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          className="px-2 py-1 border rounded-md border-graySm"
        >
          Próxima
        </button>
      </div> : null}

      {!compact ? (
        <button
          onClick={() => setCreateModalOpen(true)}
          className="p-1 text-sm border rounded-md border-graySm text-grayMd"
        >
          Nova Atividade +
        </button>
      ) : (
        <button
          onClick={createQuickActivity}
          className="w-full mt-1 text-sm font-bold border rounded-md text-graySm border-graySm hover:bg-white"
        >
          Nova Atividade +
        </button>
      )}

      {!compact ? (
        <ConfirmModal
          open={Boolean(activityToDelete)}
          title="Excluir atividade"
          description={`Deseja excluir a atividade "${activityToDelete?.title || "Sem título"}"?`}
          confirmLabel="Excluir"
          onCancel={() => setActivityToDelete(null)}
          onConfirm={() => deleteActivity(activityToDelete.id)}
        />
      ) : null}

      {!compact ? (
        <FormModal
          open={createModalOpen}
          title="Nova atividade"
          onClose={() => setCreateModalOpen(false)}
        >
          <div className="grid gap-2 text-sm">
            <input
              className="p-2 border rounded-md border-graySm"
              placeholder="Título (opcional)"
              value={activityForm.title}
              onChange={(e) =>
                setActivityForm((current) => ({ ...current, title: e.target.value }))
              }
            />
            <textarea
              className="p-2 border rounded-md border-graySm"
              rows={3}
              placeholder="Descrição"
              value={activityForm.description}
              onChange={(e) =>
                setActivityForm((current) => ({
                  ...current,
                  description: e.target.value,
                }))
              }
            />
            <input
              className="p-2 border rounded-md border-graySm"
              placeholder="Resultado (ex.: +10 XP)"
              value={activityForm.values_text}
              onChange={(e) =>
                setActivityForm((current) => ({
                  ...current,
                  values_text: e.target.value,
                }))
              }
            />
            <button
              onClick={createActivity}
              className="p-2 text-sm text-white rounded-md bg-primary"
            >
              Criar atividade
            </button>
          </div>
        </FormModal>
      ) : null}
    </div>
  );
}

Activities.propTypes = {
  standalone: PropTypes.bool,
  compact: PropTypes.bool,
};
