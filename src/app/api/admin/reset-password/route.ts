import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { message: "Missing token or password" },
        { status: 400 }
      );
    }

    const { data: admin, error } = await supabase
      .from("admins")
      .select("*")
      .eq("reset_token", token)
      .single();

    if (error || !admin)
      return NextResponse.json({ message: "Invalid token" }, { status: 400 });

    const now = new Date();
    if (new Date(admin.reset_token_expires) < now)
      return NextResponse.json({ message: "Token expired" }, { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabase
      .from("admins")
      .update({
        password: hashed,
        reset_token: null,
        reset_token_expires: null,
      })
      .eq("id", admin.id);

    if (updateError)
      return NextResponse.json(
        { message: "Failed to update password" },
        { status: 500 }
      );

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
