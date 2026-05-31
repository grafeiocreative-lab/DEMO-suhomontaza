import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, Printer, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface QuoteDetailProps {
  quoteId: number;
}

export default function QuoteDetail({ quoteId }: QuoteDetailProps) {
  const [, setLocation] = useLocation();
  const [isExporting, setIsExporting] = useState(false);

  // Fetch quote details
  const { data: quote, isLoading, error } = trpc.quotes.get.useQuery({ id: quoteId });
  const generatePDFMutation = trpc.quotes.generatePDF.useMutation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container max-w-2xl">
          <Button variant="outline" onClick={() => setLocation("/ponudbe")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Nazaj na Ponudbe
          </Button>
          <Card className="card-elegant mt-6">
            <CardHeader>
              <CardTitle className="text-red-600">Napaka</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Ponudba ni najdena ali pa nimate dostopa do nje.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const result = await generatePDFMutation.mutateAsync({ id: quoteId });

      if (result.success) {
        // Convert base64 to blob
        const byteCharacters = atob(result.buffer);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("PDF je bil uspešno prenesen");
      }
    } catch {
      toast.error("Napaka pri izvozу PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate totals
  const subtotal = quote.subtotalCents / 100;
  const vat = quote.vatCents / 100;
  const total = quote.totalCents / 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold text-accent">Ponudba {quote.quoteNumber}</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setLocation("/ponudbe")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Nazaj
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Quote Header */}
          <Card className="card-elegant mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Ponudba {quote.quoteNumber}</CardTitle>
                  <CardDescription>
                    Datum: {new Date(quote.createdAt).toLocaleDateString("sl-SI")}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="gap-2"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Izvažam...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Prenesi PDF
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handlePrint}
                    className="gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Natisni
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Client Details */}
          <Card className="card-elegant mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Podatki Naročnika</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <strong>Ime:</strong> {quote.clientName}
              </p>
              {quote.clientAddress && (
                <p>
                  <strong>Naslov:</strong> {quote.clientAddress}
                </p>
              )}
              {quote.clientTaxId && (
                <p>
                  <strong>Davčna Številka:</strong> {quote.clientTaxId}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card className="card-elegant mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Postavke Ponudbe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 font-semibold">Naziv</th>
                      <th className="text-center py-2 px-2 font-semibold">Količina</th>
                      <th className="text-center py-2 px-2 font-semibold">Enota</th>
                      <th className="text-right py-2 px-2 font-semibold">Cena/Enoto</th>
                      <th className="text-right py-2 px-2 font-semibold">Skupaj</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items.map((item: any, index: number) => (
                      <tr
                        key={item.id}
                        className={`border-b border-border ${
                          index % 2 === 0 ? "bg-muted/30" : ""
                        }`}
                      >
                        <td className="py-2 px-2">{item.name}</td>
                        <td className="text-center py-2 px-2">{item.quantity}</td>
                        <td className="text-center py-2 px-2">{item.unit}</td>
                        <td className="text-right py-2 px-2">
                          € {(item.pricePerUnitCents / 100).toFixed(2)}
                        </td>
                        <td className="text-right py-2 px-2 font-semibold">
                          € {(item.totalCents / 100).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card className="card-elegant">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Skupaj (brez DDV):</span>
                  <span className="font-semibold">€ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>DDV (22%):</span>
                  <span className="font-semibold">€ {vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg border-t border-border pt-3 mt-3">
                  <span className="font-bold">SKUPAJ Z DDV:</span>
                  <span className="font-bold text-accent">€ {total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          {quote.paymentTerm && (
            <Card className="card-elegant mt-6">
              <CardContent className="pt-6">
                <p className="text-sm">
                  <strong>Plačilni rok:</strong> {quote.paymentTerm}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
