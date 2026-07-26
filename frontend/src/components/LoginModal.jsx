"use client";
import toast from "react-hot-toast";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";


export default function LoginModal({
  isOpen,
  onClose,
  openRegister,
}) {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message);
        return;
      }

      // Success Toast
      toast.success("Welcome back!");

      // Save authentication data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Clear the form
      setFormData({
        email: "",
        password: "",
      });

      // Close the login modal
      onClose();

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="grid h-full lg:grid-cols-2">

        {/* LEFT SIDE */}

        <div className="hidden lg:block h-full">

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
              Welcome Back
            </h2>

            <p className="mt-3 text-lg text-slate-500">
              Sign in to continue.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-10 space-y-7"
            >
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
                  className="
                    h-14
                    w-full
                    rounded-2xl
                    border
                    border-slate-300
                    px-5
                    text-base
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
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
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
                      setShowPassword(!showPassword)
                    }
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
                Sign In
              </button>

            </form>

            <div className="mt-10 text-center text-base">

              <span className="text-slate-500">
                Don't have an account?
              </span>

              <button
                onClick={() => {
                  onClose();
                  openRegister();
                }}
                className="ml-2 font-semibold text-blue-600 hover:underline"
              >
                Register
              </button>

            </div>

          </div>

        </div>

      </div>
    </Modal>
  );
}