import { ArrowUpRight } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = "blue",
  subtitle,
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-800">
            {value}
          </h2>

          {subtitle && (
            <p className="mt-2 text-sm text-slate-400">
              {subtitle}
            </p>
          )}

        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors[color]}`}
        >
          <Icon size={28} />
        </div>

      </div>

      <div className="mt-6 flex items-center gap-2 text-sm font-medium text-blue-600">

        <ArrowUpRight size={16} />

        <span>View Details</span>

      </div>

    </div>
  );
}