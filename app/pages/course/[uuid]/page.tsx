"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  BookOpen,
  Settings,
  CalendarDays,
  UserCircle,
  FileQuestion,
  ChevronRight,
  Plus,
  Upload,
  GraduationCap,
  Lock,
  FileText,
  Users,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import AuthGuard from "../../../components/AuthGuard";
import { createClient } from "@/lib/supabase";

// Types
type Course = {
  id: string;
  name: string;
  description: string;
  instructor: string;
  startDate: string;
  endDate: string;
};

type Quiz = {
  id: string;
  title: string;
  dueDate: string;
  status: "Open" | "Locked";
  published: boolean;
};

type Student = {
  id: string;
  fullName: string;
};

type Lesson = {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  filePath: string;
  published: boolean;
};

// Component
function CourseContent() {
  const params = useParams<{ uuid: string | string[] }>();
  const uuid = Array.isArray(params.uuid) ? params.uuid[0] : params.uuid;
  const [supabase] = useState(() => createClient());

  const { user } = useAuth();
  const isTeacher = user?.role === "instructor";
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploading, setUploading] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem("courseid", course?.id ?? "null");
  }, [course?.id]);

  useEffect(() => {
    if (!uuid) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        const [courseRes, quizRes, enrollmentRes, lessonsRes] =
          await Promise.all([
            supabase
              .from("courses")
              .select(
                `id, title, description, "startDate", "endDate", profiles:instructorId ("fullName")`
              )
              .eq("id", uuid)
              .single(),

            supabase
              .from("quizzes")
              .select(`id, title, status, "dueDate", published`)
              .eq("courseId", uuid),

            supabase
              .from("enrollments")
              .select(`student:studentId (id, "fullName")`)
              .eq("courseId", uuid),

            supabase
              .from("lessons")
              .select(
                `id, title, "fileName", "fileUrl", "filePath", "uploadedAt", published`
              )
              .eq("courseId", uuid)
              .order("uploadedAt", { ascending: false }),
          ]);

        if (courseRes.error) throw courseRes.error;
        if (quizRes.error) throw quizRes.error;
        if (enrollmentRes.error) throw enrollmentRes.error;
        if (lessonsRes.error) throw lessonsRes.error;

        const rawCourse = courseRes.data as any;

        setCourse(
          rawCourse
            ? {
                id: rawCourse.id,
                name: rawCourse.title,
                description: rawCourse.description ?? "",
                instructor: rawCourse.profiles?.fullName ?? "Unknown Instructor",
                startDate: rawCourse.startDate ?? "",
                endDate: rawCourse.endDate ?? "",
              }
            : null
        );

        setQuizzes(
          (quizRes.data ?? []).map((quiz: any) => ({
            id: quiz.id,
            title: quiz.title,
            dueDate: quiz.dueDate ?? "",
            status: quiz.status === "open" ? "Open" : "Locked",
            published: quiz.published ?? false,
          }))
        );

        setStudents(
          (enrollmentRes.data ?? [])
            .map((e: any) => e.student as Student | null)
            .filter((s): s is Student => s !== null)
        );

        setLessons(
          (lessonsRes.data ?? []).map((lesson: any) => ({
            id: lesson.id,
            title: lesson.title,
            fileName: lesson.fileName,
            fileUrl: lesson.fileUrl,
            filePath: lesson.filePath,
            published: lesson.published ?? false,
          }))
        );
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uuid, supabase]);

  // Handlers
  const handleUploadClick = () => fileInputRef.current?.click();

  const handleLessonUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !course || !uuid) return;

    const {
      data: { user: liveUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !liveUser) {
      alert("Authentication error. Please sign in again.");
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const safeName = file.name.replace(/\s+/g, "_");
      const filePath = `${uuid}/${Date.now()}_${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("lesson-files")
        .upload(filePath, file, { upsert: false });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("lesson-files").getPublicUrl(filePath);

      const { data: inserted, error: insertError } = await supabase
        .from("lessons")
        .insert([
          {
            title: file.name.replace(/\.[^/.]+$/, ""),
            fileName: file.name,
            filePath,
            fileUrl: publicUrl,
            courseId: uuid,
            uploadedBy: liveUser.id,
            published: false,
          },
        ])
        .select(`id, title, "fileName", "fileUrl", "filePath", published`)
        .single();

      if (insertError) {
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      setLessons((prev) => [inserted as Lesson, ...prev]);
      alert("Lesson uploaded!");
    } catch (error: any) {
      console.error("Upload failed:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteLesson = async (lesson: Lesson) => {
    if (!window.confirm(`Are you sure you want to delete "${lesson.title}"?`)) {
      return;
    }

    try {
      setDeletingLessonId(lesson.id);

      const { error: storageError } = await supabase.storage
        .from("lesson-files")
        .remove([lesson.filePath]);

      if (storageError) {
        throw new Error(`Storage delete failed: ${storageError.message}`);
      }

      const { error: dbError } = await supabase
        .from("lessons")
        .delete()
        .eq("id", lesson.id);

      if (dbError) {
        throw new Error(`Database delete failed: ${dbError.message}`);
      }

      setLessons((prev) => prev.filter((l) => l.id !== lesson.id));
    } catch (error: any) {
      console.error("Delete failed:", error);
      alert(`Delete failed: ${error.message}`);
    } finally {
      setDeletingLessonId(null);
    }
  };

  const handleToggleLessonPublish = async (lesson: Lesson) => {
    try {
      const { error } = await supabase
        .from("lessons")
        .update({ published: !lesson.published })
        .eq("id", lesson.id);

      if (error) {
        throw new Error(`Lesson update failed: ${error.message}`);
      }

      setLessons((prev) =>
        prev.map((l) =>
          l.id === lesson.id ? { ...l, published: !l.published } : l
        )
      );
    } catch (error: any) {
      console.error("Lesson publish toggle failed:", error);
      alert(error.message);
    }
  };

  const handleToggleQuizPublish = async (quiz: Quiz) => {
    try {
      const nextPublished = !quiz.published;
      const { error } = await supabase
        .from("quizzes")
        .update({ published: nextPublished })
        .eq("id", quiz.id);

      if (error) {
        throw new Error(`Quiz update failed: ${error.message}`);
      }

      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === quiz.id ? { ...q, published: nextPublished } : q
        )
      );
    } catch (error: any) {
      console.error("Quiz publish toggle failed:", error);
      alert(error.message);
    }
  };

  // Loading / not-found states

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1E6]">
        <div className="animate-pulse font-bold text-zinc-400">
          Loading Course...
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1E6]">
        <p className="text-zinc-500">Course not found.</p>
      </div>
    );
  }

  const visibleLessons = isTeacher
    ? lessons
    : lessons.filter((lesson) => lesson.published);

  const visibleQuizzes = isTeacher
    ? quizzes
    : quizzes.filter((quiz) => quiz.published);

  return (
    <div className="min-h-screen bg-[#F5F1E6] text-zinc-800">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 px-8 py-4 backdrop-blur-lg">
        <div className="mx-auto flex items-center justify-between">
          <Link
            href="/pages/home"
            className="flex items-center gap-2 transition-transform hover:scale-95"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
              <BookOpen size={20} />
            </div>
            <span className="hidden text-lg font-bold tracking-tight sm:block">
              CourseCanvas
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="border-r border-zinc-200 pr-4 text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Signed in as
              </p>
              <p className="text-sm font-semibold text-zinc-800">
                {user?.name ?? "User"}
              </p>
            </div>
            <Link
              href="/pages/settings"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 bg-white shadow-sm transition-colors hover:bg-zinc-50"
            >
              <Settings
                size={20}
                className="transition-transform hover:rotate-45"
              />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto space-y-8 px-6 py-12">
        {/* Course Card */}
        <section className="rounded-3xl bg-zinc-900 p-10 text-white shadow-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
            <GraduationCap size={14} /> Active Course
          </div>
          <h1 className="text-2xl font-black sm:text-3xl md:text-4xl lg:text-5xl">
            {course.name}
          </h1>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="rounded-xl bg-white/10 p-2">
                <UserCircle size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase opacity-50">
                  Instructor
                </p>
                <p className="text-sm font-semibold">{course.instructor}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="rounded-xl bg-white/10 p-2">
                <CalendarDays size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase opacity-50">
                  Schedule
                </p>
                <p className="text-sm font-semibold">
                  {course.startDate} – {course.endDate}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Enrollment / description */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <Users size={20} className="text-zinc-400" />
              {isTeacher ? "Class Enrollment" : "About This Course"}
            </h3>
            {isTeacher && (
              <span className="rounded bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-500">
                {students.length} Total
              </span>
            )}
          </div>

          {isTeacher ? (
            students.length === 0 ? (
              <p className="py-8 text-center text-zinc-400">
                No students enrolled yet.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-sm font-medium"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold uppercase text-white">
                      {student.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    {student.fullName}
                  </div>
                ))}
              </div>
            )
          ) : (
            <p className="text-sm leading-relaxed text-zinc-600">
              {course.description || "No description provided."}
            </p>
          )}
        </div>

        {/* Lessons */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <FileText size={24} /> Lessons
            </h2>

            {isTeacher && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleLessonUpload}
                />
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 text-sm font-bold text-[#F5F1E6] transition-all hover:bg-black disabled:opacity-50"
                >
                  {uploading ? "Uploading…" : <><Upload size={16} /> Upload Lesson</>}
                </button>
              </>
            )}
          </div>

          {visibleLessons.length === 0 ? (
            <p className="py-12 text-center text-zinc-400">
              No lessons available.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visibleLessons.map((lesson) => (
                <div key={lesson.id} className="group block">
                  <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all group-hover:border-zinc-400 group-hover:shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <a
                        href={lesson.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-w-0 flex-1 items-center gap-4"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-800">
                          <FileText size={20} />
                        </div>
                        <div className="min-w-0 max-w-[150px] sm:max-w-full">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-lg font-bold group-hover:text-black">
                              {lesson.title}
                            </h3>
                            {isTeacher && (
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  lesson.published
                                    ? "bg-green-100 text-green-700"
                                    : "bg-zinc-100 text-zinc-500"
                                }`}
                              >
                                {lesson.published ? "Published" : "Hidden"}
                              </span>
                            )}
                          </div>
                          <p className="truncate text-xs text-zinc-500">
                            {lesson.fileName}
                          </p>
                        </div>
                      </a>

                      <div className="flex items-center gap-2">
                        {isTeacher && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleLessonPublish(lesson)}
                              className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                                lesson.published
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                              }`}
                              title={lesson.published ? "Unpublish lesson" : "Publish lesson"}
                            >
                              {lesson.published ? "Unpublish" : "Publish"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteLesson(lesson)}
                              disabled={deletingLessonId === lesson.id}
                              className="rounded-lg p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              title="Delete lesson"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}

                        <a
                          href={lesson.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-300 transition-colors hover:text-zinc-800"
                          title="Open in new tab"
                        >
                          <ChevronRight size={20} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quizzes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <FileQuestion size={24} /> Quizzes
            </h2>
            {isTeacher && (
              <Link
                href={`/pages/quizCreation?courseId=${uuid}`}
                className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 text-sm font-bold text-[#F5F1E6] transition-all hover:bg-black"
              >
                <Plus size={16} /> Create Quiz
              </Link>
            )}
          </div>

          {visibleQuizzes.length === 0 ? (
            <p className="py-12 text-center text-zinc-400">No quizzes available.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visibleQuizzes.map((quiz) => {
                const isOpen = quiz.status === "Open";

                const card = (
                  <div className="flex items-center justify-between rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all group-hover:border-zinc-400 group-hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                          isOpen
                            ? "bg-zinc-100 text-zinc-800"
                            : "bg-zinc-50 text-zinc-300"
                        }`}
                      >
                        {isOpen ? <FileQuestion size={20} /> : <Lock size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold group-hover:text-black">
                            {quiz.title}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              isOpen
                                ? "bg-green-100 text-green-700"
                                : "bg-zinc-100 text-zinc-400"
                            }`}
                          >
                            {quiz.status}
                          </span>
                          {isTeacher && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                quiz.published
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-zinc-100 text-zinc-500"
                              }`}
                            >
                              {quiz.published ? "Published" : "Hidden"}
                            </span>
                          )}
                        </div>
                        {quiz.dueDate && (
                          <p className="text-sm text-zinc-500">
                            Due {quiz.dueDate}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isTeacher && (
                        <button
                          type="button"
                          onClick={() => handleToggleQuizPublish(quiz)}
                          className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                            quiz.published
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                          }`}
                          title={quiz.published ? "Unpublish quiz" : "Publish quiz"}
                        >
                          {quiz.published ? "Unpublish" : "Publish"}
                        </button>
                      )}

                      {isOpen && (
                        <ChevronRight
                          size={20}
                          className="text-zinc-300 transition-colors group-hover:text-zinc-800"
                        />
                      )}
                    </div>
                  </div>
                );

                return isOpen ? (
                  <Link
                    key={quiz.id}
                    href={`/pages/quiz/${quiz.id}`}
                    className="group block"
                  >
                    {card}
                  </Link>
                ) : (
                  <div key={quiz.id} className="block">
                    {card}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CoursePage() {
  return (
    <AuthGuard>
      <CourseContent />
    </AuthGuard>
  );
}