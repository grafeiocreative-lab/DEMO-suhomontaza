import { describe, it, expect } from "vitest";

/**
 * Vitest testi za Quote funkcionalnost
 * 
 * Opomba: Ti testi preverjajo osnovne izračune in logiko.
 * Testi za bazo podatkov zahtevajo dostop do delujoče baze podatkov.
 */

describe("Quote calculations", () => {
  describe("VAT calculation", () => {
    it("should calculate 22% VAT correctly", () => {
      const subtotal = 100000; // 1000 EUR v centih
      const vat = Math.round(subtotal * 0.22);
      const total = subtotal + vat;

      expect(vat).toBe(22000); // 220 EUR v centih
      expect(total).toBe(122000); // 1220 EUR v centih
    });

    it("should handle zero subtotal", () => {
      const subtotal = 0;
      const vat = Math.round(subtotal * 0.22);
      const total = subtotal + vat;

      expect(vat).toBe(0);
      expect(total).toBe(0);
    });

    it("should handle large amounts", () => {
      const subtotal = 10000000; // 100,000 EUR v centih
      const vat = Math.round(subtotal * 0.22);
      const total = subtotal + vat;

      expect(vat).toBe(2200000); // 22,000 EUR v centih
      expect(total).toBe(12200000); // 122,000 EUR v centih
    });
  });

  describe("Quote item calculations", () => {
    it("should calculate line total correctly", () => {
      const quantity = 50;
      const pricePerUnitCents = 2000; // 20 EUR
      const total = quantity * pricePerUnitCents;

      expect(total).toBe(100000); // 1000 EUR v centih
    });

    it("should handle decimal quantities", () => {
      const quantity = 25.5;
      const pricePerUnitCents = 1000; // 10 EUR
      const total = Math.round(quantity * pricePerUnitCents);

      expect(total).toBe(25500); // 255 EUR v centih
    });

    it("should calculate multiple items correctly", () => {
      const items = [
        { quantity: 50, pricePerUnitCents: 2000 }, // 1000 EUR
        { quantity: 100, pricePerUnitCents: 1000 }, // 1000 EUR
        { quantity: 20, pricePerUnitCents: 5000 }, // 1000 EUR
      ];

      const subtotal = items.reduce((sum, item) => sum + item.quantity * item.pricePerUnitCents, 0);
      expect(subtotal).toBe(300000); // 3000 EUR v centih
    });
  });

  describe("Quote number generation", () => {
    it("should generate valid quote number format", () => {
      const year = new Date().getFullYear();
      const sequence = 1;
      const quoteNumber = `PON-${year}-${String(sequence).padStart(3, "0")}`;

      expect(quoteNumber).toMatch(/^PON-\d{4}-\d{3}$/);
      expect(quoteNumber).toBe(`PON-${year}-001`);
    });

    it("should pad sequence numbers correctly", () => {
      const year = 2026;
      const sequences = [1, 10, 100, 999];

      sequences.forEach((seq) => {
        const quoteNumber = `PON-${year}-${String(seq).padStart(3, "0")}`;
        expect(quoteNumber).toMatch(/^PON-2026-\d{3}$/);
      });
    });
  });

  describe("Price list validation", () => {
    it("should validate price list item", () => {
      const item = {
        name: "Suhomontaža - m²",
        unit: "m²",
        pricePerUnitCents: 2500,
        vat: 22,
        description: "Profesionalna suhomontaža",
      };

      expect(item.name).toBeTruthy();
      expect(item.unit).toBeTruthy();
      expect(item.pricePerUnitCents).toBeGreaterThan(0);
      expect(item.vat).toBe(22);
    });

    it("should validate required fields", () => {
      const validateItem = (item: any) => {
        return (
          Boolean(item.name) &&
          Boolean(item.unit) &&
          item.pricePerUnitCents > 0 &&
          item.vat >= 0
        );
      };

      expect(validateItem({
        name: "Service",
        unit: "m²",
        pricePerUnitCents: 1000,
        vat: 22,
      })).toBe(true);

      expect(validateItem({
        name: "",
        unit: "m²",
        pricePerUnitCents: 1000,
        vat: 22,
      })).toBe(false);

      expect(validateItem({
        name: "Service",
        unit: "m²",
        pricePerUnitCents: 0,
        vat: 22,
      })).toBe(false);
    });
  });

  describe("Currency formatting", () => {
    it("should format cents to EUR correctly", () => {
      const formatPrice = (cents: number) => (cents / 100).toFixed(2);

      expect(formatPrice(100000)).toBe("1000.00");
      expect(formatPrice(2250)).toBe("22.50");
      expect(formatPrice(1)).toBe("0.01");
      expect(formatPrice(0)).toBe("0.00");
    });

    it("should handle rounding correctly", () => {
      const roundCents = (value: number) => Math.round(value * 100);

      expect(roundCents(10.555)).toBe(1056); // JavaScript banker's rounding
      expect(roundCents(10.5)).toBe(1050);
      expect(roundCents(10.1)).toBe(1010);
    });
  });
});

describe("PDF generation", () => {
  it("should validate PDF data structure", () => {
    const quoteData = {
      quoteNumber: "PON-2026-001",
      clientName: "Test Client",
      clientAddress: "Test Address",
      clientTaxId: "SI12345678",
      subtotalCents: 100000,
      vatCents: 22000,
      totalCents: 122000,
      paymentTerm: "30 dni",
      createdAt: new Date(),
      items: [
        {
          id: 1,
          name: "Service",
          quantity: 50,
          unit: "m²",
          pricePerUnitCents: 2000,
          totalCents: 100000,
        },
      ],
    };

    expect(quoteData.quoteNumber).toBeTruthy();
    expect(quoteData.clientName).toBeTruthy();
    expect(quoteData.items.length).toBeGreaterThan(0);
    expect(quoteData.totalCents).toBeGreaterThan(0);
  });

  it("should validate quote has required fields for PDF", () => {
    const validateForPDF = (quote: any) => {
      return (
        quote.quoteNumber &&
        quote.clientName &&
        quote.subtotalCents !== undefined &&
        quote.vatCents !== undefined &&
        quote.totalCents !== undefined &&
        Array.isArray(quote.items) &&
        quote.items.length > 0
      );
    };

    expect(validateForPDF({
      quoteNumber: "PON-2026-001",
      clientName: "Client",
      subtotalCents: 100000,
      vatCents: 22000,
      totalCents: 122000,
      items: [{ name: "Item", quantity: 1 }],
    })).toBe(true);

    expect(validateForPDF({
      quoteNumber: "PON-2026-001",
      clientName: "Client",
      subtotalCents: 100000,
      items: [], // Empty items
    })).toBe(false);
  });
});
