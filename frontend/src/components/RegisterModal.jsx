"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowUpRight, Check, Eye, EyeOff, LockKeyhole, Orbit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";

export default function RegisterModal({ isOpen, onClose, openLogin }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const user = {
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
    };

    try {
      setSubmitting(true);
      const response = await fetch(
  `${import.meta.env.VITE_API_URL}/api/auth/register`,
  {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to create account");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Account created successfully! Welcome to DocumentHub.");
      setFormData({ full_name: "", email: "", password: "", confirmPassword: "" });
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
      <div className="studio-auth-layout studio-auth-layout-register">
        <aside className="studio-auth-aside">
          <a className="studio-brand studio-auth-brand" href="#hero">
            <span className="studio-brand-mark"><Orbit size={20} strokeWidth={1.8} /></span>
            <span className="studio-brand-name">document<span>hub</span></span>
          </a>
          <div className="studio-auth-aside-copy">
            <span className="studio-auth-kicker">A FRESH PLACE TO START</span>
            <h2>Make a little space for <em>peace of mind.</em></h2>
            <p>Bring your everyday paperwork together and make it easier to find what matters.</p>
          </div>
          <div className="studio-auth-aside-bottom">
            <span><Check size={14} /> Keep files in one organized space</span>
            <span><Check size={14} /> Find details in plain language</span>
            <span className="studio-auth-private"><LockKeyhole size={14} /> Your archive is yours</span>
          </div>
          <span className="studio-auth-edition">DOCUMENTHUB / YOUR PRIVATE ARCHIVE</span>
        </aside>

        <div className="studio-auth-form-panel">
          <div className="studio-auth-form">
            <span className="studio-auth-kicker studio-auth-kicker-dark">START WITH THE IMPORTANT THINGS</span>
            <h2>Create your account.</h2>
            <p className="studio-auth-description">Set up your own home for the documents that matter.</p>

            <form onSubmit={handleSubmit} className="studio-auth-fields studio-auth-fields-register">
              <div className="studio-field">
                <label htmlFor="register-name">Your name</label>
                <input
                  id="register-name"
                  type="text"
                  name="full_name"
                  autoComplete="name"
                  required
                  placeholder="Alex Morgan"
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </div>
              <div className="studio-field">
                <label htmlFor="register-email">Email address</label>
                <input
                  id="register-email"
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
                <label htmlFor="register-password">Password</label>
                <div className="studio-password-field">
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="new-password"
                    required
                    placeholder="Create a password"
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
              <div className="studio-field">
                <label htmlFor="register-confirm-password">Confirm password</label>
                <div className="studio-password-field">
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    autoComplete="new-password"
                    required
                    placeholder="Enter it once more"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={submitting} className="studio-auth-submit">
                {submitting ? "Creating your account..." : "Create your account"}
                {!submitting && <ArrowUpRight size={17} />}
              </button>
            </form>

            <p className="studio-auth-switch">
              Already have an account?{" "}
              <button onClick={() => { onClose(); openLogin?.(); }}>Sign in</button>
            </p>
          </div>
          <span className="studio-auth-footnote">A CLEARER WAY TO KEEP THE IMPORTANT THINGS.</span>
        </div>
      </div>
    </Modal>
  );
}
