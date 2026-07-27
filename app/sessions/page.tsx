import Sidebar from "@/components/Sidebar";
import SessionModal from "@/components/SessionModal";
import SessionsTable from "@/components/SessionsTable";
import { supabase } from "@/lib/supabase";

export default async function SessionsPage() {
  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .order("played_on", { ascending: false });

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-emerald-500">
              Sessions
            </h1>

            <p className="mt-2 text-zinc-400">
              Your live poker sessions.
            </p>
          </div>

          <SessionModal />
        </div>

        <SessionsTable sessions={sessions ?? []} />
      </main>
    </div>
  );
}