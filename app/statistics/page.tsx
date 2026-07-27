export const dynamic = "force-dynamic";

import AppLayout from "../layouts/AppLayout";
import StatCard from "@/components/StatCard";
import StatisticsCharts from "@/components/StatisticsCharts";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/formatters";
import { Session } from "@/types/session";

function getMonthLabel(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

export default async function StatisticsPage() {
  const response = await supabase
    .from("sessions")
    .select("*")
    .order("played_on", { ascending: true });

  const sessions = (response.data as Session[]) ?? [];
  const sessionCount = sessions.length;
  const totalProfit = sessions.reduce(
    (sum, session) =>
      sum + (session.profit ?? session.cash_out - session.buy_in),
    0
  );
  const totalHours = sessions.reduce((sum, session) => sum + (session.hours ?? 0), 0);
  const averageProfit = sessionCount > 0 ? totalProfit / sessionCount : 0;
  const averageHourly = totalHours > 0 ? totalProfit / totalHours : 0;

  const getSessionProfit = (session: Session) =>
    session.profit ?? session.cash_out - session.buy_in;

  const positiveCount = sessions.filter((session) => getSessionProfit(session) >= 0).length;
  const negativeCount = sessionCount - positiveCount;

  const bestSession = sessions.reduce<Session | null>((best, session) => {
    if (best === null || getSessionProfit(session) > getSessionProfit(best)) return session;
    return best;
  }, null);

  const worstSession = sessions.reduce<Session | null>((worst, session) => {
    if (worst === null || getSessionProfit(session) < getSessionProfit(worst)) return session;
    return worst;
  }, null);

  const monthlyProfit = sessions.reduce<Record<string, number>>((acc, session) => {
    const label = getMonthLabel(session.played_on);
    acc[label] = (acc[label] ?? 0) + getSessionProfit(session);
    return acc;
  }, {});

  const monthlyLabels = Object.keys(monthlyProfit);
  const monthlyValues = monthlyLabels.map((label) => monthlyProfit[label]);
  const monthlyMax = Math.max(...monthlyValues, 0);
  const monthlyMin = Math.min(...monthlyValues, 0);
  const profitTrendValues = sessions.map((session) => getSessionProfit(session));

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-emerald-500">Statistics</h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            Track your historical performance and session trends over time.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Sessions" value={`${sessionCount}`} />
        <StatCard title="Total Profit" value={formatCurrency(totalProfit)} colour={totalProfit >= 0 ? "text-emerald-400" : "text-rose-400"} />
        <StatCard title="Avg profit / session" value={formatCurrency(averageProfit)} />
        <StatCard title="Avg hourly" value={`${formatCurrency(averageHourly)}/hr`} />
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Profit charts</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Monthly profit and session profit trend charts.
              </p>
            </div>
            <div className="rounded-full border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-300">
              {monthlyLabels.length} months
            </div>
          </div>

          {sessionCount === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-zinc-300">
              No session data available yet.
            </div>
          ) : (
            <StatisticsCharts
              monthlyLabels={monthlyLabels}
              monthlyValues={monthlyValues}
              profitTrendValues={profitTrendValues}
            />
          )}
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white">Session outcomes</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Win/loss count and your best and worst sessions.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-center">
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Winning sessions</p>
              <p className="mt-3 text-4xl font-bold text-emerald-400">{positiveCount}</p>
            </div>
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-center">
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Losing sessions</p>
              <p className="mt-3 text-4xl font-bold text-rose-400">{negativeCount}</p>
            </div>
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Best session</p>
              {bestSession ? (
                <div className="mt-3 space-y-2 text-white">
                  <p className="font-semibold">{getMonthLabel(bestSession.played_on)}</p>
                  <p>{bestSession.venue}</p>
                  <p className="text-emerald-400">{formatCurrency(getSessionProfit(bestSession))}</p>
                </div>
              ) : (
                <p className="mt-3 text-zinc-400">No sessions yet</p>
              )}
            </div>
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Worst session</p>
              {worstSession ? (
                <div className="mt-3 space-y-2 text-white">
                  <p className="font-semibold">{getMonthLabel(worstSession.played_on)}</p>
                  <p>{worstSession.venue}</p>
                  <p className="text-rose-400">{formatCurrency(getSessionProfit(worstSession))}</p>
                </div>
              ) : (
                <p className="mt-3 text-zinc-400">No sessions yet</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
