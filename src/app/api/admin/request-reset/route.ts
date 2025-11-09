import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: Request) {
  const { email } = await req.json();

  const { data: admin, error } = await supabase
    .from("admins")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !admin)
    return NextResponse.json({ message: "No account found" }, { status: 404 });

  // token generate
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 15).toISOString(); // 15 min expiry

  await supabase
    .from("admins")
    .update({ reset_token: token, reset_token_expires: expires })
    .eq("id", admin.id);

  // send email
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/admin/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"IQRA Portal" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: `<p>Click the link below to reset your password:</p>
           <a href="${resetLink}">${resetLink}</a>
           <p>This link will expire in 15 minutes.</p>`,
  });

  return NextResponse.json({ message: "Reset email sent" });
}
