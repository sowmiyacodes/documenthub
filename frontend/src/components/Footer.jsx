"use client";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">

      <div className="container-width flex flex-col items-center justify-between gap-5 py-8 md:flex-row">

        <div>

          <h3 className="text-xl font-bold">
            LifeHub AI
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Intelligent Personal Digital Management System
          </p>

        </div>

        <p className="text-sm text-slate-500">
          © 2026 LifeHub AI. All rights reserved.
        </p>

      </div>

    </footer>
  );
}