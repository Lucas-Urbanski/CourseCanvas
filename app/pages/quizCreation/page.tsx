"use client";

import Link from "next/link";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Plus,
  Save,
  Settings,
  Trash2,
  Type,
  ArrowLeft,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState, useEffect, useCallback } from "react";
import AuthGuard from "../../components/AuthGuard";
import { useAuth } from "../../context/AuthContext";

// Types
type QuestionChoice = "A" | "B" | "C" | "D";

type Question = {
  id: number;
  prompt: string;
  A: string;
  B: string;
  C: string;
  D: string;
};

type QuestionWithAnswer = Question & { correctAnswer: QuestionChoice | null };

// Helpers
const CHOICES: QuestionChoice[] = ["A", "B", "C", "D"];

function makeQuestion(id: number): Question {
  return { id, prompt: "", A: "", B: "", C: "", D: "" };
}

// Clamp a number between [min, max].
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// Component
function QuizCreationContent() {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const courseId = searchParams.get("courseId");
  const quizId = searchParams.get("quizId");
  const isEditMode = !!quizId;

  // State
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [questions, setQuestions] = useState<Question[]>([makeQuestion(1)]);
  const [answers, setAnswers] = useState<Record<number, QuestionChoice>>({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);

  // Load existing quiz in edit mode
  useEffect(() => {
    if (!isEditMode || !courseId || !quizId || !user?.id) return;

    const fetchQuiz = async () => {
      setIsFetching(true);
      setError("");

      try {
        const { data, error: fetchError } = await supabase
          .from("quizzes")
          .select(`id, title, "dueDate", questions, "courseId"`)
          .eq("id", quizId)
          .single();

        if (fetchError) throw fetchError;

        // Ensure the quiz belongs to the current user's course.
        // NOTE: adjust this check to match your actual authorization model.
        if (data.courseId !== courseId) {
          setError("You are not authorized to edit this quiz.");
          return;
        }

        const fetchedQuestions: QuestionWithAnswer[] = data.questions ?? [
          makeQuestion(1),
        ];

        // Restore questions and answers from stored data in one pass.
        const restoredAnswers: Record<number, QuestionChoice> = {};
        const strippedQuestions: Question[] = fetchedQuestions.map((q) => {
          if (q.correctAnswer) restoredAnswers[q.id] = q.correctAnswer;
          const rest = { ...q } as { correctAnswer?: QuestionChoice };
          delete rest.correctAnswer;
          return rest as Question;
        });

        setTitle(data.title ?? "");
        setDueDate(data.dueDate ?? "");
        setQuestions(strippedQuestions);
        setAnswers(restoredAnswers);
      } catch (err: unknown) {
        console.error("Error loading quiz:", err);
        setError((err as Error)?.message ?? "Failed to load quiz.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchQuiz();
  }, [courseId, quizId, user?.id, isEditMode, supabase]);

  // Question mutation helpers
  const handleUpdateQuestion = useCallback(
    (questionId: number, field: keyof Omit<Question, "id">, value: string) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, [field]: value } : q)),
      );
    },
    [],
  );

  const handleUpdateAnswer = useCallback(
    (questionId: number, choice: QuestionChoice) => {
      setAnswers((prev) => ({ ...prev, [questionId]: choice }));
    },
    [],
  );

  const handleDeleteQuestion = useCallback((questionId: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }, []);

  /**
   * Resize the question list via the quantity input.
   * Answers for removed questions are cleaned up in a separate setState call
   * to avoid nesting state updaters.
   */
  const handleQuantityChange = useCallback((rawValue: number) => {
    const newCount = clamp(rawValue, 1, 50);

    setQuestions((prev) => {
      if (newCount === prev.length) return prev;

      if (newCount > prev.length) {
        const maxId = prev.length > 0 ? Math.max(...prev.map((q) => q.id)) : 0;
        const added = Array.from({ length: newCount - prev.length }, (_, i) =>
          makeQuestion(maxId + i + 1),
        );
        return [...prev, ...added];
      }

      // Shrinking - derive the ids that survive so we can prune answers.
      const kept = prev.slice(0, newCount);
      const keptIds = new Set(kept.map((q) => q.id));

      // Prune stale answers outside the updater to avoid nesting.
      setAnswers(
        (prevAnswers) =>
          Object.fromEntries(
            Object.entries(prevAnswers).filter(([key]) =>
              keptIds.has(Number(key)),
            ),
          ) as Record<number, QuestionChoice>,
      );

      return kept;
    });
  }, []);

  // Unified submit handler (create + edit)
  const handleSubmit = async () => {
    if (!user) return;

    setError("");

    // Validate metadata
    if (!title.trim()) {
      setError("Please enter a quiz title.");
      return;
    }
    if (!dueDate) {
      setError("Please select a due date.");
      return;
    }
    if (!courseId) {
      setError("Course ID is missing. Please reload the course page.");
      return;
    }

    // Every question must have a correct answer assigned
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setError(
        `${unanswered.length} question(s) are missing a correct answer.`,
      );
      return;
    }

    const finalQuestions: QuestionWithAnswer[] = questions.map((q) => ({
      ...q,
      correctAnswer: answers[q.id] ?? null,
    }));

    setIsLoading(true);

    try {
      if (isEditMode && quizId) {
        const { error: updateError } = await supabase
          .from("quizzes")
          .update({
            title,
            dueDate,
            questions: finalQuestions,
            updatedAt: new Date().toISOString(),
          })
          .eq("id", quizId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("quizzes").insert({
          courseId,
          title,
          dueDate,
          questions: finalQuestions,
        });

        if (insertError) throw insertError;
      }

      router.push(`/pages/course/${courseId}`);
    } catch (err: unknown) {
      console.error("Error saving quiz:", err);
      setError((err as Error)?.message ?? "Failed to save quiz.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render
  if (isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1E6]">
        <Loader2 className="animate-spin text-zinc-400" size={32} />
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
            {isEditMode ? "Edit Quiz" : "Quiz Builder"}
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

      {/* Quiz Form */}
      <main className="mx-auto w-full max-w-3xl space-y-8 px-6 py-12">
        {/* Error banner */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* Metadata */}
        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mb-4 w-18">
            <Link href={`/pages/course/${courseId}`} className="flex col gap-2">
              <ArrowLeft/>
              <h2 className="text-zinc-900">Back</h2>
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <Type size={14} /> Quiz Title
              </label>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mb-8 w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-3 text-lg font-bold outline-none transition-all focus:border-zinc-800 focus:bg-white"
              />

              <label className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <HelpCircle size={14} /> Total Questions
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={questions.length}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-3 text-lg font-bold outline-none transition-all focus:border-zinc-800 focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <Calendar size={14} /> Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-3 outline-none transition-all focus:border-zinc-800 focus:bg-white"
              />
            </div>
          </div>
        </section>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((question, i) => (
            <div
              key={question.id}
              className="group relative rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="text-xs font-black uppercase text-zinc-500">
                  Question {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(question.id)}
                  className="text-zinc-300 hover:text-red-500"
                  aria-label={`Delete question ${i + 1}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <input
                type="text"
                placeholder="What is the question prompt?"
                value={question.prompt}
                className="mb-6 w-full text-xl font-bold outline-none placeholder:text-zinc-300"
                onChange={(e) =>
                  handleUpdateQuestion(question.id, "prompt", e.target.value)
                }
              />

              <div className="grid gap-3 sm:grid-cols-2">
                {CHOICES.map((letter) => (
                  <div key={letter} className="relative">
                    <input
                      type="text"
                      placeholder={`Option ${letter}`}
                      value={question[letter]}
                      className="w-full rounded-xl border border-zinc-100 bg-zinc-50 py-3 pl-12 pr-4 text-sm outline-none focus:border-zinc-800 focus:bg-white"
                      onChange={(e) =>
                        handleUpdateQuestion(
                          question.id,
                          letter,
                          e.target.value,
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateAnswer(question.id, letter)}
                      aria-label={`Mark option ${letter} as correct`}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[10px] font-black transition-all ${
                        answers[question.id] === letter
                          ? "bg-zinc-800 text-white"
                          : "bg-zinc-200 text-zinc-500"
                      }`}
                    >
                      {letter}
                    </button>
                  </div>
                ))}
              </div>

              {answers[question.id] && (
                <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                  <CheckCircle2 size={14} /> Correct Answer:{" "}
                  {answers[question.id]}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex justify-center">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleSubmit}
            className="flex items-center gap-3 rounded-2xl bg-zinc-900 px-8 py-4 font-bold text-[#F5F1E6] shadow-2xl transition-all hover:scale-[1.02] hover:bg-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : isEditMode ? (
              <Save size={20} />
            ) : (
              <Plus size={20} />
            )}
            {isLoading
              ? "Saving…"
              : isEditMode
                ? "Save Changes"
                : "Publish Quiz"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function QuizCreation() {
  return (
    <AuthGuard>
      <QuizCreationContent />
    </AuthGuard>
  );
}
