"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Session } from "@/types/session";
import { formatCurrency, formatDate } from "@/lib/formatters";

type Props = {
  sessions: Session[];
};

export default function SessionsTable({ sessions }: Props) {
  const router = useRouter();

  async function deleteSession(id: string) {
    if (!confirm("Delete this session?")) return;

    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-xl bg-zinc-900 p-6 text-zinc-400">
        No sessions yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-zinc-900 shadow-xl">
      <table className="w-full">
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
                <td className="p-4">
                  {formatDate(session.played_on)}
                </td>

                <td className="p-4">{session.venue}</td>

                <td className="p-4">{session.stakes}</td>

                <td className="p-4 text-right">
                  {formatCurrency(session.buy_in)}
                </td>

                <td className="p-4 text-right">
                  {formatCurrency(session.cash_out)}
                </td>

                <td
                  className={`p-4 text-right font-bold ${
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
                    <button className="rounded bg-blue-600 px-3 py-1 text-sm hover:bg-blue-500">
                      Edit
                    </button>

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
  );
}