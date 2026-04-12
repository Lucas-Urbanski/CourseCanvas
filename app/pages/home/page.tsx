"use client";

import Link from "next/link";
import { Settings, BookOpen, Search, PlusCircle, Loader2 } from "lucide-react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import CourseCard from "../../components/courseCard";
import { useAuth } from "../../context/AuthContext";
import AuthGuard from "../../components/AuthGuard";

type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  instructorId: string;
  startDate: string;
  endDate?: string;
  isCompleted?: boolean;
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
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(
    new Set(),
  );
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const computeCompletedIds = useCallback(
    async (rawCourses: any[], enrolledIds: string[]): Promise<Set<string>> => {
      if (enrolledIds.length === 0) return new Set();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Only consider courses whose end date has already passed
      const pastCourseIds = enrolledIds.filter((id) => {
        const raw = rawCourses.find((c) => c.id === id);
        if (!raw?.endDate) return false;
        const ended = new Date(raw.endDate);
        ended.setHours(0, 0, 0, 0);
        return ended <= today;
      });

      if (pastCourseIds.length === 0) return new Set();

      const [{ data: quizData }, { data: gradeData }] = await Promise.all([
        supabase
          .from("quizzes")
          .select("id, courseId")
          .eq("published", true)
          .in("courseId", pastCourseIds),
        supabase
          .from("grades")
          .select("quizId")
          .eq("studentId", user!.id)
          .in("courseId", pastCourseIds),
      ]);

      const gradedQuizIds = new Set(
        (gradeData ?? []).map((g: any) => g.quizId),
      );

      return new Set(
        pastCourseIds.filter((courseId) => {
          const quizIds = (quizData ?? [])
            .filter((q: any) => q.courseId === courseId)
            .map((q: any) => q.id);
          // A course with no published quizzes is not completable
          return (
            quizIds.length > 0 &&
            quizIds.every((id: string) => gradedQuizIds.has(id))
          );
        }),
      );
    },
    [supabase, user],
  );

  const fetchCourses = useCallback(async () => {
    if (!user?.id) return;
    setCoursesLoading(true);
    setCoursesError(null);

    try {
      const { data, error } = await supabase
        .from("courses")
        .select(
          `id, title, description, category, "instructorId", "startDate", "endDate", profiles:instructorId ("fullName")`,
        )
        .order('"createdAt"', { ascending: false });

      if (error) throw error;

      if (user.role !== "instructor") {
        const { data: enrollments, error: enrollError } = await supabase
          .from("enrollments")
          .select("courseId")
          .eq("studentId", user.id);

        if (enrollError) throw enrollError;

        const enrolledIds = (enrollments ?? []).map((e: any) => e.courseId);
        const completedIds = await computeCompletedIds(data ?? [], enrolledIds);

        setEnrolledCourseIds(new Set(enrolledIds));
        setCourses(
          (data ?? []).map((c: any) => ({
            id: c.id,
            title: c.title,
            description: c.description ?? "",
            category: c.category ?? "",
            instructor: c.profiles?.fullName ?? "Unknown",
            instructorId: c.instructorId ?? "",
            startDate: c.startDate ?? "",
            endDate: c.endDate ?? "",
            isCompleted: completedIds.has(c.id),
          })),
        );
      } else {
        setCourses(
          (data ?? []).map((c: any) => ({
            id: c.id,
            title: c.title,
            description: c.description ?? "",
            category: c.category ?? "",
            instructor: c.profiles?.fullName ?? "Unknown",
            instructorId: c.instructorId ?? "",
            startDate: c.startDate ?? "",
            endDate: c.endDate ?? "",
          })),
        );
      }
    } catch (err: any) {
      console.error("Failed to fetch courses:", err);
      setCoursesError(err?.message || "Failed to load courses.");
    } finally {
      setCoursesLoading(false);
    }
  }, [supabase, user, computeCompletedIds]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

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

      // Optimistically add to enrolled set, then recompute completion
      const newEnrolledIds = [...enrolledCourseIds, courseId];
      const completedIds = await computeCompletedIds(courses, newEnrolledIds);

      setEnrolledCourseIds(new Set(newEnrolledIds));
      setCourses((prev) =>
        prev.map((c) => ({ ...c, isCompleted: completedIds.has(c.id) })),
      );
      setActionSuccess("Successfully enrolled!");
    } catch (err: any) {
      console.error("Enrollment error:", err);
      setActionError(err.message || "Failed to enroll.");
    }
  };

  const handleUnenroll = async (courseId: string) => {
    if (!user) return;
    setActionError(null);
    setActionSuccess(null);
    try {
      const { error } = await supabase
        .from("enrollments")
        .delete()
        .eq("courseId", courseId)
        .eq("studentId", user.id);

      if (error) throw error;

      const newEnrolledIds = [...enrolledCourseIds].filter(
        (id) => id !== courseId,
      );
      const completedIds = await computeCompletedIds(courses, newEnrolledIds);

      setEnrolledCourseIds(new Set(newEnrolledIds));
      setCourses((prev) =>
        prev.map((c) => ({ ...c, isCompleted: completedIds.has(c.id) })),
      );
      setActionSuccess("Successfully unenrolled.");
    } catch (err: any) {
      console.error("Unenroll error:", err);
      setActionError(err.message || "Failed to unenroll.");
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!user) return;
    setActionError(null);
    setActionSuccess(null);

    const target = courses.find((c) => c.id === courseId);
    if (target && target.instructorId !== user.id) {
      setActionError("You can only delete your own courses.");
      return;
    }

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

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()),
  );

  const myCourses = isTeacher
    ? filteredCourses.filter((c) => c.instructorId === user?.id)
    : [];
  const otherCourses = isTeacher
    ? filteredCourses.filter((c) => c.instructorId !== user?.id)
    : [];
  const enrolledCourses = !isTeacher
    ? filteredCourses.filter((c) => enrolledCourseIds.has(c.id))
    : [];
  const browseCourses = !isTeacher
    ? filteredCourses.filter((c) => !enrolledCourseIds.has(c.id))
    : [];

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

          <div className="relative mx-4 max-w-md flex-1">
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
            <div className="hidden border-r border-zinc-200 pr-4 text-right sm:block">
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
          <div className="space-y-10">
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

            {isTeacher && (
              <>
                <section className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-zinc-900">
                      My Courses
                    </h2>
                    <span className="rounded-full bg-white/80 px-3 py-0.5 text-xs font-semibold text-zinc-600">
                      {myCourses.length}
                    </span>
                  </div>
                  <div className="rounded-3xl border border-zinc-300 bg-white/50 p-8 shadow-sm">
                    {myCourses.length === 0 ? (
                      <p className="py-10 text-center text-zinc-400">
                        {search
                          ? "No matching courses."
                          : "You haven't created any courses yet."}
                      </p>
                    ) : (
                      <CourseCard courses={myCourses} onDelete={handleDelete} />
                    )}
                  </div>
                </section>

                {(otherCourses.length > 0 || !search) && (
                  <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h2 className="text-xl font-bold text-zinc-900">
                        Other Courses
                      </h2>
                      <span className="rounded-full bg-white/80 px-3 py-0.5 text-xs font-semibold text-zinc-600">
                        {otherCourses.length}
                      </span>
                    </div>
                    <div className="rounded-3xl border border-zinc-300 bg-white/50 p-8 shadow-sm">
                      {otherCourses.length === 0 ? (
                        <p className="py-10 text-center text-zinc-400">
                          No other courses available.
                        </p>
                      ) : (
                        <CourseCard courses={otherCourses} />
                      )}
                    </div>
                  </section>
                )}
              </>
            )}

            {!isTeacher && (
              <>
                <section className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-zinc-900">
                      Enrolled Courses
                    </h2>
                    <span className="rounded-full bg-white/80 px-3 py-0.5 text-xs font-semibold text-zinc-600">
                      {enrolledCourses.length}
                    </span>
                  </div>
                  <div className="rounded-3xl border border-zinc-300 bg-white/50 p-8 shadow-sm">
                    {enrolledCourses.length === 0 ? (
                      <p className="py-10 text-center text-zinc-400">
                        {search
                          ? "No matching enrolled courses."
                          : "You haven't enrolled in any courses yet."}
                      </p>
                    ) : (
                      <CourseCard
                        courses={enrolledCourses}
                        onUnenroll={handleUnenroll}
                      />
                    )}
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-zinc-900">
                      Browse Courses
                    </h2>
                    <span className="rounded-full bg-white/80 px-3 py-0.5 text-xs font-semibold text-zinc-600">
                      {browseCourses.length}
                    </span>
                  </div>
                  <div className="rounded-3xl border border-zinc-300 bg-white/50 p-8 shadow-sm">
                    {browseCourses.length === 0 ? (
                      <p className="py-10 text-center text-zinc-400">
                        {search
                          ? "No matching courses."
                          : "No other courses available right now."}
                      </p>
                    ) : (
                      <CourseCard
                        courses={browseCourses}
                        onEnroll={handleEnroll}
                      />
                    )}
                  </div>
                </section>
              </>
            )}
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
