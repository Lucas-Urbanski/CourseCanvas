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

CREATE POLICY "Instructors can manage their own courses"
  ON public.courses FOR ALL USING (auth.uid() = "instructorId");

-- QUIZZES TABLE
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "courseId" UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
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

-- LESSON UPLOADS TABLE
CREATE TABLE IF NOT EXISTS public.lesson_uploads (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "courseID" TEXT NOT NULL,
  title TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "filePath" TEXT NOT NULL,
  "fileUrl" TEXT,
  "uploadedBy" UUID REFERENCES public.profiles(id),
  "uploadedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.lesson_uploads ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR LESSON UPLOADS
CREATE POLICY "Lesson uploads are viewable by everyone"
  ON public.lesson_uploads FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can insert their own lesson uploads"
  ON public.lesson_uploads FOR INSERT
  WITH CHECK (auth.uid() = "uploadedBy");

CREATE POLICY "Users can update their own lesson uploads"
  ON public.lesson_uploads FOR UPDATE
  USING (auth.uid() = "uploadedBy");

CREATE POLICY "Users can delete their own lesson uploads"
  ON public.lesson_uploads FOR DELETE
  USING (auth.uid() = "uploadedBy");

-- STORAGE POLICIES FOR lesson-files BUCKET
CREATE POLICY "Authenticated users can upload lesson files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'lesson-files');

CREATE POLICY "Lesson files are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lesson-files');

CREATE POLICY "Users can update their own lesson files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'lesson-files' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'lesson-files' AND owner = auth.uid());

CREATE POLICY "Users can delete their own lesson files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'lesson-files' AND owner = auth.uid());

  -- CLEAN UP LESSON UPLOAD POLICIES
DROP POLICY IF EXISTS "Lesson uploads are viewable by everyone" ON public.lesson_uploads;
DROP POLICY IF EXISTS "Authenticated users can insert their own lesson uploads" ON public.lesson_uploads;
DROP POLICY IF EXISTS "Users can update their own lesson uploads" ON public.lesson_uploads;
DROP POLICY IF EXISTS "Users can delete their own lesson uploads" ON public.lesson_uploads;

DROP POLICY IF EXISTS "Authenticated users can upload lesson files" ON storage.objects;
DROP POLICY IF EXISTS "Lesson files are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own lesson files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own lesson files" ON storage.objects;

-- DROP THE TABLE SO WE DON'T KEEP THE OLD VERSION
DROP TABLE IF EXISTS public.lesson_uploads;

-- RECREATE TABLE IN THE SAME STYLE AS YOUR OTHER TABLES
CREATE TABLE public.lesson_uploads (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "courseName" TEXT NOT NULL,
  title TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "filePath" TEXT NOT NULL,
  "fileUrl" TEXT,
  "uploadedBy" UUID REFERENCES public.profiles(id) NOT NULL,
  "uploadedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.lesson_uploads ENABLE ROW LEVEL SECURITY;

-- RLS FOR lesson_uploads
CREATE POLICY "Lesson uploads are viewable by everyone"
  ON public.lesson_uploads FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can insert their own lesson uploads"
  ON public.lesson_uploads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = "uploadedBy");

CREATE POLICY "Users can update their own lesson uploads"
  ON public.lesson_uploads FOR UPDATE
  TO authenticated
  USING (auth.uid() = "uploadedBy");

CREATE POLICY "Users can delete their own lesson uploads"
  ON public.lesson_uploads FOR DELETE
  TO authenticated
  USING (auth.uid() = "uploadedBy");

-- STORAGE RLS FOR lesson-files BUCKET
CREATE POLICY "Authenticated users can upload lesson files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'lesson-files');

CREATE POLICY "Lesson files are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lesson-files');

CREATE POLICY "Users can update their own lesson files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'lesson-files' AND owner_id = auth.uid())
  WITH CHECK (bucket_id = 'lesson-files' AND owner_id = auth.uid());

CREATE POLICY "Users can delete their own lesson files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'lesson-files' AND owner_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can upload lesson files" ON storage.objects;

CREATE POLICY "Authenticated users can upload lesson files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'lesson-files');

-- STORAGE POLICY CLEANUP
DROP POLICY IF EXISTS "Authenticated users can upload lesson files" ON storage.objects;
DROP POLICY IF EXISTS "Lesson files are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own lesson files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own lesson files" ON storage.objects;

-- SIMPLE STORAGE POLICIES FOR lesson-files
CREATE POLICY "Authenticated users can upload lesson files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'lesson-files');

CREATE POLICY "Lesson files are viewable by everyone"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'lesson-files');

DROP POLICY IF EXISTS "Authenticated users can upload lesson files" ON storage.objects;

CREATE POLICY "Temporary public upload test for lesson-files"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'lesson-files');



