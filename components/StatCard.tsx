type StatCardProps = {
  title: string;
  value: string;
  colour?: string;
};

export default function StatCard({
  title,
  value,
  colour = "text-white",
}: StatCardProps) {
  return (
    <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
      <p className="text-zinc-400">{title}</p>

      <h2 className={`mt-2 text-4xl font-bold ${colour}`}>
        {value}
      </h2>
    </div>
  );
}