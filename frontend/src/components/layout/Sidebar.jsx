"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Brain,
  Bell,
  Settings,
  LogOut,
  HardDrive,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Documents",
    href: "/dashboard/documents",
    icon: FolderOpen,
  },
  {
    title: "AI Assistant",
    href: "#",
    icon: Brain,
    disabled: true,
  },
  {
    title: "Reminders",
    href: "#",
    icon: Bell,
    disabled: true,
  },
  {
    title: "Settings",
    href: "#",
    icon: Settings,
    disabled: true,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/");
  };

  return (
    <aside className="hidden lg:flex h-screen w-72 flex-col border-r border-slate-200 bg-white">

      {/* Logo */}

      <div className="px-8 py-8 border-b border-slate-200">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
            L
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              LifeHub AI
            </h1>

            <p className="text-sm text-slate-500">
              Personal Workspace
            </p>
          </div>

        </div>

      </div>

      {/* Navigation */}

      <div className="flex-1 overflow-y-auto px-5 py-6">

        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        <div className="space-y-2">

          {menuItems.map((item) => {
            const Icon = item.icon;

            const active =
              item.href !== "#" &&
              (pathname === item.href ||
                pathname.startsWith(item.href + "/"));

            return (
              <Link
                key={item.title}
                href={item.disabled ? "#" : item.href}
                className={`group flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-200 ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-100"
                } ${item.disabled ? "pointer-events-none opacity-60" : ""}`}
              >
                <div className="flex items-center gap-3">

                  <Icon size={20} />

                  <span className="font-medium">
                    {item.title}
                  </span>

                </div>

                {item.disabled && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}

        </div>

      </div>

      {/* Storage */}

      <div className="mx-5 mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">

        <div className="flex items-center gap-2">

          <HardDrive
            size={18}
            className="text-blue-600"
          />

          <span className="font-semibold text-slate-800">
            Storage
          </span>

        </div>

        <p className="mt-3 text-sm text-slate-500">
          0 MB of 2 GB used
        </p>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">

          <div className="h-full w-0 rounded-full bg-blue-600"></div>

        </div>

      </div>

      {/* Logout */}

      <div className="border-t border-slate-200 p-5">

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-red-200 py-3 font-semibold text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>

    </aside>
  );
}