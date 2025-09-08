import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest){
  // TODO: Implement WhatsApp Cloud API call using env vars
  // const token = process.env.WHATSAPP_ACCESS_TOKEN;
  // const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  return NextResponse.json({ ok: true, message: 'Stub: WhatsApp sending not implemented yet.' });
}
