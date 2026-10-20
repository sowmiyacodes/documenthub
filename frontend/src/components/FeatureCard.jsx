"use client";

import { ArrowUpRight } from "lucide-react";

export default function FeatureCard({ icon, number, badge, title, description }) {
  return (
    <article className="studio-feature-card">
      <div className="studio-feature-card-top">
        <span className="studio-feature-icon">{icon}</span>
        <span className="studio-feature-number">{number}</span>
      </div>
      <span className="studio-feature-badge">{badge}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="studio-feature-arrow" aria-hidden="true"><ArrowUpRight size={17} /></span>
    </article>
  );
}
