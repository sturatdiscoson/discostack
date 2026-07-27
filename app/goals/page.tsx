import AppLayout from "../layouts/AppLayout";
import GoalsStats from "@/components/GoalsStats";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/formatters";
import { Session } from "@/types/session";
import { BankrollAdjustment } from "@/app/types/adjustment";

const goals = [1000, 2000, 3000, 5000, 10000];

export default async function GoalsPage() {
  const [response, adjustmentResponse] = await Promise.all([
    supabase.from("sessions").select("*").order("played_on", { ascending: false }),
    supabase.from("bankroll_adjustments").select("*").order("date", { ascending: false }),
  ]);

  const sessions = (response.data as Session[]) ?? [];
  const adjustments = (adjustmentResponse.data as BankrollAdjustment[]) ?? [];
  const totalProfit = sessions.reduce(
    (sum, session) =>
      sum + (session.profit ?? session.cash_out - session.buy_in),
    0
  );
  const currentBankroll = 1500;
  const nextGoal = goals.find((goal) => totalProfit < goal) ?? goals[goals.length - 1];
  const nextGoalRemaining = Math.max(nextGoal - totalProfit, 0);

  const goalRows = goals.map((goal) => {
    const achieved = totalProfit >= goal;
    const remaining = Math.max(goal - totalProfit, 0);
    const progress = Math.min(Math.max(totalProfit / goal, 0), 1);

    return {
      goal,
      achieved,
      remaining,
      progress,
      overage: achieved ? totalProfit - goal : 0,
    };
  });

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-emerald-500">Goals</h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            Track your profit milestones and see exactly how far you are from the next target.
          </p>
        </div>

        <div className="rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-300">
          Next target: {formatCurrency(nextGoal)} • {nextGoalRemaining > 0 ? `${formatCurrency(nextGoalRemaining)} to go` : "Reached"}
        </div>
      </div>

      <GoalsStats
        currentBankroll={currentBankroll}
        totalProfit={totalProfit}
        nextGoal={nextGoal}
        nextGoalRemaining={nextGoalRemaining}
      />

      <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Profit milestones</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Goals light up automatically when your total profit reaches each target.
            </p>
          </div>
          <p className="text-sm text-zinc-400">
            Total profit: {formatCurrency(totalProfit)}
          </p>
        </div>

        <div className="space-y-4">
          {goalRows.map(({ goal, achieved, remaining, progress, overage }) => (
            <div
              key={goal}
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Goal</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(goal)}</p>
                </div>

                <div
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    achieved ? "bg-emerald-500/10 text-emerald-300" : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {achieved ? "✓ Achieved" : "Pending"}
                </div>
              </div>

              <div className="mt-5 rounded-full bg-zinc-800 h-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-zinc-400">
                <span>
                  {achieved
                    ? `Goal reached${overage > 0 ? ` • ${formatCurrency(overage)} over` : ""}`
                    : `£${remaining.toLocaleString()} to go`}
                </span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
