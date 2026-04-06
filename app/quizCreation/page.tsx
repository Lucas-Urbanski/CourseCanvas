"use client";
import { Settings, BookOpen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function QuizCreation() {
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);
  const [answerArray, setAnswerArray] = useState([""]);
  const quizList = [];

  function updateArray(index: number, answer: string) {
    const tempArray = [...answerArray];
    tempArray[index - 1] = answer;
    setAnswerArray(tempArray);
  }

  if (numberOfQuestions != 0) {
    if (numberOfQuestions < 0) {
      setNumberOfQuestions(0);
    }
    for (let i = 1; i <= numberOfQuestions; i++) {
      quizList.push(
        <li key={i} className="bg-[#F5F1E6] h-1/2 rounded-xl p-5 m-5">
          <input type="text" placeholder="Enter Question" />
          <div className="pt-5 flex flex-col">
            <div className="flex flex-row pb-3">
              <input
                type="text"
                placeholder="Enter Answer A"
                className="w-1/2"
              />
              <input
                type="text"
                placeholder="Enter Answer B"
                className="w-1/2"
              />
            </div>
            <div className="flex flex-row">
              <input
                type="text"
                placeholder="Enter Answer C"
                className="w-1/2"
              />
              <input
                type="text"
                placeholder="Enter Answer D"
                className="w-1/2"
              />
            </div>
          </div>
          <h1 className="mt-3">Select the right answer</h1>
          <div className="flex justify-around mt-1">
            <button onClick={() => updateArray(i, "A")}>A</button>
            <button onClick={() => updateArray(i, "B")}>B</button>
            <button onClick={() => updateArray(i, "C")}>C</button>
            <button onClick={() => updateArray(i, "D")}>D</button>
          </div>
        </li>,
      );
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F1E6]">
      <header className="sticky top-0 z-10 border-b border-zinc-300 bg-white/80 backdrop-blur-md px-8 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/home"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-[#F5F1E6]">
              <BookOpen size={22} />
            </div>
            <span className="hidden text-xl font-bold text-zinc-800 sm:block">
              CourseCanvas
            </span>
          </Link>

          <div className="flex-1 max-w-md px-4 text-center sm:mr-15.5">
            <h1 className="font-bold text-zinc-800 text-lg">Quiz Creation</h1>
          </div>

          <div className="flex items-center gap-5">
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
        </div>
      </header>
      <main className="flex flex-col min-h-screen m-10 mx-auto sm:min-w-xl md:min-w-2xl lg:min-w-3xl xl:min-w-4xl items-center text-zinc-800 rounded-3xl border border-zinc-300 bg-white/50 p-8 shadow-sm">
        <div className="flex flex-col bg-[#F5F1E6] rounded-xl shadow-sm p-5 m-5 gap-2">
          <h1 className="pr-6">Enter Number of Questions in The Quiz</h1>
          <input
            type="number"
            value={numberOfQuestions}
            className="text-right border pl-6"
            onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
          />
        </div>
        <ul className="w-9/10">{quizList}</ul>
        <div className="flex flex-row bg-[#F5F1E6] rounded-full shadow-sm p-5 pt-5 m-2 gap-5">
          <h1>Enter course Start date</h1>
          <input type="date" className="text-right border pl-6" />
        </div>
        <div className="flex flex-row bg-[#F5F1E6] rounded-full shadow-sm p-5 pt-5 m-2 gap-5">
          <h1>Enter course End date</h1>
          <input type="date" className="text-right border pl-6" />
        </div>
        <button className="flex w-1/3 sm:w-1/4 md:w-1/5 lg:w-1/6 items-center justify-center rounded-xl bg-zinc-800 px-4 py-3 m-2 font-semibold text-[#F5F1E6] hover:opacity-90 transition">
          Submit
        </button>
      </main>
    </div>
  );
}
