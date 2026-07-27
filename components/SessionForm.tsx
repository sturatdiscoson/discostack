"use client";

import { useState } from "react";
import { SessionFormData } from "@/types/session";

type Props = {
  initialValues?: SessionFormData;
  onSubmit: (data: SessionFormData) => Promise<void>;
  submitText: string;
};

const defaultValues: SessionFormData = {
  played_on: new Date().toISOString().split("T")[0],
  venue: "Grosvenor",
  stakes: "£1/2",
  buy_in: 0,
  cash_out: 0,
  hours: 0,
  notes: "",
};

export default function SessionForm({
  initialValues = defaultValues,
  onSubmit,
  submitText,
}: Props) {
  const [form, setForm] = useState<SessionFormData>(initialValues);
  const [formError, setFormError] = useState("");

  function update<K extends keyof SessionFormData>(
    key: K,
    value: SessionFormData[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function parseNumericValue(value: string) {
    if (value === "") {
      return 0;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function validateForm() {
    if (!form.played_on) {
      return "Please select a date.";
    }

    if (form.buy_in < 0 || form.cash_out < 0) {
      return "Buy in and cash out must be 0 or greater.";
    }

    if (form.hours < 0) {
      return "Hours played must be 0 or greater.";
    }

    const maxAllowed = 1_000_000;
    if (form.buy_in > maxAllowed || form.cash_out > maxAllowed || form.hours > maxAllowed) {
      return "Numeric values are too large. Use smaller amounts.";
    }

    if (Number.isNaN(form.buy_in) || Number.isNaN(form.cash_out) || Number.isNaN(form.hours)) {
      return "Enter valid numeric values for hours, buy in, and cash out.";
    }

    return "";
  }

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const error = validateForm();
        if (error) {
          setFormError(error);
          return;
        }
        setFormError("");
        await onSubmit(form);
      }}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Date
          </label>

          <input
            type="date"
            value={form.played_on}
            onChange={(e) => update("played_on", e.target.value)}
            className="w-full rounded-lg bg-zinc-800 p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Venue
          </label>

          <select
            value={form.venue}
            onChange={(e) => update("venue", e.target.value)}
            className="w-full rounded-lg bg-zinc-800 p-3"
          >
            <option>Grosvenor</option>
            <option>Mark's Game</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Stakes
          </label>

          <select
            value={form.stakes}
            onChange={(e) => update("stakes", e.target.value)}
            className="w-full rounded-lg bg-zinc-800 p-3"
          >
            <option>£1/1</option>
            <option>£1/2</option>
            <option>£1/3</option>
            <option>£2/5</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Hours Played
          </label>

          <input
            type="number"
            step="0.25"
            value={form.hours}
            onChange={(e) => update("hours", parseNumericValue(e.target.value))}
            className="w-full rounded-lg bg-zinc-800 p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Buy In (£)
          </label>

          <input
            type="number"
            value={form.buy_in}
            onChange={(e) => update("buy_in", parseNumericValue(e.target.value))}
            className="w-full rounded-lg bg-zinc-800 p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Cash Out (£)
          </label>

          <input
            type="number"
            value={form.cash_out}
            onChange={(e) => update("cash_out", parseNumericValue(e.target.value))}
            className="w-full rounded-lg bg-zinc-800 p-3"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-400">
          Notes
        </label>

        <textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          className="h-32 w-full rounded-lg bg-zinc-800 p-3"
          placeholder="Anything interesting about the session..."
        />
      </div>

      {formError ? (
        <div className="rounded-lg border border-red-500 bg-red-500/10 p-3 text-sm text-red-300">
          {formError}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold hover:bg-emerald-500"
        >
          {submitText}
        </button>
      </div>
    </form>
  );
}