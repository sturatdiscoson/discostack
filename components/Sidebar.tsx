import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-zinc-900 border-r border-zinc-800 p-6">
      <h1 className="text-3xl font-bold text-emerald-500">
        DiscoStacks
      </h1>

      <p className="mt-1 mb-8 text-zinc-400">
        Live Poker Tracker
      </p>

      <nav className="space-y-2">
        <Link
          href="/dashboard"
          className="block rounded-lg px-4 py-3 hover:bg-zinc-800"
        >
          🏠 Dashboard
        </Link>

        <Link
          href="/sessions"
          className="block rounded-lg px-4 py-3 hover:bg-zinc-800"
        >
          💷 Sessions
        </Link>

        <Link
          href="/statistics"
          className="block rounded-lg px-4 py-3 hover:bg-zinc-800"
        >
          📈 Statistics
        </Link>

        <Link
          href="/goals"
          className="block rounded-lg px-4 py-3 hover:bg-zinc-800"
        >
          🎯 Goals
        </Link>

      </nav>
    </aside>
  );
}