import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Calculator,
  Check,
  Clock3,
  FileText,
  ShieldCheck,
} from "lucide-react";

import { BillTracker } from "@/components/BillTracker";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Track Section 174 Deduction Restoration Progress",
  description:
    "Monitor Section 174 legislative action, model tax cash-flow impact, and get premium alerts for restoration progress.",
  openGraph: {
    title: "Section 174 Tracker",
    description:
      "Track legislative progress on restoring immediate Section 174 deductions for software development costs.",
    url: "/",
    type: "website",
  },
};

const faqItems = [
  {
    question: "Why does Section 174 matter for software companies and freelancers?",
    answer:
      "Section 174 now requires R&D costs to be capitalized and amortized, which delays deductions and increases near-term tax payments. For software teams, that directly impacts hiring, runway, and product investment decisions.",
  },
  {
    question: "What does the tracker monitor in real time?",
    answer:
      "The dashboard tracks bill movement across committee referral, markup, floor action, and chamber passage. It also logs latest official action text and links to Congress.gov for source verification.",
  },
  {
    question: "How does access work after purchase?",
    answer:
      "Checkout is handled through your Stripe hosted payment link. Once payment completes, Stripe webhook events register the purchase and you activate access with your checkout session ID or purchase email.",
  },
  {
    question: "Who is this built for?",
    answer:
      "Finance teams at software companies, independent developers managing quarterly estimates, and tax professionals advising clients affected by Section 174 amortization.",
  },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ paywall?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const paywallNotice = resolvedSearchParams.paywall === "1";

  return (
    <main className="bg-[#0d1117] text-slate-200">
      <section className="border-b border-slate-800/80 bg-gradient-to-b from-slate-900/70 to-[#0d1117] px-4 py-16">
        <div className="mx-auto max-w-6xl animate-fade-up">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="inline-flex items-center rounded-full border border-cyan-900/80 bg-cyan-950/35 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-200">
                Tax Intelligence for Software Teams
              </p>
              <h1 className="mt-5 text-4xl font-bold leading-tight text-slate-100 md:text-5xl">
                Track Section 174 restoration progress and quantify your tax exposure.
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-slate-300">
                Built for software operators responding to the Section 174 deduction rollback, this dashboard turns legislative noise into clear, actionable signals.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ size: "lg" }))}
                >
                  Start Premium ($29/mo)
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/access"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                >
                  I Already Purchased
                </Link>
                <Link
                  href="/dashboard"
                  className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
                >
                  Open Dashboard
                </Link>
              </div>

              <div className="mt-4 text-sm text-slate-400">
                Hosted Stripe checkout. No in-app card handling. Access managed via secure session cookie.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700/70 bg-slate-900/65 p-6 shadow-2xl shadow-black/30">
              <h2 className="mb-4 text-lg font-semibold text-slate-100">Why teams are subscribing now</h2>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-300" />
                  The HN community has actively called for coordinated pressure to restore immediate software R&D deductions.
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-300" />
                  Legislative updates are fragmented across hearings, committee notices, and floor calendars.
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-300" />
                  Tax impact can swing materially quarter to quarter, especially for growth-stage software companies.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14">
        <div className="mx-auto max-w-6xl space-y-5">
          <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">The Problem</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard
              icon={<Clock3 className="h-5 w-5 text-rose-300" />}
              title="Delayed Tax Relief"
              text="Section 174 amortization spreads deductions over 5 or 15 years, creating immediate cash-tax pressure for development-heavy businesses."
            />
            <InfoCard
              icon={<FileText className="h-5 w-5 text-amber-300" />}
              title="Legislative Uncertainty"
              text="Relevant tax bills move across multiple committees and chambers, with important details often buried in action logs and amendments."
            />
            <InfoCard
              icon={<ShieldCheck className="h-5 w-5 text-cyan-300" />}
              title="High Stakes Decisions"
              text="Hiring pace, pricing, and growth planning are harder when teams can’t quantify likely deduction timing outcomes."
            />
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800/80 bg-slate-900/40 px-4 py-14">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">Preview: Legislative Tracking</h2>
            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs uppercase tracking-wider text-slate-300">
              Live monitoring inside premium dashboard
            </span>
          </div>
          <BillTracker preview />
        </div>
      </section>

      <section className="px-4 py-14">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-5 text-2xl font-bold text-slate-100 md:text-3xl">The Solution</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard
              icon={<FileText className="h-5 w-5 text-cyan-300" />}
              title="Bill Status Monitoring"
              text="Track Section 174-adjacent bills with action-level context and source links to official congressional records."
            />
            <InfoCard
              icon={<Calculator className="h-5 w-5 text-emerald-300" />}
              title="Impact Calculator"
              text="Model first-year and multi-year cash-tax timing differences between immediate expensing and current-law amortization."
            />
            <InfoCard
              icon={<Bell className="h-5 w-5 text-amber-300" />}
              title="Premium Alert Workflows"
              text="Configure trigger conditions for meaningful legislative changes and material projected tax impact thresholds."
            />
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800/80 bg-slate-900/45 px-4 py-14">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-5 text-2xl font-bold text-slate-100 md:text-3xl">Pricing</h2>
          <div className="max-w-xl rounded-2xl border border-cyan-900/70 bg-gradient-to-b from-cyan-950/30 to-slate-900/70 p-6">
            <p className="text-sm uppercase tracking-wider text-cyan-200">Pro Plan</p>
            <p className="mt-2 text-4xl font-bold text-slate-100">$29/mo</p>
            <p className="mt-3 text-sm text-slate-300">
              Built for teams that need one source of truth for Section 174 legislative momentum and tax-planning implications.
            </p>

            <ul className="mt-5 space-y-2 text-sm text-slate-200">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-300" />
                Real-time bill status and action-feed refreshes
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-300" />
                Full impact calculator with scenario modeling
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-300" />
                Premium alert settings and threshold targeting
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ size: "lg" }))}
              >
                Subscribe on Stripe
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/access"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                Activate Existing Purchase
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-5 text-2xl font-bold text-slate-100 md:text-3xl">FAQ</h2>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <article
                key={item.question}
                className="rounded-xl border border-slate-700/70 bg-slate-900/50 p-4"
              >
                <h3 className="text-lg font-semibold text-slate-100">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {paywallNotice && (
        <div className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 rounded-lg border border-amber-800 bg-amber-950/85 p-3 text-sm text-amber-100 backdrop-blur">
          Dashboard access requires an active subscription. Complete checkout, then activate access to continue.
        </div>
      )}
    </main>
  );
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3">{icon}</div>
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
      </CardContent>
    </Card>
  );
}
