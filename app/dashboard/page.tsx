"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import DashboardStats from "@/components/DashboardStats";
import SessionsTable from "@/components/SessionsTable";
import BankrollAdjustmentForm from "@/components/BankrollAdjustmentForm";
import BankrollAdjustmentList from "@/components/BankrollAdjustmentList";
import { supabase } from "@/lib/supabase";
import { Session } from "@/types/session";
import { BankrollAdjustment } from "@/app/types/adjustment";

const STARTING_BANKROLL = 1500;
const BANKROLL_RESET_AT = new Date("2026-07-29T02:15:56.084Z");

export default function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [adjustments, setAdjustments] = useState<BankrollAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadDashboardData = async () => {
      setLoadError("");

      const [sessionResponse, adjustmentResponse] = await Promise.all([
        supabase.from("sessions").select("*").order("played_on", { ascending: false }),
        supabase.from("bankroll_adjustments").select("*").order("date", { ascending: false }),
      ]);

      if (!mounted) {
        return;
      }

      if (sessionResponse.error || adjustmentResponse.error) {
        setLoadError(sessionResponse.error?.message ?? adjustmentResponse.error?.message ?? "Unable to load dashboard data.");
        setSessions([]);
        setAdjustments([]);
        setLoading(false);
        return;
      }

      setSessions((sessionResponse.data as Session[]) ?? []);
      setAdjustments(((adjustmentResponse.data as BankrollAdjustment[]) ?? []).sort((a, b) => b.date.localeCompare(a.date)));
      setLoading(false);
    };

    loadDashboardData();

    const { data: authSubscription } = supabase.auth.onAuthStateChange(() => {
      loadDashboardData();
    });

    return () => {
      mounted = false;
      authSubscription.subscription.unsubscribe();
    };
  }, [reloadCount]);

  const { totalProfit, totalHours, sessionCount, currentBankroll, recentSessions } = useMemo(() => {
    const calculatedTotalProfit = sessions.reduce(
      (sum, session) =>
        sum + (session.profit ?? session.cash_out - session.buy_in),
      0
    );

    const calculatedTotalHours = sessions.reduce((sum, session) => sum + (session.hours ?? 0), 0);
    const calculatedSessionCount = sessions.length;
    const liveSessionProfit = sessions
      .filter((session) => new Date(session.created_at) >= BANKROLL_RESET_AT)
      .reduce((sum, session) => sum + (session.profit ?? session.cash_out - session.buy_in), 0);
    const liveAdjustmentSum = adjustments
      .filter((adjustment) => new Date(adjustment.created_at) >= BANKROLL_RESET_AT)
      .reduce((sum, adjustment) => sum + (adjustment.amount ?? 0), 0);

    return {
      totalProfit: calculatedTotalProfit,
      totalHours: calculatedTotalHours,
      sessionCount: calculatedSessionCount,
      currentBankroll: STARTING_BANKROLL + liveSessionProfit + liveAdjustmentSum,
      recentSessions: sessions.slice(0, 5),
    };
  }, [sessions, adjustments]);

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-emerald-500">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            Your bankroll and session performance at a glance. Use this page to monitor trends and jump to recent sessions.
          </p>
        </div>

        <Link
          href="/sessions"
          className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:border-emerald-500 hover:text-emerald-300"
        >
          View all sessions
        </Link>
      </div>

      <DashboardStats
        currentBankroll={currentBankroll}
        totalProfit={totalProfit}
        sessionCount={sessionCount}
        totalHours={totalHours}
      />

      <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Recent sessions</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Latest activity from your session tracker.
            </p>
          </div>

          <p className="text-sm text-zinc-400">
            Showing {recentSessions.length} of {sessionCount} sessions
          </p>
        </div>

        {loadError ? (
          <div className="rounded-3xl border border-red-500 bg-red-500/10 p-8 text-red-300">
            {loadError}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-zinc-300">
            Loading sessions...
          </div>
        ) : null}

        {!loading && sessionCount === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-zinc-300">
            <h3 className="text-xl font-semibold text-white">No sessions recorded yet</h3>
            <p className="mt-2 text-zinc-400">
              Add your first session from the Sessions page to populate the dashboard.
            </p>
          </div>
        ) : !loading ? (
          <SessionsTable sessions={recentSessions} />
        ) : null}
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <BankrollAdjustmentForm onSaved={() => setReloadCount((current) => current + 1)} />

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white">Recent bankroll adjustments</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Withdrawals and deposits that change your real bankroll.
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 text-zinc-300">
              Loading adjustments...
            </div>
          ) : null}

          {!loading ? <BankrollAdjustmentList adjustments={adjustments} /> : null}
        </section>
      </div>
    </AppLayout>
  );
}
