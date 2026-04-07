"use client";

import Link from "next/link";
import { useMemo, useState, useRef } from "react";
import {
  BookOpen,
  Settings,
  CalendarDays,
  Users,
  UserCircle,
  FileQuestion,
  ChevronRight,
  Plus,
  GraduationCap,
  FileText,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AuthGuard from "../../components/AuthGuard";
import { createBrowserClient } from "@supabase/ssr";

type LessonFile = {
  id: number;
  title: string;
  dueDate: string;
  status: string;
  fileUrl?: string;
  fileName?: string;
};

export default function CoursePage({ params }: { params: { uuid: string } }) {
  return (
    <AuthGuard>
      <CourseContent params={params} />
    </AuthGuard>
  );
}

function CourseContent({ params }: { params: { uuid: string } }) {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );
  const { user } = useAuth();
  const isTeacher = user?.role === "instructor";
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploading, setUploading] = useState(false);

  const [lessons, setLessons] = useState<LessonFile[]>([
    {
      id: 1,
      title: "HTML Basics Slides",
      dueDate: "May 19, 2026",
      status: "Open",
      fileUrl: "",
      fileName: "",
    },
    {
      id: 2,
      title: "CSS Fundamentals Notes",
      dueDate: "June 3, 2026",
      status: "Locked",
      fileUrl: "",
      fileName: "",
    },
    {
      id: 3,
      title: "JavaScript Intro Lesson",
      dueDate: "June 17, 2026",
      status: "Locked",
      fileUrl: "",
      fileName: "",
    },
  ]);

  const callCourse = async () => {
    const { uuid } = params;
    const { error: courseError } = await supabase
      .from("courses")
      .select("title, description, startDate, endDate")
      .eq("id", uuid)
      .single();

    if (courseError) {
      console.error("Error fetching course:", courseError);
    }
  };

  const callQuiz = async () => {
    const { error: quizError } = await supabase
      .from("quizzes")
      .select("title, dueDate")
      .eq("id", 1)
      .single();
  };

  const course = {
    name: "Introduction to Web Development",
    teacher: "Prof. Sarah Johnson",
    startDate: "May 6, 2026",
    endDate: "August 20, 2026",
    students: ["Alex Brown", "Jamie Lee", "Taylor Smith", "Jordan White"],
    quizzes: [
      {
        id: 1,
        title: "HTML Basics Quiz",
        dueDate: "May 20, 2026",
        status: "Open",
      },
      {
        id: 2,
        title: "CSS Fundamentals Quiz",
        dueDate: "June 3, 2026",
        status: "Locked",
      },
      {
        id: 3,
        title: "JavaScript Intro Quiz",
        dueDate: "June 17, 2026",
        status: "Locked",
      },
    ],
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleLessonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const {
      data: { user: liveUser },
      error: userError,
    } = await supabase.auth.getUser();

    console.log("LIVE USER:", liveUser);
    console.log("USER ERROR:", userError);

    if (userError || !liveUser) {
      alert("You are not authenticated. Please sign in again.");
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const safeName = file.name.replace(/\s+/g, "_");
      const filePath = `${course.name}/${Date.now()}_${safeName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("lesson-files")
        .upload(filePath, file, {
          upsert: false,
        });

      console.log("UPLOAD DATA:", uploadData);
      console.log("UPLOAD ERROR:", uploadError);

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from("lesson-files")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      const newLesson = {
        title: file.name.replace(/\.[^/.]+$/, ""),
        fileName: file.name,
        filePath: filePath,
        fileUrl: publicUrl,
        courseName: course.name,
        uploadedBy: liveUser.id,
      };

      const { data: insertData, error: insertError } = await supabase
        .from("lesson_uploads")
        .insert([newLesson]);

      console.log("INSERT DATA:", insertData);
      console.log("INSERT ERROR:", insertError);

      if (insertError) {
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      setLessons((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          title: newLesson.title,
          dueDate: "New Upload",
          status: "Open",
          fileUrl: publicUrl,
          fileName: file.name,
        },
      ]);

      alert("Lesson uploaded successfully.");
    } catch (error: any) {
      console.error("Upload failed:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E6] text-zinc-800">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 px-8 py-4 backdrop-blur-lg">
        <div className="mx-auto flex items-center justify-between">
          <Link
            href="/home"
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
                {user?.name || "User"}
              </p>
            </div>
            <Link
              href="/settings"
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

      <main className="mx-auto px-6 py-12">
        <section className="relative mb-12 rounded-[2.5rem] bg-zinc-900 p-10 text-white shadow-2xl">
          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
              <GraduationCap size={14} /> Active Course
            </div>
            <h1 className="text-2xl font-black sm:text-3xl md:text-4xl lg:text-5xl">
              {course.name}
            </h1>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="rounded-xl bg-white/10 p-2">
                  <UserCircle size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-50">
                    Instructor
                  </p>
                  <p className="text-sm font-semibold">{course.teacher}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
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
          </div>
        </section>

        <div className="rounded-4xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <Users size={20} className="text-zinc-400" />
              {isTeacher ? "Class Enrollment" : "Course Info"}
            </h3>
            {isTeacher && (
              <span className="rounded bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-500">
                {course.students.length} Total
              </span>
            )}
          </div>

          {isTeacher ? (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {course.students.map((student, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-zinc-50 bg-zinc-50/50 p-3 text-sm font-medium"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-bold uppercase">
                    {student
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  {student}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm italic leading-relaxed text-zinc-600">
              "The goal of this course is to provide a solid foundation in
              modern web technologies, moving from structure to style and
              interaction."
            </div>
          )}
        </div>

        <div className="grid gap-4">
          <div className="mt-8 flex items-center justify-between px-2">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <FileText size={24} /> Lessons
            </h2>

            {isTeacher && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.ppt,.pptx,.doc,.docx"
                  className="hidden"
                  onChange={handleLessonUpload}
                />

                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="group flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 text-sm font-bold text-[#F5F1E6] transition-all hover:bg-black disabled:opacity-60"
                >
                  <Plus size={16} />
                  {uploading ? "Uploading..." : "Upload Lessons"}
                </button>
              </>
            )}
          </div>

          <div className="grid items-center gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => {
              const content = (
                <div className="flex items-center justify-between rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all group-hover:border-zinc-400 group-hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        lesson.status === "Open"
                          ? "bg-zinc-100 text-zinc-800"
                          : "bg-zinc-50 text-zinc-300"
                      }`}
                    >
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold group-hover:text-black">
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-zinc-500">
                        {lesson.fileName
                          ? lesson.fileName
                          : `Due ${lesson.dueDate}`}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-zinc-300 transition-colors group-hover:text-zinc-800"
                  />
                </div>
              );

              return lesson.fileUrl ? (
                <a
                  key={lesson.id}
                  href={lesson.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group block"
                >
                  {content}
                </a>
              ) : (
                <div key={lesson.id} className="group block">
                  {content}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="mt-8 flex items-center justify-between px-2">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <FileQuestion size={24} /> Quizzes
            </h2>
            {isTeacher && (
              <Link
                href="/quizCreation"
                className="group flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 text-sm font-bold text-[#F5F1E6] transition-all hover:bg-black"
              >
                <Plus size={16} /> Create Quiz
              </Link>
            )}
          </div>

          <div className="grid items-center gap-4 md:grid-cols-2 lg:grid-cols-3">
            {course.quizzes.map((quiz) => {
              const content = (
                <div className="flex items-center justify-between rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all group-hover:border-zinc-400 group-hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        quiz.status === "Open"
                          ? "bg-zinc-100 text-zinc-800"
                          : "bg-zinc-50 text-zinc-300"
                      }`}
                    >
                      <FileQuestion size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold group-hover:text-black">
                        {quiz.title}
                      </h3>
                      <p className="text-sm text-zinc-500">
                        Due {quiz.dueDate}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-zinc-300 transition-colors group-hover:text-zinc-800"
                  />
                </div>
              );

              return quiz.status === "Open" ? (
                <Link key={quiz.id} href="/quiz" className="group block">
                  {content}
                </Link>
              ) : (
                <div key={quiz.id} className="group block">
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
