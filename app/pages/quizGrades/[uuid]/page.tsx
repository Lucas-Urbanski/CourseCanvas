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
  const [quizTitle, setQuizTitle] = useState("Quiz Grades");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Data Fetching Effect
  useEffect(() => {
    if (!uuid) return;

    const fetchData = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        // First, get the quiz so we can find which course it belongs to
        const { data: quizData, error: quizError } = await supabase
          .from("quizzes")
          .select(`id, title, "courseId"`)
          .eq("id", uuid)
          .single();

        if (quizError) throw quizError;

        const courseId = quizData.courseId;

        if (!courseId) {
          throw new Error("This quiz does not have a courseId.");
        }

        const [studentGradeRes, studentRes] = await Promise.all([
          supabase
            .from("grades")
            .select(`score, "studentId"`)
            .eq("quizId", uuid)
            .eq("courseId", courseId),

          supabase
            .from("enrollments")
            .select(`student:studentId (id, "fullName")`)
            .eq("courseId", courseId),
        ]);

        if (studentGradeRes.error) throw studentGradeRes.error;
        if (studentRes.error) throw studentRes.error;

        setQuizTitle(quizData.title ?? "Quiz Grades");

        setGrades(
          (studentGradeRes.data ?? []).map((g: any) => ({
            id: String(g.studentId),
            grade: Number(g.score),
          })),
        );

        setStudents(
          (studentRes.data ?? [])
            .map((e: any) => e.student as Student | null)
            .filter((s): s is Student => s !== null)
            .map((s) => ({
              id: String(s.id),
              fullName: s.fullName,
            })),
        );
      } catch (err: any) {
        console.error("Fetch failed:", err);
        setErrorMessage(err.message || "Failed to load quiz grades.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uuid, supabase]);

  const getGradeForStudent = (studentId: string) => {
    return grades.find((grade) => grade.id === studentId);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1E6]">
        <p className="animate-pulse font-bold text-zinc-500">
          Loading grades...
        </p>
      </div>
    );
  }

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

          <h1 className="ml-4 text-sm font-bold uppercase tracking-widest text-zinc-500 sm:mr-16">
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

      <main className="mx-auto w-full max-w-4xl space-y-8 px-6 py-12">
        <div className="w-full rounded-3xl border border-zinc-200 bg-white p-10 shadow-xl shadow-zinc-200/50">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-zinc-900">{quizTitle}</h2>
            <p className="mt-2 text-sm text-zinc-500">
              View all student grades for this quiz.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 border-b border-zinc-200 pb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">
            <h1>Names</h1>
            <h1>Grades</h1>
          </div>

          <div className="mt-4 space-y-3">
            {students.length === 0 ? (
              <p className="py-8 text-center text-zinc-400">
                No students are enrolled in this course.
              </p>
            ) : (
              students.map((s) => {
                const match = getGradeForStudent(s.id);

                return (
                  <div
                    key={s.id}
                    className="grid grid-cols-2 items-center gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-sm font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold uppercase text-white">
                        {s.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      {s.fullName}
                    </div>

                    <div>
                      {match ? (
                        <span className="font-bold text-green-700">
                          {match.grade}%
                        </span>
                      ) : (
                        <span className="text-zinc-400">Not submitted</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
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