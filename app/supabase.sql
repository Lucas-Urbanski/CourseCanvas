-- CLEANUP
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP VIEW IF EXISTS public.instructor_records, public.student_records;
DROP TABLE IF EXISTS public.profiles, public.courses, public.quizzes CASCADE;

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  "fullName" TEXT,
  role TEXT CHECK (role IN ('student', 'instructor')) DEFAULT 'student',
  bio TEXT DEFAULT NULL,
  "avatarUrl" TEXT DEFAULT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE VIEW public.instructor_records
  WITH (security_invoker = true) AS
  SELECT id, "fullName"
  FROM public.profiles
  WHERE role = 'instructor';

CREATE VIEW public.student_records
  WITH (security_invoker = true) AS
  SELECT id, "fullName"
  FROM public.profiles
  WHERE role = 'student';

-- RLS POLICIES FOR PROFILES
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- AUTOMATION: TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, "fullName", role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'fullName',
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  "instructorId" UUID REFERENCES public.profiles(id),
  "startDate" DATE,
  "endDate" DATE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR COURSES
CREATE POLICY "Courses are viewable by everyone"
  ON public.courses FOR SELECT USING (TRUE);

CREATE POLICY "Instructors can create their own courses"
ON public.courses
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role = 'instructor'
  )
);

CREATE POLICY "Instructors can manage their own courses"
  ON public.courses FOR ALL USING (auth.uid() = "instructorId");

-- QUIZZES TABLE
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "courseId" UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "dueDate" DATE,
  questions JSONB NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR QUIZZES
CREATE POLICY "Quizzes are viewable by everyone"
  ON public.quizzes FOR SELECT USING (TRUE);

CREATE POLICY "Instructors can manage quizzes for their courses"
  ON public.quizzes FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = quizzes."courseId"
      AND courses."instructorId" = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS public.lesson (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "courseID" TEXT NOT NULL,
  title TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "filePath" TEXT NOT NULL,
  "fileUrl" TEXT,
  "uploadedBy" UUID REFERENCES public.profiles(id),
  "uploadedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.lesson ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR LESSON
CREATE POLICY "Instructors can create their own lesson uploads"
ON public.lesson
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = "uploadedBy"
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'instructor'
  )
);
