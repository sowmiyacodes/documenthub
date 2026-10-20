"use client";

import { useState } from "react";
import { ArrowUpRight, LockKeyhole, Sparkles } from "lucide-react";
import RegisterModal from "./RegisterModal";

export default function CTA() {
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <>
      <section id="security" className="studio-cta-section">
        <div className="studio-container">
          <div className="studio-cta">
            <div className="studio-cta-decoration" aria-hidden="true">
              <span /><span /><span /><span /><span />
            </div>
            <div className="studio-cta-copy">
              <div className="studio-eyebrow studio-eyebrow-light"><span /> READY WHEN YOU ARE</div>
              <h2>A little less<br /><em>life admin.</em></h2>
              <p>Start with the files you have. Make room for a more organized tomorrow.</p>
              <button className="studio-accent-button" onClick={() => setRegisterOpen(true)}>
                Create your free account <ArrowUpRight size={18} />
              </button>
              <div className="studio-cta-privacy"><LockKeyhole size={14} /> Your documents stay yours.</div>
            </div>
            <div className="studio-cta-side-note">
              <Sparkles size={18} />
              <span>One home for<br />the important stuff.</span>
              <small>DOCUMENTHUB / 001</small>
            </div>
          </div>
        </div>
      </section>
      <RegisterModal isOpen={registerOpen} onClose={() => setRegisterOpen(false)} />
    </>
  );
}
