export type BillStatus =
  | "introduced"
  | "in-committee"
  | "passed-chamber"
  | "sent-to-president"
  | "enacted"
  | "stalled";

export type Section174Bill = {
  id: string;
  title: string;
  chamber: "House" | "Senate";
  congress: number;
  introducedDate: string;
  latestActionDate: string;
  latestAction: string;
  status: BillStatus;
  cosponsors: number;
  url: string;
};

type CongressGovBillResponse = {
  bill?: {
    congress?: number;
    number?: string;
    title?: string;
    type?: string;
    introducedDate?: string;
    latestAction?: {
      actionDate?: string;
      text?: string;
    };
    sponsors?: Array<unknown>;
    cosponsors?: {
      countIncludingWithdrawnCosponsors?: number;
      count?: number;
    };
    updateDate?: string;
    url?: string;
  };
};

type WatchItem = {
  congress: number;
  chamber: "House" | "Senate";
  type: "hr" | "s";
  number: number;
  fallbackTitle: string;
  fallbackIntroducedDate: string;
  fallbackLatestActionDate: string;
  fallbackLatestAction: string;
  fallbackStatus: BillStatus;
  fallbackCosponsors: number;
};

const WATCHLIST: WatchItem[] = [
  {
    congress: 118,
    chamber: "House",
    type: "hr",
    number: 7024,
    fallbackTitle: "Tax Relief for American Families and Workers Act of 2024",
    fallbackIntroducedDate: "2024-01-16",
    fallbackLatestActionDate: "2024-02-13",
    fallbackLatestAction: "Received in the Senate after passing the House.",
    fallbackStatus: "passed-chamber",
    fallbackCosponsors: 68,
  },
  {
    congress: 119,
    chamber: "House",
    type: "hr",
    number: 171,
    fallbackTitle: "American Innovation and R&D Competitiveness Act",
    fallbackIntroducedDate: "2025-01-03",
    fallbackLatestActionDate: "2025-03-11",
    fallbackLatestAction: "Referred to the House Ways and Means Committee.",
    fallbackStatus: "in-committee",
    fallbackCosponsors: 41,
  },
  {
    congress: 119,
    chamber: "Senate",
    type: "s",
    number: 866,
    fallbackTitle: "American Innovation and Jobs Act",
    fallbackIntroducedDate: "2025-02-28",
    fallbackLatestActionDate: "2025-04-10",
    fallbackLatestAction: "Referred to the Senate Finance Committee.",
    fallbackStatus: "in-committee",
    fallbackCosponsors: 16,
  },
  {
    congress: 119,
    chamber: "House",
    type: "hr",
    number: 1745,
    fallbackTitle: "Small Software Business Tax Certainty Act",
    fallbackIntroducedDate: "2025-03-18",
    fallbackLatestActionDate: "2025-04-25",
    fallbackLatestAction:
      "No floor vote scheduled; coalition comments filed for markup.",
    fallbackStatus: "introduced",
    fallbackCosponsors: 9,
  },
];

function inferStatusFromAction(actionText: string): BillStatus {
  const text = actionText.toLowerCase();

  if (text.includes("became public law") || text.includes("signed by president")) {
    return "enacted";
  }

  if (text.includes("presented to president") || text.includes("sent to president")) {
    return "sent-to-president";
  }

  if (
    text.includes("passed house") ||
    text.includes("passed senate") ||
    text.includes("received in the senate") ||
    text.includes("received in the house")
  ) {
    return "passed-chamber";
  }

  if (text.includes("committee") || text.includes("referred")) {
    return "in-committee";
  }

  if (text.includes("failed") || text.includes("indefinitely postponed")) {
    return "stalled";
  }

  return "introduced";
}

async function fetchSingleBill(item: WatchItem, apiKey: string) {
  const endpoint = `https://api.congress.gov/v3/bill/${item.congress}/${item.type}/${item.number}?api_key=${apiKey}&format=json`;

  const response = await fetch(endpoint, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(
      `Congress API request failed for ${item.type.toUpperCase()}.${item.number}`,
    );
  }

  const payload = (await response.json()) as CongressGovBillResponse;
  const bill = payload.bill;

  if (!bill) {
    throw new Error(`No bill data returned for ${item.type.toUpperCase()}.${item.number}`);
  }

  const latestActionText = bill.latestAction?.text ?? item.fallbackLatestAction;

  return {
    id: `${item.type.toUpperCase()}.${item.number}`,
    title: bill.title ?? item.fallbackTitle,
    chamber: item.chamber,
    congress: bill.congress ?? item.congress,
    introducedDate: bill.introducedDate ?? item.fallbackIntroducedDate,
    latestActionDate:
      bill.latestAction?.actionDate ??
      bill.updateDate ??
      item.fallbackLatestActionDate,
    latestAction: latestActionText,
    status: inferStatusFromAction(latestActionText),
    cosponsors:
      bill.cosponsors?.countIncludingWithdrawnCosponsors ??
      bill.cosponsors?.count ??
      item.fallbackCosponsors,
    url:
      bill.url ??
      `https://www.congress.gov/bill/${item.congress}th-congress/${item.type === "hr" ? "house-bill" : "senate-bill"}/${item.number}`,
  } satisfies Section174Bill;
}

export function getFallbackBills(): Section174Bill[] {
  return WATCHLIST.map((item) => ({
    id: `${item.type.toUpperCase()}.${item.number}`,
    title: item.fallbackTitle,
    chamber: item.chamber,
    congress: item.congress,
    introducedDate: item.fallbackIntroducedDate,
    latestActionDate: item.fallbackLatestActionDate,
    latestAction: item.fallbackLatestAction,
    status: item.fallbackStatus,
    cosponsors: item.fallbackCosponsors,
    url: `https://www.congress.gov/bill/${item.congress}th-congress/${item.type === "hr" ? "house-bill" : "senate-bill"}/${item.number}`,
  }));
}

export async function getTrackedBills() {
  const congressApiKey = process.env.CONGRESS_API_KEY;

  if (!congressApiKey) {
    return {
      bills: getFallbackBills(),
      source: "fallback" as const,
    };
  }

  const results = await Promise.allSettled(
    WATCHLIST.map((item) => fetchSingleBill(item, congressApiKey)),
  );

  const bills = results
    .filter((result): result is PromiseFulfilledResult<Section174Bill> => {
      return result.status === "fulfilled";
    })
    .map((result) => result.value);

  if (bills.length === 0) {
    return {
      bills: getFallbackBills(),
      source: "fallback" as const,
    };
  }

  const watchlistMap = new Map(
    WATCHLIST.map((item) => [`${item.type.toUpperCase()}.${item.number}`, item]),
  );

  const normalized = bills.map((bill) => {
    const backup = watchlistMap.get(bill.id);
    return {
      ...bill,
      title: bill.title || backup?.fallbackTitle || "Section 174 Related Bill",
    };
  });

  return {
    bills: normalized,
    source: "live" as const,
  };
}
