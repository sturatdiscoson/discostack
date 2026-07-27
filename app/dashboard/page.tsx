import Link from "next/link";
import AppLayout from "../layouts/AppLayout";
import DashboardStats from "@/components/DashboardStats";
import SessionsTable from "@/components/SessionsTable";
import BankrollAdjustmentForm from "@/components/BankrollAdjustmentForm";
import BankrollAdjustmentList from "@/components/BankrollAdjustmentList";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/formatters";
import { Session } from "@/types/session";
import { BankrollAdjustment } from "@/app/types/adjustment";

const STARTING_BANKROLL = 1500;

export default async function Dashboard() {
  const [sessionResponse, adjustmentResponse] = await Promise.all([
    supabase.from("sessions").select("*").order("played_on", { ascending: false }),
    supabase.from("bankroll_adjustments").select("*").order("date", { ascending: false }),
  ]);

  const sessions = (sessionResponse.data as Session[]) ?? [];
  const adjustments = (adjustmentResponse.data as BankrollAdjustment[]) ?? [];
  const totalProfit = sessions.reduce((sum, session) => sum + (session.profit ?? 0), 0);
  const totalHours = sessions.reduce((sum, session) => sum + (session.hours ?? 0), 0);
  const sessionCount = sessions.length;
  const adjustmentSum = adjustments.reduce((sum, adjustment) => sum + (adjustment.amount ?? 0), 0);
  const currentBankroll = 1500;
  const recentSessions = sessions.slice(0, 5);

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

        {sessionCount === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-zinc-300">
            <h3 className="text-xl font-semibold text-white">No sessions recorded yet</h3>
            <p className="mt-2 text-zinc-400">
              Add your first session from the Sessions page to populate the dashboard.
            </p>
          </div>
        ) : (
          <SessionsTable sessions={recentSessions} />
        )}
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <BankrollAdjustmentForm />

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white">Recent bankroll adjustments</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Withdrawals and deposits that change your real bankroll.
            </p>
          </div>

          <BankrollAdjustmentList adjustments={adjustments} />
        </section>
      </div>
    </AppLayout>
  );
}
