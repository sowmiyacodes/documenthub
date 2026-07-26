"use client";

import { useState } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

export default function Navbar() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
        <div className="container-width flex h-20 items-center justify-between">
          {/* Logo */}

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
              L
            </div>

            <div>
              <h1 className="text-xl font-bold">LifeHub AI</h1>

              <p className="text-xs text-slate-500">
                Personal Digital Management
              </p>
            </div>
          </div>

          {/* Navigation */}

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#">Home</a>
            <a href="#features">Features</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
          </nav>

          {/* Buttons */}

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLoginOpen(true)}
              className="secondary-btn"
            >
              Login
            </button>

            <button
              onClick={() => setRegisterOpen(true)}
              className="primary-btn"
            >
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Login Modal */}

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        openRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
      />

      {/* Register Modal */}

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