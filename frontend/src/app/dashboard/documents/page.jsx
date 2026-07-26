"use client";

import { useEffect, useState } from "react";
import {
  Upload,
  Search,
  FolderOpen,
  Filter,
} from "lucide-react";

import UploadDocumentModal from "@/components/documents/UploadDocumentModal";
import DocumentCard from "@/components/documents/DocumentCard";

import {
  getDocuments,
  deleteDocument,
  viewDocument,
} from "@/services/document";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const loadDocuments = async () => {
    try {
      setLoading(true);

      const response = await getDocuments();

      setDocuments(response.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleView = async (id) => {
    try {
      const response = await viewDocument(id);
      window.open(response.url, "_blank");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document?")) return;

    try {
      await deleteDocument(id);
      loadDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchSearch = doc.file_name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      category === "All" || doc.category === category;

    return matchSearch && matchCategory;
  });

  return (
    <>
      <div className="space-y-8">

        {/* Header */}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <p className="text-sm font-semibold text-blue-600">
              Document Vault
            </p>

            <h1 className="mt-2 text-4xl font-bold text-slate-900">
              My Documents
            </h1>

            <p className="mt-2 text-slate-500">
              {documents.length} document
              {documents.length !== 1 ? "s" : ""} stored securely.
            </p>

          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <Upload size={18} />
            Upload Document
          </button>

        </div>

        {/* Toolbar */}

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search by file name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500"
            />

          </div>

          <div className="relative">

            <Filter
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-8 outline-none"
            >
              <option>All</option>
              <option>Education</option>
              <option>Identity</option>
              <option>Medical</option>
              <option>Financial</option>
              <option>Legal</option>
              <option>Others</option>
            </select>

          </div>

        </div>

        {/* Loading */}

        {loading && (
          <div className="py-24 text-center text-slate-500">
            Loading documents...
          </div>
        )}

        {/* Empty */}

        {!loading && filteredDocuments.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white py-24 shadow-sm">

            <div className="flex flex-col items-center">

              <div className="rounded-full bg-blue-100 p-6">

                <FolderOpen
                  size={55}
                  className="text-blue-600"
                />

              </div>

              <h2 className="mt-8 text-2xl font-bold text-slate-900">
                No Documents Found
              </h2>

              <p className="mt-3 max-w-md text-center text-slate-500">
                Upload your first document and build your secure
                AI-powered document vault.
              </p>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Upload First Document
              </button>

            </div>

          </div>
        )}

        {/* Documents */}

        {!loading && filteredDocuments.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onView={handleView}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

      </div>

      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => {
          setIsUploadModalOpen(false);
          loadDocuments();
        }}
      />
    </>
  );
}