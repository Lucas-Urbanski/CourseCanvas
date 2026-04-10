"use client";

import Link from "next/link";
import { Settings, BookOpen, Search, PlusCircle, Loader2 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import CourseCard from "../../components/courseCard";
import { useAuth } from "../../context/AuthContext";
import AuthGuard from "../../components/AuthGuard";

type Course = {
  id: string;
  title: string;
  description: string;
  instructor: string;
  startDate: string;
  endDate?: string;
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
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const handleEnroll = async (courseId: string) => {
    if (!user) return;
    setActionError(null);
    setActionSuccess(null);
    try {
      const { error } = await supabase
        .from("enrollments")
        .insert([{ courseId, studentId: user.id }]);

      if (error) {
        if (error.code === "23505") {
          setActionError("You are already enrolled in this course.");
          return;
        }
        throw error;
      }
      setActionSuccess("Successfully enrolled!");
    } catch (err: any) {
      console.error("Enrollment error:", err);
      setActionError(err.message || "Failed to enroll.");
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!user) return;
    setActionError(null);
    setActionSuccess(null);
    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);
      if (error) throw error;
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err: any) {
      console.error("Delete error:", err);
      setActionError(err.message || "Failed to delete course.");
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      setCoursesError(null);
      try {
        const { data, error } = await supabase
          .from("courses")
          .select(
            `id, title, description, "startDate", "endDate", profiles:instructorId ("fullName")`,
          )
          .order('"createdAt"', { ascending: false });

        if (error) throw error;

        setCourses(
          data?.map((course: any) => ({
            id: course.id,
            title: course.title,
            description: course.description ?? "",
            instructor: course.profiles?.fullName ?? "Unknown",
            startDate: course.startDate ?? "",
            endDate: course.endDate ?? "",
          })) ?? [],
        );
      } catch (err: any) {
        console.error("Failed to fetch courses:", err);
        setCoursesError(err?.message || "Failed to load courses.");
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, [supabase]);

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#F5F1E6] text-zinc-800">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 px-8 py-4 backdrop-blur-lg">
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

          <div className="relative mx-4 flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search Courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-10 py-2 text-zinc-800 outline-none transition focus:border-zinc-800"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right border-r border-zinc-200 pr-4">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Signed in as
              </p>
              <p className="text-sm font-semibold text-zinc-800">
                {user?.name || "User"}
              </p>
            </div>
            <Link
              href="/pages/settings"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 bg-white shadow-sm transition-colors hover:bg-zinc-50"
            >
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
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="flex items-center gap-3 text-zinc-500">
              <Loader2 className="animate-spin" size={20} />
              Loading courses...
            </div>
          </div>
        ) : coursesError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            {coursesError}
          </div>
        ) : (
          <div className="space-y-6">
            {isTeacher && (
              <div className="flex items-center justify-center">
                <Link
                  href="/pages/courseCreation"
                  className="flex items-center gap-2 rounded-xl bg-zinc-800 px-6 py-3 font-semibold text-[#F5F1E6] transition hover:opacity-90"
                >
                  <PlusCircle size={18} />
                  Create Course
                </Link>
              </div>
            )}

            {actionError && (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {actionError}
              </div>
            )}
            {actionSuccess && (
              <div className="rounded-3xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                {actionSuccess}
              </div>
            )}

            <div className="rounded-3xl border border-zinc-300 bg-white/50 p-8 shadow-sm">
              {filteredCourses.length === 0 ? (
                <p className="py-16 text-center text-zinc-500">
                  {search
                    ? "No courses match your search."
                    : "No courses available yet."}
                </p>
              ) : isTeacher ? (
                <CourseCard courses={filteredCourses} onDelete={handleDelete} />
              ) : (
                <CourseCard courses={filteredCourses} onEnroll={handleEnroll} />
              )}
            </div>
          </div>
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
