"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, LogOut, Save, Camera } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

// Using the newer SSR client to match your SignUp page
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function Settings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
 
  // Form state - matched exactly to your SQL column names
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
 
  useEffect(() => {
    const getData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
 
      if (user) {
        setUser(user);
 
        // Matching your SQL: fullName, bio, avatarUrl
        const { data: profile } = await supabase
          .from("profiles")
          .select("fullName, bio, avatarUrl")
          .eq("id", user.id)
          .single();
 
        if (profile) {
          setFullName(profile.fullName || "");
          setBio(profile.bio || "");
          setAvatarUrl(profile.avatarUrl || "");
        }
      } 
      else {
        router.push("/signin");
      }
      setLoading(false);
    };
 
    getData();
  }, [supabase, router]);
 
  async function saveProfile() {
    if (newPassword && newPassword.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
 
    setLoading(true);
 
    // Update Database Profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        fullName: fullName,
        bio: bio,
        avatarUrl: avatarUrl,
      })
      .eq("id", user.id);
 
    if (profileError) {
      alert(profileError.message);
      setLoading(false);
      return;
    }
 
    // Update Auth Password if provided
    if (newPassword) {
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });
 
      if (authError) {
        alert("Password error: " + authError.message);
        setLoading(false);
        return;
      }
      setNewPassword("");
      setConfirmPassword("");
    }
 
    alert("Profile updated successfully!");
    setLoading(false);
  }
 
  async function logout() {
    await supabase.auth.signOut();
    router.push("/signin");
  }
 
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1E6]">
        Loading settings...
      </div>
    );
 
  return (
    <main className="min-h-screen bg-[#F5F1E6] px-6 py-12">
      <div className="mx-auto max-w-md rounded-3xl border border-zinc-300 bg-white/80 p-8 shadow-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-[#F5F1E6]">
            <BookOpen size={28} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-800">Account Settings</h1>
        </div>
 
        {/* Avatar Section */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative group">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-zinc-200 shadow-md">
              {avatarUrl ? (
                <Image
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
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`,
                )
              }
              className="absolute bottom-0 right-0 rounded-full bg-zinc-800 p-2 text-white shadow-lg hover:scale-110 transition"
            >
              <Camera size={16} />
            </button>
          </div>
          <p className="mt-2 text-sm font-cursive text-zinc-600">{fullName}</p>
        </div>
 
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Full Name
            </label>
            <input
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-800 outline-none focus:border-zinc-800"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
 
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Bio
            </label>
            <textarea
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-800 outline-none focus:border-zinc-800"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>
 
          <div className="pt-4 border-t border-zinc-200">
            <label className="mb-2 block text-sm font-medium text-zinc-700 text-zinc-400">
              Change Password
            </label>
            <input
              type="password"
              placeholder="New password"
              className="mb-3 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-800 outline-none focus:border-zinc-800"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-800 outline-none focus:border-zinc-800"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
 
          <button
            onClick={saveProfile}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-800 px-4 py-3 font-semibold text-[#F5F1E6] hover:opacity-90 transition"
          >
            <Save size={18} />
            Save Changes
          </button>
 
          <button
            onClick={logout}
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