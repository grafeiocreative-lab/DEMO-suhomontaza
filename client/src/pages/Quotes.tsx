import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Loader2, Plus, Trash2, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

interface QuoteItem {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnitCents: number;
  vat: number;
  totalCents: number;
}

export default function Quotes() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");

  // Form state
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientTaxId, setClientTaxId] = useState("");
  const [description, setDescription] = useState("");
  const [paymentTerm, setPaymentTerm] = useState("30 dni");
  const [items, setItems] = useState<QuoteItem[]>([
    { id: "1", name: "", quantity: 0, unit: "m²", pricePerUnitCents: 0, vat: 22, totalCents: 0 },
  ]);

  // Queries and mutations
  const { data: quotes, isLoading: quotesLoading } = trpc.quotes.list.useQuery();
  const createQuoteMutation = trpc.quotes.create.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="card-elegant max-w-md">
          <CardHeader>
            <CardTitle>Dostop Zavrnjen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Za dostop do ponudb se morate prijaviti.
            </p>
            <Button onClick={() => setLocation("/")} className="w-full">
              Nazaj na Domačo Stran
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("sl-SI", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.totalCents, 0);
    const vat = Math.round(subtotal * (items[0]?.vat || 22) / 100);
    return { subtotal, vat, total: subtotal + vat };
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        name: "",
        quantity: 0,
        unit: "m²",
        pricePerUnitCents: 0,
        vat: 22,
        totalCents: 0,
      },
    ]);
  };

  const removeItem = (id: string | undefined) => {
    if (id) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string | undefined, field: string, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "pricePerUnitCents") {
            updated.totalCents = Math.round(updated.quantity * updated.pricePerUnitCents);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleCreateQuote = async () => {
    if (!clientName.trim()) {
      toast.error("Vnesite ime naročnika");
      return;
    }

    if (items.filter((i) => i.name.trim()).length === 0) {
      toast.error("Dodajte vsaj en material");
      return;
    }

    try {
      const result = await createQuoteMutation.mutateAsync({
        clientName,
        clientAddress,
        clientTaxId,
        description,
        paymentTerm,
        items: items
          .filter((i) => i.name.trim())
          .map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            pricePerUnitCents: item.pricePerUnitCents,
            vat: item.vat,
            totalCents: item.totalCents,
          })),
      });

      toast.success(`Ponudba ${result.quoteNumber} je bila ustvarjena`);

      // Reset form
      setClientName("");
      setClientAddress("");
      setClientTaxId("");
      setDescription("");
      setItems([
        { id: "1", name: "", quantity: 0, unit: "m²", pricePerUnitCents: 0, vat: 22, totalCents: 0 },
      ]);

      setActiveTab("history");
    } catch (error) {
      toast.error("Napaka pri ustvarjanju ponudbe");
      console.error(error);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold text-accent">Ponudbe</h1>
          <Button variant="outline" onClick={() => setLocation("/")}>
            Domača Stran
          </Button>
        </div>
      </nav>

      <div className="container py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("new")}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === "new"
                ? "text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Nova Ponudba
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === "history"
                ? "text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Zgodovina
          </button>
        </div>

        {/* New Quote Tab */}
        {activeTab === "new" && (
          <div className="space-y-8">
            {/* Client Details */}
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle>Podatki Naročnika</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clientName">Ime Naročnika *</Label>
                  <Input
                    id="clientName"
                    className="input-elegant"
                    placeholder="npr. Janez Novak"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="clientAddress">Naslov</Label>
                  <Input
                    id="clientAddress"
                    className="input-elegant"
                    placeholder="npr. Slovenska cesta 1, Ljubljana"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="clientTaxId">Davčna Številka</Label>
                  <Input
                    id="clientTaxId"
                    className="input-elegant"
                    placeholder="npr. SI12345678"
                    value={clientTaxId}
                    onChange={(e) => setClientTaxId(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="paymentTerm">Plačilni Rok</Label>
                  <Input
                    id="paymentTerm"
                    className="input-elegant"
                    placeholder="npr. 30 dni"
                    value={paymentTerm}
                    onChange={(e) => setPaymentTerm(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Opombe</Label>
                  <Textarea
                    id="description"
                    className="input-elegant"
                    placeholder="Dodatne opombe za ponudbo..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Materials List */}
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle>Popis Materiala</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-3 py-2 text-left font-semibold">Naziv</th>
                        <th className="px-3 py-2 text-right font-semibold">Količina</th>
                        <th className="px-3 py-2 text-center font-semibold">Enota</th>
                        <th className="px-3 py-2 text-right font-semibold">Cena/Enoto</th>
                        <th className="px-3 py-2 text-right font-semibold">Skupaj</th>
                        <th className="px-3 py-2 text-center font-semibold">Akcija</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                          <td className="px-3 py-2">
                            <Input
                              className="input-elegant text-sm"
                              placeholder="Naziv materiala"
                              value={item.name}
                              onChange={(e) => updateItem(item.id, "name", e.target.value)}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              className="input-elegant text-sm"
                              placeholder="0"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              className="input-elegant text-sm"
                              value={item.unit}
                              onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                            >
                              <option value="m²">m²</option>
                              <option value="kos">kos</option>
                              <option value="uro">uro</option>
                              <option value="kg">kg</option>
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              className="input-elegant text-sm"
                              placeholder="0.00"
                              value={item.pricePerUnitCents / 100}
                              onChange={(e) =>
                                updateItem(item.id, "pricePerUnitCents", Math.round(parseFloat(e.target.value) * 100) || 0)
                              }
                            />
                          </td>
                          <td className="px-3 py-2 text-right font-semibold">
                            € {formatPrice(item.totalCents)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-destructive hover:opacity-70 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Dodaj Vrstico
                </Button>
              </CardContent>
            </Card>

            {/* Totals */}
            <Card className="card-elegant bg-accent/5">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span>Skupaj (brez DDV):</span>
                    <span className="font-semibold">€ {formatPrice(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span>DDV (22%):</span>
                    <span className="font-semibold">€ {formatPrice(totals.vat)}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between text-xl">
                    <span className="font-bold">Skupaj z DDV:</span>
                    <span className="font-bold text-accent">€ {formatPrice(totals.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={handleCreateQuote}
                disabled={createQuoteMutation.isPending}
                className="gap-2"
              >
                {createQuoteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Ustvarjam...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Ustvari Ponudbo
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {quotesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : quotes && quotes.length > 0 ? (
              <div className="grid gap-4">
                {quotes.map((quote) => (
                  <Card key={quote.id} className="card-elegant hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{quote.quoteNumber}</CardTitle>
                          <CardDescription>{quote.clientName}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-accent">
                            € {formatPrice(quote.totalCents)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(quote.createdAt).toLocaleDateString("sl-SI")}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => setLocation(`/ponudbe/${quote.id}`)}
                        >
                          <Download className="h-4 w-4" />
                          Prenesi PDF
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setLocation(`/ponudbe/${quote.id}`)}
                        >
                          Podrobnosti
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="card-elegant">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Še nimate nobene ponudbe</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
