"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  FileText,
  LockKeyhole,
  Search,
  Sparkles,
} from "lucide-react";
import RegisterModal from "./RegisterModal";
import LoginModal from "./LoginModal";

export default function Hero() {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <section id="hero" className="studio-hero">
        <div className="studio-container studio-hero-grid">
          <div className="studio-hero-copy animate-fade-up">
            <div className="studio-eyebrow"><span /> YOUR PERSONAL KNOWLEDGE DESK</div>
            <h1>Make your documents <em>make sense.</em></h1>
            <p className="studio-hero-intro">
              A calmer place for the paperwork that runs your life. Keep it together,
              find what matters, and get clear answers from your own files.
            </p>
            <div className="studio-hero-actions">
              <button className="studio-accent-button" onClick={() => setRegisterOpen(true)}>
                Build your vault <ArrowUpRight size={18} />
              </button>
              <button className="studio-link-button" onClick={() => setLoginOpen(true)}>
                I already have an account <ArrowRight size={16} />
              </button>
            </div>
            <div className="studio-proof-row">
              <span><LockKeyhole size={15} /> Private by design</span>
              <span><FileText size={15} /> Your files, one place</span>
              <span><Sparkles size={15} /> Answers with sources</span>
            </div>
          </div>

          <div className="studio-hero-art animate-fade-in" aria-label="Illustration of a searchable document workspace">
            <div className="studio-art-orbit studio-art-orbit-one" />
            <div className="studio-art-orbit studio-art-orbit-two" />
            <div className="studio-art-label"><span className="studio-status-dot" /> A LITTLE MORE ORDER</div>
            <div className="studio-file-card studio-file-back">
              <span className="studio-file-type">PDF / 04</span>
              <span className="studio-file-lines"><i /><i /><i /></span>
              <span className="studio-file-foot">Lease agreement</span>
            </div>
            <div className="studio-file-card studio-file-front">
              <div className="studio-file-heading">
                <span className="studio-file-icon"><FileText size={17} /></span>
                <span className="studio-file-type">PERSONAL / 2025</span>
                <button aria-label="Open document"><ArrowUpRight size={15} /></button>
              </div>
              <div className="studio-paper-title">The important<br />things, in order.</div>
              <span className="studio-paper-rule" />
              <span className="studio-file-lines"><i /><i /><i /><i /></span>
              <div className="studio-file-foot">Insurance policy <span>Updated 2 days ago</span></div>
            </div>
            <div className="studio-search-card">
              <span className="studio-search-icon"><Search size={17} /></span>
              <span>When does my coverage renew?</span>
              <span className="studio-search-enter"><ArrowRight size={15} /></span>
            </div>
            <div className="studio-answer-card">
              <span className="studio-answer-mark"><Sparkles size={16} /></span>
              <span><strong>Found in your policy</strong><small>Renewal date · October 18</small></span>
              <span className="studio-answer-check"><Check size={14} /></span>
            </div>
            <div className="studio-orbit-note"><ArrowDown size={14} /> Fewer folders. More clarity.</div>
          </div>
        </div>
        <a className="studio-scroll-cue" href="#features"><span>SCROLL TO EXPLORE</span><ArrowDown size={14} /></a>
      </section>

      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        openLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
      />
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        openRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
      />
    </>
  );
}
