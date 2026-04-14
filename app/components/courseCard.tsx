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
  Award,
} from "lucide-react";

// Type definition for a Course object used throughout the component.
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

// Props for the main CourseCard list component.
interface CourseCardProps {
  courses: Course[];
  onEnroll?: (courseId: string) => Promise<void>;
  onUnenroll?: (courseId: string) => Promise<void>;
  onDelete?: (courseId: string) => Promise<void>;
}

// Component to display a stylized "Certificate of Completion" in an overlay.
function CertificateModal({
  course,
  onClose,
}: {
  course: Course;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      // Close if clicking outside the certificate
      onClick={onClose} 
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        // Prevent closing when clicking inside the certificate
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Gold Header */}
        <div className="bg-gradient-to-r from-amber-500 to-yellow-400 px-8 py-6 text-center">
          <Award size={48} className="mx-auto mb-2 text-white drop-shadow" />
          <p className="text-xs font-bold uppercase tracking-widest text-amber-900/70">
            Certificate of Completion
          </p>
        </div>

        {/* Certificate Details */}
        <div className="px-10 py-8 text-center">
          <p className="mb-1 text-sm text-zinc-400">This certifies that</p>
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
            you have successfully completed
          </p>

          <h2 className="mb-6 text-3xl font-black text-zinc-900">
            {course.title}
          </h2>

          <div className="mx-auto mb-6 h-px w-24 bg-amber-400" />

          {/* Instructor and Completion Date */}
          <div className="mb-8 flex justify-center gap-8 text-sm text-zinc-500">
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-zinc-400" />
              <span>{course.instructor}</span>
            </div>
            {course.endDate && (
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-zinc-400" />
                <span>
                  {new Date(course.endDate).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Central Seal */}
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border-4 border-amber-400 bg-amber-50">
            <Award size={36} className="text-amber-500" />
          </div>

          {/* Close/view Buttons */}
          <div className="flex gap-3">
            <Link
              href={`/pages/course/${course.id}`}
              className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
            >
              View Course
            </Link>
            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// Main component that renders a grid of courses with actions for enrollment and management.
export default function CourseCard({
  courses,
  onEnroll,
  onUnenroll,
  onDelete,
}: CourseCardProps) {
  // Track which course is currently in the "Confirm?" state for deletion/unenrollment
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  // Track which course certificate is currently being displayed in the modal
  const [certCourse, setCertCourse] = useState<Course | null>(null);


  // Handles immediate enrollment.
  const handleEnrollClick = (e: React.MouseEvent, courseId: string) => {
    e.preventDefault();
    onEnroll?.(courseId);
  };

  // Handles actions that require a double-click/confirmation (e.g., Unenroll, Delete).
  // First click sets the pending state, second click executes the action.
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

  // Resets the confirmation state if the user cancels.
  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    setPendingAction(null);
  };

  return (
    <>
      {/* Conditionally render Certificate */}
      {certCourse && (
        <CertificateModal
          course={certCourse}
          onClose={() => setCertCourse(null)}
        />
      )}

      {/* Course Cards Grid */}
      <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => {
          const isConfirming = pendingAction === course.id;

          // reusable card UI snippet 
          const card = (
            <div
              className={`relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                course.isCompleted
                  ? "border-amber-300 ring-1 ring-amber-200"
                  : "border-zinc-300"
              }`}
            >
              {/* Certification Badge */}
              {course.isCompleted && (
                <div className="absolute right-0 top-0 flex items-center gap-2 rounded-bl-2xl rounded-tr-3xl bg-gradient-to-r from-amber-500 to-yellow-400 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white">
                  <Award size={12} />
                  Certified
                </div>
              )}

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-lg border border-zinc-200 bg-zinc-900 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white">
                    {course.id.slice(0, 8)}
                  </span>

                  {/* Delete Button */}
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
                          <><Check size={14} /> Confirm</>
                        ) : (
                          <><XIcon size={14} /> Remove</>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Unenroll Button */}
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
                          <><Check size={14} /> Confirm</>
                        ) : (
                          <><LogOut size={14} /> Unenroll</>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Enroll Action */}
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

              {/* Course Details */}
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
          );

          /* Return Logic: 
            If completed, clicking the card opens the certificate modal.
            If not completed, clicking the card navigates to the course details page.
          */
          return course.isCompleted ? (
            <div
              key={course.id}
              className="group block cursor-pointer"
              onClick={() => setCertCourse(course)}
            >
              {card}
            </div>
          ) : (
            <Link
              key={course.id}
              href={`/pages/course/${course.id}`}
              className="group block"
            >
              {card}
            </Link>
          );
        })}
      </div>
    </>
  );
}