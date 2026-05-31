import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Price list table for storing service prices
 * Stores standard prices for drywall services with VAT information
 */
export const priceList = mysqlTable("price_list", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Montaža suhomontaže"
  unit: varchar("unit", { length: 50 }).notNull(), // e.g., "m²", "kos", "uro"
  pricePerUnit: int("price_per_unit").notNull(), // Price in cents (EUR)
  vat: int("vat").default(22).notNull(), // VAT percentage (default 22% for Slovenia)
  description: text("description"),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PriceList = typeof priceList.$inferSelect;
export type InsertPriceList = typeof priceList.$inferInsert;

/**
 * Quotes table for storing generated quotes
 * Each quote contains client details and material specification
 */
export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  quoteNumber: varchar("quote_number", { length: 50 }).notNull().unique(), // e.g., "PON-2026-001"
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientAddress: text("client_address"),
  clientTaxId: varchar("client_tax_id", { length: 50 }), // Davčna številka
  description: text("description"), // Additional notes
  subtotalCents: int("subtotal_cents").notNull(), // Total before VAT in cents
  vatCents: int("vat_cents").notNull(), // VAT amount in cents
  totalCents: int("total_cents").notNull(), // Total with VAT in cents
  paymentTerm: varchar("payment_term", { length: 100 }), // e.g., "30 dni"
  status: varchar("status", { length: 50 }).default("draft").notNull(), // draft, sent, accepted, rejected
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;

/**
 * Quote items table for storing individual line items in a quote
 * Each item represents a material or service in the quote
 */
export const quoteItems = mysqlTable("quote_items", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: int("quote_id").notNull().references(() => quotes.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(), // Material/service name
  quantity: int("quantity").notNull(), // Quantity (stored as integer, e.g., 100 for 1.00)
  unit: varchar("unit", { length: 50 }).notNull(), // e.g., "m²", "kos", "uro"
  pricePerUnitCents: int("price_per_unit_cents").notNull(), // Price per unit in cents
  vat: int("vat").default(22).notNull(), // VAT percentage
  totalCents: int("total_cents").notNull(), // Total for this line (before VAT) in cents
  order: int("order").notNull(), // Display order
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuoteItem = typeof quoteItems.$inferSelect;
export type InsertQuoteItem = typeof quoteItems.$inferInsert;

export const inquiries = mysqlTable("inquiries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  message: text("message"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;