"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Settings,
  BookOpen,
  Plus,
  HelpCircle,
  Calendar,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "../context/AuthContext";
import AuthGuard from "../components/AuthGuard";

type Question = {
  id: number;
};

export default function QuizCreation() {
   const { user } = useAuth();
  const today = new Date();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(today.toLocaleDateString());
  const [questions, setQuestions] = useState<Question[]>([{ id: 1 }]);



function QuizCreationContent() {
    const supabase = useMemo(
      () =>
        createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        ),
      [],
    );
 

    const handleCreateQuiz = async () => {
      const { error } = await supabase
        .from("quizzes")
        .insert({
          title: "My Quiz",
          "dueDate": new Date(),
          questions: []
        });

    }

  const numberOfQuestions = questions.length;

  const handleUpdateAnswer = (questionId: number, choice: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choice }));
  };

  const handleDeleteQuestion = (questionId: number) => {
    setQuestions((prev) => prev.filter((question) => question.id !== questionId));

    setAnswers((prev) => {
      const updatedAnswers = { ...prev };
      delete updatedAnswers[questionId];
      return updatedAnswers;
    });
  };

  const handleQuantityChange = (val: number) => {
    let newValue = val;

    if (newValue < 0) newValue = 0;
    if (newValue > 50) newValue = 50;

    setQuestions((prev) => {
      if (newValue === prev.length) return prev;

      if (newValue > prev.length) {
        const currentMaxId =
          prev.length > 0 ? Math.max(...prev.map((question) => question.id)) : 0;

        const newQuestions = Array.from(
          { length: newValue - prev.length },
          (_, index) => ({
            id: currentMaxId + index + 1,
          })
        );

        return [...prev, ...newQuestions];
      }

      const keptQuestions = prev.slice(0, newValue);
      const keptIds = new Set(keptQuestions.map((question) => question.id));

      setAnswers((prevAnswers) => {
        const updatedAnswers: Record<number, string> = {};
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

          <h1 className="ml-4 text-sm font-bold uppercase tracking-widest text-zinc-500 sm:mr-16">
            Quiz Builder
          </h1>

          <Link
            href="/settings"
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
        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-2">
              <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              >
              </input>
              <label className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <HelpCircle size={14} /> Total Questions
              </label>
              <input
                type="number"
                value={numberOfQuestions}
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
              className="group relative rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:border-zinc-300"
            >
              <div className="mb-6 flex items-center justify-between border-b border-zinc-50 pb-4">
                <span className="text-xs font-black uppercase tracking-tighter text-zinc-500">
                  Question {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(question.id)}
                  className="transition-colors text-zinc-300 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <input
                type="text"
                placeholder="What is the question prompt?"
                className="mb-6 w-full rounded-xl border border-zinc-100 bg-zinc-50 bg-transparent px-5 py-3 text-xl font-bold placeholder:text-zinc-300 outline-none"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                {["A", "B", "C", "D"].map((letter) => (
                  <div key={letter} className="relative group/input">
                    <input
                      type="text"
                      placeholder={`Option ${letter}`}
                      className="w-full rounded-xl border border-zinc-100 bg-zinc-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-zinc-800 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateAnswer(question.id, letter)}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[10px] font-black transition-all ${
                        answers[question.id] === letter
                          ? "bg-zinc-800 text-white shadow-lg"
                          : "bg-zinc-200 text-zinc-500 hover:bg-zinc-300"
                      }`}
                    >
                      {letter}
                    </button>
                  </div>
                ))}
              </div>

              {answers[question.id] && (
                <div className="animate-in slide-in-from-top-1 mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600 fade-in">
                  <CheckCircle2 size={14} /> Correct Answer Set to{" "}
                  {answers[question.id]}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button className="flex items-center gap-3 rounded-2xl bg-zinc-900 px-8 py-4 font-bold text-[#F5F1E6] shadow-2xl transition-all hover:scale-[1.02] hover:bg-black active:scale-95">
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