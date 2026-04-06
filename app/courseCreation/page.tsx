import { Settings, BookOpen } from "lucide-react";
import Link from "next/link";

export default function CourseCreation() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#F5F1E6]">
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
          <h1 className="font-bold text-zinc-800 text-lg">Course Creation</h1>
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
      <main className="flex flex-col min-h-screen my-10 mx-auto sm:min-w-xl md:min-w-2xl lg:min-w-3xl xl:min-w-4xl items-center text-zinc-800 rounded-3xl border border-zinc-300 bg-white/50 shadow-sm">
        <div className="flex bg-[#F5F1E6] rounded-xl shadow-sm p-2 m-2 mt-8">
          <input
            type="text"
            placeholder="Enter Course Title"
            className="text-center border"
          />
        </div>
        <div className="flex flex-row bg-[#F5F1E6] rounded-xl shadow-sm p-2 m-2">
          <input
            type="text"
            placeholder="Enter Course Description"
            className="text-center border"
          />
        </div>
        <div className="flex flex-row bg-[#F5F1E6] rounded-full shadow-sm p-5 pt-5 m-2 gap-5">
          <h1>Enter course Start date:</h1>
          <input type="date" className="text-right border pl-6" />
        </div>
        <div className="flex flex-row bg-[#F5F1E6] rounded-full shadow-sm p-5 pt-5 m-2 gap-5">
          <h1>Enter course End date:</h1>
          <input type="date" className="text-right border pl-6" />
        </div>
        <button className="flex w-1/3 sm:w-1/4 md:w-1/5 lg:w-1/6 items-center justify-center rounded-xl bg-zinc-800 px-4 py-3 m-2 font-semibold text-[#F5F1E6] hover:opacity-90 transition ">
          Submit
        </button>
      </main>
    </div>
  );
}
