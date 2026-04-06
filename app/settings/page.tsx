"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, LogOut, Save, Camera, Loader2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "../context/AuthContext";
import AuthGuard from "../components/AuthGuard";

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
    <main className="min-h-screen bg-[#F5F1E6] px-6 py-12">
      <div className="mx-auto max-w-xl rounded-3xl border border-zinc-300 bg-white/80 p-8 shadow-lg">
        <div className="mb-8 text-center">
          <Link
            href="/home"
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-[#F5F1E6] transition-opacity hover:opacity-80"
          >
            <BookOpen size={28} />
          </Link>
          <h1 className="text-2xl font-bold text-zinc-800">Account Settings</h1>
        </div>

        <div className="mb-8 flex flex-col items-center">
          <div className="relative group">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-zinc-200 shadow-md">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-zinc-500">
                  {fullName ? fullName.substring(0, 2).toUpperCase() : "UC"}
                </div>
              )}
            </div>
            <button
              onClick={() =>
                setAvatarUrl(
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}-${Date.now()}`,
                )
              }
              className="absolute bottom-0 right-0 rounded-full bg-zinc-800 p-2 text-white shadow-lg hover:scale-110 transition"
            >
              <Camera size={16} />
            </button>
          </div>
          <p className="mt-2 text-sm font-semibold text-zinc-600">
            {fullName || "New User"}
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Full Name
            </label>
            <input
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-800 outline-none focus:border-zinc-800 transition"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Bio
            </label>
            <textarea
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-800 outline-none focus:border-zinc-800 transition"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>

          <div className="pt-4 border-t border-zinc-200">
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-400">
              Security
            </p>
            <input
              type="password"
              placeholder="New password (optional)"
              className="mb-3 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-800 outline-none focus:border-zinc-800 transition"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-800 outline-none focus:border-zinc-800 transition"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}
          {formSuccess && (
            <p className="text-sm text-green-600">
              Profile updated successfully!
            </p>
          )}

          <button
            onClick={saveProfile}
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-800 px-4 py-3 font-semibold text-[#F5F1E6] hover:opacity-90 transition disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>

          <button
            onClick={signOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-3 font-semibold text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
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
