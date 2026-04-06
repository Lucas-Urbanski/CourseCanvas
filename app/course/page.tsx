"use client";

import Link from "next/link";
import {
  BookOpen,
  Settings,
  PlusCircle,
  CalendarDays,
  Users,
  UserCircle,
  FileQuestion,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthGuard from "../components/AuthGuard";

function CourseContent() {
  const { user } = useAuth();

  const isTeacher = user?.role === "instructor";

  const course = {
    name: "Introduction to Web Development",
    teacher: "Prof. Sarah Johnson",
    startDate: "May 6, 2026",
    endDate: "August 20, 2026",
    students: ["Alex Brown", "Jamie Lee", "Taylor Smith", "Jordan White"],
    quizzes: [
      {
        id: 1,
        title: "HTML Basics Quiz",
        dueDate: "May 20, 2026",
      },
      {
        id: 2,
        title: "CSS Fundamentals Quiz",
        dueDate: "June 3, 2026",
      },
      {
        id: 3,
        title: "JavaScript Intro Quiz",
        dueDate: "June 17, 2026",
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#F5F1E6]">
      <header className="sticky top-0 z-10 shadow-sm border-b border-zinc-300 bg-white/80 backdrop-blur-md px-8 py-4">
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

          <div className="text-center sm:mr-16">
            <h1 className="font-bold text-zinc-800 text-lg">Course Page</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/home")}
              className="rounded-xl bg-zinc-800 px-4 py-2 font-medium text-[#F5F1E6] transition hover:opacity-90"
            >
              ← Back to Home
            </button>

            {isTeacher && (
              <Link
                href="/quizCreation"
                className="rounded-xl bg-zinc-800 px-4 py-2 font-medium text-[#F5F1E6] transition hover:opacity-90"
              >
                Create Quiz
              </Link>
            )}
          </div>
        </div>

        <section className="rounded-3xl border border-zinc-300 bg-white p-8 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-zinc-800 p-3 text-[#F5F1E6]">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-800">
                {course.name}
              </h2>
              <p className="text-zinc-600">Course overview and details</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <div className="mb-2 flex items-center gap-2 text-zinc-700">
                <UserCircle size={18} />
                <h3 className="font-semibold">Instructor</h3>
              </div>
              <p className="text-zinc-800">{course.teacher}</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <div className="mb-2 flex items-center gap-2 text-zinc-700">
                <CalendarDays size={18} />
                <h3 className="font-semibold">Course Dates</h3>
              </div>
              <p className="text-zinc-800">Start: {course.startDate}</p>
              <p className="text-zinc-800">End: {course.endDate}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-300 bg-white p-8 shadow-lg">
          <div className="mb-6 flex items-center gap-2 text-zinc-700">
            <FileQuestion size={20} />
            <h2 className="text-xl font-bold text-zinc-800">Quizzes</h2>
          </div>

          <div className="grid gap-4">
            {course.quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5"
              >
                <h3 className="text-lg font-semibold text-zinc-800">
                  {quiz.title}
                </h3>
                <p className="mt-1 text-zinc-600">Due: {quiz.dueDate}</p>
              </div>
            ))}
          </div>
        </section>

        {isTeacher ? (
          <section className="rounded-3xl border border-zinc-300 bg-white p-8 shadow-lg">
            <div className="mb-6 flex items-center gap-3">
              <div>
                <h2 className="text-2xl font-bold text-zinc-800">
                  {course.name}
                </h2>
                <p className="text-zinc-600">Course overview and details</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="mb-2 flex items-center gap-2 text-zinc-700">
                  <UserCircle size={18} />
                  <h3 className="font-semibold">Instructor</h3>
                </div>
                <p className="text-zinc-800">{course.teacher}</p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="mb-2 flex items-center gap-2 text-zinc-700">
                  <CalendarDays size={18} />
                  <h3 className="font-semibold">Course Dates</h3>
                </div>
                <p className="text-zinc-800">Start: {course.startDate}</p>
                <p className="text-zinc-800">End: {course.endDate}</p>
              </div>
            </div>
          </section>

          {isTeacher ? (
            <section className="rounded-3xl border border-zinc-300 bg-white p-8 shadow-lg">
              <div className="mb-6 flex items-center gap-2 text-zinc-700">
                <Users size={20} />
                <h2 className="text-xl font-bold text-zinc-800">
                  Enrolled Students
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {course.students.map((student, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-zinc-800"
                  >
                    {student}
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="rounded-3xl border border-zinc-300 bg-white p-8 shadow-lg">
              <h2 className="text-xl font-bold text-zinc-800">Student View</h2>
              <p className="mt-3 text-zinc-600">
                You are signed in as a student. Instructor-only controls are
                hidden.
              </p>
            </section>
          )}

          <div className="flex justify-between flex-wrap items-center gap-4 rounded-3xl border border-zinc-300 bg-white p-6 shadow-lg">
            <div>
              <h1 className="mt-2 text-xl font-bold text-zinc-800">Quizzes</h1>
              <p className="mt-1 text-sm text-zinc-600">
                Signed in as {user?.name}:{" "}
                {user?.role
                  ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                  : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isTeacher && (
                <Link
                  href="/quizCreation"
                  className="flex items-center gap-2 rounded-xl bg-zinc-800 px-6 py-3 font-semibold text-white transition hover:opacity-90"
                >
                  <PlusCircle size={18} />
                  Create Quiz
                </Link>
              )}
              <Link
                href="/quiz"
                className="flex items-center gap-2 rounded-xl bg-zinc-800 px-6 py-3 font-semibold text-white transition hover:opacity-90"
              >
                Take Quiz
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CoursePage() {
  return (
    <AuthGuard>
      <CourseContent />
    </AuthGuard>
  );
}