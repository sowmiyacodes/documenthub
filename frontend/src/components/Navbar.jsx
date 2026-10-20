"use client";

import { useState } from "react";
import { ArrowUpRight, Orbit } from "lucide-react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

export default function Navbar() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <>
      <header className="studio-nav">
        <div className="studio-container studio-nav-inner">
          <a className="studio-brand" href="#hero" aria-label="DocumentHub home">
            <span className="studio-brand-mark"><Orbit size={21} strokeWidth={1.8} /></span>
            <span className="studio-brand-name">document<span>hub</span></span>
          </a>

          <nav className="studio-nav-links" aria-label="Main navigation">
            <a href="#hero">The idea</a>
            <a href="#features">What it does</a>
            <a href="#workflow">How it works</a>
            <a href="#security">Privacy</a>
          </nav>

          <div className="studio-nav-actions">
            <button className="studio-text-button" onClick={() => setLoginOpen(true)}>
              Sign in
            </button>
            <button className="studio-dark-button studio-nav-cta" onClick={() => setRegisterOpen(true)}>
              Start organizing <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </header>

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        openRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
      />
      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        openLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
      />
    </>
  );
}
