// src/app/api/courses/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// safety check
if (!SUPABASE_URL || !ANON_KEY) {
  throw new Error("❌ Missing Supabase environment variables on server!");
}

// create public client
const supabase = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { persistSession: false },
});

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("name");

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("❌ Error fetching courses:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: "Course name required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("courses")
      .insert([{ name: body.name }])
      .select();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("❌ Error adding course:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
                  }
      
