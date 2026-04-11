"use client";

import { createBrowserClient } from "@supabase/ssr";
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
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import AuthGuard from "../../components/AuthGuard";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

type QuestionChoice = "A" | "B" | "C" | "D";

type Question = {
  id: number;
  prompt: string;
  A: string;
  B: string;
  C: string;
  D: string;
};

function makeQuestion(id: number): Question {
  return {
    id,
    prompt: "",
    A: "",
    B: "",
    C: "",
    D: "",
  };
}

function QuizCreationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const courseId = searchParams.get("courseId");

  const [answers, setAnswers] = useState<Record<number, QuestionChoice>>({});
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [questions, setQuestions] = useState<Question[]>([makeQuestion(1)]);

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  const handleCreateQuiz = async () => {
    if (!user) return alert("You must be signed in.");
    if (!title.trim()) return alert("Please enter a quiz title.");
    if (!dueDate) return alert("You must have a due date.");
    if (!courseId) return alert("Course ID missing. Please reload the course page.");
    if (Object.keys(answers).length != questions.length) return alert ("One or more of the Questions don't have answer");

    try {
      const finalQuestions = questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        A: q.A,
        B: q.B,
        C: q.C,
        D: q.D,
        correctAnswer: answers[q.id] || null,
      }));

      const { error } = await supabase.from("quizzes").insert({
        courseId,
        title,
        dueDate,
        questions: finalQuestions,
      });

      if (error) throw error;

      router.push(`/pages/course/${courseId}`);
    } catch (error: any) {
      console.error("Error creating quiz:", error);
      alert(error?.message || "Failed to create quiz.");
    }
  };

  const handleUpdateQuestion = (
    questionId: number,
    field: keyof Omit<Question, "id">,
    value: string,
  ) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, [field]: value } : q)),
    );
  };

  const handleUpdateAnswer = (questionId: number, choice: QuestionChoice) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choice }));
  };

  const handleDeleteQuestion = (questionId: number) => {
    setQuestions((prev) => prev.filter((question) => question.id !== questionId));

    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  };

  const handleQuantityChange = (val: number) => {
    let newQuantity = val;

    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 50) newQuantity = 50;

    setQuestions((prev) => {
      if (newQuantity === prev.length) return prev;

      if (newQuantity > prev.length) {
        const currentMaxId = prev.length > 0 ? Math.max(...prev.map((q) => q.id)) : 0;
        const newQuestions = Array.from(
          { length: newQuantity - prev.length },
          (_, index) => makeQuestion(currentMaxId + index + 1),
        );
        return [...prev, ...newQuestions];
      }

      const keptQuestions = prev.slice(0, newQuantity);
      const keptIds = new Set(keptQuestions.map((q) => q.id));

      setAnswers((prevAnswers) => {
        const updatedAnswers: Record<number, QuestionChoice> = {};
        for (const key in prevAnswers) {
          const numericKey = Number(key);
          if (keptIds.has(numericKey)) {
            updatedAnswers[numericKey] = prevAnswers[numericKey];
          }
        }
        return updatedAnswers;
      });

      return keptQuestions;
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F1E6] text-zinc-800">
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
            Quiz Builder
          </h1>

          <Link
            href="/pages/settings"
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 font-bold text-zinc-800 transition hover:bg-zinc-50"
          >
            Settings
            <Settings size={20} className="transition-transform hover:rotate-45" />
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl space-y-8 px-6 py-12">
        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
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
                {(["A", "B", "C", "D"] as QuestionChoice[]).map((letter) => (
                  <div key={letter} className="relative">
                    <input
                      type="text"
                      placeholder={`Option ${letter}`}
                      value={question[letter]}
                      className="w-full rounded-xl border border-zinc-100 bg-zinc-50 py-3 pl-12 pr-4 text-sm outline-none focus:border-zinc-800 focus:bg-white"
                      onChange={(e) =>
                        handleUpdateQuestion(question.id, letter, e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateAnswer(question.id, letter)}
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
                  <CheckCircle2 size={14} /> Correct Answer Set to {answers[question.id]}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            className="flex items-center gap-3 rounded-2xl bg-zinc-900 px-8 py-4 font-bold text-[#F5F1E6] shadow-2xl transition-all hover:scale-[1.02] hover:bg-black active:scale-95"
            onClick={handleCreateQuiz}
          >
            <Plus size={20} />
            Publish Quiz
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