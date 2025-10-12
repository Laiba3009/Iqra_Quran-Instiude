// src/app/api/courses/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const sbAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

export async function GET() {
  const { data, error } = await sbAdmin.from("courses").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json(); // { name }
  const { data, error } = await sbAdmin.from("courses").insert([{ name: body.name }]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
