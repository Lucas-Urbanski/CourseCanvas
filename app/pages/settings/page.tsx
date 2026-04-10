"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  LogOut,
  Save,
  Camera,
  Loader2,
  User,
  ShieldCheck,
  Info,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "../../context/AuthContext";
import AuthGuard from "../../components/AuthGuard";

function SettingsContent() {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  const { user, loading: authLoading, signOut } = useAuth();

  const [profileLoading, setProfileLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    const getProfile = async () => {
      setProfileLoading(true);
      const { data: profile } = await supabase
        .from("profiles")
        .select("fullName, bio, avatarUrl")
        .eq("id", user.id)
        .single();

      setFullName(profile?.fullName || user.name || "");
      setBio(profile?.bio || "");
      setAvatarUrl(profile?.avatarUrl || "");
      setProfileLoading(false);
    };
    getProfile();
  }, [user?.id, supabase]);

  async function saveProfile() {
    if (!user) return;

    setFormError(null);
    setFormSuccess(false);

    if (newPassword && newPassword.length < 6) {
      setFormError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setIsSaving(true);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ fullName: fullName, bio, avatarUrl: avatarUrl })
      .eq("id", user.id);

    if (profileError) {
      setFormError(profileError.message);
      setIsSaving(false);
      return;
    }

    if (newPassword) {
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (authError) {
        setFormError("Password error: " + authError.message);
        setIsSaving(false);
        return;
      }

      setNewPassword("");
      setConfirmPassword("");
    }

    setFormSuccess(true);
    setIsSaving(false);
  }

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F1E6] text-zinc-800">
        <Loader2 className="mb-4 h-10 w-10 animate-spin" />
        <p className="font-medium">Loading your settings...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F1E6] px-6 py-12 text-zinc-800">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <Link href="/pages/home" className="group flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-[#F5F1E6] transition-transform group-hover:scale-95">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black leading-none">Settings</h1>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                CourseCanvas
              </p>
            </div>
          </Link>

          <button
            onClick={signOut}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-red-500 shadow-sm transition hover:bg-red-50"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <div className="space-y-8">
          {/* Identity */}
          <section className="rounded-[2.5rem] border border-zinc-200 bg-white p-10 shadow-sm">
            <div className="mb-10 flex flex-col items-center sm:flex-row sm:gap-8">
              <div className="relative mb-4 sm:mb-0">
                <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-zinc-50 bg-zinc-100 shadow-inner">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-black text-zinc-300">
                      {fullName?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <button
                  onClick={() =>
                    setAvatarUrl(
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}-${Date.now()}`,
                    )
                  }
                  className="absolute bottom-1 right-1 rounded-full bg-zinc-900 p-2 text-[#F5F1E6] shadow-xl transition hover:scale-110 active:scale-90"
                >
                  <Camera size={18} />
                </button>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-black">Profile Identity</h2>
                <p className="text-sm text-zinc-400 font-medium">
                  Manage how you appear to others on CourseCanvas.
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">
                  <User size={14} /> Legal Name
                </label>
                <input
                  className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-900/5"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">
                  <Info size={14} /> Short Bio
                </label>
                <textarea
                  className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 resize-none"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a little about your teaching/learning style..."
                  rows={3}
                />
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="rounded-[2.5rem] border border-zinc-200 bg-white p-10 shadow-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-black flex items-center gap-2">
                Security
              </h2>
              <p className="text-sm text-zinc-400 font-medium">
                Update your credentials to keep your account safe.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">
                  <ShieldCheck size={14} /> New Password
                </label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current"
                  className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4 outline-none transition-all focus:border-zinc-900 focus:bg-white"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4 outline-none transition-all focus:border-zinc-900 focus:bg-white"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Notifications */}
            <div className="mt-6 min-h-[20px]">
              {formError && (
                <p className="text-sm font-bold text-red-500 animate-in fade-in slide-in-from-top-1">
                  {formError}
                </p>
              )}
              {formSuccess && (
                <p className="text-sm font-bold text-emerald-600 animate-in fade-in slide-in-from-top-1">
                  Changes saved successfully!
                </p>
              )}
            </div>
          </section>

          {/* Persistent Save Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={saveProfile}
              disabled={isSaving}
              className="flex w-full max-w-sm items-center justify-center gap-3 rounded-2xl bg-zinc-900 py-5 font-bold text-[#F5F1E6] shadow-xl shadow-zinc-900/20 transition-all hover:bg-black hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              {isSaving ? "Saving..." : "Save All Changes"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Settings() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}
