"use client";

import Link from "next/link";
import { BookOpen, LogIn } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    router.push("/home");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F1E6] px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-zinc-300 bg-white/80 p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-[#F5F1E6]">
            <BookOpen size={28} />
          </div>
          <h1 className="text-3xl font-bold text-zinc-800">Sign In</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Welcome back to CourseCanvas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-800 outline-none transition focus:border-zinc-800"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-800 outline-none transition focus:border-zinc-800"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-800 px-4 py-3 font-semibold text-[#F5F1E6] transition hover:opacity-90"
          >
            <LogIn size={18} />
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-zinc-800 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}