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
  IconPhone,
  IconUserPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import axios, { AxiosResponse } from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    profileImage: "",
    otp: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    if (field === "email") {
      setIsEmailVerified(false);
      setForm((prev) => ({ ...prev, otp: "" }));
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const verifyEmail = async () => {
    if (!form.email || !form.email.includes("@") || !form.email.includes(".")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!form.name) {
      toast.error("Please enter your name first");
      return;
    }
    try {
      const response = axios.post(`/api/helper/verify-email`, {
        name: form.name,
        email: form.email,
      });
      toast.promise(response, {
        loading: "Sending Email...",
        success: () => {
          (
            document.getElementById("otpContainer") as HTMLDialogElement
          ).showModal();
          return "Email Sent!!";
        },
        error: () => {
          return "Unable to send OTP right now";
        },
      });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!!!");
    }
  };

  const uploadImage = (folderName: string, imageName: string, path: string) => {
    if (!image) {
      toast.error("No image selected");
      return;
    }
    if (imageName.trim() === "") {
      toast.error("Image name cannot be empty");
      return;
    }
    if (image) {
      if (image.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB");
        return;
      }
      const imageResponse = axios.postForm("/api/helper/upload-img", {
        file: image,
        name: imageName,
        folderName: folderName,
      });
      toast.promise(imageResponse, {
        loading: "Uploading Image...",
        success: (data: AxiosResponse) => {
          setForm({
            ...form,
            profileImage: data.data.path,
          });
          return "Image Uploaded Successfully";
        },
        error: (err: unknown) => `This just happened: ${err}`,
      });
    }
  };

  const handleRegister = async () => {
    const { name, email, phone, password, confirmPassword } = form;

    if (!name || !email || !phone || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!isEmailVerified) {
      toast.error("Please verify your email first");
      return;
    }

    setIsLoading(true);
    try {
      const response = axios.post("/api/auth/signup", { formData: form });
      toast.promise(response, {
        loading: "Creating your account...",
        success: () => {
          router.push("/login");
          return "Account created successfully!";
        },
        error: (err: unknown) => {
          return `This just happened: ${err}`;
        },
      });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!!!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-base-100 shadow-2xl w-full max-w-lg z-10 border border-base-content/5"
        >
          <div className="card-body p-8 lg:px-10 lg:py-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex p-4 rounded-3xl bg-primary/10 text-primary mb-4">
                <IconUserPlus size={40} stroke={1.5} />
              </div>
              <h1 className="text-3xl font-black tracking-tight">
                Join Vi<span className="text-primary">DARY</span>
              </h1>
              <p className="text-sm opacity-60 font-medium">
                Create your account to get started
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend uppercase text-[10px] font-bold opacity-70">
                    Full Name
                  </legend>
                  <div className="input input-primary w-full bg-base-200/50 focus:bg-base-100 transition-all border-none focus:ring-2 ring-primary/20">
                    <IconUser className="opacity-30" size={18} />
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="grow"
                      value={form.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                    />
                  </div>
                </fieldset>

                <fieldset className="fieldset">
                  <legend className="fieldset-legend uppercase text-[10px] font-bold opacity-70">
                    Phone Number
                  </legend>
                  <div className="input input-primary w-full bg-base-200/50 focus:bg-base-100 transition-all border-none focus:ring-2 ring-primary/20">
                    <IconPhone className="opacity-30" size={18} />
                    <input
                      type="tel"
                      placeholder="+91 00000 00000"
                      className="grow"
                      value={form.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                    />
                  </div>
                </fieldset>
              </div>

              <fieldset className="fieldset">
                <legend className="fieldset-legend uppercase text-[10px] font-bold opacity-70">
                  Email Address
                </legend>
                <div className="join">
                  <div className="input input-primary w-full bg-base-200/50 focus:bg-base-100 transition-all border-none focus:ring-2 ring-primary/20 join-item">
                    <IconMail className="opacity-30" size={18} />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      className="grow"
                      value={form.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                    />
                  </div>
                  {form.email.includes("@") &&
                    form.email.includes(".") &&
                    form.email.length > 5 &&
                    form.name.length > 2 &&
                    !isEmailVerified && (
                      <button
                        className="btn btn-primary join-item"
                        onClick={verifyEmail}
                      >
                        Verify
                      </button>
                    )}
                </div>
              </fieldset>

              {/* Profile Image Field */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Profile Image <span className="text-error">*</span>
                </legend>
                <div className="join">
                  <input
                    type="file"
                    accept="image/*"
                    className="file-input file-input-primary w-full join-item"
                    disabled={form.profileImage !== "" || form.name === ""}
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        setImage(files[0]);
                      }
                    }}
                  />
                  {(image || form.profileImage !== "") && (
                    <button
                      className="btn btn-secondary join-item"
                      onClick={() =>
                        uploadImage(
                          "applicant-profile-images",
                          form.name || "profile-image",
                          "profileImage"
                        )
                      }
                    >
                      Upload
                    </button>
                  )}
                </div>
              </fieldset>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend uppercase text-[10px] font-bold opacity-70">
                    Password
                  </legend>
                  <div className="input input-primary w-full bg-base-200/50 focus:bg-base-100 transition-all border-none focus:ring-2 ring-primary/20">
                    <IconLock className="opacity-30" size={18} />
                    <input
                      type={isPasswordVisible ? "text" : "password"}
                      placeholder="••••••••"
                      className="grow"
                      value={form.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                    />
                    <button
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      className="opacity-50 hover:opacity-100"
                    >
                      {isPasswordVisible ? (
                        <IconEyeOff size={16} />
                      ) : (
                        <IconEye size={16} />
                      )}
                    </button>
                  </div>
                </fieldset>

                <fieldset className="fieldset">
                  <legend className="fieldset-legend uppercase text-[10px] font-bold opacity-70">
                    Confirm
                  </legend>
                  <div className="input input-primary w-full bg-base-200/50 focus:bg-base-100 transition-all border-none focus:ring-2 ring-primary/20">
                    <IconLock className="opacity-30" size={18} />
                    <input
                      type={isPasswordVisible ? "text" : "password"}
                      placeholder="••••••••"
                      className="grow"
                      value={form.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                    />
                  </div>
                </fieldset>
              </div>

              <button
                onClick={handleRegister}
                disabled={isLoading}
                className="btn btn-primary w-full rounded-2xl uppercase tracking-widest mt-4 shadow-lg shadow-primary/20 group flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
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
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary font-black hover:underline underline-offset-4"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <dialog id="otpContainer" className="modal">
        <div className="modal-box space-y-6">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-base-content hover:text-primary transition duration-200">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-xl text-center text-base-content uppercase my-4">
            Please Enter The OTP
          </h3>

          <div className="flex justify-center gap-4">
            {/* OTP Input fields for 6 digits */}
            {[...Array(6)].map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                className="input input-bordered input-primary text-center w-12 h-12 text-xl font-semibold placeholder:text-base-content/70"
                value={form.otp?.[index] ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d$/.test(value) || value === "") {
                    const otp = [...form.otp!];
                    otp[index] = value;
                    setForm({ ...form, otp: otp.join("") });
                    if (value && index < 5) {
                      document
                        .getElementById(`otp-input-${index + 1}`)
                        ?.focus();
                    }
                  }
                }}
                id={`otp-input-${index}`}
                placeholder="●"
              />
            ))}
          </div>

          <button
            className="btn btn-primary w-full mt-4 py-2"
            onClick={async (e) => {
              e.preventDefault();

              if (form.otp?.length !== 6) {
                toast.error("Enter the 6 digit OTP", { duration: 2000 });
                return;
              }

              try {
                const response = await axios.post(
                  "/api/helper/verify-email/confirm",
                  {
                    email: form.email,
                    otp: form.otp,
                  }
                );

                if (response.data.verified) {
                  setIsEmailVerified(true);
                  (
                    document.getElementById("otpContainer") as HTMLDialogElement
                  )?.close();
                  toast.success("OTP Verified", { duration: 2000 });
                }
              } catch (error) {
                toast.error("Invalid or expired OTP!!!", { duration: 2000 });
              }
            }}
          >
            Verify
          </button>
        </div>
      </dialog>
    </>
  );
}
