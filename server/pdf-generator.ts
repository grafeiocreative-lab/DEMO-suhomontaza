import { PDFDocument, PDFPage, rgb, degrees } from "pdf-lib";
import { Quote, QuoteItem } from "../drizzle/schema";

interface QuoteWithItems extends Quote {
  items: QuoteItem[];
}

export async function generateQuotePDF(data: QuoteWithItems): Promise<Buffer> {
  const items = data.items;

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();

  // Define colors
  const accentColor = rgb(0.8, 0.2, 0.2); // Red/orange
  const textColor = rgb(0.1, 0.1, 0.1);
  const lightGray = rgb(0.95, 0.95, 0.95);

  // Embed a font
  const helveticaFont = await pdfDoc.embedFont("Helvetica");

  // Helper function to draw text
  const drawText = (
    x: number,
    y: number,
    text: string,
    size: number = 12,
    color = textColor,
    bold = false
  ) => {
    page.drawText(text, {
      x,
      y,
      size,
      color,
      font: helveticaFont,
    });
  };

  // Header
  drawText(50, height - 50, "PONUDBA", 24, accentColor, true);
  drawText(50, height - 80, `Številka: ${data.quoteNumber}`, 12);
  drawText(50, height - 100, `Datum: ${new Date(data.createdAt).toLocaleDateString("sl-SI")}`, 12);

  // Client details
  let yPos = height - 150;
  drawText(50, yPos, "NAROČNIK:", 12, textColor, true);
  yPos -= 20;
  drawText(50, yPos, data.clientName, 12);
  yPos -= 15;

  if (data.clientAddress) {
    drawText(50, yPos, data.clientAddress, 12);
    yPos -= 15;
  }

  if (data.clientTaxId) {
    drawText(50, yPos, `Davčna številka: ${data.clientTaxId}`, 12);
    yPos -= 15;
  }

  // Items table
  yPos -= 20;
  const tableTop = yPos;
  const colWidths = [200, 60, 80, 100];
  const rowHeight = 20;

  // Table header
  page.drawRectangle({
    x: 50,
    y: tableTop - rowHeight,
    width: colWidths.reduce((a, b) => a + b, 0),
    height: rowHeight,
    color: accentColor,
  });

  drawText(60, tableTop - 15, "Naziv", 11, rgb(1, 1, 1), true);
  drawText(260, tableTop - 15, "Količina", 11, rgb(1, 1, 1), true);
  drawText(330, tableTop - 15, "Enota", 11, rgb(1, 1, 1), true);
  drawText(390, tableTop - 15, "Skupaj (€)", 11, rgb(1, 1, 1), true);

  // Table rows
  let currentY = tableTop - rowHeight - 5;
  items.forEach((item, index) => {
    if (currentY < 100) {
      // Add new page if needed
      const newPage = pdfDoc.addPage([595, 842]);
      currentY = height - 50;
    }

    // Alternate row colors
    if (index % 2 === 0) {
      page.drawRectangle({
        x: 50,
        y: currentY - rowHeight,
        width: colWidths.reduce((a, b) => a + b, 0),
        height: rowHeight,
        color: lightGray,
      });
    }

    drawText(60, currentY - 15, item.name, 11);
    drawText(260, currentY - 15, item.quantity.toString(), 11);
    drawText(330, currentY - 15, item.unit, 11);
    drawText(390, currentY - 15, `€ ${(item.totalCents / 100).toFixed(2)}`, 11);

    currentY -= rowHeight;
  });

  // Totals section
  currentY -= 10;
  const totalsX = 350;

  drawText(totalsX, currentY, "Skupaj (brez DDV):", 12, textColor, true);
  drawText(totalsX + 150, currentY, `€ ${(data.subtotalCents / 100).toFixed(2)}`, 12, textColor, true);

  currentY -= 20;
  drawText(totalsX, currentY, "DDV (22%):", 12, textColor, true);
  drawText(totalsX + 150, currentY, `€ ${(data.vatCents / 100).toFixed(2)}`, 12, textColor, true);

  currentY -= 25;
  page.drawRectangle({
    x: totalsX - 10,
    y: currentY - 20,
    width: 200,
    height: 25,
    color: accentColor,
  });

  drawText(totalsX, currentY - 15, "SKUPAJ Z DDV:", 14, rgb(1, 1, 1), true);
  drawText(totalsX + 150, currentY - 15, `€ ${(data.totalCents / 100).toFixed(2)}`, 14, rgb(1, 1, 1), true);

  // Payment terms
  currentY -= 50;
  if (data.paymentTerm) {
    drawText(50, currentY, `Plačilni rok: ${data.paymentTerm}`, 11);
  }

  // Footer
  drawText(50, 30, "Suhomontaža - Profesionalne storitve suhomontaže", 10, rgb(0.5, 0.5, 0.5));
  drawText(50, 15, "Ljubljana, Slovenija", 10, rgb(0.5, 0.5, 0.5));

  // Save to buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
