import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BarChart3, BellRing, Calculator, LockKeyhole } from "lucide-react";

import { AlertSettings } from "@/components/AlertSettings";
import { BillTracker } from "@/components/BillTracker";
import { ImpactCalculator } from "@/components/ImpactCalculator";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ACCESS_COOKIE_NAME = "section174_access";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get(ACCESS_COOKIE_NAME)?.value === "granted";

  if (!hasAccess) {
    redirect("/?paywall=1");
  }

  return (
    <main className="min-h-screen bg-[#0d1117] px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-cyan-300">Premium Dashboard</p>
              <h1 className="text-2xl font-bold text-slate-100 md:text-3xl">
                Section 174 Legislative Command Center
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                Monitor live congressional movement, quantify tax timing exposure, and configure high-signal alerts for restoration-related action.
              </p>
            </div>
            <Link
              href="/access"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <LockKeyhole className="h-4 w-4" />
              Manage Access
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MetricCard
              icon={<BarChart3 className="h-4 w-4 text-cyan-300" />}
              title="Legislative Monitoring"
              detail="Live bill status and chamber progress"
            />
            <MetricCard
              icon={<Calculator className="h-4 w-4 text-emerald-300" />}
              title="Cash-Tax Exposure"
              detail="Immediate expensing vs amortization outcomes"
            />
            <MetricCard
              icon={<BellRing className="h-4 w-4 text-amber-300" />}
              title="Premium Alerting"
              detail="Targeted updates for material changes"
            />
          </div>
        </header>

        <BillTracker />
        <ImpactCalculator />
        <AlertSettings />
      </div>
    </main>
  );
}

function MetricCard({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <Card className="rounded-lg bg-slate-950/40">
      <CardContent className="p-3">
        <div className="mb-2">{icon}</div>
        <p className="text-sm font-medium text-slate-100">{title}</p>
        <p className="text-xs text-slate-400">{detail}</p>
      </CardContent>
    </Card>
  );
}
