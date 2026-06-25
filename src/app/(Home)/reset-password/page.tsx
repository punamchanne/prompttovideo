"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowNarrowRightDashed,
  IconShieldLock,
  IconFingerprint,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      toast.error("Please enter the 6-digit OTP code sent to your email.");
      return;
    }

    if (otp.trim().length !== 6) {
      toast.error("OTP must be exactly 6 digits.");
      return;
    }

    if (!password || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = axios.post("/api/auth/reset-password", {
        otp: otp.trim(),
        password,
      });

      await toast.promise(res, {
        loading: "Resetting password...",
        success: (data) => {
          setTimeout(() => {
            router.push("/login");
          }, 2000);
          return data.data.message || "Password reset successfully!";
        },
        error: (err) => {
          return err.response?.data?.message || "Failed to reset password.";
        },
      });
    } catch (error) {
      console.error(error);
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
            <div className="inline-flex p-4 rounded-3xl bg-secondary/10 text-secondary mb-4">
              <IconShieldLock size={40} stroke={1.5} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              Reset <span className="text-secondary">Password</span>
            </h1>
            <p className="text-sm opacity-60 font-medium">
              Enter the OTP sent to your email and choose your new password.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* OTP Input */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                OTP Code (6 Digits) <span className="text-error">*</span>
              </legend>
              <div className="input input-secondary w-full bg-base-200/50 focus:bg-base-100 transition-all border-none focus:ring-2 ring-secondary/20">
                <IconFingerprint className="opacity-30" size={20} />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  className="grow tracking-widest font-black text-center text-lg"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  disabled={isLoading}
                />
              </div>
            </fieldset>

            {/* New Password */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                New Password <span className="text-error">*</span>
              </legend>
              <div className="join w-full">
                <div className="input input-secondary w-full bg-base-200/50 focus:bg-base-100 transition-all border-none focus:ring-2 ring-secondary/20 join-item">
                  <IconLock className="opacity-30" size={20} />
                  <input
                    type={isPasswordVisible ? "text" : "password"}
                    placeholder="••••••••"
                    className="grow"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="btn btn-ghost join-item bg-base-200/50 focus:bg-base-100 transition-all border-none focus:ring-2 ring-secondary/20"
                >
                  {isPasswordVisible ? (
                    <IconEyeOff size={16} />
                  ) : (
                    <IconEye size={16} />
                  )}
                </button>
              </div>
            </fieldset>

            {/* Confirm Password */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                Confirm Password <span className="text-error">*</span>
              </legend>
              <div className="input input-secondary w-full bg-base-200/50 focus:bg-base-100 transition-all border-none focus:ring-2 ring-secondary/20">
                <IconLock className="opacity-30" size={20} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="grow"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-secondary w-full rounded-2xl uppercase tracking-widest mt-4 shadow-lg shadow-secondary/20 group flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Resetting...
                </>
              ) : (
                <>
                  Update Password
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <IconArrowNarrowRightDashed size={20} />
                  </motion.div>
                </>
              )}
            </button>
          </form>

          <div className="divider"></div>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-primary font-bold hover:underline"
            >
              Go to Login page
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
