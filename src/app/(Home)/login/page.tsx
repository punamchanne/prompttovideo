"use client";

import { motion } from "framer-motion";
import {
  IconUser,
  IconLock,
  IconMail,
  IconStethoscope,
  IconUsers,
  IconUserCircle,
  IconArrowNarrowRightDashed,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onLogin = async () => {
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const res = axios.post("/api/auth/login", {
        email: form.email,
        password: form.password,
      });
      toast.promise(res, {
        loading: "Logging in...",
        success: (data) => {
          console.log(data);
          router.push(data.data.route);
          return "Login successful!";
        },
        error: "Login failed. Please try again.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      toast.error(errorMessage);
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-base-100 shadow-2xl w-full max-w-md z-10 border border-base-content/5"
      >
        <div className="card-body p-8 lg:px-10 lg:py-8">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="inline-flex p-4 rounded-3xl bg-primary/10 text-primary mb-4">
              <IconUser size={40} stroke={1.5} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              Vi<span className="text-primary">DARY</span> Access
            </h1>
            <p className="text-sm opacity-60 font-medium">
              Create video using AI
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                Email Address <span className="text-error">*</span>
              </legend>
              <div className="input input-primary w-full bg-base-200/50 focus:bg-base-100 transition-all border-none focus:ring-2 ring-primary/20">
                <IconMail className="opacity-30" size={20} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="grow"
                  value={form.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                Password <span className="text-error">*</span>{" "}
              </legend>
              <div className="join">
                <div className="input input-primary w-full bg-base-200/50 focus:bg-base-100 transition-all border-none focus:ring-2 ring-primary/20 join-item">
                  <IconLock className="opacity-30" size={20} />
                  <input
                    type={isPasswordVisible ? "text" : "password"}
                    placeholder="••••••••"
                    className="grow"
                    value={form.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                  />
                </div>
                <button
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="btn btn-ghost join-item bg-base-200/50 focus:bg-base-100 transition-all border-none focus:ring-2 ring-primary/20"
                >
                  {isPasswordVisible ? (
                    <IconEyeOff size={16} />
                  ) : (
                    <IconEye size={16} />
                  )}
                </button>
              </div>
            </fieldset>
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Remember Me
              </label>
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot Password?
              </a>
            </div>
            <button
              onClick={onLogin}
              disabled={isLoading}
              className="btn btn-primary w-full rounded-2xl uppercase tracking-widest mt-4 shadow-lg shadow-primary/20 group flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Logging in...
                </>
              ) : (
                <>
                  Login
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <IconArrowNarrowRightDashed size={20} />
                  </motion.div>
                </>
              )}
            </button>
          </div>
          <div className="divider">OR</div>
          <div className="text-center">
            <p className="text-sm opacity-60">
              New to the platform?{" "}
              <Link
                href="/sign-up"
                className="text-primary font-black hover:underline underline-offset-4"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
