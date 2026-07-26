"use client";

import Link from "next/link";
import {
  ArrowRight,
  FolderOpen,
  HardDrive,
  Upload,
  Sparkles,
  FileText,
} from "lucide-react";

export default function DashboardPage() {
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};

  const greeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-8">

      {/* Header */}

      <section>

        <p className="text-sm font-medium text-blue-600">
          Welcome Back
        </p>

        <h1 className="mt-2 text-4xl font-bold text-slate-900">
          {greeting()}, {user?.full_name || "User"} 👋
        </h1>

        <p className="mt-3 max-w-2xl text-slate-500">
          Manage your personal documents, organize important files,
          and let AI help you find information instantly.
        </p>

      </section>

      {/* Stats */}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <FolderOpen className="mb-4 text-blue-600" />

          <p className="text-sm text-slate-500">
            Documents
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            0
          </h2>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <HardDrive className="mb-4 text-green-600" />

          <p className="text-sm text-slate-500">
            Storage Used
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            0 MB
          </h2>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <FileText className="mb-4 text-orange-500" />

          <p className="text-sm text-slate-500">
            Categories
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            0
          </h2>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <Sparkles className="mb-4 text-purple-600" />

          <p className="text-sm text-slate-500">
            AI Features
          </p>

          <h2 className="mt-2 text-lg font-semibold">
            Coming Soon
          </h2>

        </div>

      </section>

      {/* Content */}

      <section className="grid gap-8 lg:grid-cols-3">

        {/* Recent */}

        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 p-6">

            <h2 className="text-xl font-semibold">
              Recent Documents
            </h2>

            <Link
              href="/dashboard/documents"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              View All
              <ArrowRight size={16} />
            </Link>

          </div>

          <div className="flex flex-col items-center justify-center py-24">

            <FolderOpen
              size={60}
              className="text-slate-300"
            />

            <h3 className="mt-6 text-xl font-semibold">
              No Documents Uploaded
            </h3>

            <p className="mt-2 text-slate-500">
              Upload your first document to get started.
            </p>

            <Link
              href="/dashboard/documents"
              className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Upload Document
            </Link>

          </div>

        </div>

        {/* Quick Actions */}

        <div className="space-y-6">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="mb-6 text-xl font-semibold">
              Quick Actions
            </h2>

            <Link
              href="/dashboard/documents"
              className="flex items-center justify-between rounded-xl bg-blue-600 px-5 py-4 text-white hover:bg-blue-700"
            >
              <span>Upload Document</span>

              <Upload size={20} />
            </Link>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="font-semibold">
              Upcoming AI Features
            </h2>

            <div className="mt-5 space-y-4 text-sm text-slate-600">

              <div>🤖 AI Categorization</div>

              <div>📄 OCR Text Extraction</div>

              <div>🔍 Semantic Search</div>

              <div>📝 AI Summaries</div>

              <div>⏰ Smart Reminders</div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}