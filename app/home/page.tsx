import Link from "next/link";
import { Settings, BookOpen } from "lucide-react";
import CourseCard from "../components/courseCard";

export default function Home() {
  const isTeacher: boolean = true;

  return (
    <div className="min-h-screen font-sans bg-[#F5F1E6]">
      {/* Header */}
      <header className="bg-[#D9D2C3] border-b border-black/10 px-8 py-4 flex items-center justify-between">
        {/* Logo & Home Link */}
        <Link
          href="/home"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center text-[#F5F1E6]">
            <BookOpen size={18} />
          </div>
          <span className="font-bold text-zinc-800 text-lg">CourseCanvas</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mr-15.5 px-4">
          <input
            type="text"
            placeholder="Search for courses..."
            className="w-full rounded-full border border-zinc-800 bg-transparent px-10 py-1.5 focus:outline-none placeholder:text-zinc-600 text-zinc-800"
            style={{ backgroundImage: 'url("data:image/svg+xml,...")' }}
          />
        </div>

        {/* Courses & Settings */}
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
        </Link>
      </main>
    </div>
  );
}
