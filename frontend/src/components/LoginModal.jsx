"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowUpRight, Check, Eye, EyeOff, LockKeyhole, Orbit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";

export default function LoginModal({ isOpen, onClose, openRegister }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to sign in");
        return;
      }

      toast.success("Welcome back to DocumentHub AI!");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setFormData({ email: "", password: "" });
      onClose();
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="studio-auth-layout">
        <aside className="studio-auth-aside">
          <a className="studio-brand studio-auth-brand" href="#hero">
            <span className="studio-brand-mark"><Orbit size={20} strokeWidth={1.8} /></span>
            <span className="studio-brand-name">document<span>hub</span></span>
          </a>
          <div className="studio-auth-aside-copy">
            <span className="studio-auth-kicker">YOUR DOCUMENT DESK</span>
            <h2>Everything important, <em>right where you left it.</em></h2>
            <p>Pick up where you left off, with your files and answers in one place.</p>
          </div>
          <div className="studio-auth-aside-bottom">
            <span><Check size={14} /> One home for your documents</span>
            <span><Check size={14} /> Answers linked to their sources</span>
            <span className="studio-auth-private"><LockKeyhole size={14} /> Private by design</span>
          </div>
          <span className="studio-auth-edition">DOCUMENTHUB / YOUR PRIVATE ARCHIVE</span>
        </aside>

        <div className="studio-auth-form-panel">
          <div className="studio-auth-form">
            <span className="studio-auth-kicker studio-auth-kicker-dark">GOOD TO SEE YOU AGAIN</span>
            <h2>Welcome back.</h2>
            <p className="studio-auth-description">Sign in to return to your personal document desk.</p>

            <form onSubmit={handleSubmit} className="studio-auth-fields">
              <div className="studio-field">
                <label htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="studio-field">
                <label htmlFor="login-password">Password</label>
                <div className="studio-password-field">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    required
                    placeholder="Your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={submitting} className="studio-auth-submit">
                {submitting ? "Signing you in..." : "Sign in to your desk"}
                {!submitting && <ArrowUpRight size={17} />}
              </button>
            </form>

            <p className="studio-auth-switch">
              New to DocumentHub?{" "}
              <button onClick={() => { onClose(); openRegister(); }}>Create an account</button>
            </p>
          </div>
          <span className="studio-auth-footnote">A CLEARER WAY TO KEEP THE IMPORTANT THINGS.</span>
        </div>
      </div>
    </Modal>
  );
}
