"use client";

import {
  Eye,
  Trash2,
  Download,
  Calendar,
  HardDrive,
  FileText,
  Image,
  File,
} from "lucide-react";

export default function DocumentCard({
  document,
  onView,
  onDelete,
}) {
  const formattedDate = new Date(
    document.created_at
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const fileSize = (
    document.file_size /
    1024 /
    1024
  ).toFixed(2);

  const extension =
    document.file_name.split(".").pop()?.toLowerCase() || "";

  const getIcon = () => {
    if (extension === "pdf")
      return <FileText size={42} className="text-red-500" />;

    if (
      ["png", "jpg", "jpeg", "gif", "webp"].includes(extension)
    )
      return <Image size={42} className="text-green-600" />;

    return <File size={42} className="text-blue-600" />;
  };

  return (
    <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* File Icon */}

      <div className="flex justify-center bg-slate-50 py-10">

        {getIcon()}

      </div>

      {/* Content */}

      <div className="space-y-5 p-6">

        <div>

          <h3
            className="truncate text-lg font-bold text-slate-900"
            title={document.file_name}
          >
            {document.file_name}
          </h3>

          <span className="mt-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            {document.category}
          </span>

        </div>

        <div className="space-y-3 text-sm text-slate-500">

          <div className="flex items-center gap-2">

            <HardDrive size={16} />

            <span>{fileSize} MB</span>

          </div>

          <div className="flex items-center gap-2">

            <Calendar size={16} />

            <span>{formattedDate}</span>

          </div>

        </div>

        {/* Buttons */}

        <div className="grid grid-cols-3 gap-3 pt-2">

          <button
            onClick={() => onView(document.id)}
            className="flex items-center justify-center rounded-xl border border-slate-200 py-3 transition hover:bg-slate-100"
            title="View"
          >
            <Eye size={18} />
          </button>

          <button
            className="flex items-center justify-center rounded-xl border border-slate-200 py-3 transition hover:bg-slate-100"
            title="Download"
          >
            <Download size={18} />
          </button>

          <button
            onClick={() => onDelete(document.id)}
            className="flex items-center justify-center rounded-xl border border-red-200 py-3 text-red-600 transition hover:bg-red-50"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>

        </div>

      </div>

    </div>
  );
}