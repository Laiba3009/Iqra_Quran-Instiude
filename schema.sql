-- Core enums and tables
create type if not exists user_role as enum ('admin','teacher','student');

create table if not exists users_public (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text unique not null,
  role user_role not null default 'student',
  created_at timestamptz default now()
);

create table if not exists courses (
  id bigserial primary key,
  name text unique not null
);

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

create table if not exists students (
  id bigserial primary key,
  name text not null,
  roll_no text,
  contact text,
  email text unique,
  course_ids bigint[] default '{}',
  student_fee numeric default 0,
  created_at timestamptz default now()
);
create index if not exists idx_students_courses on students using gin (course_ids);

create table if not exists teachers (
  id bigserial primary key,
  name text not null,
  contact text,
  email text unique,
  course_id bigint references courses(id) on delete set null,
  salary numeric default 0,
  created_at timestamptz default now()
);

create table if not exists classes (
  id bigserial primary key,
  course_id bigint not null references courses(id) on delete cascade,
  teacher_id bigint references teachers(id) on delete set null,
  title text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  zoom_meeting_id text,
  zoom_host_id text,
  zoom_join_url text,
  reminder_sent boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_classes_times on classes (start_time, end_time);

create table if not exists enrollments (
  id bigserial primary key,
  student_id bigint not null references students(id) on delete cascade,
  course_id bigint not null references courses(id) on delete cascade,
  unique (student_id, course_id)
);

create table if not exists zoom_registrants (
  id bigserial primary key,
  class_id bigint not null references classes(id) on delete cascade,
  student_id bigint not null references students(id) on delete cascade,
  zoom_registrant_id text,
  zoom_join_url text,
  created_at timestamptz default now(),
  unique(class_id, student_id)
);

create table if not exists attendance_logs (
  id bigserial primary key,
  class_id bigint not null references classes(id) on delete cascade,
  student_id bigint references students(id) on delete cascade,
  zoom_user_id text,
  join_time timestamptz,
  leave_time timestamptz,
  duration_seconds int,
  raw_payload jsonb,
  created_at timestamptz default now()
);

create table if not exists attendance (
  id bigserial primary key,
  class_id bigint not null references classes(id) on delete cascade,
  student_id bigint not null references students(id) on delete cascade,
  status text not null check (status in ('present','absent','late','excused')),
  total_minutes int default 0,
  marked_at timestamptz default now(),
  unique (class_id, student_id)
);

create or replace function finalize_attendance(p_class_id bigint, p_threshold_minutes int default 20)
returns void
language plpgsql
as $$
begin
  insert into attendance (class_id, student_id, status, total_minutes)
  select
    l.class_id,
    l.student_id,
    case when sum(coalesce(l.duration_seconds,0))/60 >= p_threshold_minutes
         then 'present' else 'absent' end as status,
    (sum(coalesce(l.duration_seconds,0))/60)::int as total_minutes
  from attendance_logs l
  where l.class_id = p_class_id
  group by l.class_id, l.student_id
  on conflict (class_id, student_id) do update
  set status = excluded.status,
      total_minutes = excluded.total_minutes,
      marked_at = now();
end;
$$;

create table if not exists cancel_reasons (
  id bigserial primary key,
  class_id bigint references classes(id) on delete cascade,
  student_id bigint not null references students(id) on delete cascade,
  reason text not null,
  created_at timestamptz default now()
);

create table if not exists reminders (
  id bigserial primary key,
  class_id bigint not null references classes(id) on delete cascade,
  teacher_id bigint references teachers(id) on delete set null,
  sent_by uuid,
  sent_at timestamptz default now(),
  details jsonb
);

-- Global settings (Zoom link management)
create table if not exists settings (
  id int primary key,
  current_zoom_link text,
  updated_at timestamptz default now()
);
insert into settings (id, current_zoom_link)
values (1, null)
on conflict (id) do nothing;

-- Simple dashboard view
create or replace view v_dashboard_counts as
select
  (select count(*) from students) as total_students,
  (select count(*) from teachers) as total_teachers,
  10::int as total_courses;

-- Enable RLS (adjust policies per your auth model)
alter table students enable row level security;
alter table teachers enable row level security;
alter table classes enable row level security;
alter table attendance enable row level security;
alter table attendance_logs enable row level security;
alter table enrollments enable row level security;
alter table cancel_reasons enable row level security;
alter table reminders enable row level security;
alter table settings enable row level security;
alter table users_public enable row level security;
alter table courses enable row level security;

-- VERY open sample policies (tighten for prod)
create policy "read all dev" on students for select using (true);
create policy "insert dev" on students for insert with check (true);
create policy "read all dev t" on teachers for select using (true);
create policy "insert dev t" on teachers for insert with check (true);
create policy "read settings" on settings for select using (true);
create policy "write settings" on settings for update using (true) with check (true);
