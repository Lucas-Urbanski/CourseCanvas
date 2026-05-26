"use client";
import AuthGuard from "@/app/components/AuthGuard";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Plus,
  Settings,
  Trash2,
  Type,
} from "lucide-react";
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

    // Extract the course UUID from the URL parameters
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

    // Data Fetching Effect
    useEffect(() => {
        if (!uuid) return;

        const fetchData = async () => {
            try {
                const [studentGradeRes] =
                    await Promise.all([
                        supabase
                            .from("grades")
                            .select(`"score", studentId`)
                            .eq("quizId", uuid),
                    ]);
                // Error handling for all requests
                if (studentGradeRes.error) throw studentGradeRes.error;
                const [studentRes] =
                    await Promise.all([
                        supabase
                            .from("enrollments")
                            .select(`student:studentId (id, "fullName")`)
                            .eq("courseId", ),
                    ]);
                if (studentRes.error) throw studentRes.error;

                setGrades(
                    (studentGradeRes.data ?? []).map((g: any) => ({
                        id: String(g.id),
                        grade: Number(g.score),
                    })),
                );

                setStudents(
                    (studentRes.data ?? []).map((e: any) => 
                        e.student as Student | null)
                    .filter((s): s is Student => s !== null),
                );
            } catch (err) {
                console.error("Fetch failed:", err);
            }
        };

      fetchData();
    }, [uuid, supabase])

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
      <main className="mx-auto w-full max-w-3xl space-y-8 px-6 py-12">
        <div className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white p-10 shadow-xl shadow-zinc-200/50 flex flex-row justify-around">
            <div>
                <h1>Names</h1>
                {students.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-sm font-medium"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold uppercase text-white">
                      {s.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    {s.fullName}
                  </div>  
                ))}
            </div>
            <div className="h-screen border-l border-gray-400">
            </div>
            <div>
                <h1>Grades</h1>
                {students.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-sm font-medium"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold uppercase text-white">
                      {grades.some(grade => grade.id === s.id) ? (
                        <div> 
                            {grades.map((g) => (
                                <>
                                {g.id == s.id &&
                                <div>{g.grade}%</div>}
                                </>
                            ))}
                        </div>
                      ) : (
                        <div>0%</div>
                      )}
                    </div>
                  </div>  
                ))}
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
