"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PropTypes } from "prop-types";
import Task from "./Task.jsx";
import ConfirmModal from "./ConfirmModal.jsx";
import FormModal from "./FormModal.jsx";
import { getDeviceId } from "../lib/deviceId";

const defaultTask = {
  title: "",
  level: 1,
  status: "A FAZER",
  due_label: "",
};

export default function BrainDump({ standalone = false, compact = false }) {
  const [deviceId, setDeviceId] = useState("anonymous-device");
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState(defaultTask);
  const [statusFilter, setStatusFilter] = useState("TODAS");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const pageSize = compact ? 3 : 5;

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2200);
  };

  const fetchTasks = async (id) => {
    const response = await fetch("/api/tasks", {
      headers: { "x-device-id": id },
      cache: "no-store",
    });

    if (!response.ok) return;
    const data = await response.json();
    setTasks(data?.data || []);
  };

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    fetchTasks(id);
  }, []);

  const createTask = async () => {
    if (!taskForm.title?.trim()) {
      showMessage("Informe o título da tarefa.");
      return;
    }

    await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify(taskForm),
    });

    setTaskForm(defaultTask);
    await fetchTasks(deviceId);
    setPage(1);
    setCreateModalOpen(false);
    showMessage("Tarefa criada.");
  };

  const createQuickTask = async () => {
    await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify({
        title: "Nova tarefa",
        level: 1,
        status: "A FAZER",
        due_label: "",
      }),
    });

    await fetchTasks(deviceId);
    showMessage("Tarefa criada.");
  };

  const updateTask = async (id, payload) => {
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify(payload),
    });

    await fetchTasks(deviceId);
    showMessage("Tarefa atualizada.");
  };

  const deleteTask = async (id) => {
    await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
      headers: { "x-device-id": deviceId },
    });

    await fetchTasks(deviceId);
    showMessage("Tarefa removida.");
    setTaskToDelete(null);
  };

  const filteredTasks = tasks.filter((task) =>
    statusFilter === "TODAS" ? true : task.status === statusFilter,
  );

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className={compact ? "p-2" : ""}>
      <div className="flex items-center justify-between border-b border-b-graySm">
        <h2 className="-mb-px border-b-2 w-fit h-fit border-b-black text-[32px] font-semibold text-grayMd leading-none">
          💡 Brain Dump
        </h2>
        {!standalone ? (
          <Link
            href="/home/brain-dump"
            className="text-xs text-primary underline-offset-2 hover:underline"
          >
            Ver todos
          </Link>
        ) : null}
      </div>

      {!compact && message ? (
        <p className="p-1 mt-2 text-xs text-green-700 bg-green-100 rounded-md">
          {message}
        </p>
      ) : null}

      {!compact ? (
        <div className="flex gap-2 mt-2 text-xs">
          <button
            onClick={() => {
              setStatusFilter("TODAS");
              setPage(1);
            }}
            className="px-2 py-1 border rounded-md border-graySm"
          >
            Todas
          </button>
          <button
            onClick={() => {
              setStatusFilter("A FAZER");
              setPage(1);
            }}
            className="px-2 py-1 border rounded-md border-graySm"
          >
            A Fazer
          </button>
          <button
            onClick={() => {
              setStatusFilter("CONCLUÍDO");
              setPage(1);
            }}
            className="px-2 py-1 border rounded-md border-graySm"
          >
            Concluído
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-1 py-2">
        {paginatedTasks.map((task) => (
          <Task
            key={task.id}
            title={task.title}
            level={task.level}
            status={task.status}
            today={task.due_label}
            compact={compact}
            onToggleStatus={() =>
              updateTask(task.id, {
                ...task,
                status: task.status === "A FAZER" ? "CONCLUÍDO" : "A FAZER",
              })
            }
            onDelete={() => setTaskToDelete(task)}
          />
        ))}

        {compact && paginatedTasks.length === 0 ? (
          <p className="text-xs text-grayMd">Nenhuma tarefa por aqui.</p>
        ) : null}
      </div>

      {!compact ? (
        <div className="flex items-center justify-between mt-1 text-xs text-grayMd">
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
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            className="px-2 py-1 border rounded-md border-graySm"
          >
            Próxima
          </button>
        </div>
      ) : null}

      {!compact ? (
        <div className="text-sm font-bold text-graySm">
          <button onClick={() => setCreateModalOpen(true)}>
            Nova Tarefa +
          </button>
        </div>
      ) : (
        <button
          onClick={createQuickTask}
          className="w-full mt-1 text-sm font-bold border rounded-md text-graySm border-graySm hover:bg-white"
        >
          Nova Tarefa +
        </button>
      )}

      {!compact ? (
        <ConfirmModal
          open={Boolean(taskToDelete)}
          title="Excluir tarefa"
          description={`Deseja excluir a tarefa "${taskToDelete?.title || ""}"?`}
          confirmLabel="Excluir"
          onCancel={() => setTaskToDelete(null)}
          onConfirm={() => deleteTask(taskToDelete.id)}
        />
      ) : null}

      {!compact ? (
        <FormModal
          open={createModalOpen}
          title="Nova tarefa"
          onClose={() => setCreateModalOpen(false)}
        >
          <div className="grid grid-cols-2 gap-2 text-sm">
            <input
              className="p-2 border rounded-md border-graySm"
              placeholder="Título"
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm((current) => ({
                  ...current,
                  title: e.target.value,
                }))
              }
            />
            <input
              className="p-2 border rounded-md border-graySm"
              type="number"
              min="1"
              placeholder="Nível"
              value={taskForm.level}
              onChange={(e) =>
                setTaskForm((current) => ({
                  ...current,
                  level: Number(e.target.value) || 1,
                }))
              }
            />
            <input
              className="col-span-2 p-2 border rounded-md border-graySm"
              placeholder="Rótulo de horário (opcional)"
              value={taskForm.due_label}
              onChange={(e) =>
                setTaskForm((current) => ({
                  ...current,
                  due_label: e.target.value,
                }))
              }
            />
            <button
              onClick={createTask}
              className="col-span-2 p-2 text-sm text-white rounded-md bg-primary"
            >
              Criar tarefa
            </button>
          </div>
        </FormModal>
      ) : null}
    </div>
  );
}

BrainDump.propTypes = {
  standalone: PropTypes.bool,
  compact: PropTypes.bool,
};
