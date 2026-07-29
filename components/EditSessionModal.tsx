"use client";

import { useEffect, useState } from "react";
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
    return "Unable to update session.";
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
      setError("Please sign in before editing sessions.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { data: updatedData, error: updateError } = await supabase
        .from("sessions")
        .update({
          played_on: data.played_on,
          venue: data.venue,
          stakes: data.stakes,
          buy_in: data.buy_in,
          cash_out: data.cash_out,
          hours: data.hours,
          notes: data.notes || null,
        })
        .eq("id", session.id)
        .select();

      if (updateError) {
        throw updateError;
      }

      // Temporary logging to diagnose cases where rows are not returned
      // (helps identify RLS/policy or response-shape issues on the live site).
      // no-op logging in production build — rely on fallback select below

      // Accept both array and single-object responses from Supabase
      let updatedRow = Array.isArray(updatedData) ? updatedData[0] : updatedData;

      // If no row was returned (empty array), try a follow-up select for the
      // specific row. Some RLS or return settings may cause the update to not
      // return rows but the change may still have been applied.
      if (!updatedRow) {
        try {
          const { data: fetchedData, error: fetchError } = await supabase
            .from("sessions")
            .select("*")
            .eq("id", session.id)
            .single();

          if (!fetchError && fetchedData) {
            updatedRow = fetchedData as any;
          // fetched updated row; proceed
          } else {
            // could not fetch updated row; continue and treat as success
          }
        } catch (e) {
          // ignore fetch errors
        }
      }

      if (!updatedRow) {
        throw new Error("The update did not return a row, so the change may not have been applied. Please check your Supabase policies for the sessions table.");
      }

      setSuccess("Session updated successfully.");
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
        className="rounded bg-blue-600 px-3 py-1 text-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isAuthenticated ? "Edit" : "Sign in"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-2 sm:items-center sm:p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-zinc-900 p-4 shadow-2xl sm:rounded-xl sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-emerald-500 sm:text-3xl">
                Edit Session
              </h2>

              <button
                type="button"
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