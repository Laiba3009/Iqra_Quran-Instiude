import { NextResponse } from "next/server";
import twilio from "twilio";
import { createClient } from "@supabase/supabase-js";

// 🔐 ENV variables
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = twilio(accountSid, authToken);

// Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { student_id, class_time } = await req.json();

    // 🔹 1. Student fetch
    const { data: student, error } = await supabase
      .from("students")
      .select("name, contact")
      .eq("id", student_id)
      .single();

    if (error || !student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // 🔹 2. Check reminder limit
    const { data: log } = await supabase
      .from("reminder_logs")
      .select("*")
      .eq("student_id", student_id)
      .eq("class_time", class_time)
      .eq("reminder_date", new Date().toISOString().split("T")[0])
      .single();

    if (log && log.reminder_count >= 2) {
      return NextResponse.json(
        { error: "Limit reached (2 reminders already sent)" },
        { status: 400 }
      );
    }

    // 🔹 3. Send WhatsApp message
    const message = await client.messages.create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:${student.contact}`,
      body: `Assalam o Alaikum ${student.name}, aapka class time ho gaya hai. Teacher wait kar rahi hain.`,
    });

    // 🔹 4. Insert / Update log
    if (!log) {
      await supabase.from("reminder_logs").insert({
        student_id,
        class_time,
        reminder_count: 1,
      });
    } else {
      await supabase
        .from("reminder_logs")
        .update({
          reminder_count: log.reminder_count + 1,
          last_sent_at: new Date(),
        })
        .eq("id", log.id);
    }

    return NextResponse.json({ success: true, sid: message.sid });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}