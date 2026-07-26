"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  children,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md px-6 py-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          relative
          h-[90vh]
          w-full
          max-w-7xl
          overflow-hidden
          rounded-[32px]
          bg-white
          shadow-2xl
        "
      >
        {/* Close Button */}

        <button
          onClick={onClose}
          className="
            absolute
            right-8
            top-8
            z-50
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            bg-slate-100
            text-slate-500
            transition-all
            hover:bg-slate-200
            hover:text-slate-900
          "
        >
          <X size={24} />
        </button>

        {children}
      </div>
    </div>
  );
}