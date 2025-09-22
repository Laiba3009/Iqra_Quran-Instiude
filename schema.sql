-- Enum roles
do $$ 
begin
  create type user_role as enum ('admin','teacher','student');
exception
  when duplicate_object then null;
end $$;

-- Students table
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  roll_no text unique,
  contact text,
  email text unique,
  courses text[] default '{}', -- multiple courses
  student_fee numeric default 0,
  fee_status text check (fee_status in ('paid','unpaid')) default 'unpaid',
  created_at timestamp default now()
);

-- Teachers table
create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  email text unique,
  courses text[] default '{}',
  salary numeric default 0,
  created_at timestamp default now()
);

-- Courses master table
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

-- Insert default courses
insert into courses (name) values
 ('Urdu Language Course'),
 ('Quran Recitation Course'),
 ('Memorization of Quran'),
 ('Kid''s Tarbiya Course'),
 ('Islamic Teaching'),
 ('Quran Ijazah Course'),
 ('Basic Qaida Online'),
 ('Quran Tajweed Course'),
 ('Quran Translation Course'),
 ('English Language Course')
on conflict (name) do nothing;

-- Settings table (Zoom link management)
create table if not exists settings (
  id int primary key default 1,
  current_zoom_link text,
  updated_at timestamp default now()
);

-- Cancel reasons table
create table if not exists cancel_reasons (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  reason text,
  created_at timestamp default now()
);

-- Profiles table for roles (auth integration)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role default 'student',
  created_at timestamp default now()
);

-- RPC function to get students with their selected courses
create or replace function get_students_with_courses()
returns table (
  id uuid,
  name text,
  roll_no text,
  email text,
  student_fee numeric,
  fee_status text,
  courses text[]
)
language sql
as $$
  select s.id, s.name, s.roll_no, s.email, s.student_fee, s.fee_status, s.courses
  from students s
  order by s.created_at desc;
$$;
