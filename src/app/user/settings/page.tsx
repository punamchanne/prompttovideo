"use client";

import Title from "@/components/Title";
import Loading from "@/components/Loading";
import axios, { AxiosResponse } from "axios";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/Types";
import {
  IconUser,
  IconMail,
  IconPhone,
  IconCoins,
  IconCamera,
  IconDeviceFloppy,
} from "@tabler/icons-react";

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<User>(user!);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user || !form) return <Loading />;

  const handleInputChange = (field: keyof User, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("File size exceeds 5MB");
    }

    const uploadPromise = axios.postForm("/api/helper/upload-img", {
      file: file,
      name: `${user._id}`,
      folderName: "profiles",
    });

    toast.promise(uploadPromise, {
      loading: "Uploading Profile Image...",
      success: (res: AxiosResponse) => {
        const imagePath = res.data.path ?? res.data.url ?? "";
        const nextForm = { ...form, profileImage: imagePath };
        setForm(nextForm);
        setUser({ ...user, ...nextForm });
        return "Image Uploaded Successfully";
      },
      error: "Failed to upload image",
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post("/api/user/update-settings", {
        name: form.name,
        phone: form.phone,
        profileImage: form.profileImage,
      });
      setUser({ ...user, ...form });
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Title
        title="Account Settings"
        subtitle="Update your personal information and preferences"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card bg-base-200 border border-base-300 shadow-sm overflow-hidden">
            <div className="h-24 bg-primary/10 w-full" />
            <div className="px-6 pb-6 -mt-12 flex flex-col items-center">
              <div className="relative group">
                <div className="avatar">
                  <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden bg-base-300">
                    {form.profileImage ? (
                      <img src={form.profileImage} alt="Profile" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-3xl font-bold opacity-20">
                        {form.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 btn btn-circle btn-primary btn-sm shadow-lg scale-90 group-hover:scale-100 transition-transform"
                >
                  <IconCamera size={16} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
              <h3 className="mt-4 text-xl font-bold">{form.name}</h3>
              <p className="text-sm opacity-60">{form.email}</p>

              <div className="mt-6 w-full grid grid-cols-2 gap-2">
                <div className="bg-base-100 p-3 rounded-xl text-center border border-base-300">
                  <p className="text-[10px] uppercase font-bold opacity-50">
                    Credits
                  </p>
                  <div className="flex items-center justify-center gap-1 text-primary">
                    <IconCoins size={14} />
                    <span className="font-bold">{form.credits}</span>
                  </div>
                </div>
                <div className="bg-base-100 p-3 rounded-xl text-center border border-base-300">
                  <p className="text-[10px] uppercase font-bold opacity-50">
                    Status
                  </p>
                  <span className="text-success text-xs font-bold uppercase tracking-wider">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-base-100 border border-base-300 shadow-sm p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <fieldset className="fieldset col-span-2 md:col-span-1">
                <legend className="fieldset-legend uppercase text-[10px] font-bold opacity-70">
                  Full Name
                </legend>
                <div className="input w-full bg-base-200/50 focus-within:bg-base-100 transition-all border-none focus-within:ring-2 ring-primary/20 flex items-center gap-3">
                  <IconUser className="opacity-30" size={18} />
                  <input
                    type="text"
                    className="grow bg-transparent outline-none"
                    value={form.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
              </fieldset>

              {/* Phone */}
              <fieldset className="fieldset col-span-2 md:col-span-1">
                <legend className="fieldset-legend uppercase text-[10px] font-bold opacity-70">
                  Phone Number
                </legend>
                <div className="input w-full bg-base-200/50 focus-within:bg-base-100 transition-all border-none focus-within:ring-2 ring-primary/20 flex items-center gap-3">
                  <IconPhone className="opacity-30" size={18} />
                  <input
                    type="text"
                    placeholder="+1 234 567 890"
                    className="grow bg-transparent outline-none"
                    value={form.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </fieldset>

              {/* Email (Read Only) */}
              <fieldset className="fieldset col-span-2">
                <legend className="fieldset-legend uppercase text-[10px] font-bold opacity-70">
                  Email Address (Permanent)
                </legend>
                <div className="input w-full bg-base-300/30 border-none flex items-center gap-3 cursor-not-allowed">
                  <IconMail className="opacity-20" size={18} />
                  <input
                    type="email"
                    className="grow opacity-50 bg-transparent outline-none"
                    value={form.email}
                    disabled
                  />
                </div>
              </fieldset>
            </div>

            <div className="flex justify-end mt-10">
              <button
                className={`btn btn-primary px-8 shadow-lg shadow-primary/20 ${
                  saving ? "loading" : ""
                }`}
                onClick={handleSave}
                disabled={saving}
              >
                {!saving && <IconDeviceFloppy size={18} />}
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
