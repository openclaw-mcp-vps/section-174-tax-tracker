"use client";

import Link from "next/link";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import {
  Activity,
  CircleAlert,
  ExternalLink,
  Loader2,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { Section174Bill } from "@/lib/congress-api";
import { Button } from "@/components/ui/button";

type BillsApiResponse = {
  bills: Section174Bill[];
  generatedAt: string;
  source: "live" | "fallback";
};

type BillTrackerProps = {
  preview?: boolean;
};

const STATUS_LABELS: Record<Section174Bill["status"], string> = {
  introduced: "Introduced",
  "in-committee": "In Committee",
  "passed-chamber": "Passed One Chamber",
  "sent-to-president": "Sent to President",
  enacted: "Enacted",
  stalled: "Stalled",
};

const STATUS_COLORS: Record<Section174Bill["status"], string> = {
  introduced: "text-slate-300",
  "in-committee": "text-amber-300",
  "passed-chamber": "text-cyan-300",
  "sent-to-president": "text-indigo-300",
  enacted: "text-emerald-300",
  stalled: "text-rose-300",
};

export function BillTracker({ preview = false }: BillTrackerProps) {
  const [data, setData] = useState<BillsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/bills", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load bill tracker data");
      }

      const payload = (await response.json()) as BillsApiResponse;
      setData(payload);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load legislative data";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills();
    const timer = window.setInterval(fetchBills, 60_000);

    return () => {
      window.clearInterval(timer);
    };
  }, [fetchBills]);

  const statusChartData = useMemo(() => {
    const bucket = new Map<string, number>();

    for (const bill of data?.bills ?? []) {
      const label = STATUS_LABELS[bill.status];
      bucket.set(label, (bucket.get(label) ?? 0) + 1);
    }

    return Array.from(bucket.entries()).map(([status, count]) => ({
      status,
      count,
    }));
  }, [data?.bills]);

  const visibleBills = preview ? data?.bills.slice(0, 3) ?? [] : data?.bills ?? [];

  return (
    <section className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5 backdrop-blur-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-cyan-300" />
          <h2 className="text-xl font-semibold text-slate-100">Section 174 Bill Tracker</h2>
        </div>
        <Button
          type="button"
          onClick={() => {
            void fetchBills();
          }}
          variant="outline"
          size="sm"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          Pulling latest congressional bill activity...
        </div>
      )}

      {!loading && error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-900/70 bg-rose-950/40 p-3 text-sm text-rose-200">
          <CircleAlert className="mt-0.5 h-4 w-4" />
          <div>
            <p className="font-medium">Data fetch failed</p>
            <p className="text-rose-100/90">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-1">
              Source: {data.source === "live" ? "Congress.gov API" : "Verified baseline dataset"}
            </span>
            <span>
              Updated {formatDistanceToNowStrict(parseISO(data.generatedAt), { addSuffix: true })}
            </span>
            {data.source === "fallback" && (
              <span className="inline-flex items-center gap-1 text-amber-300">
                <ShieldAlert className="h-3.5 w-3.5" />
                Add `CONGRESS_API_KEY` for live congressional updates.
              </span>
            )}
          </div>

          {statusChartData.length > 0 && (
            <div className="mb-6 h-56 rounded-xl border border-slate-700/70 bg-slate-950/40 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#243041" />
                  <XAxis dataKey="status" stroke="#8ba1bd" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="#8ba1bd" fontSize={12} />
                  <Tooltip
                    cursor={{ fill: "rgba(30, 41, 59, 0.35)" }}
                    contentStyle={{
                      backgroundColor: "#0b1220",
                      border: "1px solid #334155",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="space-y-3">
            {visibleBills.map((bill) => (
              <article
                key={bill.id}
                className="rounded-xl border border-slate-700/70 bg-slate-950/50 p-4"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-100">
                    {bill.id} ({bill.chamber}, {bill.congress}th Congress)
                  </p>
                  <span className={`text-sm font-medium ${STATUS_COLORS[bill.status]}`}>
                    {STATUS_LABELS[bill.status]}
                  </span>
                </div>

                <p className="mb-2 text-sm text-slate-300">{bill.title}</p>
                <p className="mb-3 text-xs text-slate-400">Latest action: {bill.latestAction}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <span>Cosponsors: {bill.cosponsors}</span>
                  <Link
                    href={bill.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200"
                  >
                    Congress.gov
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {preview && (
            <div className="mt-4 rounded-lg border border-cyan-900/60 bg-cyan-950/25 p-3 text-sm text-cyan-100">
              Full dashboard includes live polling, advanced tax impact modeling, and automated alert workflows.
            </div>
          )}
        </>
      )}
    </section>
  );
}
