"use client";

import { useEffect, useMemo, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import GoalsStats from "@/components/GoalsStats";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/formatters";
import { Session } from "@/types/session";
import { BankrollAdjustment } from "@/app/types/adjustment";

const bankrollGoals = [2000, 2500, 3000, 4000, 5000, 7500, 10000];
const STARTING_BANKROLL = 1500;
const BANKROLL_RESET_AT = new Date("2026-07-29T02:15:56.084Z");

export default function GoalsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [adjustments, setAdjustments] = useState<BankrollAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadGoalsData = async () => {
      setLoadError("");

      const [sessionResponse, adjustmentResponse] = await Promise.all([
        supabase.from("sessions").select("*").order("played_on", { ascending: false }),
        supabase.from("bankroll_adjustments").select("*").order("date", { ascending: false }),
      ]);

      if (!mounted) {
        return;
      }

      if (sessionResponse.error || adjustmentResponse.error) {
        setLoadError(
          sessionResponse.error?.message ?? adjustmentResponse.error?.message ?? "Unable to load goals data."
        );
        setSessions([]);
        setAdjustments([]);
        setLoading(false);
        return;
      }

      setSessions((sessionResponse.data as Session[]) ?? []);
      setAdjustments(((adjustmentResponse.data as BankrollAdjustment[]) ?? []).sort((a, b) => b.date.localeCompare(a.date)));
      setLoading(false);
    };

    loadGoalsData();

    const { data: authSubscription } = supabase.auth.onAuthStateChange(() => {
      loadGoalsData();
    });

    return () => {
      mounted = false;
      authSubscription.subscription.unsubscribe();
    };
  }, []);

  const { currentBankroll, nextGoal, nextGoalRemaining, goalRows } = useMemo(() => {
    const liveSessionProfit = sessions
      .filter((session) => new Date(session.created_at) >= BANKROLL_RESET_AT)
      .reduce((sum, session) => sum + (session.profit ?? session.cash_out - session.buy_in), 0);

    const liveAdjustmentSum = adjustments
      .filter((adjustment) => new Date(adjustment.created_at) >= BANKROLL_RESET_AT)
      .reduce((sum, adjustment) => sum + (adjustment.amount ?? 0), 0);

    const bankroll = STARTING_BANKROLL + liveSessionProfit + liveAdjustmentSum;
    const goal = bankrollGoals.find((target) => bankroll < target) ?? bankrollGoals[bankrollGoals.length - 1];
    const remaining = Math.max(goal - bankroll, 0);

    return {
      currentBankroll: bankroll,
      nextGoal: goal,
      nextGoalRemaining: remaining,
      goalRows: bankrollGoals.map((target) => {
        const achieved = bankroll >= target;
        const goalSpan = target - STARTING_BANKROLL;
        const progress = Math.min(Math.max((bankroll - STARTING_BANKROLL) / goalSpan, 0), 1);

        return {
          goal: target,
          achieved,
          remaining: Math.max(target - bankroll, 0),
          progress,
          overage: achieved ? bankroll - target : 0,
        };
      }),
    };
  }, [adjustments, sessions]);

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-emerald-500">Goals</h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            Track your bankroll milestones and see exactly how far you are from the next target.
          </p>
        </div>

        <div className="rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-300">
          Next target: {formatCurrency(nextGoal)} • {nextGoalRemaining > 0 ? `${formatCurrency(nextGoalRemaining)} to go` : "Reached"}
        </div>
      </div>

      <GoalsStats currentBankroll={currentBankroll} nextGoal={nextGoal} nextGoalRemaining={nextGoalRemaining} />

      <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Bankroll milestones</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Goals light up automatically when your bankroll reaches each target.
            </p>
          </div>
          <p className="text-sm text-zinc-400">Current bankroll: {formatCurrency(currentBankroll)}</p>
        </div>

        {loadError ? (
          <div className="mb-6 rounded-3xl border border-red-500 bg-red-500/10 p-8 text-red-300">
            {loadError}
          </div>
        ) : null}

        {loading ? (
          <div className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-zinc-300">
            Loading bankroll targets...
          </div>
        ) : null}

        <div className="space-y-4">
          {goalRows.map(({ goal, achieved, remaining, progress, overage }) => (
            <div key={goal} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
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

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full rounded-full bg-emerald-400 transition-all duration-300" style={{ width: `${progress * 100}%` }} />
              </div>

              <div className="mt-4 flex flex-col gap-2 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  {achieved ? `Goal reached${overage > 0 ? ` • ${formatCurrency(overage)} over` : ""}` : `${formatCurrency(remaining)} to go`}
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
