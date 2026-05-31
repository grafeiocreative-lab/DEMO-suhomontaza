import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,

  calculator: router({
    verify: publicProcedure
      .input(z.object({ password: z.string().max(200) }))
      .mutation(({ input }) => {
        const secret = process.env.CALCULATOR_PASSWORD;
        if (!secret || input.password !== secret) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Napačno geslo" });
        }
        return { success: true } as const;
      }),
  }),

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Quotes management
  quotes: router({
    // Create a new quote
    create: protectedProcedure
      .input(z.object({
        clientName: z.string().min(1, "Ime naročnika je obvezno").max(200),
        clientAddress: z.string().max(300).optional(),
        clientTaxId: z.string().max(50).optional(),
        description: z.string().max(2000).optional(),
        paymentTerm: z.string().max(100).optional(),
        items: z.array(z.object({
          name: z.string().min(1).max(300),
          quantity: z.number().positive(),
          unit: z.string().min(1),
          pricePerUnitCents: z.number().nonnegative(),
          vat: z.number().default(22),
          totalCents: z.number().nonnegative(),
        })),
      }))
      .mutation(async ({ input }) => {
        try {
          const quoteNumber = await db.generateQuoteNumber();
          
          // Calculate totals
          const subtotalCents = input.items.reduce((sum, item) => sum + item.totalCents, 0);
          const vatCents = Math.round(subtotalCents * (input.items[0]?.vat || 22) / 100);
          const totalCents = subtotalCents + vatCents;

          const quoteId = await db.createQuote({
            quoteNumber,
            clientName: input.clientName,
            clientAddress: input.clientAddress,
            clientTaxId: input.clientTaxId,
            description: input.description,
            subtotalCents,
            vatCents,
            totalCents,
            paymentTerm: input.paymentTerm,
            items: input.items,
          });

          return { id: quoteId, quoteNumber };
        } catch {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Napaka pri ustvarjanju ponudbe",
          });
        }
      }),

    // Get all quotes
    list: protectedProcedure
      .query(async () => {
        try {
          return await db.getAllQuotes();
        } catch {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Napaka pri pridobivanju ponudb",
          });
        }
      }),

    // Get a specific quote with items
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        try {
          const quote = await db.getQuoteWithItems(input.id);
          if (!quote) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Ponudba ni najdena",
            });
          }
          return quote;
        } catch {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Napaka pri pridobivanju ponudbe",
          });
        }
      }),

    // Update quote status
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "sent", "accepted", "rejected"]),
      }))
      .mutation(async ({ input }) => {
        try {
          await db.updateQuoteStatus(input.id, input.status);
          return { success: true };
        } catch {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Napaka pri posodabljanju statusa ponudbe",
          });
        }
      }),

    // Delete a quote
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await db.deleteQuote(input.id);
          return { success: true };
        } catch {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Napaka pri brisanju ponudbe",
          });
        }
      }),

    // Generate PDF for a quote
    generatePDF: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          const quote = await db.getQuoteWithItems(input.id);
          if (!quote) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Ponudba ni najdena",
            });
          }

          const { generateQuotePDF } = await import("./pdf-generator");
          const pdfBuffer = await generateQuotePDF(quote);

          return {
            success: true,
            buffer: pdfBuffer.toString("base64"),
            filename: `ponudba-${quote.quoteNumber}.pdf`,
          };
        } catch {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Napaka pri generiranju PDF",
          });
        }
      }),
  }),

  contact: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        phone: z.string().max(50).optional(),
        email: z.string().email().max(320).optional(),
        message: z.string().max(2000).optional(),
      }))
      .mutation(async ({ input }) => {
        if (!input.phone && !input.email) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Vnesite telefon ali email" });
        }
        await db.saveInquiry(input);
        return { success: true } as const;
      }),
  }),

  // Price list management
  priceList: router({
    // Get all active prices
    list: publicProcedure
      .query(async () => {
        try {
          return await db.getPriceList();
        } catch {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Napaka pri pridobivanju cenika",
          });
        }
      }),

    // Create or update price list item (admin only)
    createOrUpdate: protectedProcedure
      .input(z.object({
        id: z.number().optional(),
        name: z.string().min(1).max(300),
        unit: z.string().min(1).max(20),
        pricePerUnit: z.number().positive(),
        vat: z.number().default(22),
        description: z.string().max(2000).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Only admin can manage price list
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Nimate dovoljenj za upravljanje cenika",
          });
        }

        try {
          const id = await db.createOrUpdatePriceListItem(input);
          return { id, success: true };
        } catch {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Napaka pri upravljanju cenika",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
