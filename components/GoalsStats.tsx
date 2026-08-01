"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import { formatCurrency } from "@/lib/formatters";

type GoalsStatsProps = {
  currentBankroll: number;
  nextGoal: number;
  nextGoalRemaining: number;
};

const BANKROLL_KEY = "disco-goals-hide-bankroll";

export default function GoalsStats({
  currentBankroll,
  nextGoal,
  nextGoalRemaining,
}: GoalsStatsProps) {
  const [hideBankroll, setHideBankroll] = useState(false);

  useEffect(() => {
    const savedBankroll = window.localStorage.getItem(BANKROLL_KEY);

    if (savedBankroll !== null) {
      setHideBankroll(JSON.parse(savedBankroll));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(BANKROLL_KEY, JSON.stringify(hideBankroll));
  }, [hideBankroll]);

  const bankrollValue = hideBankroll ? "Hidden" : formatCurrency(currentBankroll);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Goals overview</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Hide your bankroll if you want to keep the page private.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setHideBankroll((current) => !current)}
            className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:border-emerald-500 hover:text-emerald-300"
          >
            {hideBankroll ? "Show bankroll" : "Hide bankroll"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Current Bankroll" value={bankrollValue} />
        <StatCard title="Next bankroll target" value={formatCurrency(nextGoal)} />
        <StatCard title="Remaining" value={nextGoalRemaining > 0 ? formatCurrency(nextGoalRemaining) : "Hit"} />
      </div>
    </div>
  );
}
