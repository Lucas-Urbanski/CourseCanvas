-- drop function if exists public.handle_new_user();
-- drop trigger if exists on_auth_user_created on auth.users;
-- drop table if exists public.profiles;
-- drop table if exists public.courses;

create function if not exists public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, fullName, role)
  values (
    new.id, 
    new.raw_user_meta_data->>'fullName', 
    new.raw_user_meta_data->>'role'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger if not exists on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  fullName text,
  role text check (role in ('student', 'instructor')), 
  bio text default null,
  avatarUrl text default null,
  updatedAt timestamp with time zone default now()
);

alter table profiles enable row level security;

create policy if not exists "Profiles are viewable by everyone" 
  on profiles for select using (true);

create policy if not exists "Users can update their own profile" 
  on profiles for update using (auth.uid() = id);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  instructorId uuid references public.profiles(id),
  startDate date,
  endDate date,
  createdAt timestamp with time zone default now(),
  updatedAt timestamp with time zone default now()
);

alter table courses enable row level security;

create policy if not exists "Courses are viewable by everyone" 
  on courses for select using (true);

create policy if not exists "Instructors can manage their own courses" 
  on courses for all using (auth.uid() = instructorId);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  courseId uuid references public.courses(id) on delete cascade,
  title text not null,
  questions jsonb not null,
  createdAt timestamp with time zone default now(),
  updatedAt timestamp with time zone default now()
);

alter table quizzes enable row level security;

create policy if not exists "Quizzes are viewable by everyone" 
  on quizzes for select using (true);

create policy if not exists "Instructors can manage quizzes for their courses" 
  on quizzes for all using (exists (
    select 1 from public.courses 
    where courses.id = quizzes.courseId 
      and courses.instructorId = auth.uid()
  ));