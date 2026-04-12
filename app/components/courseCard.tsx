"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Calendar,
  User,
  GraduationCap,
  XIcon,
  Check,
  LogOut,
  BadgeCheck,
} from "lucide-react";

type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  startDate: string;
  endDate?: string;
  isCompleted?: boolean;
};

interface CourseCardProps {
  courses: Course[];
  onEnroll?: (courseId: string) => Promise<void>;
  onUnenroll?: (courseId: string) => Promise<void>;
  onDelete?: (courseId: string) => Promise<void>;
}

export default function CourseCard({
  courses,
  onEnroll,
  onUnenroll,
  onDelete,
}: CourseCardProps) {
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const handleEnrollClick = (e: React.MouseEvent, courseId: string) => {
    e.preventDefault();
    onEnroll?.(courseId);
  };

  const handleConfirmableClick = (
    e: React.MouseEvent,
    courseId: string,
    action: () => void,
  ) => {
    e.preventDefault();
    if (pendingAction === courseId) {
      action();
      setPendingAction(null);
    } else {
      setPendingAction(courseId);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    setPendingAction(null);
  };

  return (
    <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => {
        const isConfirming = pendingAction === course.id;

        return (
          <Link
            key={course.id}
            href={`/pages/course/${course.id}`}
            className="group block"
          >
            <div
              className={`relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                course.isCompleted
                  ? "border-green-300 ring-1 ring-green-200"
                  : "border-zinc-300"
              }`}
            >
              {/* Completed ribbon */}
              {course.isCompleted && (
                <div className="absolute right-0 top-0 flex items-center gap-1.5 rounded-bl-2xl rounded-tr-3xl bg-green-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white">
                  <BadgeCheck size={12} />
                  Completed
                </div>
              )}

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-lg border border-zinc-200 bg-zinc-900 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white">
                    {course.id.slice(0, 8)}
                  </span>

                  {/* Delete */}
                  {onDelete && (
                    <div className="flex items-center gap-2">
                      {isConfirming && (
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2 text-[11px] font-bold uppercase tracking-tight text-white transition-all hover:bg-zinc-700 active:scale-95"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={(e) =>
                          handleConfirmableClick(e, course.id, () =>
                            onDelete(course.id),
                          )
                        }
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-bold uppercase tracking-tight text-white transition-all active:scale-95 ${
                          isConfirming
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-zinc-900 hover:bg-zinc-700"
                        }`}
                      >
                        {isConfirming ? (
                          <>
                            <Check size={14} /> Confirm
                          </>
                        ) : (
                          <>
                            <XIcon size={14} /> Remove
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Unenroll */}
                  {onUnenroll && (
                    <div className="flex items-center gap-2">
                      {isConfirming && (
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2 text-[11px] font-bold uppercase tracking-tight text-white transition-all hover:bg-zinc-700 active:scale-95"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={(e) =>
                          handleConfirmableClick(e, course.id, () =>
                            onUnenroll(course.id),
                          )
                        }
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-bold uppercase tracking-tight text-white transition-all active:scale-95 ${
                          isConfirming
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-zinc-900 hover:bg-zinc-700"
                        }`}
                      >
                        {isConfirming ? (
                          <>
                            <Check size={14} /> Confirm
                          </>
                        ) : (
                          <>
                            <LogOut size={14} /> Unenroll
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Enroll */}
                  {onEnroll && (
                    <button
                      onClick={(e) => handleEnrollClick(e, course.id)}
                      className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-[11px] font-bold uppercase tracking-tight text-white transition-all hover:bg-zinc-700 active:scale-95"
                    >
                      <GraduationCap size={14} />
                      Enroll
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-2xl font-bold leading-tight text-zinc-800 transition-colors group-hover:text-black">
                    {course.title}
                  </h2>
                  <span className="text-xs text-zinc-500">{course.category}</span>
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-500">
                  {course.description}
                </p>
              </div>

              <div className="mt-8 border-t border-zinc-100 pt-6">
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