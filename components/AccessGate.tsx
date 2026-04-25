"use client";

import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AccessState = "idle" | "checking" | "granted" | "error";

export function AccessGate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdFromQuery = useMemo(
    () => searchParams.get("session_id") ?? "",
    [searchParams],
  );

  const [sessionId, setSessionId] = useState(sessionIdFromQuery);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<AccessState>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!sessionIdFromQuery) {
      return;
    }

    void grantAccess({ sessionId: sessionIdFromQuery });
  }, [sessionIdFromQuery]);

  async function grantAccess(payload: { sessionId?: string; email?: string }) {
    setState("checking");
    setMessage("Validating purchase and activating your dashboard access...");

    try {
      const response = await fetch("/api/access/grant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = (await response.json()) as { granted?: boolean; message?: string; error?: string };

      if (!response.ok || !body.granted) {
        const errorMessage = body.message || body.error || "Could not verify purchase.";
        throw new Error(errorMessage);
      }

      setState("granted");
      setMessage("Access granted. Redirecting to your premium dashboard...");
      window.setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not grant access";
      setState("error");
      setMessage(errorMessage);
    }
  }

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-xl shadow-black/30">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-cyan-300" />
        <h1 className="text-xl font-semibold text-slate-100">Activate Premium Access</h1>
      </div>

      <p className="mb-5 text-sm text-slate-300">
        After checkout, activate your Section 174 dashboard by validating either your Stripe checkout session ID or the purchase email used at checkout.
      </p>

      <div className="space-y-3">
        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Stripe Checkout Session ID</span>
          <Input
            value={sessionId}
            onChange={(event) => setSessionId(event.target.value)}
            placeholder="cs_test_a1B2c3D4..."
          />
        </label>

        <div className="text-center text-xs uppercase tracking-wider text-slate-500">or</div>

        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Purchase Email</span>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="finance@company.com"
          />
        </label>

        <Button
          type="button"
          onClick={() => {
            void grantAccess({
              sessionId: sessionId.trim() || undefined,
              email: email.trim() || undefined,
            });
          }}
          disabled={state === "checking"}
          className="w-full disabled:bg-cyan-800"
        >
          {state === "checking" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Activate Access
            </>
          )}
        </Button>

        {message && (
          <p
            className={`rounded-md border px-3 py-2 text-sm ${
              state === "error"
                ? "border-rose-800 bg-rose-950/35 text-rose-200"
                : "border-emerald-800 bg-emerald-950/30 text-emerald-200"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
