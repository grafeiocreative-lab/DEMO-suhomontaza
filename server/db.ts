import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, quotes, quoteItems, priceList } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch {
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) return;

  const values: InsertUser = {
    openId: user.openId,
  };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];

  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };

  textFields.forEach(assignNullable);

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = 'admin';
    updateSet.role = 'admin';
  }

  if (!values.lastSignedIn) {
    values.lastSignedIn = new Date();
  }

  if (Object.keys(updateSet).length === 0) {
    updateSet.lastSignedIn = new Date();
  }

  await db.insert(users).values(values).onDuplicateKeyUpdate({
    set: updateSet,
  });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createQuote(quote: {
  quoteNumber: string;
  clientName: string;
  clientAddress?: string;
  clientTaxId?: string;
  description?: string;
  subtotalCents: number;
  vatCents: number;
  totalCents: number;
  paymentTerm?: string;
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    pricePerUnitCents: number;
    vat: number;
    totalCents: number;
  }>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(quotes).values({
    quoteNumber: quote.quoteNumber,
    clientName: quote.clientName,
    clientAddress: quote.clientAddress,
    clientTaxId: quote.clientTaxId,
    description: quote.description,
    subtotalCents: quote.subtotalCents,
    vatCents: quote.vatCents,
    totalCents: quote.totalCents,
    paymentTerm: quote.paymentTerm,
    status: "draft",
  });

  const quoteId = (result as any).insertId as number;

  for (let i = 0; i < quote.items.length; i++) {
    const item = quote.items[i];
    await db.insert(quoteItems).values({
      quoteId,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      pricePerUnitCents: item.pricePerUnitCents,
      vat: item.vat,
      totalCents: item.totalCents,
      order: i,
    });
  }

  return quoteId;
}

export async function getQuoteWithItems(quoteId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const quote = await db.select().from(quotes).where(eq(quotes.id, quoteId)).limit(1);
  if (!quote.length) return null;

  const items = await db.select().from(quoteItems).where(eq(quoteItems.quoteId, quoteId));

  return {
    ...quote[0],
    items,
  };
}

export async function getAllQuotes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(quotes).orderBy(desc(quotes.createdAt));
}

export async function updateQuoteStatus(quoteId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(quotes).set({ status }).where(eq(quotes.id, quoteId));
}

export async function deleteQuote(quoteId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(quoteItems).where(eq(quoteItems.quoteId, quoteId));
  await db.delete(quotes).where(eq(quotes.id, quoteId));
}

export async function getPriceList() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(priceList).where(eq(priceList.active, 1));
}

export async function createOrUpdatePriceListItem(item: {
  id?: number;
  name: string;
  unit: string;
  pricePerUnit: number;
  vat?: number;
  description?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (item.id) {
    await db.update(priceList).set({
      name: item.name,
      unit: item.unit,
      pricePerUnit: item.pricePerUnit,
      vat: item.vat || 22,
      description: item.description,
    }).where(eq(priceList.id, item.id));
    return item.id;
  } else {
    const result = await db.insert(priceList).values({
      name: item.name,
      unit: item.unit,
      pricePerUnit: item.pricePerUnit,
      vat: item.vat || 22,
      description: item.description,
      active: 1,
    });
    return (result as any).insertId as number;
  }
}

export async function generateQuoteNumber(): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const lastQuote = await db.select().from(quotes).orderBy(desc(quotes.id)).limit(1);
  const number = lastQuote.length > 0 ? parseInt(lastQuote[0].quoteNumber.split('-')[2] || '0') + 1 : 1;
  const year = new Date().getFullYear();
  return `PON-${year}-${String(number).padStart(3, '0')}`;
}
