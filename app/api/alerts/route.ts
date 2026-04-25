import { NextRequest, NextResponse } from "next/server";

import { getAlertPreference, upsertAlertPreference } from "@/lib/database";

type AlertPayload = {
  email: string;
  billChangeAlerts: boolean;
  majorVoteAlerts: boolean;
  weeklyDigest: boolean;
  minimumTaxImpact: number;
  webhookUrl: string;
};

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")?.trim();

  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const preference = await getAlertPreference(email);
  return NextResponse.json({ preference });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as AlertPayload | null;

  if (!body || !body.email?.trim()) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const minimumTaxImpact = Number.isFinite(body.minimumTaxImpact)
    ? Math.max(0, body.minimumTaxImpact)
    : 0;

  await upsertAlertPreference({
    email: body.email.trim(),
    billChangeAlerts: Boolean(body.billChangeAlerts),
    majorVoteAlerts: Boolean(body.majorVoteAlerts),
    weeklyDigest: Boolean(body.weeklyDigest),
    minimumTaxImpact,
    webhookUrl: body.webhookUrl?.trim() ?? "",
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ saved: true });
}
