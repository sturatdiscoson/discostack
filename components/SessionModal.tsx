"use client";

import { useState } from "react";
import SessionForm from "@/components/SessionForm";

export default function SessionModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold hover:bg-emerald-500"
      >
        + New Session
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-2xl rounded-xl bg-zinc-900 p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-emerald-500">
                New Session
              </h2>

              <button
                onClick={() => setOpen(false)}
                className="text-2xl text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <SessionForm
              submitText="Save Session"
              onSubmit={async (data) => {
                console.log(data);
                setOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}