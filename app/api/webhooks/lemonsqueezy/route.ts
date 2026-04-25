import { NextRequest, NextResponse } from "next/server";

import { savePurchase } from "@/lib/database";
import { verifyStripeEvent } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const signatureHeader = request.headers.get("stripe-signature");

  if (!signatureHeader) {
    return NextResponse.json(
      { error: "Missing Stripe signature header" },
      { status: 400 },
    );
  }

  const payload = await request.text();

  let event;
  try {
    event = verifyStripeEvent(payload, signatureHeader);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not validate webhook signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (!event) {
    return NextResponse.json(
      {
        error:
          "Stripe webhook is not configured. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.",
      },
      { status: 500 },
    );
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object;

    const email =
      session.customer_details?.email ||
      session.customer_email ||
      "unknown-customer@unknown.local";

    await savePurchase({
      sessionId: session.id,
      email,
      customerId: typeof session.customer === "string" ? session.customer : undefined,
      amountTotal: session.amount_total ?? undefined,
      currency: session.currency ?? undefined,
      purchasedAt: new Date().toISOString(),
      sourceEventId: event.id,
    });
  }

  return NextResponse.json({ received: true });
}
