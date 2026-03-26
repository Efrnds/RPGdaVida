"use client";

import Link from "next/link";
import BrainDump from "./BrainDump.jsx";
import Activities from "./Activities.jsx";

const MODULES = [
  {
    href: "/home/bom-habito",
    title: "Bom hábito",
    subtitle: "Ganhar XP",
    icon: "🌱",
  },
  {
    href: "/home/mau-habito",
    title: "Mau hábito",
    subtitle: "Evitar dano",
    icon: "⚔️",
  },
  {
    href: "/home/metas-conquistas",
    title: "Metas",
    subtitle: "Objetivos",
    icon: "🏆",
  },
  {
    href: "/home/estagio-para",
    title: "PARA",
    subtitle: "Notas .md",
    icon: "🧭",
  },
  {
    href: "/home/dinheiro",
    title: "Loja",
    subtitle: "Recompensas",
    icon: "🪙",
  },
  { href: "/home/diario", title: "Diário", subtitle: "Histórico", icon: "📓" },
  {
    href: "/home/financas-investimentos",
    title: "Investimentos",
    subtitle: "Rendimento",
    icon: "📈",
  },
  {
    href: "/home/configuracoes",
    title: "Config",
    subtitle: "Preferências",
    icon: "⚙️",
  },
];

export default function HomeMobileLayout() {
  return (
    <main className="w-full px-3 pt-3 pb-24 space-y-3">
      <section className="rounded-md border border-graySm bg-white px-3 py-2.5 shadow-sm">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-grayMd">
          MENU RPG
        </p>
        <p className="text-sm font-semibold text-black">
          Escolha seu próximo módulo
        </p>
        <p className="mt-0.5 text-xs text-grayMd">
          Cada card abre uma área específica do sistema.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-2">
        {MODULES.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="flex items-center gap-2 rounded-md border border-graySm bg-white px-2.5 py-2 shadow-sm"
          >
            <span className="text-lg leading-none">{module.icon}</span>
            <span className="leading-tight">
              <span className="block text-xs font-semibold text-grayMd">
                {module.title}
              </span>
              <span className="block text-[10px] text-grayMd/80">
                {module.subtitle}
              </span>
            </span>
          </Link>
        ))}
      </section>

      <section className="rounded-md border border-graySm bg-white p-2 shadow-sm">
        <BrainDump compact />
      </section>

      <section className="rounded-md border border-graySm bg-white p-2 shadow-sm">
        <Activities compact />
      </section>
    </main>
  );
}
