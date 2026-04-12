"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  BookOpen,
  PlusCircle,
  Calendar,
  FileText,
  Type,
  Tag,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "../../context/AuthContext";
import AuthGuard from "../../components/AuthGuard";

function CourseCreationContent() {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreateCourse = async () => {
    if (!user) {
      return;
    }

    if (!title.trim()) {
      alert("Please enter a course title.");
      return;
    }

    try {
      setCreating(true);

      const { data, error } = await supabase
        .from("courses")
        .insert({
          title,
          description,
          category,
          instructorId: user.id,
          startDate: startDate || null,
          endDate: endDate || null,
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      setTitle("");
      setDescription("");
      setCategory("");
      setStartDate("");
      setEndDate("");

      router.push(`/pages/course/${data.id}`);
    } catch (error: any) {
      console.error("Error creating course:", error);
      alert(error?.message || "Failed to create course.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F1E6] font-sans text-zinc-800">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/70 px-8 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/pages/home"
            className="flex items-center gap-2 transition-transform hover:scale-95"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
              <BookOpen size={20} />
            </div>
            <span className="hidden text-lg font-bold tracking-tight sm:block">
              CourseCanvas
            </span>
          </Link>

          <h1 className="ml-4 font-bold text-sm uppercase tracking-widest text-zinc-500 sm:mr-16">
            New Course
          </h1>

          <Link
            href="/pages/settings"
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 font-bold text-zinc-800 transition hover:bg-zinc-50"
          >
            Settings
            <Settings
              size={20}
              className="transition-transform hover:rotate-45"
            />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 py-16">
        <div className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white p-10 shadow-xl shadow-zinc-200/50">
          <div className="mb-10">
            <h2 className="mb-2 text-3xl font-black text-zinc-900">
              Create a Course
            </h2>
            <p className="text-zinc-500">
              Fill in the details below to launch your new curriculum.
            </p>
          </div>

          <form
            className="space-y-8"
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateCourse();
            }}
          >
            <div className="flex flex-col gap-2">
              <label className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <Type size={14} /> Course Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Advanced System Architecture"
                className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4 text-zinc-800 outline-none transition-all focus:border-zinc-800 focus:bg-white focus:ring-4 focus:ring-zinc-800/5"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <Tag size={14} /> Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Computer Science, Engineering, etc..."
                className="w-full resize-none rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4 text-zinc-800 outline-none transition-all focus:border-zinc-800 focus:bg-white focus:ring-4 focus:ring-zinc-800/5"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <FileText size={14} /> Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the course objectives..."
                rows={4}
                className="w-full resize-none rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4 text-zinc-800 outline-none transition-all focus:border-zinc-800 focus:bg-white focus:ring-4 focus:ring-zinc-800/5"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                  <Calendar size={14} /> Start Date
                </label>
                <input
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  type="date"
                  className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4 text-zinc-800 outline-none transition-all focus:border-zinc-800 focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                  <Calendar size={14} /> End Date
                </label>
                <input
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  type="date"
                  className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4 text-zinc-800 outline-none transition-all focus:border-zinc-800 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={creating}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-zinc-900 py-5 font-bold text-[#F5F1E6] shadow-lg shadow-zinc-900/20 transition-all hover:scale-[1.01] hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                <PlusCircle size={20} />
                {creating ? "Creating..." : "Create Course"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function CourseCreation() {
  return (
    <AuthGuard>
      <CourseCreationContent />
    </AuthGuard>
  );
}