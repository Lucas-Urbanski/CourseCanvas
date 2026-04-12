"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, CheckCircle2, Circle } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "../../../context/AuthContext";
import AuthGuard from "../../../components/AuthGuard";

type QuestionChoice = "A" | "B" | "C" | "D";

type QuizQuestion = {
  id: number;
  prompt: string;
  A: string;
  B: string;
  C: string;
  D: string;
  correctAnswer: QuestionChoice;
};

type Quiz = {
  id: string;
  courseId: string;
  title: string;
  questions: QuizQuestion[];
};

function QuizContent() {
  const params = useParams<{ uuid: string | string[] }>();
  const { user } = useAuth();
  const router = useRouter();
  const uuid = Array.isArray(params.uuid) ? params.uuid[0] : params.uuid;

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("quizzes")
          .select(`id, title, "courseId", questions`)
          .eq("id", uuid)
          .single();

        if (error) throw error;
        setQuiz(data as Quiz);
      } catch (error) {
        console.error("Error fetching quiz:", error);
        setQuiz(null);
      } finally {
        setLoading(false);
      }
    };

    if (uuid) fetchData();
  }, [uuid, supabase]);

  // Load saved answers when quiz data arrives
  useEffect(() => {
    if (!uuid) return;
    const saved = localStorage.getItem(`quiz-answers-${uuid}`);
    if (saved) {
      try {
        setAnswers(JSON.parse(saved));
      } catch {
        localStorage.removeItem(`quiz-answers-${uuid}`);
      }
    }
  }, [uuid]);

  // Save answers to local storage
  useEffect(() => {
    if (!uuid || Object.keys(answers).length === 0) return;
    localStorage.setItem(`quiz-answers-${uuid}`, JSON.stringify(answers));
  }, [answers, uuid]);

  let grade = 0;
  const calculateGrade = () => {
    let numberOfCorrectAnswers = 0;
    quiz?.questions?.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        numberOfCorrectAnswers++;
      }
    });
    if (quiz?.questions?.length === null) return;
    grade = (numberOfCorrectAnswers / (quiz?.questions?.length ?? 0)) * 100;
    grade = Math.round(grade * 100) / 100;
  };

  const handleGrading = async () => {
    calculateGrade();
    try {
      const { error } = await supabase.from("grades").insert({
        studentId: user?.id,
        quizId: quiz?.id,
        courseId: quiz?.courseId,
        score: grade,
      });
      if (error) throw error;
    } catch (error: any) {
      alert(error.message ?? "Error creating grade");
      console.error("Error creating grade:", error);
    }
  };

  const handleSelect = (qId: number, letter: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: letter }));
  };

  const scrollToQuestion = (id: number) => {
    document
      .getElementById(`question-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F1E6] text-zinc-500">
        Loading quiz...
      </main>
    );
  }

  if (!quiz) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F1E6] text-zinc-500">
        Quiz not found.
      </main>
    );
  }

  const questions = quiz.questions ?? [];

  return (
    <main className="min-h-screen bg-[#F5F1E6] text-zinc-800 flex">
      {/* Sidebar */}
      <aside className="sticky top-0 z-20 flex h-screen w-20 flex-col items-center gap-6 border-r border-zinc-200 bg-white/80 py-10 backdrop-blur-md md:w-24">
        {questions.map((q, index) => {
          const isAnswered = !!answers[q.id];
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => scrollToQuestion(q.id)}
              className={`group relative flex h-12 w-12 items-center justify-center rounded-xl border text-xs font-bold shadow-sm transition-all ${
                isAnswered
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-400 hover:border-zinc-800 hover:text-zinc-800"
              }`}
            >
              Q{index + 1}
              <div className="absolute -right-1 -top-1">
                {isAnswered ? (
                  <div className="rounded-full border-2 border-white bg-emerald-500 p-0.5 shadow-sm">
                    <Check className="text-white" size={8} strokeWidth={4} />
                  </div>
                ) : (
                  <div className="rounded-full border-2 border-white bg-zinc-200 p-0.5 shadow-sm">
                    <Circle className="fill-zinc-400 text-zinc-400" size={8} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </aside>

      {/* Questions */}
      <div className="flex flex-1 flex-col items-center px-6 py-12 md:px-12">
        <div className="w-full max-w-4xl space-y-12">
          {questions.map((q, index) => (
            <section
              id={`question-${q.id}`}
              key={q.id}
              className={`rounded-[2.5rem] border bg-white p-8 shadow-sm transition-all duration-500 md:p-12 ${
                answers[q.id]
                  ? "border-zinc-300 opacity-100"
                  : "border-zinc-200 opacity-90"
              }`}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-zinc-500">
                    Multiple Choice
                  </span>
                  <span className="text-xs font-bold uppercase tracking-tighter text-zinc-400">
                    Question {index + 1}
                  </span>
                </div>
                {answers[q.id] && (
                  <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-emerald-600">
                    <Check size={12} strokeWidth={3} />
                    Answered
                  </span>
                )}
              </div>

              <h2 className="mb-10 text-2xl font-bold leading-tight text-zinc-900 md:text-3xl">
                {q.prompt}
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {(["A", "B", "C", "D"] as const).map((letter) => {
                  const isSelected = answers[q.id] === letter;
                  return (
                    <button
                      key={letter}
                      onClick={() => handleSelect(q.id, letter)}
                      className={`flex items-start text-left gap-4 p-6 rounded-2xl border transition-all active:scale-95 group ${
                        isSelected
                          ? "border-zinc-900 bg-zinc-900 text-white shadow-md shadow-zinc-200"
                          : "border-zinc-100 bg-zinc-50/50 hover:border-zinc-300 hover:bg-white"
                      }`}
                    >
                      <span
                        className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg font-bold text-xs transition-colors ${
                          isSelected
                            ? "bg-white text-zinc-900"
                            : "bg-white border border-zinc-200 text-zinc-400 group-hover:border-zinc-800 group-hover:text-zinc-800"
                        }`}
                      >
                        {letter}
                      </span>
                      <span
                        className={`font-medium pt-1 leading-relaxed ${isSelected ? "text-zinc-100" : "text-zinc-700"}`}
                      >
                        {q[letter]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

          <div className="flex flex-col items-center gap-4 pb-32 pt-6">
            <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">
              {Object.keys(answers).length} of {questions.length} Answered
            </p>
            <button
              type="button"
              onClick={() => {
                if (Object.keys(answers).length !== questions.length) return;
                handleGrading();
                localStorage.removeItem(`quiz-answers-${uuid}`);
                router.push(`/pages/course/${quiz.courseId}`);
              }}
              disabled={Object.keys(answers).length !== questions.length}
              className={`group flex items-center gap-3 rounded-2xl px-12 py-5 font-bold transition-all shadow-xl ${
                Object.keys(answers).length === questions.length
                  ? "bg-zinc-900 text-[#F5F1E6] hover:bg-black hover:scale-[1.02]"
                  : "cursor-not-allowed bg-zinc-200 text-zinc-400"
              }`}
            >
              Submit Quiz
              <CheckCircle2 size={20} />
            </button>
            {quiz?.questions?.length === null && (
              <p className="text-red-500">
                Quiz not found, go back to the course page and reenter the quiz.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Quiz() {
  return (
    <AuthGuard>
      <QuizContent />
    </AuthGuard>
  );
}
