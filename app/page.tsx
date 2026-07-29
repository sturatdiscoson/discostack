import Link from "next/link";
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 text-white">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-emerald-500 sm:text-6xl">
          DiscoStacks
        </h1>

        <div className="mt-6 text-xl leading-relaxed text-zinc-300 sm:mt-8 sm:text-2xl">
          <p>Bankroll.</p>
          <p>Study.</p>
          <p>Improve.</p>
        </div>

        <p className="mt-6 text-lg text-zinc-400 sm:mt-8 sm:text-xl">
          Live Poker Bankroll Tracker
        </p>

        <p className="mt-2 text-sm text-zinc-500 sm:text-base">
          Version 0.1
        </p>

        <Link
          href="/dashboard"
          className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-4 text-base font-semibold transition hover:bg-emerald-500 sm:mt-10 sm:text-lg"
        >
          Enter
        </Link>
      </div>
    </main>
  );
}