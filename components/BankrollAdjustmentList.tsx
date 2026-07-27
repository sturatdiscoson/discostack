import { BankrollAdjustment } from "@/app/types/adjustment";
import { formatCurrency } from "@/lib/formatters";

type Props = {
  adjustments: BankrollAdjustment[];
};

export default function BankrollAdjustmentList({ adjustments }: Props) {
  if (adjustments.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-950 p-8 text-zinc-400">
        No bankroll adjustments recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {adjustments.map((adjustment) => (
        <div
          key={adjustment.id}
          className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-zinc-400">{adjustment.date}</p>
              <p className="text-xl font-semibold text-white">{adjustment.note ?? "Adjustment"}</p>
            </div>
            <p
              className={`text-lg font-semibold ${adjustment.amount >= 0 ? "text-emerald-400" : "text-rose-400"}`}
            >
              {adjustment.amount >= 0 ? "+" : ""}{formatCurrency(adjustment.amount)}
            </p>
          </div>
          <p className="mt-3 text-sm text-zinc-400">{adjustment.type}</p>
        </div>
      ))}
    </div>
  );
}
