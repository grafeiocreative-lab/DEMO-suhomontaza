import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
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
        clientName: z.string().min(1, "Ime naročnika je obvezno"),
        clientAddress: z.string().optional(),
        clientTaxId: z.string().optional(),
        description: z.string().optional(),
        paymentTerm: z.string().optional(),
        items: z.array(z.object({
          name: z.string().min(1),
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
        } catch (error) {
          console.error("Failed to create quote:", error);
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
        } catch (error) {
          console.error("Failed to get quotes:", error);
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
        } catch (error) {
          console.error("Failed to get quote:", error);
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
        } catch (error) {
          console.error("Failed to update quote status:", error);
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
        } catch (error) {
          console.error("Failed to delete quote:", error);
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
        } catch (error) {
          console.error("Failed to generate PDF:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Napaka pri generiranju PDF",
          });
        }
      }),
  }),

  // Price list management
  priceList: router({
    // Get all active prices
    list: publicProcedure
      .query(async () => {
        try {
          return await db.getPriceList();
        } catch (error) {
          console.error("Failed to get price list:", error);
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
        name: z.string().min(1),
        unit: z.string().min(1),
        pricePerUnit: z.number().positive(),
        vat: z.number().default(22),
        description: z.string().optional(),
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
        } catch (error) {
          console.error("Failed to create/update price list item:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Napaka pri upravljanju cenika",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
