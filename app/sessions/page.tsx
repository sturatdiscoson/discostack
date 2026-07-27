export const dynamic = "force-dynamic";

import AppLayout from "@/app/layouts/AppLayout";
import SessionModal from "@/components/SessionModal";
import SessionsTable from "@/components/SessionsTable";
import { supabase } from "@/lib/supabase";

export default async function SessionsPage() {
  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .order("played_on", { ascending: false });

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-500 sm:text-4xl lg:text-5xl">
              Sessions
            </h1>

            <p className="mt-2 text-sm text-zinc-400 sm:text-base">
              Your live poker sessions.
            </p>
          </div>

          <SessionModal />
        </div>

        <SessionsTable sessions={sessions ?? []} />
      </div>
    </AppLayout>
  );
}