"use client";

import { ArrowUpRight, Orbit } from "lucide-react";

export default function Footer() {
  return (
    <footer className="studio-footer">
      <div className="studio-container">
        <div className="studio-footer-main">
          <a className="studio-brand studio-footer-brand" href="#hero">
            <span className="studio-brand-mark"><Orbit size={20} strokeWidth={1.8} /></span>
            <span className="studio-brand-name">document<span>hub</span></span>
          </a>
          <p>A more thoughtful home for your documents.</p>
          <a className="studio-back-top" href="#hero">BACK TO TOP <ArrowUpRight size={14} /></a>
        </div>
        <div className="studio-footer-bottom">
          <span>© {new Date().getFullYear()} DocumentHub. Made for the stuff that matters.</span>
          <div><a href="#features">Explore</a><a href="#security">Privacy</a></div>
        </div>
      </div>
    </footer>
  );
}
