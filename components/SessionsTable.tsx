"use client";
import { useEffect, useState } from "react";
import EditSessionModal from "@/components/EditSessionModal";
import { supabase } from "@/lib/supabase";
import { Session } from "@/types/session";
import { formatCurrency, formatDate } from "@/lib/formatters";

type Props = {
  sessions: Session[];
};

export default function SessionsTable({ sessions }: Props) {
  const [sessionList, setSessionList] = useState<Session[]>(sessions);

  useEffect(() => {
    setSessionList(sessions);
  }, [sessions]);

  async function deleteSession(id: string) {
    if (!confirm("Delete this session?")) return;

    const { data, error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      alert(error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("Unable to delete session; record not found.");
      return;
    }

    setSessionList((current) => current.filter((session) => session.id !== id));
  }

  if (sessionList.length === 0) {
    return (
      <div className="rounded-xl bg-zinc-900 p-6 text-zinc-400">
        No sessions yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-zinc-900 shadow-xl">
      <div className="space-y-4 p-4 sm:hidden">
        {sessions.map((session) => {
          const profit = session.cash_out - session.buy_in;

          return (
            <div
              key={session.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                      Date
                    </p>
                    <p className="text-base font-semibold text-white">
                      {formatDate(session.played_on)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                      Profit
                    </p>
                    <p
                      className={`text-base font-semibold ${
                        profit >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {profit >= 0 ? "+" : ""}
                      {formatCurrency(profit)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                      Venue
                    </p>
                    <p className="text-sm text-white">{session.venue}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                      Stakes
                    </p>
                    <p className="text-sm text-white">{session.stakes}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                      Buy In
                    </p>
                    <p className="text-sm text-white">
                      {formatCurrency(session.buy_in)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                      Cash Out
                    </p>
                    <p className="text-sm text-white">
                      {formatCurrency(session.cash_out)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <EditSessionModal session={session} />
                  <button
                    onClick={() => deleteSession(session.id)}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto hidden sm:block">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="border-b border-zinc-800 bg-zinc-950">
            <tr className="text-left text-sm uppercase tracking-wide text-zinc-400">
              <th className="p-4">Date</th>
              <th className="p-4">Venue</th>
              <th className="p-4">Stakes</th>
              <th className="p-4 text-right">Buy In</th>
              <th className="p-4 text-right">Cash Out</th>
              <th className="p-4 text-right">Profit</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sessions.map((session) => {
              const profit = session.cash_out - session.buy_in;

              return (
                <tr
                  key={session.id}
                  className="border-b border-zinc-800 transition hover:bg-zinc-800/60"
                >
                  <td className="p-4 whitespace-nowrap">
                    {formatDate(session.played_on)}
                  </td>

                  <td className="p-4 whitespace-nowrap">{session.venue}</td>

                  <td className="p-4 whitespace-nowrap">{session.stakes}</td>

                  <td className="p-4 text-right whitespace-nowrap">
                    {formatCurrency(session.buy_in)}
                  </td>

                  <td className="p-4 text-right whitespace-nowrap">
                    {formatCurrency(session.cash_out)}
                  </td>

                  <td
                    className={`p-4 text-right font-bold whitespace-nowrap ${
                      profit >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {profit >= 0 ? "+" : ""}
                    {formatCurrency(profit)}
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <EditSessionModal session={session} />

                      <button
                        onClick={() => deleteSession(session.id)}
                        className="rounded bg-red-600 px-3 py-1 text-sm hover:bg-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}