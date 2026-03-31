"use client";

import Link from "next/link";
import { Settings, BookOpen } from "lucide-react";
import CourseCard from "../components/courseCard";
import { useAuth } from "../context/AuthContext";
import AuthGuard from "../components/AuthGuard";

export default function Home() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}

function HomeContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1E6]">
        Loading...
      </div>
    );
  }

  const isTeacher = user?.role === "instructor";

  return (
    <div className="min-h-screen font-sans bg-[#F5F1E6]">
      <header className="flex items-center justify-between border-b border-black/10 bg-[#D9D2C3] px-8 py-4">
        <Link
          href="/home"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded bg-zinc-800 text-[#F5F1E6]">
            <BookOpen size={18} />
          </div>
          <span className="text-lg font-bold text-zinc-800">CourseCanvas</span>
        </Link>

        <div className="max-w-md flex-1 px-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-md mr-15.5 px-4">
          <input
            type="text"
            placeholder="Search for courses..."
            className="w-full rounded-full border border-zinc-800 bg-transparent px-10 py-1.5 text-zinc-800 placeholder:text-zinc-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-6 font-medium text-zinc-800">
          <span className="cursor-default text-lg font-bold">Courses</span>
          <Link href="/settings" aria-label="Settings">
            <Settings
              size={22}
              className="cursor-pointer transition-transform hover:rotate-45"
            />
          </Link>
        </div>
      </header>

      <main className="p-10">
        {!user ? (
          <div className="mt-20 text-center">
            <p className="mb-4 text-zinc-600">
              Please sign in to view your courses.
            </p>
            <Link
              href="/signin"
              className="rounded-xl bg-zinc-800 px-4 py-2 text-[#F5F1E6]"
            >
              Go to Sign In
            </Link>
          </div>
        ) : isTeacher ? (
      {/* Main Content */}
      {isTeacher && (
        <div className="flex items-center justify-center mt-6">
          <Link
            href="/courseCreation"
            className="flex w-1/4 items-center justify-center gap-2 rounded-xl bg-zinc-800 px-4 py-3 font-semibold text-[#F5F1E6] hover:opacity-90 transition"
          >
            Create Course
          </Link>
        </div>
      )}
      <main className="p-10">
        <Link href="/course">
          <CourseCard
            courses={[
              {
                id: "CS101",
                name: "Intro to Computer Science",
                description:
                  "Learn the fundamentals of computer science and programming.",
                teacher: "Dr. Smith",
                startDate: "2027-09-01",
              },
              {
                id: "WD202",
                name: "Intro to Web Development",
                description:
                  "A comprehensive course on modern web development.",
                teacher: "Ms. Johnson",
                startDate: "2027-10-15",
              },
              {
                id: "DS303",
                name: "Data Structures and Algorithms",
                description:
                  "Explore advanced data structures and algorithmic approaches.",
                teacher: "Prof. Williams",
                startDate: "2027-11-01",
              },
            ]}
          />
        ) : (
          <CourseCard
            courses={[
              {
                id: "WD202",
                name: "Intro to Web Development",
                description:
                  "A comprehensive course on modern web development.",
                teacher: "Ms. Johnson",
                startDate: "2027-10-15",
              },
            ]}
          />
        )}
        </Link>
      </main>
    </div>
  );
}