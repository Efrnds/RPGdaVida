"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PropTypes from "prop-types";
import {
  FaCalendarAlt,
  FaChartBar,
  FaInfoCircle,
  FaSeedling,
  FaTrash,
} from "react-icons/fa";
import { getDeviceId } from "../lib/deviceId";
import { LuSwords } from "react-icons/lu";
import FormModal from "./FormModal";

const HEATMAP_CELLS = 35;

function frequencyLabel(value) {
  if (value === "daily") return "Diário";
  if (value === "weekly") return "Semanal";
  return "Mensal";
}

function statusByHabit(habit, isGood) {
  const doneToday = Number(habit?.completions_today || 0) > 0;

  if (isGood) {
    return doneToday
      ? {
          chip: "✅ Concluído hoje",
          chipClass:
            "bg-green-600/10 text-green-700 border border-green-600/20",
          action: "Concluído hoje",
          actionClass: "bg-zinc-100 text-zinc-400 border border-zinc-200",
          disabled: true,
        }
      : {
          chip: "⏳ Pendente hoje",
          chipClass:
            "bg-amber-500/10 text-amber-700 border border-amber-500/20",
          action: "Concluir hoje",
          actionClass:
            "bg-primary text-white shadow-sm hover:shadow hover:-translate-y-0.5 transition-all",
          disabled: false,
        };
  }

  return doneToday
    ? {
        chip: "⚠ Recaída hoje",
        chipClass: "bg-red-600/10 text-red-700 border border-red-600/20",
        action: "Recaída registrada",
        actionClass: "bg-zinc-100 text-zinc-400 border border-zinc-200",
        disabled: true,
      }
    : {
        chip: "✅ Sem recaída",
        chipClass: "bg-green-600/10 text-green-700 border border-green-600/20",
        action: "Registrar recaída",
        actionClass:
          "bg-red-500 text-white shadow-sm hover:shadow hover:-translate-y-0.5 transition-all",
        disabled: false,
      };
}

function getBars(seed) {
  const a = Math.max(5, Math.min(30, (seed % 26) + 5));
  const b = Math.max(5, Math.min(30, ((seed * 2) % 26) + 5));
  const c = Math.max(5, Math.min(30, ((seed * 3) % 26) + 5));
  return [a, b, c];
}

