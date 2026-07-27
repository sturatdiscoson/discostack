"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/sessions", label: "Sessions", icon: "💷" },
  { href: "/statistics", label: "Statistics", icon: "📈" },
  { href: "/goals", label: "Goals", icon: "🎯" },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 md:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        id="mobile-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-800 bg-zinc-900/95 p-5 shadow-2xl backdrop-blur transition-transform duration-300 ease-out md:static md:w-64 md:translate-x-0 md:border-r md:bg-zinc-900 md:p-6 md:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-500 sm:text-3xl">
              DiscoStacks
            </h1>
            <p className="mt-1 text-sm text-zinc-400 sm:text-base">
              Live Poker Tracker
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-2 text-zinc-200 transition hover:bg-zinc-800 md:hidden"
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition sm:text-base ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-zinc-200 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-zinc-300">
          Keep your bankroll sharp on the go.
        </div>
      </aside>
    </>
  );
}