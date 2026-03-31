"use client";

import Link from "next/link";

type Course = {
  id: string;
  name: string;
  description: string;
  teacher: string;
  startDate: string;
};

type CourseCardProps = {
  courses: Course[];
};

export default function CourseCard({ courses }: CourseCardProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => (
        <Link
          key={course.id}
          href={course.name === "Intro to Web Development" ? "/course" : "/home"}
          className="block"
        >
          <div className="cursor-pointer rounded-2xl border border-zinc-300 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
            <h2 className="text-xl font-bold text-zinc-800">{course.name}</h2>
            <p className="mt-2 text-zinc-600">{course.description}</p>
            <p className="mt-4 text-sm text-zinc-700">
              <span className="font-semibold">Instructor:</span> {course.teacher}
            </p>
            <p className="mt-1 text-sm text-zinc-700">
              <span className="font-semibold">Start Date:</span> {course.startDate}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}