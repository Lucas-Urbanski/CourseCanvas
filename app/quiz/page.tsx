"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, CheckCircle2, Circle } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "../context/AuthContext";
import AuthGuard from "../components/AuthGuard";

async function QuizContent() {
    const supabase = useMemo(
      () =>
        createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        ),
      [],
    );

  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const questions = [1, 2, 3, 4];

  // const { error: quizError } = await supabase
  //   .from("quizzes")
  //   .select("*")
  //   .eq("id", quizId)
  //   .single();

  const handleSelect = (qId: number, letter: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: letter }));
  };

  const scrollToQuestion = (id: number) => {
    const element = document.getElementById(`question-${id}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <main className="bg-[#F5F1E6] min-h-screen flex text-zinc-800">
      {/* Sidebar */}
      <aside className="w-20 md:w-24 bg-white/80 border-r border-zinc-200 sticky top-0 h-screen flex flex-col items-center py-10 gap-6 z-20 backdrop-blur-md">
        {questions.map((q) => {
          const isAnswered = !!answers[q];
          return (
            <button
              key={q}
              onClick={() => scrollToQuestion(q)}
              className={`group relative w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs transition-all border shadow-sm ${
                isAnswered
                  ? "bg-zinc-900 border-zinc-900 text-white"
                  : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-800 hover:text-zinc-800"
              }`}
            >
              Q{q}
              <div className="absolute -top-1 -right-1">
                {isAnswered ? (
                  <div className="bg-emerald-500 rounded-full p-0.5 border-2 border-white shadow-sm">
                    <Check className="text-white" size={8} strokeWidth={4} />
                  </div>
                ) : (
                  <div className="bg-zinc-200 rounded-full p-0.5 border-2 border-white shadow-sm">
                    <Circle className="text-zinc-400 fill-zinc-400" size={8} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center py-12 px-6 md:px-12">
        <div className="max-w-4xl w-full space-y-12">
          {questions.map((item) => (
            <section
              id={`question-${item}`}
              key={item}
              className={`bg-white rounded-[2.5rem] border p-8 md:p-12 shadow-sm transition-all duration-500 ${
                answers[item]
                  ? "border-zinc-300 opacity-100"
                  : "border-zinc-200 opacity-90"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="bg-zinc-100 text-zinc-500 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-zinc-200">
                    Multiple Choice
                  </span>
                  <span className="text-zinc-400 text-xs font-bold uppercase tracking-tighter">
                    Question {item}
                  </span>
                </div>

                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 animate-in fade-in zoom-in">
                  <Check size={12} strokeWidth={3} />
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-10 leading-tight">
                {item === 1
                  ? "Which hook is used to handle side effects in React?"
                  : "Why did the chicken cross the road?"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { letter: "A", text: item === 1 ? "useEffect" : "To get to the other side" },
                ].map((option) => {
                  const isSelected = answers[item] === option.letter;
                  return (
                    <button
                      key={option.letter}
                      onClick={() => handleSelect(item, option.letter)}
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
                        {option.letter}
                      </span>
                      <span
                        className={`font-medium pt-1 leading-relaxed ${isSelected ? "text-zinc-100" : "text-zinc-700"}`}
                      >
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

          {/* Footer */}
          <div className="flex flex-col items-center gap-4 pt-6 pb-32">
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
              {Object.keys(answers).length} of {questions.length} Answered
            </p>
            <Link
              href="/course"
              className={`group flex items-center gap-3 rounded-2xl px-12 py-5 font-bold transition-all shadow-xl ${
                Object.keys(answers).length === questions.length
                  ? "bg-zinc-900 text-[#F5F1E6] hover:bg-black hover:scale-[1.02]"
                  : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
              }`}
            >
              Submit Quiz
              <CheckCircle2 size={20} />
            </Link>
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