"use client";

import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";

type Course = {
  id: string;
  title: string;
  description: string;
  instructor: string;
  startDate: string;
};

export default function CourseCard({ courses }: { courses: Course[] }) {
  return (
    <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => (
        <Link
          key={course.id}
          href={`/course/${course.id}`}
          className="group block"
        >
          <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-zinc-300 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-lg bg-[#F5F1E6] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border border-zinc-200">
                  {course.id.slice(0, 8)}
                </span>
                <ArrowRight
                  size={18}
                  className="text-zinc-300 transition-colors group-hover:text-zinc-800"
                />
              </div>
              <h2 className="text-2xl font-bold leading-tight text-zinc-800 transition-colors group-hover:text-black">
                {course.title}
              </h2>
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-600">
                {course.description}
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-zinc-100">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-zinc-700">
                  <User size={16} className="text-zinc-400" />
                  <span className="font-medium">{course.instructor}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Calendar size={16} className="text-zinc-400" />
                  <span>
                    Starts{" "}
                    {new Date(course.startDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
