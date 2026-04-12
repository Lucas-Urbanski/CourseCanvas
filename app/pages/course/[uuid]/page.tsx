"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useMemo } from "react";
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
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "../../../context/AuthContext";
import AuthGuard from "../../../components/AuthGuard";

type Course = {
  id: string;
  name: string;
  description: string;
  instructorId: string;
  instructor: string;
  startDate: string;
  endDate: string;
};

type Quiz = {
  id: string;
  title: string;
  dueDate: string;
  timeLimit: number;
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

type Grade = {
  studentId: string;
  quizId: string;
  courseId: string;
  score: number;
};

function CourseContent() {
  const params = useParams<{ uuid: string | string[] }>();
  const uuid = Array.isArray(params.uuid) ? params.uuid[0] : params.uuid;

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const isTeacher = course?.instructorId === user?.id;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  const [uploading, setUploading] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
  const [pendingDeleteQuiz, setPendingDeleteQuiz] = useState<string | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!uuid) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [courseRes, quizRes, enrollmentRes, lessonsRes, gradeRes] =
          await Promise.all([
            supabase
              .from("courses")
              .select(
                `id, title, description, "startDate", "endDate", "instructorId", profiles:instructorId ("fullName")`,
              )
              .eq("id", uuid)
              .single(),
            supabase
              .from("quizzes")
              .select(`id, title, timeLimit, "dueDate", published`)
              .eq("courseId", uuid),
            supabase
              .from("enrollments")
              .select(`student:studentId (id, "fullName")`)
              .eq("courseId", uuid),
            supabase
              .from("lessons")
              .select(
                `id, title, "fileName", "fileUrl", "filePath", "uploadedAt", published`,
              )
              .eq("courseId", uuid)
              .order("uploadedAt", { ascending: false }),
            supabase
              .from("grades")
              .select(`score, "studentId", "quizId", "courseId"`)
              .eq("courseId", uuid)
              .eq("studentId", user?.id),
          ]);

        if (courseRes.error) throw courseRes.error;
        if (quizRes.error) throw quizRes.error;
        if (enrollmentRes.error) throw enrollmentRes.error;
        if (lessonsRes.error) throw lessonsRes.error;
        if (gradeRes.error) throw gradeRes.error;

        const raw = courseRes.data as any;
        setCourse({
          id: raw.id,
          name: raw.title,
          description: raw.description ?? "",
          instructorId: raw.instructorId ?? "",
          instructor: raw.profiles?.fullName ?? "Unknown Instructor",
          startDate: raw.startDate ?? "",
          endDate: raw.endDate ?? "",
        });

        setQuizzes(
          (quizRes.data ?? []).map((q: any) => ({
            id: String(q.id),
            title: q.title,
            dueDate: q.dueDate ?? "",
            timeLimit: q.timeLimit ?? 10000,
            published: q.published ?? false,
          })),
        );

        setStudents(
          (enrollmentRes.data ?? [])
            .map((e: any) => e.student as Student | null)
            .filter((s): s is Student => s !== null),
        );

        setLessons(
          (lessonsRes.data ?? []).map((l: any) => ({
            id: String(l.id),
            title: l.title,
            fileName: l.fileName,
            fileUrl: l.fileUrl,
            filePath: l.filePath,
            published: l.published ?? false,
          })),
        );

        setGrades(
          (gradeRes.data ?? []).map((g: any) => ({
            studentId: g.studentId,
            quizId: g.quizId,
            courseId: g.courseId,
            score: g.score,
          })),
        );
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uuid, supabase, user?.id]);

  const handleLessonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uuid) return;

    setActionError(null);

    const {
      data: { user: liveUser },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !liveUser) {
      setActionError("Authentication error. Please sign in again.");
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
      if (uploadError)
        throw new Error(`Storage upload failed: ${uploadError.message}`);

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
      if (insertError)
        throw new Error(`Database insert failed: ${insertError.message}`);

      setLessons((prev) => [
        {
          ...(inserted as Lesson),
          id: String((inserted as any).id),
        },
        ...prev,
      ]);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setActionError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteLesson = async (lesson: Lesson) => {
    if (!window.confirm(`Are you sure you want to delete "${lesson.title}"?`)) {
      return;
    }

    setActionError(null);

    try {
      setDeletingLessonId(lesson.id);

      const { data: dbData, error: dbError } = await supabase
        .from("lessons")
        .delete()
        .eq("id", Number(lesson.id))
        .select();

      console.log("DB DELETE DATA:", dbData);
      console.log("DB DELETE ERROR:", dbError);

      if (dbError) {
        throw new Error(`Database delete failed: ${dbError.message}`);
      }

      if (!dbData || dbData.length === 0) {
        throw new Error("Lesson was not deleted from the database.");
      }

      const { error: storageError } = await supabase.storage
        .from("lesson-files")
        .remove([lesson.filePath]);

      console.log("STORAGE DELETE ERROR:", storageError);

      if (storageError) {
        throw new Error(`Storage delete failed: ${storageError.message}`);
      }

      setLessons((prev) => prev.filter((l) => l.id !== lesson.id));
    } catch (err: any) {
      console.error("Delete failed:", err);
      setActionError(err.message || "Delete failed.");
    } finally {
      setDeletingLessonId(null);
    }
  };

  const handleToggleLessonPublish = async (lesson: Lesson) => {
    setActionError(null);
    try {
      const { error } = await supabase
        .from("lessons")
        .update({ published: !lesson.published })
        .eq("id", Number(lesson.id));
      if (error) throw error;
      setLessons((prev) =>
        prev.map((l) =>
          l.id === lesson.id ? { ...l, published: !l.published } : l,
        ),
      );
    } catch (err: any) {
      setActionError(err.message || "Failed to update lesson.");
    }
  };

  const handleDeleteQuiz = async (quiz: Quiz) => {
    if (pendingDeleteQuiz !== quiz.id) {
      setPendingDeleteQuiz(quiz.id);
      return;
    }

    setActionError(null);
    try {
      setDeletingQuizId(quiz.id);

      const { error: dbError } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", quiz.id);
      if (dbError)
        throw new Error(`Database delete failed: ${dbError.message}`);

      setQuizzes((prev) => prev.filter((q) => q.id !== quiz.id));
      setPendingDeleteQuiz(null);
    } catch (err: any) {
      console.error("Delete failed:", err);
      setActionError(err.message || "Delete failed.");
    } finally {
      setDeletingQuizId(null);
    }
  };

  const handleToggleQuizPublish = async (quiz: Quiz) => {
    setActionError(null);
    try {
      const { error } = await supabase
        .from("quizzes")
        .update({ published: !quiz.published })
        .eq("id", quiz.id);
      if (error) throw error;
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === quiz.id ? { ...q, published: !q.published } : q,
        ),
      );
    } catch (err: any) {
      setActionError(err.message || "Failed to update quiz.");
    }
  };

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
    : lessons.filter((l) => l.published);
  const visibleQuizzes = isTeacher
    ? quizzes
    : quizzes.filter((q) => q.published);

  return (
    <div className="min-h-screen bg-[#F5F1E6] text-zinc-800">
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
                  {course.startDate} - {course.endDate}
                </p>
              </div>
            </div>
          </div>
        </section>

        {actionError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {actionError}
          </div>
        )}

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
                {students.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-sm font-medium"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold uppercase text-white">
                      {s.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    {s.fullName}
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

        <div className="w-full space-y-4">
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
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 text-sm font-bold text-[#F5F1E6] transition-all hover:bg-black disabled:opacity-50"
                >
                  {uploading ? (
                    "Uploading…"
                  ) : (
                    <>
                      <Upload size={16} /> Upload Lesson
                    </>
                  )}
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
              {visibleLessons.map((l) => (
                <div
                  key={l.id}
                  className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-400 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <a
                      href={l.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-w-0 flex-1 items-center gap-4"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-800">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-lg font-bold group-hover:text-black">
                            {l.title}
                          </h3>
                        </div>
                        <p className="truncate text-xs text-zinc-500">
                          {l.fileName}
                        </p>
                      </div>
                    </a>
                    <div className="flex shrink-0 items-center gap-2">
                      {isTeacher && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleLessonPublish(l)}
                            className={`rounded-lg px-3 py-1 text-xs font-bold uppercase transition ${l.published ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
                          >
                            {l.published ? "unlocked" : "locked"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLesson(l)}
                            disabled={deletingLessonId === l.id}
                            className="rounded-lg p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            title="Delete lesson"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                      <a
                        href={l.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-300 transition-colors hover:text-zinc-800"
                      >
                        {l.published && <ChevronRight size={20} />}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-full space-y-4">
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
            <p className="py-12 text-center text-zinc-400">
              No quizzes available.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visibleQuizzes.map((q) => {
                const card = (
                  <div className="flex items-center justify-between rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all group-hover:border-zinc-400 group-hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${q.published ? "bg-zinc-100 text-zinc-800" : "bg-zinc-50 text-zinc-300"}`}
                      >
                        {q.published ? (
                          <FileQuestion size={20} />
                        ) : (
                          <Lock size={20} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-lg font-bold group-hover:text-black">
                            {q.title}
                          </h3>
                        </div>
                        {q.dueDate && (
                          <p className="truncate text-xs text-zinc-500">
                            Due {q.dueDate}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isTeacher && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleToggleQuizPublish(q);
                            }}
                            className={`rounded-lg px-3 py-1 text-xs font-bold uppercase transition ${q.published ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
                          >
                            {q.published ? "unlocked" : "locked"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuiz(q)}
                            disabled={deletingQuizId === q.id}
                            className={`rounded-lg p-2 transition disabled:opacity-50 ${pendingDeleteQuiz === q.id ? "bg-red-100 text-red-600" : "text-zinc-400 hover:bg-red-50 hover:text-red-600"}`}
                            title={
                              pendingDeleteQuiz === q.id
                                ? "Click again to confirm"
                                : "Delete quiz"
                            }
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}

                      {grades.find((g) => g.quizId === q.id) && (
                        <p className="text-xs text-zinc-500">
                          {grades.find((g) => g.quizId === q.id)?.score}%
                        </p>
                      )}

                      {q.published && (
                        <ChevronRight
                          size={20}
                          className="text-zinc-300 transition-colors hover:text-zinc-800"
                        />
                      )}
                    </div>
                  </div>
                );

                return q.published ? (
                  <div key={q.id}>
                  {isTeacher ? (
                  <div className="block">
                    {card}
                  </div>)
                  : (<Link
                    href={`/pages/quiz/${q.id}`}
                    className="group block"
                  >
                    {card}
                  </Link>)}
                  </div>
                ) : (
                  <div key={q.id} className="block">
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