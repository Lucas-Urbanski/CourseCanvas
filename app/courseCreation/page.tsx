"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Settings,
  BookOpen,
  PlusCircle,
  Calendar,
  FileText,
  Type,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "../context/AuthContext";
import AuthGuard from "../components/AuthGuard";

function CourseCreationContent() {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

    const handleCreateCourse = async () => {
      const { error } = await supabase
        .from("courses")
        .insert({
          "title": title,
          "description": description,
          "id": user?.id,
          "startDate": startDate,
          "endDate": endDate,
        });


        setDescription("")
        setTitle("")
        setStartDate("")
        setEndDate("")

      if (error) {
        console.error("Error creating course:", error);
      }
    };


  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#F5F1E6] text-zinc-800">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/70 backdrop-blur-md px-8 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/home"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-[#F5F1E6]">
              <BookOpen size={20} />
            </div>
            <span className="hidden text-lg font-bold tracking-tight sm:block">
              CourseCanvas
            </span>
          </Link>

          <h1 className="font-bold text-sm uppercase tracking-widest text-zinc-500 ml-4 sm:mr-16">
            New Course
          </h1>

          <Link
            href="/settings"
            className="flex h-10 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-zinc-800 font-bold transition hover:bg-zinc-50 gap-2"
          >
            Settings
            <Settings
              size={20}
              className="transition-transform hover:rotate-45"
            />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-16 px-6">
        <div className="w-full max-w-2xl bg-white rounded-3xl border border-zinc-200 p-10 shadow-xl shadow-zinc-200/50">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-zinc-900 mb-2">
              Create a Course
            </h2>
            <p className="text-zinc-500">
              Fill in the details below to launch your new curriculum.
            </p>
          </div>

          <form className="space-y-8">
            {/* Course Title */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
                <Type size={14} /> Course Title
              </label>
              <input
                type="text"
                placeholder="e.g. Advanced System Architecture"
                onBlur={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4 text-zinc-800 outline-none transition-all focus:border-zinc-800 focus:bg-white focus:ring-4 focus:ring-zinc-800/5"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
                <FileText size={14} /> Description
              </label>
              <textarea
                placeholder="Briefly describe the course objectives..."
                onBlur={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4 text-zinc-800 outline-none transition-all focus:border-zinc-800 focus:bg-white focus:ring-4 focus:ring-zinc-800/5 resize-none"
              />
            </div>

            {/* Date Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
                  <Calendar size={14} /> Start Date
                </label>
                <input
                  onBlur={(e) => setStartDate(e.target.value)}
                  type="date"
                  className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4 text-zinc-800 outline-none transition-all focus:border-zinc-800 focus:bg-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
                  <Calendar size={14} /> End Date
                </label>
                <input
                onBlur={(e) => setEndDate(e.target.value)}
                  type="date"
                  className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4 text-zinc-800 outline-none transition-all focus:border-zinc-800 focus:bg-white"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <Link
                href="/course"
                onClick={() => handleCreateCourse()}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-zinc-900 py-5 font-bold text-[#F5F1E6] transition-all hover:bg-black hover:scale-[1.01] shadow-lg shadow-zinc-900/20"
              >
                <PlusCircle size={20} />
                Create Course
              </Link>
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
