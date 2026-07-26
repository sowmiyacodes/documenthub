"use client";
import toast from "react-hot-toast";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Modal from "./Modal";

export default function RegisterModal({
  isOpen,
  onClose,
  openLogin,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

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
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    const data = await response.json();

    if (!response.ok) {
        toast.error(data.message);
      return;
    }

    // Save token if needed
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    toast.error(data.message);

    // Clear form
    setFormData({
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    onClose();

    // Optional: Open login modal instead
    // openLogin();

  } catch (error) {
    console.error(error);
    alert("Something went wrong");
  }
};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="grid h-full lg:grid-cols-2">

        {/* LEFT SIDE */}

        <div className="hidden h-full lg:block">
          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1400"
            alt="LifeHub AI"
            className="h-full w-full object-cover"
          />
        </div>

        {/* RIGHT SIDE */}

        <div className="flex h-full items-center justify-center bg-white px-10 py-14 lg:px-20">

          <div className="w-full max-w-md">

            {/* Logo */}

            <div className="mb-12 flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white">
                L
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  LifeHub AI
                </h1>

                <p className="text-sm text-slate-500">
                  Personal Digital Management
                </p>
              </div>

            </div>

            <h2 className="text-4xl font-bold text-slate-900">
              Create Account
            </h2>

            <p className="mt-3 text-lg text-slate-500">
            
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-10 space-y-6"
            >
              {/* Full Name */}

              <div>
                <label className="mb-2 block font-medium text-slate-700">
                  Full Name
                </label>

                <input
                  type="text"
                  name="full_name"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="
                    h-14
                    w-full
                    rounded-2xl
                    border
                    border-slate-300
                    px-5
                    outline-none
                    transition
                    focus:border-blue-600
                    focus:ring-4
                    focus:ring-blue-100
                  "
                />
              </div>

              {/* Email */}

              <div>
                <label className="mb-2 block font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="
                    h-14
                    w-full
                    rounded-2xl
                    border
                    border-slate-300
                    px-5
                    outline-none
                    transition
                    focus:border-blue-600
                    focus:ring-4
                    focus:ring-blue-100
                  "
                />
              </div>

              {/* Password */}

              <div>
                <label className="mb-2 block font-medium text-slate-700">
                  Password
                </label>

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="
                      h-14
                      w-full
                      rounded-2xl
                      border
                      border-slate-300
                      px-5
                      pr-14
                      outline-none
                      transition
                      focus:border-blue-600
                      focus:ring-4
                      focus:ring-blue-100
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showPassword ? (
                      <EyeOff size={22} />
                    ) : (
                      <Eye size={22} />
                    )}
                  </button>

                </div>
              </div>

              {/* Confirm Password */}

              <div>
                <label className="mb-2 block font-medium text-slate-700">
                  Confirm Password
                </label>

                <div className="relative">

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="
                      h-14
                      w-full
                      rounded-2xl
                      border
                      border-slate-300
                      px-5
                      pr-14
                      outline-none
                      transition
                      focus:border-blue-600
                      focus:ring-4
                      focus:ring-blue-100
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={22} />
                    ) : (
                      <Eye size={22} />
                    )}
                  </button>

                </div>
              </div>

              {/* Register Button */}

              <button
                type="submit"
                className="
                  h-14
                  w-full
                  rounded-2xl
                  bg-blue-600
                  text-lg
                  font-semibold
                  text-white
                  transition
                  hover:bg-blue-700
                "
              >
                Create Account
              </button>

            </form>

            {/* Bottom Link */}

            <div className="mt-10 text-center text-base">

              <span className="text-slate-500">
                Already have an account?
              </span>

              <button
                onClick={() => {
                  onClose();
                  openLogin();
                }}
                className="ml-2 font-semibold text-blue-600 hover:underline"
              >
                Sign In
              </button>

            </div>

          </div>

        </div>

      </div>
    </Modal>
  );
}