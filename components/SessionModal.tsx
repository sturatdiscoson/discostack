"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import SessionForm from "@/components/SessionForm";
import { SessionFormData } from "@/types/session";
import { supabase } from "@/lib/supabase";

export default function SessionModal() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (mounted) {
        setIsAuthenticated(Boolean(user));
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsAuthenticated(Boolean(session?.user));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function getErrorMessage(err: unknown) {
    if (err instanceof Error) return err.message;
    if (err && typeof err === "object") {
      const errorObject = err as Record<string, unknown>;
      if (typeof errorObject.message === "string") return errorObject.message;
      if (typeof errorObject.statusText === "string") return errorObject.statusText;
      return JSON.stringify(err);
    }
    return "Unable to create session.";
  }

  function getFriendlyErrorMessage(err: unknown) {
    const message = getErrorMessage(err);

    if (message.toLowerCase().includes("row-level security") || message.toLowerCase().includes("policy")) {
      return `${message}\n\nThis usually means Supabase is blocking the write because the database policies for the sessions table do not allow your signed-in user to insert/update/delete rows.`;
    }

    return message;
  }

  async function handleSubmit(data: SessionFormData) {
    if (!isAuthenticated) {
      setError("Please sign in before creating sessions.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { data: insertedData, error } = await supabase
        .from("sessions")
        .insert({
          played_on: data.played_on,
          venue: data.venue,
          stakes: data.stakes,
          buy_in: data.buy_in,
          cash_out: data.cash_out,
          hours: data.hours,
          notes: data.notes || null,
        })
        .select();

      if (error) {
        throw error;
      }

      if (!insertedData || insertedData.length === 0) {
        throw new Error("No session was returned from the server.");
      }

      setSuccess("Session created successfully.");
      setSaving(false);

      setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 800);
    } catch (err) {
      const message = getFriendlyErrorMessage(err);
      console.error(err);
      setError(message);
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={!isAuthenticated}
        className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isAuthenticated ? "+ New Session" : "Sign in to add"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-2xl rounded-xl bg-zinc-900 p-8 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-emerald-500">
                New Session
              </h2>

              <button
                disabled={saving}
                onClick={() => setOpen(false)}
                className="text-2xl text-zinc-400 hover:text-white disabled:opacity-40"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-500 bg-red-500/10 p-3 text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 rounded-lg border border-emerald-500 bg-emerald-500/10 p-3 text-emerald-300">
                {success}
              </div>
            )}

            <SessionForm
              key={open ? "create-session-open" : "create-session-closed"}
              submitText={saving ? "Saving..." : "Save Session"}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      )}
    </>
  );
}