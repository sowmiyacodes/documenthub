"use client";

import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="section-padding">
      <div className="container-width grid items-center gap-20 lg:grid-cols-2">

        <div className="animate-up">

          <span className="badge">
            AI Powered Personal Workspace
          </span>

          <h1 className="title mt-6">
            Your Entire Digital Life,
            <br />
            Organized in
            <span className="text-blue-600"> One Place.</span>
          </h1>

          <p className="subtitle mt-6 max-w-xl">
            Store documents, track expenses, manage knowledge,
            receive reminders, and retrieve everything instantly
            using AI.
          </p>

          <div className="mt-10 flex gap-4">

            <button className="primary-btn flex items-center gap-2">
              Get Started
              <ArrowRight size={18} />
            </button>

            <button className="secondary-btn">
              Learn More
            </button>

          </div>

        </div>

        <div className="animate-left">
          <div className="card rounded-3xl p-8">

            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200"
              alt="LifeHub"
              className="rounded-2xl"
            />

          </div>
        </div>

      </div>
    </section>
  );
}