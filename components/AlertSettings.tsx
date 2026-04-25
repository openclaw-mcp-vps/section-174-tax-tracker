"use client";

import { Bell, Loader2, Save } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function AlertSettings() {
  const [email, setEmail] = useState("");
  const [billChangeAlerts, setBillChangeAlerts] = useState(true);
  const [majorVoteAlerts, setMajorVoteAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [minimumTaxImpact, setMinimumTaxImpact] = useState(5000);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState("");

  async function handleSave() {
    if (!email.trim()) {
      setStatus("error");
      setMessage("Email is required to save premium alerts.");
      return;
    }

    setStatus("saving");
    setMessage("");

    try {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          billChangeAlerts,
          majorVoteAlerts,
          weeklyDigest,
          minimumTaxImpact,
          webhookUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not save alert settings");
      }

      setStatus("saved");
      setMessage("Alert settings saved. You will receive notices based on these triggers.");
    } catch {
      setStatus("error");
      setMessage("Save failed. Confirm your values and try again.");
    }
  }

  return (
    <section className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Bell className="h-5 w-5 text-amber-300" />
        <h2 className="text-xl font-semibold text-slate-100">Alert Settings</h2>
      </div>

      <p className="mb-5 text-sm text-slate-300">
        Configure premium legislative alerts for bill movement, major votes, and high-impact tax updates.
      </p>

      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Notification Email</span>
          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="team@yourcompany.com"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Optional Webhook Endpoint</span>
          <Input
            value={webhookUrl}
            onChange={(event) => setWebhookUrl(event.target.value)}
            type="url"
            placeholder="https://hooks.yourcompany.com/section174"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Minimum Tax Impact Threshold (USD)</span>
          <Input
            value={minimumTaxImpact}
            onChange={(event) => setMinimumTaxImpact(Number(event.target.value))}
            type="number"
            min={0}
            step={500}
          />
        </label>

        <div className="grid gap-2 text-sm md:grid-cols-3">
          <ToggleCard
            checked={billChangeAlerts}
            onChange={setBillChangeAlerts}
            title="Bill Status Changes"
            description="Committee movement and referral updates"
          />
          <ToggleCard
            checked={majorVoteAlerts}
            onChange={setMajorVoteAlerts}
            title="Major Vote Alerts"
            description="Floor calendar and chamber vote notices"
          />
          <ToggleCard
            checked={weeklyDigest}
            onChange={setWeeklyDigest}
            title="Weekly Digest"
            description="Friday summary with trend analysis"
          />
        </div>

        <Button
          type="button"
          onClick={() => {
            void handleSave();
          }}
          disabled={status === "saving"}
          className="disabled:bg-cyan-800"
        >
          {status === "saving" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Alerts
            </>
          )}
        </Button>

        {message && (
          <p
            className={`text-sm ${
              status === "error" ? "text-rose-300" : "text-emerald-300"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </section>
  );
}

function ToggleCard({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`rounded-lg border px-3 py-3 text-left transition ${
        checked
          ? "border-cyan-700 bg-cyan-950/25 text-cyan-100"
          : "border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-600"
      }`}
    >
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-xs opacity-90">{description}</p>
      <p className="mt-2 text-xs uppercase tracking-wide">{checked ? "Enabled" : "Disabled"}</p>
    </button>
  );
}
