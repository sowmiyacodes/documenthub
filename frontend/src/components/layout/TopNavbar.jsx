"use client";

import { useEffect, useState } from "react";
import { Search, Bell } from "lucide-react";

export default function TopNavbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">

      {/* Search */}

      <div className="relative hidden w-full max-w-md lg:block">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search your documents..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white"
        />

      </div>

      {/* Right */}

      <div className="ml-auto flex items-center gap-4">

        <button className="rounded-xl border border-slate-200 p-3 transition hover:bg-slate-100">
          <Bell size={20} />
        </button>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
            {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="hidden sm:block">

            <p className="text-sm font-semibold text-slate-800">
              {user?.full_name || "User"}
            </p>

            <p className="text-xs text-slate-500">
              {user?.email || ""}
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}