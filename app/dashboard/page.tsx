import AppLayout from "../layouts/AppLayout";
import StatCard from "@/components/StatCard";

export default function Dashboard() {
  return (
    <AppLayout>
      <h1 className="text-4xl font-bold text-emerald-500">
        Dashboard
      </h1>

      <p className="mt-2 text-zinc-400">
        Welcome back, Disco.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Current Bankroll" value="£2,000" />
        <StatCard title="Lifetime Profit" value="£0" colour="text-emerald-400" />
        <StatCard title="Sessions" value="0" />
        <StatCard title="Hourly" value="£0/hr" />
      </div>
    </AppLayout>
  );
}