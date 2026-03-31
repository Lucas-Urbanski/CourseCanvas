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

  if (numberOfQuestions != 0){
    if (numberOfQuestions < 0){
        setNumberOfQuestions(0)
    }
    for (let i = 1; i <= numberOfQuestions; i++) {
    quizList.push(
      <li key={i} className="bg-[#F5F1E6] h-1/2 rounded-sm p-5 m-5">
        <input type="text" placeholder="Enter Question" />
        <div className="pt-5 flex flex-col">
          <div className="flex flex-row pb-3">
            <input type="text" placeholder="Enter Answer A"  className="w-1/2"/>
            <input type="text" placeholder="Enter Answer B" className="w-1/2"/>
          </div>
          <div className="flex flex-row">
            <input type="text" placeholder="Enter Answer C" className="w-1/2"/>
            <input type="text" placeholder="Enter Answer D" className="w-1/2"/>
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
  }}
  
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F1E6]">
      <header className="bg-[#D9D2C3] border-b border-black/10 px-8 py-4 flex items-center justify-between">
        <Link
          href="/home"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center text-[#F5F1E6]">
            <BookOpen size={18} />
          </div>
          <span className="font-bold text-zinc-800 text-lg">CourseCanvas</span>
        </Link>

        <div className="flex-1 max-w-md mr-16 px-4 text-center">
          <h1 className="font-bold text-zinc-800 text-lg">Quiz Creation</h1>
        </div>

        <div className="flex items-center text-zinc-800 font-medium">
          <Link
            href="/settings"
            className="flex items-center gap-2 group hover:opacity-80 transition-all"
          >
            <h1 className="text-lg font-bold">Settings</h1>
            <Settings
              size={22}
              className="group-hover:rotate-45 transition-transform duration-300"
            />
          </Link>
        </div>
      </header>
      <main className="flex flex-col bg-[#D9D2C3] min-h-screen w-1/3 m-10 rounded-sm mx-auto items-center text-zinc-500">
        <div className="flex flex-col bg-[#F5F1E6] rounded-sm p-5 m-5 gap-2">
            <h1 className="pr-6">Enter Number of Questions in The Quiz</h1>
            <input type="number" value={numberOfQuestions} className="text-right border pl-6"
            onChange={(e) => setNumberOfQuestions(Number(e.target.value))}/>
        </div>
        <ul className="w-9/10">{quizList}</ul>
        <div className="flex flex-row bg-[#F5F1E6] rounded-full p-5 pt-5 m-2 gap-5">
          <h1>Enter course Start date</h1>
          <input type="date" className="text-right border pl-6" />
        </div>
        <div className="flex flex-row bg-[#F5F1E6] rounded-full p-5 pt-5 m-2 gap-5">
          <h1>Enter course End date</h1>
          <input type="date" className="text-right border pl-6" />
        </div>
        <button className="flex w-1/4 items-center justify-center gap-2 rounded-xl bg-zinc-800 px-4 py-3 font-semibold text-[#F5F1E6] hover:opacity-90 transition">
          Submit
        </button>
      </main>
    </div>
  );
}
