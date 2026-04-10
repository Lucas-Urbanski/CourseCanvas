"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Calendar, User, GraduationCap, XIcon, Check } from "lucide-react";

type Course = {
  id: string;
  title: string;
  description: string;
  instructor: string;
  startDate: string;
};

interface CourseCardProps {
  courses: Course[];
  onEnroll?: (courseId: string) => Promise<void>;
  onDelete?: (courseId: string) => Promise<void>;
}

export default function CourseCard({ courses, onEnroll, onDelete }: CourseCardProps) {
  const { user } = useAuth();
  const isTeacher = user?.role === "instructor";

  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const handleEnrollClick = (e: React.MouseEvent, courseId: string) => {
    e.preventDefault();
    onEnroll?.(courseId);
  };

  const handleDeleteClick = (e: React.MouseEvent, courseId: string) => {
    e.preventDefault();
    if (pendingDelete === courseId) {
      onDelete?.(courseId);
      setPendingDelete(null);
    } else {
      setPendingDelete(courseId);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    setPendingDelete(null);
  };

  return (
    <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => {
        const isConfirming = pendingDelete === course.id;

        return (
          <Link key={course.id} href={`/pages/course/${course.id}`} className="group block">
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-zinc-300 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-lg bg-[#F5F1E6] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border border-zinc-200">
                    {course.id.slice(0, 8)}
                  </span>

                  {isTeacher ? (
                    <div className="flex items-center gap-2">
                      {isConfirming && (
                        <button
                          onClick={handleCancelDelete}
                          className="flex items-center gap-2 rounded-xl px-4 py-2 text-[11px] font-bold uppercase tracking-tight text-white transition-all active:scale-95 bg-zinc-900 hover:bg-zinc-700"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDeleteClick(e, course.id)}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[11px] font-bold uppercase tracking-tight text-white transition-all active:scale-95 ${
                          isConfirming
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-zinc-900 hover:bg-zinc-700"
                        }`}
                      >
                        {isConfirming ? (
                          <><Check size={14} /> Confirm</>
                        ) : (
                          <><XIcon size={14} /> Remove</>
                        )}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => handleEnrollClick(e, course.id)}
                      className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-[11px] font-bold uppercase tracking-tight text-white transition-all"
                    >
                      <GraduationCap size={14} />
                      Enroll
                    </button>
                  )}
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
        );
      })}
    </div>
  );
}