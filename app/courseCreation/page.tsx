import { Settings, BookOpen } from "lucide-react";
import Link from "next/link";

export default function CourseCreation() {
  return (
    <div className="min-h-screen font-sans bg-[#F5F1E6]">
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

            <div className="flex-1 max-w-md px-4 text-center">
                <h1 className="font-bold text-zinc-800 text-lg">Course Creation</h1>
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
        <main className="flex flex-col bg-[#D9D2C3] min-h-screen w-1/3 m-10 rounded-sm mx-auto items-center">
            <div className="flex flex-row bg-[#F5F1E6] rounded-sm p-2 m-5">
                <input type="text" placeholder="Enter course's Name" className="text-center border"/>
            </div>
            <div className="flex flex-row bg-[#F5F1E6] rounded-sm p-5 pt-5 pd-5 m-5 gap-5">
                <h1>Enter course Start date</h1>
                <input type="date" className="text-right border pl-6"/>
            </div>
            <div className="flex flex-row bg-[#F5F1E6] rounded-sm p-5 pt-5 pd-5 m-5 gap-5">
                <h1>Enter course End date</h1>
                <input type="date" className="text-right border pl-6"/>
            </div>
            <button className="bg-[#F5F1E6] w-1/5 rounded-sm p-2">Submit</button>
        </main>
    </div>
  );
}