function HeatMapCard({ habit, isGood, onComplete, onDelete }) {
  const activeCells = Math.max(
    0,
    Math.min(HEATMAP_CELLS, habit?.completions_7d || 0),
  );
  const status = statusByHabit(habit, isGood);
  const cells = Array.from({ length: HEATMAP_CELLS });

  return (
    <article className="flex flex-col p-4 bg-white border rounded-xl border-graySm/60 shadow-sm transition-shadow hover:shadow-md relative">
      <button
        onClick={onDelete}
        className="absolute top-3 right-3 text-graySm/60 hover:text-red-500 transition-colors"
        title="Excluir"
      >
        <FaTrash size={12} />
      </button>
      <header className="flex items-start justify-between gap-2 mb-3 pr-6">
        <div className="flex-1">
          <p className="text-[14px] font-bold text-grayMd leading-tight mb-0.5 line-clamp-2">
            {habit.title}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-medium text-grayMd/70 uppercase tracking-wide">
              {frequencyLabel(habit.frequency)}
            </p>
            <span className="w-1 h-1 rounded-full bg-graySm"></span>
            <p className="text-[11px] font-medium text-grayMd/70">
              Total:{" "}
              <span className="text-black">{habit.completions_total || 0}</span>
            </p>
          </div>
        </div>
      </header>

      <div className="mb-4">
        <span
          className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md ${status.chipClass}`}
        >
          {status.chip}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-4 mt-auto">
        {cells.map((_, idx) => (
          <span
            key={`${habit.id}-${idx}`}
            className={`h-4 rounded-sm transition-colors ${
              idx < activeCells
                ? isGood
                  ? "bg-primary"
                  : "bg-red-400"
                : "bg-zinc-100 border border-zinc-200/60"
            }`}
          />
        ))}
      </div>

      <button
        onClick={onComplete}
        disabled={status.disabled}
        className={`w-full py-2 text-xs font-bold rounded-lg ${status.actionClass} ${status.disabled ? "cursor-not-allowed" : ""}`}
      >
        {status.action}
      </button>
    </article>
  );
}

HeatMapCard.propTypes = {
  habit: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    frequency: PropTypes.string.isRequired,
    completions_7d: PropTypes.number,
    completions_total: PropTypes.number,
    completions_today: PropTypes.number,
  }).isRequired,
  isGood: PropTypes.bool.isRequired,
  onComplete: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default function HabitModule({ type }) {
  const isGood = type === "good";
  const pageMeta = isGood
    ? {
        title: "Crescimento",
        introTitle: "Seus Desenvolvimentos Pessoais",
        introSubtitle:
          "Acompanhe sua evolução diária, construa bons hábitos e ganhe recompensas ao mantê-los.",
        heatTitle: "Heat Map de Desenvolvimento",
        heatSubtitle:
          "A consistência é chave: veja seu progresso nos últimos dias.",
        statsTitle: "Estatísticas de Desenvolvimento",
        statsSubtitle:
          "Visão a longo prazo: entenda como seus hábitos se mantêm ao longo dos meses.",
        icon: <FaSeedling className="text-[80px] text-primary" />,
        actionLabel: "Concluir",
      }
    : {
        title: "Batalhas",
        introTitle: "Enfrente seus Maus Hábitos",
        introSubtitle:
          "Registre suas recaídas com honestidade. Cada dia sem recair é uma vitória.",
        heatTitle: "Heat Map de Derrotas",
        heatSubtitle: "Identifique padrões de recaídas ao longo das semanas.",
        statsTitle: "Estatísticas de Batalha",
        statsSubtitle:
          "Veja se você está conseguindo diminuir suas recaídas com o tempo.",
        icon: <LuSwords className="text-[80px] text-red-500" />,
        actionLabel: "Registrar recaída",
      };

  const [deviceId, setDeviceId] = useState("anonymous-device");
  const [habits, setHabits] = useState([]);
  const [message, setMessage] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [newHabitTitle, setNewHabitTitle] = useState("");

  const topHabits = useMemo(() => habits.slice(0, 4), [habits]);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2200);
  };

  const fetchData = useCallback(
    async (id) => {
      const habitsRes = await fetch(
        `/api/habits?type=${isGood ? "good" : "bad"}`,
        {
          headers: { "x-device-id": id },
          cache: "no-store",
        },
      );

      if (!habitsRes.ok) {
        showMessage("Falha ao atualizar dados.");
        return;
      }

      const habitsData = await habitsRes.json();
      setHabits(habitsData?.data || []);
    },
    [isGood],
  );

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    fetchData(id);
  }, [fetchData]);

  const createHabit = async () => {
    if (!newHabitTitle?.trim()) {
      showMessage("Nome do hábito é obrigatório.");
      return;
    }

    await fetch("/api/habits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify({
        title: newHabitTitle.trim(),
        type,
        frequency: "daily",
        reward_coins: isGood ? 5 : 0,
        damage_hp: isGood ? 0 : 5,
      }),
    });

    setNewHabitTitle("");
    setCreateModalOpen(false);
    await fetchData(deviceId);
    showMessage("Novo hábito criado.");
  };

  const completeHabit = async (id) => {
    await fetch(`/api/habits/${id}/complete`, {
      method: "POST",
      headers: { "x-device-id": deviceId },
    });

    await fetchData(deviceId);
    showMessage(
      isGood ? "Moedas e XP adicionados!" : "HP reduzido pela recaída.",
    );
  };

  const confirmDelete = async () => {
    if (!habitToDelete) return;

    await fetch(`/api/habits/${habitToDelete.id}`, {
      method: "DELETE",
      headers: { "x-device-id": deviceId },
    });

    setDeleteModalOpen(false);
    setHabitToDelete(null);
    await fetchData(deviceId);
    showMessage("Hábito deletado com sucesso.");
  };

  const openDeleteModal = (habit) => {
    setHabitToDelete(habit);
    setDeleteModalOpen(true);
  };

  return (
    <main className="max-w-[1200px] p-4 md:p-8 mx-auto space-y-12 text-grayMd bg-[#f8f9fa] min-h-screen">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b-2 border-graySm/50">
        <div>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 text-xs font-semibold uppercase tracking-wider text-grayMd bg-white border border-graySm rounded hover:bg-zinc-50 transition-colors"
          >
            ← Voltar ao Início
          </Link>
          <h1 className="flex items-center gap-3 text-4xl md:text-5xl font-extrabold text-black tracking-tight">
            {isGood ? (
              <FaSeedling className="text-primary" />
            ) : (
              <LuSwords className="text-red-500" />
            )}
            {pageMeta.title}
          </h1>
        </div>
      </header>

      {message && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <p className="px-4 py-3 text-sm font-medium text-green-800 bg-green-100 border border-green-200 rounded-lg shadow-lg">
            {message}
          </p>
        </div>
      )}

      <section className="pb-10 border-b-2 border-graySm/50">
        <div className="flex flex-col gap-8 md:flex-row md:items-center">
          <article className="grid shrink-0 w-40 h-40 md:w-56 md:h-56 border-2 rounded-2xl border-graySm/40 bg-white shadow-sm place-items-center">
            {pageMeta.icon}
          </article>

          <article className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-3">
              {pageMeta.introTitle}
            </h2>
            <p className="text-base text-grayMd leading-relaxed mb-4">
              {pageMeta.introSubtitle}
            </p>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-grayMd bg-white border border-graySm rounded hover:bg-zinc-50 transition-colors">
              <FaInfoCircle /> Como funciona
            </button>
          </article>
        </div>

        <div className="mt-10 bg-white border border-graySm/40 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-black">
              Principais {isGood ? "Hábitos" : "Desafios"}
            </h3>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="text-sm font-bold text-primary hover:text-primaryHover transition-colors"
            >
              + Novo
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {topHabits.map((habit) => {
              const status = statusByHabit(habit, isGood);
              return (
                <div
                  key={`${habit.id}-top-status`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-graySm/50 rounded-xl hover:border-graySm transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">
                      {isGood ? "🏵" : "🎞"}
                    </span>
                    <div>
                      <p className="font-bold text-black text-[15px]">
                        {habit.title}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-md ${status.chipClass}`}
                      >
                        {status.chip}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openDeleteModal(habit)}
                      className="p-2 text-graySm hover:text-red-500 rounded bg-white border border-graySm/40 shadow-sm transition-colors"
                      title="Excluir"
                    >
                      <FaTrash size={12} />
                    </button>
                    <button
                      onClick={() => completeHabit(habit.id)}
                      disabled={status.disabled}
                      className={`px-4 py-2 text-xs font-bold rounded-lg ${status.actionClass} ${status.disabled ? "cursor-not-allowed" : ""}`}
                    >
                      {status.action}
                    </button>
                  </div>
                </div>
              );
            })}
            {topHabits.length === 0 ? (
              <div className="col-span-full py-8 text-center border-2 border-dashed border-graySm rounded-xl">
                <p className="text-grayMd font-medium mb-2">
                  Nenhum hábito cadastrado
                </p>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  Criar primeiro hábito
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="pb-10 border-b-2 border-graySm/50">
        <div className="flex flex-col gap-8 md:flex-row md:items-center mb-10">
          <article className="grid shrink-0 w-32 h-32 md:w-48 md:h-48 border-2 rounded-2xl border-graySm/40 bg-white shadow-sm place-items-center">
            <FaCalendarAlt
              className={`text-[60px] md:text-[80px] ${isGood ? "text-primary/80" : "text-grayMd"}`}
            />
          </article>

          <article className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-3">
              {pageMeta.heatTitle}
            </h2>
            <p className="text-base text-grayMd leading-relaxed">
              {pageMeta.heatSubtitle}
            </p>
          </article>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {habits.map((habit) => (
            <HeatMapCard
              key={habit.id}
              habit={habit}
              isGood={isGood}
              onComplete={() => completeHabit(habit.id)}
              onDelete={() => openDeleteModal(habit)}
            />
          ))}

          {habits.length > 0 && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl border-graySm/80 text-grayMd hover:bg-white hover:text-primary hover:border-primary/50 transition-all group min-h-[220px]"
            >
              <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                +
              </span>
              <span className="font-bold">Novo Hábito</span>
            </button>
          )}
        </div>

        <p className="mt-6 text-sm font-medium text-grayMd/80 bg-white p-4 border border-graySm/50 rounded-xl flex items-center gap-3">
          <FaInfoCircle className="text-lg text-primary" />
          {isGood
            ? "Dica: clique em 'Concluir hoje' nos cards acima para registrar seu progresso diário."
            : "Dica: clique em 'Registrar recaída' apenas quando o mau hábito acontecer no dia de hoje."}
        </p>
      </section>

      <section className="pb-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center mb-10">
          <article className="grid shrink-0 w-32 h-32 md:w-48 md:h-48 border-2 rounded-2xl border-graySm/40 bg-white shadow-sm place-items-center">
            <FaChartBar
              className={`text-[60px] md:text-[80px] ${isGood ? "text-primary/80" : "text-grayMd"}`}
            />
          </article>

          <article className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-3">
              {pageMeta.statsTitle}
            </h2>
            <p className="text-base text-grayMd leading-relaxed">
              {pageMeta.statsSubtitle}
            </p>
          </article>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {habits.map((habit) => {
            const bars = getBars(
              Number(habit.completions_total || 1) +
                Number(habit.completions_7d || 0),
            );

            return (
              <article
                key={`${habit.id}-stats`}
                className="p-6 bg-white border border-graySm/60 rounded-2xl shadow-sm"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-[18px] font-bold text-black leading-tight mb-1">
                      {habit.title}
                    </p>
                    <p className="text-[12px] font-medium text-grayMd">
                      Gráfico de frequência mensal
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-zinc-100 rounded border border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Últimos 3 Meses
                  </div>
                </div>

                <div className="relative h-48 border-l-2 border-b-2 border-graySm/50 ml-6 mr-4 mb-3 mt-4">
                  <div
                    className={`absolute bottom-0 left-[15%] w-10 rounded-t-sm transition-all duration-500 hover:opacity-80 ${isGood ? "bg-primary/60" : "bg-red-400/60"}`}
                    style={{ height: `${bars[0] * 4}px` }}
                  />
                  <div
                    className={`absolute bottom-0 left-[45%] w-10 rounded-t-sm transition-all duration-500 hover:opacity-80 ${isGood ? "bg-primary/80" : "bg-red-400/80"}`}
                    style={{ height: `${bars[1] * 4.5}px` }}
                  />
                  <div
                    className={`absolute bottom-0 left-[75%] w-10 rounded-t-sm transition-all duration-500 hover:opacity-80 ${isGood ? "bg-primary" : "bg-red-500"}`}
                    style={{ height: `${bars[2] * 5}px` }}
                  />
                  <p className="absolute -left-6 top-0 text-[10px] font-bold text-grayMd -rotate-90 origin-left mt-10">
                    Frequência
                  </p>
                </div>

                <div className="relative grid grid-cols-3 pl-6 text-[11px] font-bold text-center text-grayMd">
                  <p>Mês 1</p>
                  <p>Mês 2</p>
                  <p>Mês 3</p>
                  <p className="absolute right-0 top-1 text-[10px] text-grayMd/50">
                    Meses →
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <FormModal
        open={createModalOpen}
        title={isGood ? "Novo Bom Hábito" : "Novo Mau Hábito"}
        onClose={() => setCreateModalOpen(false)}
      >
        <div className="grid gap-3 text-sm">
          <input
            className="p-3 bg-zinc-50 border rounded-lg border-graySm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
            placeholder={`Nome do ${isGood ? "desenvolvimento pessoal" : "mau hábito"}...`}
            value={newHabitTitle}
            onChange={(e) => setNewHabitTitle(e.target.value)}
            autoFocus
          />
          <button
            onClick={createHabit}
            className={`p-3 font-bold text-white rounded-lg transition-colors ${isGood ? "bg-primary hover:bg-primaryHover" : "bg-red-500 hover:bg-red-600"}`}
          >
            {isGood ? "Criar Hábito" : "Criar Desafio"}
          </button>
        </div>
      </FormModal>

      <FormModal
        open={deleteModalOpen}
        title={"Excluir Item"}
        onClose={() => setDeleteModalOpen(false)}
      >
        <div className="text-sm space-y-4">
          <p className="text-grayMd text-base">
            Tem certeza que deseja excluir o item{" "}
            <strong className="text-black">{habitToDelete?.title}</strong>? Todo
            o histórico de progresso será perdido e esta ação não poderá ser
            desfeita.
          </p>
          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-lg text-black font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              className="px-5 py-2.5 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 shadow-sm transition-colors"
            >
              Sim, Excluir
            </button>
          </div>
        </div>
      </FormModal>
    </main>
  );
}

HabitModule.propTypes = {
  type: PropTypes.oneOf(["good", "bad"]).isRequired,
};
