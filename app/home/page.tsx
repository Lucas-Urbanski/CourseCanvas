"use client";

import Link from "next/link";
import { Settings, BookOpen, Search, PlusCircle, Loader2 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import CourseCard from "../components/courseCard";
import { useAuth } from "../context/AuthContext";
import AuthGuard from "../components/AuthGuard";

type Course = {
  id: string;
  title: string;
  description: string;
  instructor: string;
  startDate: string;
};

function HomeContent() {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  const { user, loading } = useAuth();
  const isTeacher = user?.role === "instructor";

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      const { data, error } = await supabase.from("courses").select(`
        id,
        title,
        description,
        "startDate",
        profiles!instructorId (
          "fullName"
        )
      `);

      if (error) {
        setCoursesError(error.message);
      } else {
        setCourses(
          (data || []).map((c: any) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            instructor: c.profiles?.fullName || "Unknown Instructor",
            startDate: c.startDate,
          })),
        );
      }
      setCoursesLoading(false);
    };

    fetchCourses();
  }, [supabase]);

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#F5F1E6]">
      <header className="sticky top-0 z-10 border-b border-zinc-300 bg-white/80 backdrop-blur-md px-8 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/home"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-[#F5F1E6]">
              <BookOpen size={22} />
            </div>
            <span className="hidden text-xl font-bold text-zinc-800 sm:block">
              CourseCanvas
            </span>
          </Link>

          <div className="relative mx-4 flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-10 py-2 text-zinc-800 outline-none transition focus:border-zinc-800"
            />
          </div>

          <div className="flex items-center gap-5">
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
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-8">
        {loading || coursesLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-zinc-800" />
            <p className="font-medium">Loading your dashboard...</p>
          </div>
        ) : coursesError ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500">
            <p className="font-medium">
              Failed to load courses: {coursesError}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-center">
              {isTeacher && (
                <Link
                  href="/courseCreation"
                  className="flex items-center gap-2 rounded-xl bg-zinc-800 px-6 py-3 font-semibold text-[#F5F1E6] transition hover:opacity-90"
                >
                  <PlusCircle size={18} />
                  Create Course
                </Link>
              )}
            </div>
            <div className="rounded-3xl border border-zinc-300 bg-white/50 p-8 shadow-sm">
              {filteredCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-6">
                  <p className="text-center text-zinc-500">
                    {search
                      ? "No courses match your search."
                      : "No courses available yet."}
                  </p>

                  {/* Temporary course for testing */}
                  <Link
                    href="/course"
                    className="group relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-300 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="absolute top-0 right-0 p-4">
                      <div className="rounded-full bg-zinc-800 p-2 text-[#F5F1E6] opacity-0 transition-opacity group-hover:opacity-100">
                        <BookOpen size={16} />
                      </div>
                    </div>

                    <div className="mb-4 inline-block rounded-lg bg-[#F5F1E6] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-800 border border-zinc-200">
                      Demo Course
                    </div>

                    <h3 className="text-2xl font-bold text-zinc-800 group-hover:text-black transition-colors">
                      Intro to CourseCanvas
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                      Learn how to navigate your new dashboard, manage quizzes,
                      and track your progress.
                    </p>

                    <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-6">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-500">
                          CC
                        </div>
                        <span className="text-xs font-semibold text-zinc-700">
                          CourseCanvas Team
                        </span>
                      </div>
                      <span className="text-xs font-bold text-zinc-800 underline underline-offset-4 decoration-zinc-300 group-hover:decoration-zinc-800 transition-all">
                        Enter Course
                      </span>
                    </div>
                  </Link>
                </div>
              ) : (
                <CourseCard courses={filteredCourses} />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}
