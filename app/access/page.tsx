import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AccessGate } from "@/components/AccessGate";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Activate Access",
  description:
    "Activate your paid Section 174 Tracker subscription by validating your Stripe checkout purchase.",
};

export default function AccessPage() {
  return (
    <main className="min-h-screen bg-[#0d1117] px-4 py-12">
      <div className="mx-auto mb-6 max-w-xl text-center">
        <p className="text-sm uppercase tracking-[0.18em] text-cyan-300">Section 174 Tracker</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-100">Subscription Activation</h1>
      </div>

      <Suspense
        fallback={
          <div className="mx-auto max-w-xl rounded-2xl border border-slate-700 bg-slate-900/70 p-6 text-sm text-slate-300">
            Loading subscription activation...
          </div>
        }
      >
        <AccessGate />
      </Suspense>

      <div className="mx-auto mt-6 max-w-xl text-center text-sm text-slate-400">
        Need to complete checkout first?{" "}
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Return to pricing
        </Link>
      </div>
    </main>
  );
}
