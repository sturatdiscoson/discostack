"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import { formatCurrency, formatHours } from "@/lib/formatters";

type DashboardStatsProps = {
  currentBankroll: number;
  totalProfit: number;
  sessionCount: number;
  totalHours: number;
};

const BANKROLL_KEY = "disco-dashboard-hide-bankroll";
const PROFIT_KEY = "disco-dashboard-hide-profit";

export default function DashboardStats({
  currentBankroll,
  totalProfit,
  sessionCount,
  totalHours,
}: DashboardStatsProps) {
  const [hideBankroll, setHideBankroll] = useState(false);
  const [hideProfit, setHideProfit] = useState(false);

  useEffect(() => {
    const savedBankroll = window.localStorage.getItem(BANKROLL_KEY);
    const savedProfit = window.localStorage.getItem(PROFIT_KEY);

    if (savedBankroll !== null) {
      setHideBankroll(JSON.parse(savedBankroll));
    }
    if (savedProfit !== null) {
      setHideProfit(JSON.parse(savedProfit));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(BANKROLL_KEY, JSON.stringify(hideBankroll));
  }, [hideBankroll]);

  useEffect(() => {
    window.localStorage.setItem(PROFIT_KEY, JSON.stringify(hideProfit));
  }, [hideProfit]);

  const bankrollValue = hideBankroll ? "Hidden" : formatCurrency(currentBankroll);
  const profitValue = hideProfit ? "Hidden" : formatCurrency(totalProfit);
  const profitColour = hideProfit
    ? "text-zinc-400"
    : totalProfit >= 0
    ? "text-emerald-400"
    : "text-rose-400";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Key stats</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Hide your bankroll or profit individually when sharing your dashboard.
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

          <button
            type="button"
            onClick={() => setHideProfit((current) => !current)}
            className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:border-emerald-500 hover:text-emerald-300"
          >
            {hideProfit ? "Show profit" : "Hide profit"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Current Bankroll" value={bankrollValue} />
        <StatCard title="Lifetime Profit" value={profitValue} colour={profitColour} />
        <StatCard title="Sessions" value={`${sessionCount}`} />
        <StatCard title="Total Hours" value={formatHours(totalHours)} />
      </div>
    </div>
  );
}
