import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ⚠️ Use SERVICE ROLE KEY here (not anon key)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, newEmail, newPassword } = await req.json();

    const updates: any = {};
    if (newEmail) updates.email = newEmail;
    if (newPassword) updates.password = newPassword;

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      updates
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "User updated", data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
