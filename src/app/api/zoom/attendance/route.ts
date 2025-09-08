import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest){
  // TODO: Validate Zoom webhook signature using ZOOM_WEBHOOK_SECRET
  // Parse participant joined/left and write to attendance_logs, then finalize_attendance.
  return NextResponse.json({ ok: true, message: 'Stub: Zoom webhook not implemented yet.' });
}
