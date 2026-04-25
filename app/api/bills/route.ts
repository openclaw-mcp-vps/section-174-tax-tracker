import { NextResponse } from "next/server";

import { getTrackedBills } from "@/lib/congress-api";

export async function GET() {
  const { bills, source } = await getTrackedBills();

  return NextResponse.json(
    {
      bills,
      source,
      generatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "s-maxage=120, stale-while-revalidate=300",
      },
    },
  );
}
