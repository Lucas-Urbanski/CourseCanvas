"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function Quiz() {
  const questions = [1, 2, 3, 4];

  return (
    <main className="bg-[#F5F1E6] min-h-screen flex text-zinc-800">
      {/* Sidebar */}
      <aside className="w-20 md:w-24 bg-white/80 border-r border-zinc-200 sticky top-0 h-screen flex flex-col items-center py-10 gap-6">
        {questions.map((q) => (
          <button
            key={q}
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all border border-zinc-200 bg-white hover:bg-zinc-800 hover:text-white hover:border-zinc-800 shadow-sm"
          >
            Q{q}
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center py-12 px-6 md:px-12">
        <div className="max-w-4xl w-full space-y-12">
          
          {[1, 2, 3].map((item) => (
            <section 
              key={item} 
              className="bg-white rounded-[2rem] border border-zinc-200 p-8 md:p-10 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-zinc-100 text-zinc-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-zinc-200">
                  Multiple Choice
                </span>
                <span className="text-zinc-400 text-sm">Question {item}</span>
              </div>

              <h2 className="text-2xl font-bold text-zinc-900 mb-8">
                Why did the chicken cross the road?
              </h2>

              {/* Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { letter: "A", text: "To get to the other side" },
                  { letter: "B", text: "To find its walking stick" },
                  { letter: "C", text: "To get to the KFC" },
                  { letter: "D", text: "Why are you asking? The chicken can do what it wants." },
                ].map((option) => (
                  <button
                    key={option.letter}
                    className="flex items-start text-left gap-4 p-5 rounded-2xl border border-zinc-100 bg-zinc-50/50 transition-all hover:border-zinc-300 hover:bg-white group"
                  >
                    <span className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-white border border-zinc-200 font-bold text-xs group-hover:bg-zinc-800 group-hover:text-white group-hover:border-zinc-800">
                      {option.letter}
                    </span>
                    <span className="text-zinc-700 font-medium pt-1 leading-relaxed">
                      {option.text}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}

          {/* Footer */}
          <div className="flex justify-center pt-6 pb-20">
            <Link
              href="/course"
              className="group flex items-center gap-3 rounded-2xl bg-zinc-900 px-10 py-4 font-bold text-[#F5F1E6] transition-all hover:scale-[1.02] hover:bg-black shadow-lg"
            >
              Submit Quiz
              <CheckCircle2 size={20} className="text-zinc-400 group-hover:text-white" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}