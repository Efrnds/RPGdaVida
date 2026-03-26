"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/home", label: "Menu", icon: "🧭" },
  { href: "/home/metas-conquistas", label: "Metas", icon: "🏆" },
  { href: "/home/dinheiro", label: "Loja", icon: "🪙" },
  { href: "/home/brain-dump", label: "Missões", icon: "💡" },
  { href: "/home/atividades", label: "Log", icon: "🔄" },
];

export default function MobileRpgNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-rpg-nav fixed inset-x-0 bottom-0 z-50 border-t border-graySm bg-white/95 backdrop-blur md:hidden">
      <ul className="grid grid-cols-5 px-1 py-1.5">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`mobile-rpg-nav-link flex flex-col items-center justify-center gap-0.5 rounded-md py-1 text-[10px] transition-colors ${
                  active
                    ? "is-active bg-primary/15 text-black ring-1 ring-primary/40"
                    : "text-grayMd"
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span className="font-semibold tracking-wide">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
