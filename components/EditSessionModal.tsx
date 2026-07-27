"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import SessionForm from "./SessionForm";
import { Session, SessionFormData } from "@/types/session";

type Props = {
  session: Session;
};

export default function EditSessionModal({ session }: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(data: SessionFormData) {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { data: newSession, error: insertError } = await supabase
        .from("sessions")
        .insert({
          played_on: data.played_on,
          venue: data.venue,
          stakes: data.stakes,
          buy_in: data.buy_in,
          cash_out: data.cash_out,
          hours: data.hours,
          notes: data.notes,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      const { error: deleteError } = await supabase
        .from("sessions")
        .delete()
        .eq("id", session.id);

      if (deleteError) {
        throw deleteError;
      }

      setSuccess("Session updated successfully.");
      setSaving(false);

      setTimeout(() => {
        setOpen(false);
        router.refresh();

        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }, 800);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to update session.";
      console.error(err);
      setError(message);
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded bg-blue-600 px-3 py-1 text-sm hover:bg-blue-500"
      >
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-2xl rounded-xl bg-zinc-900 p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-emerald-500">
                Edit Session
              </h2>

              <button
                onClick={() => setOpen(false)}
                disabled={saving}
                className="text-2xl text-zinc-400 hover:text-white disabled:opacity-40"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-500 bg-red-500/10 p-3 text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-lg border border-emerald-500 bg-emerald-500/10 p-3 text-emerald-300">
                {success}
              </div>
            )}

            <SessionForm
              key={session.id}
              initialValues={{
                played_on: session.played_on,
                venue: session.venue,
                stakes: session.stakes,
                buy_in: session.buy_in,
                cash_out: session.cash_out,
                hours: Number(session.hours),
                notes: session.notes ?? "",
              }}
              submitText={saving ? "Saving..." : "Save Changes"}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      )}
    </>
  );
}