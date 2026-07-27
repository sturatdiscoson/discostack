import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-emerald-500">
          DISCO STACK
        </h1>

        <div className="mt-8 text-2xl text-zinc-300 leading-relaxed">
          <p>Bankroll.</p>
          <p>Study.</p>
          <p>Improve.</p>
        </div>

        <p className="mt-8 text-xl text-zinc-400">
          Live Poker Bankroll Tracker
        </p>

        <p className="mt-2 text-zinc-500">
          Version 0.1
        </p>

<Link
  href="/dashboard"
  className="mt-10 inline-block rounded-xl bg-emerald-600 px-8 py-4 text-lg font-semibold transition hover:bg-emerald-500"
>
  Enter
</Link>
      </div>
    </main>
  );
}