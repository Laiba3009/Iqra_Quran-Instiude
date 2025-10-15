// src/app/api/courses/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// safety check
if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error("❌ Missing Supabase environment variables on server!");
}

// always create admin client on server only
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
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
    const body = await req.json(); // expect { name }

    if (!body.name) {
      return NextResponse.json({ error: "Course name required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
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
