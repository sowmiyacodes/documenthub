"use client";

import {
  Brain,
  FileText,
  Wallet,
  ShieldCheck,
} from "lucide-react";

import FeatureCard from "./FeatureCard";

export default function Features() {
  return (
    <section
      id="features"
      className="section-padding bg-white"
    >
      <div className="container-width">

        <div className="mb-14 text-center">

          <span className="badge">
            Features
          </span>

          <h2 className="mt-5 text-4xl font-bold">
            Everything You Need
          </h2>

          <p className="subtitle mt-4 mx-auto max-w-2xl">
            LifeHub AI combines document management,
            expense tracking, knowledge management,
            and emergency access into one intelligent platform.
          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

          <FeatureCard
            icon={<FileText size={34} />}
            title="Document Vault"
            description="Upload and organize all your important documents securely."
          />

          <FeatureCard
            icon={<Wallet size={34} />}
            title="Expense Intelligence"
            description="Automatically analyze receipts and understand spending."
          />

          <FeatureCard
            icon={<Brain size={34} />}
            title="Knowledge Vault"
            description="Store notes, PDFs and ask AI questions instantly."
          />

          <FeatureCard
            icon={<ShieldCheck size={34} />}
            title="Emergency Access"
            description="Keep important records ready for trusted family members."
          />

        </div>

      </div>
    </section>
  );
}