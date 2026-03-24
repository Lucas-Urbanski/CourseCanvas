import Link from "next/link";
import { Settings, BookOpen } from "lucide-react";
import CourseCard from "./components/courseCard";
import SignInPage from "./login/page";

export default function Home() {
  const isTeacher: boolean = true;

  return (
    <div className="min-h-screen font-sans bg-[#F5F1E6]">
      {/* Header */}
      <header className="bg-[#D9D2C3] border-b border-black/10 px-8 py-4 flex items-center justify-between">
        {/* Logo & Home Link */}
        <Link
          href="/login"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center text-[#F5F1E6]">
            <BookOpen size={18} />
          </div>
          <span className="font-bold text-zinc-800 text-lg">CourseCanvas</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md px-4">
          <input
            type="text"
            placeholder="Search for courses..."
            className="w-full rounded-full border border-zinc-800 bg-transparent px-10 py-1.5 focus:outline-none placeholder:text-zinc-600 text-zinc-800"
            style={{ backgroundImage: 'url("data:image/svg+xml,...")' }} // You can add a magnifying glass icon here
          />
        </div>

        {/* Courses & Settings */}
        <div className="flex items-center gap-6 text-zinc-800 font-medium">
          <Link href="/courses" className="text-lg font-bold hover:opacity-80">
            Courses
          </Link>
          <Link href="/settings" aria-label="Settings">
            <Settings
              size={22}
              className="hover:rotate-45 transition-transform cursor-pointer"
            />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-10">
        {isTeacher ? (
          <div>
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
          </div>
        ) : (
          <div className="text-center text-zinc-500 mt-20">
            No courses enrolled yet.
          </div>
        )}
      </main>
    </div>
  );
}
