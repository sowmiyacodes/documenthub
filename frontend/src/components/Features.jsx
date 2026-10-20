"use client";

import { FileText, Layers3, Search, Sparkles } from "lucide-react";
import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: <FileText size={21} />,
    number: "01",
    badge: "THE INTAKE",
    title: "Paperwork, without the paper cuts.",
    description: "Bring in PDFs and images. Text extraction makes scanned pages and everyday files easy to work with.",
  },
  {
    icon: <Search size={21} />,
    number: "02",
    badge: "THE FIND",
    title: "Search by what you mean.",
    description: "Look up a phrase, a date, or just the idea you remember. Find relevant details across your archive.",
  },
  {
    icon: <Sparkles size={21} />,
    number: "03",
    badge: "THE ANSWER",
    title: "Get a useful answer, with receipts.",
    description: "Ask questions in plain language and see answers connected back to the documents they came from.",
  },
  {
    icon: <Layers3 size={21} />,
    number: "04",
    badge: "THE ORDER",
    title: "A place for every kind of file.",
    description: "Automatic categories help make sense of personal, financial, educational, and legal records.",
  },
];

export default function Features() {
  return (
    <section id="features" className="studio-features">
      <div className="studio-container">
        <div className="studio-section-top">
          <div>
            <div className="studio-eyebrow"><span /> A DESK THAT DOES THE BUSYWORK</div>
            <h2>Less hunting.<br /><em>More knowing.</em></h2>
          </div>
          <p>
            DocumentHub turns scattered files into a collection you can actually
            use—with helpful tools for every step from upload to answer.
          </p>
        </div>

        <div id="workflow" className="studio-feature-grid">
          {features.map((feature) => (
            <FeatureCard key={feature.number} {...feature} />
          ))}
        </div>

        <div className="studio-feature-foot">
          <span className="studio-feature-foot-icon"><Layers3 size={18} /></span>
          <p><strong>Your archive, working together.</strong> Search and ask across your documents from one quiet, organized space.</p>
          <span className="studio-feature-foot-index">A BETTER KIND OF FILE CABINET&nbsp; ↗</span>
        </div>
      </div>
    </section>
  );
}
