"use client";

import { motion } from "framer-motion";
import { IconMail, IconKey, IconArrowNarrowLeft, IconArrowNarrowRightDashed } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const res = axios.post("/api/auth/forgot-password", { email });
      await toast.promise(res, {
        loading: "Sending OTP...",
        success: (data) => {
          setIsSubmitted(true);
          setTimeout(() => {
            router.push("/reset-password");
          }, 2000);
          return data.data.message || "OTP sent successfully!";
        },
        error: (err) => {
          return err.response?.data?.message || "Failed to send OTP.";
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
            <div className="inline-flex p-4 rounded-3xl bg-primary/10 text-primary mb-4">
              <IconKey size={40} stroke={1.5} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              Forgot <span className="text-primary">Password?</span>
            </h1>
            <p className="text-sm opacity-60 font-medium">
              We'll send you a 6-digit OTP code to verify your request.
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={onSubmit} className="space-y-5">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full rounded-2xl uppercase tracking-widest mt-4 shadow-lg shadow-primary/20 group flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
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
          ) : (
            <div className="text-center space-y-4 py-4">
              <div className="alert alert-success text-sm py-3">
                OTP sent successfully!
              </div>
              <p className="text-sm opacity-70">
                Redirecting you to the verification and password reset page...
              </p>
            </div>
          )}

          <div className="divider"></div>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-primary font-bold hover:underline"
            >
              <IconArrowNarrowLeft size={18} />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
