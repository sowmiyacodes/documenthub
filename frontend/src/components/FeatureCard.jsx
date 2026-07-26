"use client";

export default function FeatureCard({
  icon,
  title,
  description,
}) {
  return (
    <div className="card p-8 text-center">

      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
        {icon}
      </div>

      <h3 className="text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-4 text-slate-600">
        {description}
      </p>

    </div>
  );
}