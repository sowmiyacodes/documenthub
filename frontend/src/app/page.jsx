export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-6 border-b border-slate-800">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xl">
            D
          </div>

          <h1 className="text-2xl font-bold">
            Document<span className="text-blue-500">Hub</span>
          </h1>
        </div>

        <div className="hidden md:flex items-center gap-8 text-slate-300">
          <a href="#" className="hover:text-white transition">Home</a>
          <a href="#" className="hover:text-white transition">Features</a>
          <a href="#" className="hover:text-white transition">About</a>
          <a href="#" className="hover:text-white transition">Contact</a>
        </div>

        <div className="flex gap-4">
          <a
            href="/login"
            className="px-5 py-2 rounded-lg border border-slate-700 hover:border-blue-500 transition"
          >
            Login
          </a>

          <a
            href="/register"
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
          >
            Register
          </a>
        </div>

      </nav>

      {/* Hero */}

      <section className="max-w-7xl mx-auto px-10 py-24">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}

          <div>

            <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
              AI Powered Document Management
            </span>

            <h1 className="mt-8 text-5xl lg:text-7xl font-extrabold leading-tight">

              Manage Your
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Documents
              </span>

              Smarter with AI

            </h1>

            <p className="mt-8 text-lg text-slate-400 leading-8 max-w-xl">

              Upload, organize, summarize, search, and chat with your
              documents using powerful AI. Keep everything secure,
              accessible, and intelligently managed from one place.

            </p>

            <div className="mt-10 flex flex-wrap gap-5">

              <a
                href="/register"
                className="rounded-xl bg-blue-600 px-8 py-4 font-semibold hover:bg-blue-700 transition"
              >
                Get Started
              </a>

              <a
                href="#"
                className="rounded-xl border border-slate-700 px-8 py-4 hover:border-blue-500 transition"
              >
                Learn More
              </a>

            </div>

            <div className="mt-12 flex flex-wrap gap-4">

              {[
                "AI Search",
                "OCR",
                "Summarization",
                "Chat with PDFs",
                "Secure Storage",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300"
                >
                  {item}
                </span>
              ))}

            </div>

          </div>

          {/* Right */}

          <div className="relative">

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

              <div className="flex items-center justify-between">

                <h2 className="text-xl font-semibold">
                  AI Workspace
                </h2>

                <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-400">
                  Online
                </span>

              </div>

              <div className="mt-8 space-y-5">

                <div className="rounded-xl bg-slate-800 p-5">

                  <p className="font-semibold">
                    📄 Annual_Report.pdf
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    AI Summary Generated
                  </p>

                </div>

                <div className="rounded-xl bg-slate-800 p-5">

                  <p className="font-semibold">
                    🔍 Search
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    "Find invoices from March 2026"
                  </p>

                </div>

                <div className="rounded-xl bg-slate-800 p-5">

                  <p className="font-semibold">
                    🤖 AI Assistant
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    "Summarize this legal agreement in simple terms."
                  </p>

                </div>

              </div>

            </div>

            {/* Glow */}

            <div className="absolute -z-10 -right-12 top-10 h-72 w-72 rounded-full bg-blue-600 blur-[120px] opacity-30"></div>

          </div>

        </div>

      </section>

    </main>
  );
}