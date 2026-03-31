"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, CalendarDays, Users, UserCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthGuard from "../components/AuthGuard";

export default function CoursePage() {
  return (
    <AuthGuard>
      <CourseContent />
    </AuthGuard>
  );
}

function CourseContent() {
  const router = useRouter();
  const { user } = useAuth();

  const isTeacher = user?.role === "instructor";

  const course = {
    name: "Introduction to Web Development",
    teacher: "Prof. Sarah Johnson",
    startDate: "May 6, 2026",
    endDate: "August 20, 2026",
    students: ["Alex Brown", "Jamie Lee", "Taylor Smith", "Jordan White"],
  };

  return (
    <main className="min-h-screen bg-[#F5F1E6] px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-zinc-300 bg-white p-6 shadow-lg">
          <div>
            <p className="text-sm font-medium text-zinc-500">CourseCanvas</p>
            <h1 className="mt-2 text-3xl font-bold text-zinc-800">
              Course Page
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Signed in as {user?.name} ({user?.role})
            </p>
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
      </div>
    </main>
  );
}