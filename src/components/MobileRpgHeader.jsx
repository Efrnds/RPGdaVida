"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TITLES = {
  "/home": "Menu Principal",
  "/home/skills": "Skills",
  "/home/dinheiro": "Loja",
  "/home/brain-dump": "Missões",
  "/home/atividades": "Log",
  "/home/bom-habito": "Bom Hábito",
  "/home/mau-habito": "Mau Hábito",
  "/home/estagio-para": "PARA",
  "/home/metas-conquistas": "Metas",
  "/home/metricas": "Métricas",
  "/home/diario": "Diário",
  "/home/perfil-metas": "Perfil",
  "/home/financas-investimentos": "Investimentos",
  "/home/configuracoes": "Configurações",
};

export default function MobileRpgHeader() {
  const pathname = usePathname();
  const title = TITLES[pathname] || "RPG da Vida";

  return (
    <header className="mobile-rpg-header sticky top-0 z-40 border-b border-graySm bg-white/95 px-3 py-2 backdrop-blur md:hidden">
      <div className="flex items-center justify-between">
        <p className="mobile-rpg-header-kicker text-[11px] font-semibold tracking-[0.18em] text-grayMd">
          RPG DA VIDA
        </p>
        <Link
          href="/home/perfil-metas"
          className="mobile-rpg-header-profile rounded-md border border-graySm px-2 py-1 text-xs font-semibold text-grayMd hover:bg-zinc-50"
        >
          👤 Perfil
        </Link>
      </div>
      <p className="mobile-rpg-header-title mt-0.5 text-sm font-semibold text-black">
        {title}
      </p>
    </header>
  );
}
