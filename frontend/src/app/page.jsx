"use client";

import { useEffect, useState } from "react";
import {
  FiMoon,
  FiSun,
  FiArrowRight,
  FiFileText,
  FiSearch,
  FiMessageSquare,
  FiShield,
} from "react-icons/fi";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }

    setDarkMode(!darkMode);
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">

      {/* ================= NAVBAR ================= */}

      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
              D
            </div>

            <div>
              <h1 className="text-xl font-bold">
                Document<span className="text-blue-600">Hub</span>
              </h1>
            </div>
          </div>

          <div className="hidden gap-10 font-medium md:flex">
            <a href="#" className="hover:text-blue-600">
              Home
            </a>
            <a href="#" className="hover:text-blue-600">
              Features
            </a>
            <a href="#" className="hover:text-blue-600">
              AI Workspace
            </a>
            <a href="#" className="hover:text-blue-600">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-4">

            <button
              onClick={toggleTheme}
              className="rounded-xl border border-gray-300 p-3 transition hover:bg-gray-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            <a
              href="/login"
              className="hidden rounded-xl border border-gray-300 px-5 py-2 font-medium hover:bg-gray-100 dark:border-slate-700 dark:hover:bg-slate-800 md:block"
            >
              Login
            </a>

            <a
              href="/register"
              className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700"
            >
              Get Started
            </a>

          </div>

        </div>
      </nav>

      {/* ================= HERO ================= */}

      <section className="mx-auto flex max-w-7xl flex-col items-center gap-16 px-8 py-20 lg:flex-row">

        {/* LEFT */}

        <div className="flex-1">

          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            AI Powered Document Management
          </span>

          <h1 className="mt-8 text-5xl font-extrabold leading-tight lg:text-7xl">

            Organize Every
            <span className="block text-blue-600">
              Document Smarter
            </span>

          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-gray-600 dark:text-slate-400">

            Store, organize, search, summarize and chat with your
            documents using Artificial Intelligence.

            Secure cloud storage, OCR, reminders, AI search,
            document translation and much more in one platform.

          </p>

          <div className="mt-10 flex flex-wrap gap-5">

            <a
              href="/register"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white transition hover:bg-blue-700"
            >
              Get Started
              <FiArrowRight />
            </a>

            <button className="rounded-xl border border-gray-300 px-7 py-4 font-medium hover:bg-gray-100 dark:border-slate-700 dark:hover:bg-slate-800">
              Learn More
            </button>

          </div>

          <div className="mt-12 flex flex-wrap gap-3">

            {[
              "OCR",
              "AI Search",
              "Summarization",
              "Chat with PDFs",
              "Secure Storage",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                {item}
              </span>
            ))}

          </div>

        </div>

        {/* RIGHT */}

        <div className="flex-1">

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl transition dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-center justify-between">

              <h2 className="text-xl font-bold">
                Dashboard Preview
              </h2>

              <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700 dark:bg-green-900/40 dark:text-green-400">
                Online
              </span>

            </div>

            <div className="mt-8 space-y-5">

              <div className="flex items-center gap-4 rounded-2xl bg-gray-100 p-5 dark:bg-slate-800">

                <FiFileText
                  className="text-blue-600"
                  size={25}
                />

                <div>
                  <h3 className="font-semibold">
                    Research Paper.pdf
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    AI Summary Available
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-4 rounded-2xl bg-gray-100 p-5 dark:bg-slate-800">

                <FiSearch
                  className="text-blue-600"
                  size={25}
                />

                <div>
                  <h3 className="font-semibold">
                    Smart Search
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Find any document instantly.
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-4 rounded-2xl bg-gray-100 p-5 dark:bg-slate-800">

                <FiMessageSquare
                  className="text-blue-600"
                  size={25}
                />

                <div>
                  <h3 className="font-semibold">
                    AI Assistant
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Ask questions about your documents.
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-4 rounded-2xl bg-gray-100 p-5 dark:bg-slate-800">

                <FiShield
                  className="text-blue-600"
                  size={25}
                />

                <div>
                  <h3 className="font-semibold">
                    Secure Storage
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    End-to-end protected documents.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}