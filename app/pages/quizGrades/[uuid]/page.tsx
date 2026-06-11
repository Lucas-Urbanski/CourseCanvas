"use client";

import AuthGuard from "@/app/components/AuthGuard";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { BookOpen, Settings } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

type StudentGrade = {
  id: string;
  grade: number;
};

type Student = {
  id: string;
  fullName: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

function getGradeColor(grade: number) {
  if (grade >= 80) return "text-emerald-600";
  if (grade >= 60) return "text-amber-500";
  return "text-red-500";
}

function getBarColor(grade: number) {
  if (grade >= 80) return "bg-emerald-500";
  if (grade >= 60) return "bg-amber-400";
  return "bg-red-400";
}

function QuizGradesContent() {
  // Extract the quiz UUID from the URL parameters
  const params = useParams<{ uuid: string | string[] }>();
  const uuid = Array.isArray(params.uuid) ? params.uuid[0] : params.uuid;

  // Initialize Supabase client using useMemo to prevent reinitialization on every render
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  useEffect(() => {
    if (!uuid) return;

    const fetchData = async () => {
      try {
        const { data: quizData, error: quizError } = await supabase
          .from("quizzes")
          .select("courseId")
          .eq("id", uuid)
          .single();
        if (quizError) throw quizError;

        const courseId = quizData.courseId;
        const [studentGradeRes, studentRes] = await Promise.all([
          supabase.from("grades").select(`score, studentId`).eq("quizId", uuid),
          supabase
            .from("enrollments")
            .select(`student:studentId (id, "fullName")`)
            .eq("courseId", courseId),
        ]);
        if (studentGradeRes.error) throw studentGradeRes.error;
        if (studentRes.error) throw studentRes.error;

        setGrades(
          (studentGradeRes.data ?? []).map((g: unknown) => ({
            id: String((g as { studentId: unknown }).studentId),
            grade: Number((g as { score: unknown }).score),
          })),
        );

        setStudents(
          (studentRes.data ?? [])
            .map((e: unknown) => (e as { student: Student | null }).student)
            .filter((s): s is Student => s !== null),
        );
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    };

    fetchData();
  }, [uuid, supabase]);

  const gradeValues = students.map(
    (s) => grades.find((g) => g.id === s.id)?.grade ?? 0,
  );
  const average =
    gradeValues.length > 0
      ? Math.round(gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length)
      : null;
  const highest = gradeValues.length > 0 ? Math.max(...gradeValues) : null;

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F1E6] text-zinc-800">
      {/* Navigation Header */}
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

          <h1 className="ml-4 text-xs font-semibold uppercase tracking-widest text-zinc-400 sm:mr-16">
            Quiz Grades
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

      <main className="mx-auto w-full max-w-3xl space-y-6 px-6 py-10">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Students", value: students.length || "—" },
            {
              label: "Class average",
              value: average != null ? `${average}%` : "—",
            },
            {
              label: "Highest score",
              value: highest != null ? `${highest}%` : "—",
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl bg-white border border-zinc-200 px-5 py-4"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1">
                {label}
              </p>
              <p className="text-2xl font-semibold text-zinc-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Grades Table */}
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_80px_56px] items-center gap-4 px-6 py-3 border-b border-zinc-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Student
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 text-right">
              Progress
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 text-right">
              Score
            </span>
          </div>

          {/* Student rows */}
          {students.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-zinc-400">
              No students enrolled.
            </div>
          ) : (
            students.map((s) => {
              const grade = grades.find((g) => g.id === s.id)?.grade ?? 0;
              return (
                <div
                  key={s.id}
                  className="grid grid-cols-[1fr_80px_56px] items-center gap-4 px-6 py-3 border-b border-zinc-100 last:border-none hover:bg-zinc-50 transition-colors"
                >
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-semibold uppercase text-white">
                      {getInitials(s.fullName)}
                    </div>
                    <span className="capitalize text-sm font-bold text-zinc-900">
                      {s.fullName}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getBarColor(grade)} transition-all`}
                      style={{ width: `${grade}%` }}
                    />
                  </div>

                  {/* Score */}
                  <span
                    className={`text-sm font-semibold text-right ${getGradeColor(grade)}`}
                  >
                    {grade}%
                  </span>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

export default function QuizGrades() {
  return (
    <AuthGuard>
      <QuizGradesContent />
    </AuthGuard>
  );
}