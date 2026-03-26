"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PropTypes from "prop-types";
import {
  FaCalendarAlt,
  FaChartBar,
  FaInfoCircle,
  FaRedoAlt,
  FaSeedling,
} from "react-icons/fa";
import { getDeviceId } from "../lib/deviceId";
import { LuSwords } from "react-icons/lu";

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
          chipClass: "bg-green-600 text-white",
          action: "Concluído hoje",
          actionClass: "bg-zinc-300 text-zinc-700",
          disabled: true,
        }
      : {
          chip: "⏳ Pendente hoje",
          chipClass: "bg-amber-500 text-white",
          action: "Concluir hoje",
          actionClass: "bg-primary text-white",
          disabled: false,
        };
  }

  return doneToday
    ? {
        chip: "⚠ Recaída registrada hoje",
        chipClass: "bg-red-600 text-white",
        action: "Recaída registrada",
        actionClass: "bg-zinc-300 text-zinc-700",
        disabled: true,
      }
    : {
        chip: "✅ Sem recaída hoje",
        chipClass: "bg-green-600 text-white",
        action: "Registrar recaída",
        actionClass: "bg-red-600 text-white",
        disabled: false,
      };
}

function getBars(seed) {
  const a = Math.max(5, Math.min(30, (seed % 26) + 5));
  const b = Math.max(5, Math.min(30, ((seed * 2) % 26) + 5));
  const c = Math.max(5, Math.min(30, ((seed * 3) % 26) + 5));
  return [a, b, c];
}

