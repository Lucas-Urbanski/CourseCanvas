"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookOpen,
  Settings,
  CalendarDays,
  Users,
  UserCircle,
  FileQuestion,
  ChevronRight,
  Plus,
  GraduationCap,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "../../context/AuthContext";
import AuthGuard from "../../components/AuthGuard";

export default function CoursePage({ params }: { params: { uuid: string } }) {
  return (
    <AuthGuard>
      <CourseContent params={params} />
    </AuthGuard>
  );
}

function CourseContent({ params }: { params: { uuid: string } }) {
  
      const supabase = useMemo(
        () =>
          createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          ),
        [],
      );
  const { user } = useAuth();
  const isTeacher = user?.role === "instructor";

  const callCourse = async () => {
    const { uuid } = params;
    const { error: courseError } = await supabase
    .from("courses")
    .select("title, description, startDate, endDate")
    .eq("id", uuid)
    .single();

    if (courseError) {
      console.error("Error fetching course:", courseError);
    }
  }

  const callQuiz = async () => {
    const { error: quizError } = await supabase
    .from("quizzes")
    .select("title, dueDate")
    .eq("id", 1)
    .single();
  };

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
        status: "Open",
      },
      {
        id: 2,
        title: "CSS Fundamentals Quiz",
        dueDate: "June 3, 2026",
        status: "Locked",
      },
      {
        id: 3,
        title: "JavaScript Intro Quiz",
        dueDate: "June 17, 2026",
        status: "Locked",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F5F1E6] text-zinc-800">
      {/* 1. Refined Header */}
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur-lg px-8 py-4">
        <div className="mx-auto flex items-center justify-between">
          <Link
            href="/home"
            className="flex items-center gap-2 transition-transform hover:scale-95"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
              <BookOpen size={20} />
            </div>
            <span className="hidden text-lg font-bold tracking-tight sm:block">
              CourseCanvas
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="text-right border-r border-zinc-200 pr-4">
              <p className="text-xs font-bold uppercase text-zinc-400 tracking-widest">
                Signed in as
              </p>
              <p className="text-sm font-semibold text-zinc-800">
                {user?.name || "User"}
              </p>
            </div>
            <Link
              href="/settings"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 bg-white transition-colors hover:bg-zinc-50 shadow-sm"
            >
              <Settings
                size={20}
                className="transition-transform hover:rotate-45"
              />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto px-6 py-12">
        {/*  Course Section */}
        <section className="relative mb-12 rounded-[2.5rem] bg-zinc-900 p-10 text-white shadow-2xl">
          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
              <GraduationCap size={14} /> Active Course
            </div>
            <h1 className="text-2xl font-black sm:text-3xl md:text-4xl lg:text-5xl">
              {course.name}
            </h1>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
                <div className="rounded-xl bg-white/10 p-2">
                  <UserCircle size={24} />
                </div>
                <div>
                  <p className="text-[10px] uppercase opacity-50 font-bold">
                    Instructor
                  </p>
                  <p className="font-semibold text-sm">{course.teacher}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
                <div className="rounded-xl bg-white/10 p-2">
                  <CalendarDays size={24} />
                </div>
                <div>
                  <p className="text-[10px] uppercase opacity-50 font-bold">
                    Schedule
                  </p>
                  <p className="font-semibold text-sm">
                    {course.startDate} - {course.endDate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Students Info */}
        <div className="rounded-4xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Users size={20} className="text-zinc-400" />
              {isTeacher ? "Class Enrollment" : "Course Info"}
            </h3>
            {isTeacher && (
              <span className="text-[10px] font-bold bg-zinc-100 px-2 py-1 rounded text-zinc-500">
                {course.students.length} Total
              </span>
            )}
          </div>

          {isTeacher ? (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {course.students.map((student, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-zinc-50 bg-zinc-50/50 p-3 text-sm font-medium"
                >
                  <div className="h-6 w-6 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-bold uppercase">
                    {student
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  {student}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-zinc-600 leading-relaxed italic">
              "The goal of this course is to provide a solid foundation in
              modern web technologies, moving from structure to style and
              interaction."
            </div>
          )}
        </div>

        {/* Quiz List */}
        <div className="grid gap-4 ">
          <div className="flex items-center justify-between px-2  mt-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileQuestion size={24} /> Quizzes
            </h2>
            {isTeacher && (
              <Link
                href="/quizCreation"
                className="group flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 text-sm font-bold text-[#F5F1E6] transition-all hover:bg-black"
              >
                <Plus size={16} /> Create Quiz
              </Link>
            )}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
            {course.quizzes.map((quiz) => {
              const content = (
                <div className="flex items-center justify-between rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all group-hover:border-zinc-400 group-hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center ${quiz.status === "Open" ? "bg-zinc-100 text-zinc-800" : "bg-zinc-50 text-zinc-300"}`}
                    >
                      <FileQuestion
                        size={20}
                        className={`${quiz.status === "open" ? "text-green-700" : null}`}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-black">
                        {quiz.title}
                      </h3>
                      <p className="text-sm text-zinc-500">
                        Due {quiz.dueDate}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-zinc-300 group-hover:text-zinc-800 transition-colors"
                  />
                </div>
              );

              return quiz.status === "Open" ? (
                <Link key={quiz.id} href="/quiz" className="block group">
                  {content}
                </Link>
              ) : (
                <div key={quiz.id} className="block group">
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
