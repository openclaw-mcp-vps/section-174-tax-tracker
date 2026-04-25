import Stripe from "stripe";

// Legacy filename kept intentionally to satisfy requested file structure.
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export function getHostedCheckoutLink() {
  return process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
}

export function getStripeClient() {
  if (!stripeSecretKey) {
    return null;
  }

  return new Stripe(stripeSecretKey);
}

export function verifyStripeEvent(payload: string, signatureHeader: string) {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = getStripeClient();

  if (!stripe || !endpointSecret) {
    return null;
  }

  return stripe.webhooks.constructEvent(payload, signatureHeader, endpointSecret);
}
