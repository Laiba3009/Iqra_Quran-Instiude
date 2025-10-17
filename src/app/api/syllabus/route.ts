// src/app/api/syllabus/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, ANON_KEY);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const course = url.searchParams.get("course");
  const grade = url.searchParams.get("grade");

  let q = supabase.from("syllabus").select("*").order("created_at", { ascending: true });

  if (course) q = q.eq("course_name", course);
  if (grade) q = q.eq("grade", grade);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { data, error } = await supabase.from("syllabus").insert([body]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, ...rest } = body;
  const { data, error } = await supabase.from("syllabus").update(rest).eq("id", id).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { id } = body;
  const { error } = await supabase.from("syllabus").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
