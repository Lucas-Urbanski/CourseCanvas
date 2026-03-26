"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function Settings() {
  // Initialize Supabase client once using useMemo
  const supabase = useMemo(() => createClientComponentClient(), []);
  const router = useRouter();

  // Store authenticated user and loading state
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form state for profile and password fields
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Fetch user and profile data on component mount
    const getData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        // Fetch profile data from "profiles" table
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, bio, avatar_url")
          .eq("id", user.id)
          .single();

        if (profile) {
          // Populate form fields with existing profile data
          setUsername(profile.username || "");
          setNewUsername(profile.username || "");
          setBio(profile.bio || "");
          setAvatarUrl(profile.avatar_url || "");
        }
      } else {
        // Redirect to home if no user is logged in
        router.push("/");
      }

      setLoading(false);
    };

    getData();
  }, [supabase, router]);

  async function saveProfile() {
    // Handle password update if user entered a new one
    if (newPassword && newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ username: newUsername, bio, avatar_url: avatarUrl })
      .eq("id", user.id);

    if (profileError) {
      alert(profileError.message);
      return;
    }

    if (newPassword) {
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (authError) {
        alert("Password error: " + authError.message);
        return;
      }

      // Clear password fields after successful update
      setNewPassword("");
      setConfirmPassword("");
    }

    // Update displayed username and notify user
    setUsername(newUsername);
    alert("Profile updated successfully!");
  }

  async function logout() {
    // Sign out user and redirect to home page
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F5F1E6] p-8 flex flex-col items-center">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-6">
          <button
            onClick={() =>
              setAvatarUrl(`https://i.pravatar.cc/300?u=${user?.id}`)
            }
            className="relative w-24 h-24 mb-4 rounded-full overflow-hidden border-4 border-white shadow-md hover:opacity-80 transition"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {username ? username.slice(0, 2).toUpperCase() : "??"}
              </div>
            )}
          </button>

          <h1 className="text-2xl font-bold text-gray-800">
            {username || "New User"}
          </h1>
        </div>

        {/* Form Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
          </div>

          {/* Bio Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>

          {/* Password Section */}
          <div className="pt-4 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password (Leave blank to keep current)
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Save & Logout */}
          <button
            onClick={saveProfile}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Save Changes
          </button>

          <button
            onClick={logout}
            className="w-full bg-gray-100 text-red-500 font-bold py-3 rounded-lg hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