function HeatMapCard({ habit, isGood, onComplete }) {
  const activeCells = Math.max(0, Math.min(HEATMAP_CELLS, habit?.completions_7d || 0));
  const status = statusByHabit(habit, isGood);
  const cells = Array.from({ length: HEATMAP_CELLS });

  return (
    <article className="p-2 border rounded-sm border-graySm bg-zinc-50">
      <header className="flex items-start justify-between gap-1">
        <div>
          <p className="text-[12px] font-semibold leading-4">{habit.title}</p>
          <p className="text-[10px] text-grayMd">{frequencyLabel(habit.frequency)}</p>
        </div>
        <p className="text-[10px] text-grayMd">Total: {habit.completions_total || 0}</p>
      </header>

      <div className="mt-1.5 space-y-1">
        <span className={`inline-block px-1 py-0.5 text-[9px] rounded-sm ${status.chipClass}`}>
          {status.chip}
        </span>
        <p className="text-[10px] text-center text-grayMd">Setembro - 2024</p>
      </div>

      <div className="grid grid-cols-7 gap-1 mt-1.5">
        {cells.map((_, idx) => (
          <span
            key={`${habit.id}-${idx}`}
            className={`h-3 rounded-sm ${
              idx < activeCells
                ? isGood
                  ? "bg-zinc-400"
                  : "bg-zinc-500"
                : "bg-zinc-200"
            }`}
          />
        ))}
      </div>

      <button
        onClick={onComplete}
        disabled={status.disabled}
        className={`w-full mt-2 px-2 py-1 text-[11px] rounded-sm ${status.actionClass} ${status.disabled ? "cursor-not-allowed" : "hover:opacity-90"}`}
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
};

export default function HabitModule({ type }) {
  const isGood = type === "good";
  const pageMeta = isGood
    ? {
        title: "Crescimento - Bom hábito",
        introTitle: "Seus Desenvolvimentos Pessoais!",
        introSubtitle: "Confira todos os desenvolvimentos pessoais que você têm.",
        heatTitle: "Heat Map de Desenvolvimento",
        heatSubtitle: "Confira o seu heat map de desenvolvimento pessoal aqui.",
        statsTitle: "Estatísticas de Desenvolvimento",
        statsSubtitle: "Confira as suas estatísticas de desenvolvimento pessoal aqui.",
        icon: <FaRedoAlt className="text-[90px] text-grayMd" />,
        actionLabel: "Concluir",
      }
    : {
        title: "Batalha - Mau hábito",
        introTitle: "Batalhe",
        introSubtitle: "Batalhe os seus Maus Hábitos! Conquiste eles!",
        heatTitle: "Heat Map de Derrotas",
        heatSubtitle: "Confira o seu heat map de batalhas aqui.",
        statsTitle: "Estatísticas de Batalha",
        statsSubtitle: "Confira as suas estatísticas de batalha pessoal aqui.",
        icon: <LuSwords className="text-[90px] text-grayMd" />,
        actionLabel: "Registrar",
      };

  const [deviceId, setDeviceId] = useState("anonymous-device");
  const [habits, setHabits] = useState([]);
  const [message, setMessage] = useState("");
  const topHabits = useMemo(() => habits.slice(0, 4), [habits]);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2200);
  };

  const fetchData = useCallback(
    async (id) => {
      const habitsRes = await fetch(`/api/habits?type=${isGood ? "good" : "bad"}`, {
        headers: { "x-device-id": id },
        cache: "no-store",
      });

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
    const title = window.prompt("Nome do novo desenvolvimento pessoal:");
    if (!title?.trim()) return;

    await fetch("/api/habits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify({
        title: title.trim(),
        type,
        frequency: "daily",
        reward_coins: isGood ? 5 : 0,
        damage_hp: isGood ? 0 : 5,
      }),
    });

    await fetchData(deviceId);
    showMessage("Novo hábito criado.");
  };

  const completeHabit = async (id) => {
    await fetch(`/api/habits/${id}/complete`, {
      method: "POST",
      headers: { "x-device-id": deviceId },
    });

    await fetchData(deviceId);
    showMessage(isGood ? "Moedas adicionadas." : "HP reduzido.");
  };

  return (
    <main className="max-w-305 p-4 mx-auto space-y-6 text-grayMd">
      <header className="pb-4 border-b-2 border-graySm">
        <h1 className="flex items-center gap-2 text-5xl font-bold">
          {isGood ? <FaSeedling /> : <LuSwords />}
          {pageMeta.title}
        </h1>
      </header>

      {message ? (
        <p className="p-2 text-sm text-green-700 bg-green-100 rounded-md">
          {message}
        </p>
      ) : null}

      <section className="pb-6 border-b-2 border-graySm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-center">
          <article className="grid w-52 h-44 border rounded-sm border-graySm place-items-center bg-zinc-100">
            {pageMeta.icon}
          </article>

          <article className="pt-3">
            <h2 className="text-4xl font-bold text-black">{pageMeta.introTitle}</h2>
            <p className="text-sm">{pageMeta.introSubtitle}</p>
            <p className="flex items-center gap-1 mt-1 text-[13px] underline">
              <FaInfoCircle /> Precisa de ajuda
            </p>
          </article>
        </div>

        <div className="grid gap-4 mt-6 md:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            {topHabits.map((habit) => (
              <p key={habit.id} className="text-[28px] leading-8">{isGood ? "🏵" : "🎞"} {habit.title}</p>
            ))}
            {topHabits.length === 0 ? (
              <p className="text-base text-grayMd">Nenhum hábito criado ainda.</p>
            ) : null}
            <button
              onClick={createHabit}
              className="text-[28px] font-medium text-graySm transition-colors hover:text-grayMd"
            >
              + Novo Desenvolvimento Pessoal
            </button>
          </div>

          <div className="space-y-1.5 md:pt-1.5">
            {topHabits.map((habit) => {
              const status = statusByHabit(habit, isGood);
              return (
                <div key={`${habit.id}-top-status`} className="flex items-center justify-end gap-1.5">
                  <span className={`px-2 py-1 text-[10px] rounded-sm ${status.chipClass}`}>
                    {status.chip}
                  </span>
                  <button
                    onClick={() => completeHabit(habit.id)}
                    disabled={status.disabled}
                    className={`px-2 py-1 text-[10px] rounded-sm ${status.actionClass} ${status.disabled ? "cursor-not-allowed" : "hover:opacity-90"}`}
                  >
                    {status.action}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-6 border-b-2 border-graySm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-center">
          <article className="grid w-52 h-44 border rounded-sm border-graySm place-items-center bg-zinc-100">
            <FaCalendarAlt className="text-[90px]" />
          </article>

          <article className="pt-3">
            <h2 className="text-4xl font-bold text-black">{pageMeta.heatTitle}</h2>
            <p className="text-sm">{pageMeta.heatSubtitle}</p>
            <p className="flex items-center gap-1 mt-1 text-[13px] underline">
              <FaInfoCircle /> Precisa de ajuda
            </p>
          </article>
        </div>

        <div className="grid gap-3 mt-6 sm:grid-cols-2 lg:grid-cols-4">
          {habits.map((habit) => (
            <HeatMapCard
              key={habit.id}
              habit={habit}
              isGood={isGood}
              onComplete={() => completeHabit(habit.id)}
            />
          ))}

          {habits.length === 0 ? (
            <p className="text-sm text-grayMd sm:col-span-2 lg:col-span-4">Crie seu primeiro hábito para começar o heat map.</p>
          ) : null}

          <button
            onClick={createHabit}
            className="grid p-3 text-2xl border rounded-sm border-graySm bg-zinc-50 place-items-center hover:bg-zinc-100"
          >
            + Novo Desenvolvimento Pessoal
          </button>
        </div>

        <p className="mt-3 text-xs text-grayMd">
          {isGood
            ? "Dica: clique em 'Concluir hoje' no hábito para registrar o progresso diário."
            : "Dica: clique em 'Registrar recaída' apenas quando o mau hábito acontecer hoje."}
        </p>
      </section>

      <section>
        <div className="pb-6 border-b-2 border-graySm">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-center">
            <article className="grid w-52 h-44 border rounded-sm border-graySm place-items-center bg-zinc-100">
              <FaChartBar className="text-[90px]" />
            </article>

            <article className="pt-3">
              <h2 className="text-4xl font-bold text-black">{pageMeta.statsTitle}</h2>
              <p className="text-sm">{pageMeta.statsSubtitle}</p>
              <p className="flex items-center gap-1 mt-1 text-[13px] underline">
                <FaInfoCircle /> Precisa de ajuda
              </p>
            </article>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {habits.map((habit) => {
            const bars = getBars(Number(habit.completions_total || 1) + Number(habit.completions_7d || 0));

            return (
              <article key={`${habit.id}-stats`} className="p-3 border rounded-sm border-graySm bg-zinc-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-2xl font-semibold">{habit.title}</p>
                  <p className="text-[11px]">Ordenar pelos últimos: 3M 6M 9M</p>
                </div>

                <p className="mb-3 text-[11px]">Setembro - 2024</p>

                <div className="relative h-56 border-l border-b border-black/70 ml-3 mr-8 mb-2">
                  <div className="absolute bottom-0 left-[14%] w-8 bg-zinc-300" style={{ height: `${bars[0] * 6}px` }} />
                  <div className="absolute bottom-0 left-[45%] w-8 bg-zinc-300" style={{ height: `${bars[1] * 6}px` }} />
                  <div className="absolute bottom-0 left-[76%] w-8 bg-zinc-300" style={{ height: `${bars[2] * 6}px` }} />
                  <p className="absolute -left-5 top-0 text-[10px]">Dias</p>
                  <p className="absolute -right-11 bottom-0 text-[10px]">Meses</p>
                </div>

                <div className="grid grid-cols-3 pl-4 text-[10px] text-center">
                  <p>Jan</p>
                  <p>Fev</p>
                  <p>Mar</p>
                </div>
              </article>
            );
          })}

          {habits.length === 0 ? (
            <p className="text-sm text-grayMd">Sem estatísticas ainda. Adicione hábitos para gerar os gráficos.</p>
          ) : null}

          <button
            onClick={createHabit}
            className="w-full h-28 text-2xl border rounded-sm border-graySm bg-zinc-50 hover:bg-zinc-100"
          >
            + Novo Desenvolvimento Pessoal
          </button>
        </div>
      </section>

      <div className="text-right">
        <Link className="text-sm underline" href="/home">Voltar</Link>
      </div>
    </main>
  );
}

HabitModule.propTypes = {
  type: PropTypes.oneOf(["good", "bad"]).isRequired,
};
