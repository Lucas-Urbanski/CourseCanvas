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



function QuizCreationContent() {
    const supabase = useMemo(
      () =>
        createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        ),
      [],
    );

  const { user } = useAuth();
  const [numberOfQuestions, setNumberOfQuestions] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [questions, setQuestions] = useState<{ prompt: string; options: string[] }[]>([
    { prompt: "", options: ["", "", "", ""] },
  ]);

    const handleCreateQuiz = async () => {
      const { error } = await supabase
        .from("quizzes")
        .insert({
          title: "My Quiz",
          "dueDate": new Date(),
          questions: []
        });

    }

  const handleUpdateAnswer = (index: number, choice: string) => {
    setAnswers((prev) => ({ ...prev, [index]: choice }));
  };

  const handleQuantityChange = (val: number) => {
    if (val < 0) setNumberOfQuestions(0);
    else if (val > 50) setNumberOfQuestions(50);
    else setNumberOfQuestions(val);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F1E6] text-zinc-800">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/70 backdrop-blur-md px-8 py-4">
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

          <h1 className="font-bold text-sm uppercase tracking-widest text-zinc-500 ml-4 sm:mr-16">
            Quiz Builder
          </h1>

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
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-12 space-y-8">
        {/* Information Card */}
        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
                <HelpCircle size={14} /> Total Questions
              </label>
              <input
                type="number"
                value={numberOfQuestions}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-3 font-bold text-lg outline-none transition-all focus:border-zinc-800 focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
                <Calendar size={14} /> Due Date
              </label>
              <input
                type="date"
                className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-3 outline-none transition-all focus:border-zinc-800 focus:bg-white"
              />
            </div>
          </div>
        </section>

        {/* Question List */}
        <div className="space-y-6">
          {Array.from({ length: numberOfQuestions }).map((_, i) => (
            <div
              key={i}
              className="group relative rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:border-zinc-300"
            >
              <div className="mb-6 flex items-center justify-between border-b border-zinc-50 pb-4">
                <span className="text-xs font-black uppercase tracking-tighter text-zinc-500">
                  Question {i + 1}
                </span>
                <button className="text-zinc-300 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>

              <input
                type="text"
                placeholder="What is the question prompt?"
                className="mb-6 w-full rounded-xl border border-zinc-100 bg-zinc-50 px-5 py-3 bg-transparent text-xl font-bold placeholder:text-zinc-300 outline-none"
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
                      onClick={() => handleUpdateAnswer(i, letter)}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[10px] font-black transition-all ${
                        answers[i] === letter
                          ? "bg-zinc-800 text-white shadow-lg"
                          : "bg-zinc-200 text-zinc-500 hover:bg-zinc-300"
                      }`}
                    >
                      {letter}
                    </button>
                  </div>
                ))}
              </div>

              {answers[i] && (
                <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600 animate-in fade-in slide-in-from-top-1">
                  <CheckCircle2 size={14} /> Correct Answer Set to {answers[i]}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Publish Button */}
        <div className="flex justify-center">
          <button className="flex items-center gap-3 rounded-2xl bg-zinc-900 px-8 py-4 font-bold text-[#F5F1E6] shadow-2xl transition-all hover:bg-black hover:scale-[1.02] active:scale-95">
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