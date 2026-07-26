"use client";

import { useState } from "react";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { uploadDocument } from "@/services/document";

export default function UploadDocumentModal({
  isOpen,
  onClose,
  onUploadSuccess,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState("Others");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setSelectedFile(null);
    setCategory("Others");
    setDescription("");
    setUploading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a document.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("document", selectedFile);
      formData.append("category", category);
      formData.append("description", description);

      await uploadDocument(formData);

      alert("Document uploaded successfully.");

      resetForm();

      onClose();

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to upload document."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6">

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Upload Document
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Upload PDFs or Images securely.
            </p>
          </div>

          <button
            onClick={handleClose}
            disabled={uploading}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <X size={22} />
          </button>

        </div>

        {/* Body */}

        <div className="space-y-6 p-8">

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 px-6 py-14 hover:bg-blue-100">

            <Upload
              size={50}
              className="text-blue-600"
            />

            <h3 className="mt-4 text-lg font-semibold">
              Click to Upload
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              PDF, PNG, JPG, JPEG
            </p>

            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={handleFileChange}
            />

          </label>

          {selectedFile && (
            <div className="flex items-center gap-4 rounded-xl border bg-slate-50 p-4">

              <FileText
                size={28}
                className="text-blue-600"
              />

              <div>

                <h4 className="font-semibold">
                  {selectedFile.name}
                </h4>

                <p className="text-sm text-slate-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>

              </div>

            </div>
          )}

          <div>

            <label className="mb-2 block font-medium">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border p-3"
            >
              <option>Others</option>
              <option>Identity</option>
              <option>Education</option>
              <option>Medical</option>
              <option>Financial</option>
              <option>Legal</option>
            </select>

          </div>

          <div>

            <label className="mb-2 block font-medium">
              Description
            </label>

            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="w-full rounded-xl border p-4"
            />

          </div>

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-4 border-t px-8 py-6">

          <button
            onClick={handleClose}
            disabled={uploading}
            className="rounded-xl border px-6 py-3"
          >
            Cancel
          </button>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload
              </>
            )}
          </button>

        </div>

      </div>

    </div>
  );
}