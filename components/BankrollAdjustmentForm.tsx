"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const defaultValues = {
  date: new Date().toISOString().split("T")[0],
  type: "deposit",
  amount: 0,
  note: "",
};

type AdjustmentForm = typeof defaultValues;

export default function BankrollAdjustmentForm() {
  const [form, setForm] = useState<AdjustmentForm>(defaultValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const updateField = <K extends keyof AdjustmentForm>(key: K, value: AdjustmentForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const amount = Number(form.amount);
      if (!amount || Number.isNaN(amount)) {
        throw new Error("Enter a valid amount.");
      }

      const { error } = await supabase.from("bankroll_adjustments").insert({
        date: form.date,
        amount: form.type === "withdrawal" ? amount * -1 : amount,
        type: form.type,
        note: form.note || null,
      });

      if (error) {
        throw error;
      }

      setSuccess("Adjustment saved.");
      setForm(defaultValues);
      setSaving(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save adjustment.");
      setSaving(false);
    }
  };

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white">Bankroll adjustment</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Record money added to or withdrawn from your real bankroll.
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-500 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="mb-4 rounded-2xl border border-emerald-500 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {success}
        </div>
      ) : null}

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-zinc-300">
            Date
            <input
              type="date"
              value={form.date}
              onChange={(event) => updateField("date", event.target.value)}
              className="w-full rounded-2xl bg-zinc-800 p-3 text-white"
            />
          </label>

          <label className="space-y-2 text-sm text-zinc-300">
            Type
            <select
              value={form.type}
              onChange={(event) => updateField("type", event.target.value as "deposit" | "withdrawal")}
              className="w-full rounded-2xl bg-zinc-800 p-3 text-white"
            >
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-zinc-300">
            Amount
            <input
              type="number"
              step="1"
              value={form.amount}
              onChange={(event) => updateField("amount", Number(event.target.value))}
              className="w-full rounded-2xl bg-zinc-800 p-3 text-white"
            />
          </label>

          <label className="space-y-2 text-sm text-zinc-300">
            Note
            <input
              type="text"
              value={form.note}
              onChange={(event) => updateField("note", event.target.value)}
              className="w-full rounded-2xl bg-zinc-800 p-3 text-white"
              placeholder="Reason (withdrawal, deposit, etc.)"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save adjustment"}
          </button>
        </div>
      </form>
    </div>
  );
}
