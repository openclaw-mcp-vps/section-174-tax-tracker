import { promises as fs } from "node:fs";
import path from "node:path";

export type PurchaseRecord = {
  sessionId: string;
  email: string;
  customerId?: string;
  amountTotal?: number;
  currency?: string;
  purchasedAt: string;
  sourceEventId: string;
};

export type AlertPreference = {
  email: string;
  billChangeAlerts: boolean;
  majorVoteAlerts: boolean;
  weeklyDigest: boolean;
  minimumTaxImpact: number;
  webhookUrl: string;
  updatedAt: string;
};

type DatabaseShape = {
  purchases: PurchaseRecord[];
  alerts: AlertPreference[];
};

const DB_PATH = path.join(process.cwd(), "data", "db.json");

const EMPTY_DB: DatabaseShape = {
  purchases: [],
  alerts: [],
};

async function ensureDbExists() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(EMPTY_DB, null, 2), "utf8");
  }
}

async function readDb(): Promise<DatabaseShape> {
  await ensureDbExists();
  const raw = await fs.readFile(DB_PATH, "utf8");

  try {
    const parsed = JSON.parse(raw) as Partial<DatabaseShape>;
    return {
      purchases: parsed.purchases ?? [],
      alerts: parsed.alerts ?? [],
    };
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(EMPTY_DB, null, 2), "utf8");
    return EMPTY_DB;
  }
}

async function writeDb(nextData: DatabaseShape) {
  await ensureDbExists();
  await fs.writeFile(DB_PATH, JSON.stringify(nextData, null, 2), "utf8");
}

export async function savePurchase(record: PurchaseRecord) {
  const db = await readDb();
  const alreadyExists = db.purchases.some(
    (purchase) => purchase.sessionId === record.sessionId,
  );

  if (!alreadyExists) {
    db.purchases.unshift(record);
    await writeDb(db);
  }
}

export async function hasPurchaseBySessionId(sessionId: string) {
  const db = await readDb();
  return db.purchases.some((purchase) => purchase.sessionId === sessionId);
}

export async function hasPurchaseByEmail(email: string) {
  const db = await readDb();
  const normalized = email.toLowerCase().trim();
  return db.purchases.some(
    (purchase) => purchase.email.toLowerCase().trim() === normalized,
  );
}

export async function upsertAlertPreference(preference: AlertPreference) {
  const db = await readDb();
  const normalized = preference.email.toLowerCase().trim();
  const existingIndex = db.alerts.findIndex(
    (alert) => alert.email.toLowerCase().trim() === normalized,
  );

  if (existingIndex >= 0) {
    db.alerts[existingIndex] = preference;
  } else {
    db.alerts.unshift(preference);
  }

  await writeDb(db);
}

export async function getAlertPreference(email: string) {
  const db = await readDb();
  const normalized = email.toLowerCase().trim();
  return (
    db.alerts.find((alert) => alert.email.toLowerCase().trim() === normalized) ??
    null
  );
}
