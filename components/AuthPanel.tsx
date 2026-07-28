"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const refreshUser = async () => {
      const response = await supabase.auth.getUser();
      const user = response.data.user;

      if (isMounted) {
        setUserEmail(user?.email ?? null);
      }
    };

    refreshUser();

    const authSubscription = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUserEmail(session?.user?.email ?? null);
      }
    });

    return () => {
      isMounted = false;
      authSubscription.data.subscription.unsubscribe();
    };
  }, []);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Signed in successfully.");
      setEmail("");
      setPassword("");
    }

    setLoading(false);
  }

  async function handleSignOut() {
    setLoading(true);
    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Signed out.");
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {userEmail ? (
        <div className="flex items-center gap-3 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200">
          <span className="truncate">{userEmail}</span>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={loading}
            className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700"
          >
            {loading ? "Working..." : "Sign out"}
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSignIn}
          className="flex flex-wrap items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-2 py-2"
        >
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="rounded-full bg-zinc-800 px-3 py-2 text-sm text-white outline-none"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="rounded-full bg-zinc-800 px-3 py-2 text-sm text-white outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      )}

      {message ? <p className="text-xs text-zinc-400">{message}</p> : null}
    </div>
  );
}
