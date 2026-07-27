"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/95 px-4 py-3 backdrop-blur md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-200 transition hover:bg-zinc-800"
            aria-label="Open navigation"
          >
            ☰
          </button>

          <div className="text-sm font-semibold tracking-wide text-emerald-500">
            DiscoStacks
          </div>

          <div className="w-10" />
        </header>

        <main className="flex-1 overflow-x-hidden px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}