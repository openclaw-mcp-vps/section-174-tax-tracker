import { NextRequest, NextResponse } from "next/server";

import { hasPurchaseByEmail, hasPurchaseBySessionId } from "@/lib/database";

const ACCESS_COOKIE_NAME = "section174_access";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { sessionId?: string; email?: string }
    | null;

  if (!body) {
    return NextResponse.json({ error: "Missing request body" }, { status: 400 });
  }

  const sessionId = body.sessionId?.trim();
  const email = body.email?.trim();

  if (!sessionId && !email) {
    return NextResponse.json(
      { error: "Provide either a checkout session id or purchase email" },
      { status: 400 },
    );
  }

  const isPaid = sessionId
    ? await hasPurchaseBySessionId(sessionId)
    : await hasPurchaseByEmail(email ?? "");

  if (!isPaid) {
    return NextResponse.json(
      {
        granted: false,
        message:
          "Purchase not found yet. If you just paid, wait 10-20 seconds for Stripe webhook delivery and try again.",
      },
      { status: 404 },
    );
  }

  const response = NextResponse.json({ granted: true });

  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: "granted",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
