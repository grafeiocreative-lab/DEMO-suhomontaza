import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { Loader2, Lock, Send } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface CalculatorResult {
  success: boolean;
  result?: number;
  error?: string;
}

export default function Calculator() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const verifyMutation = trpc.calculator.verify.useMutation();

  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [operation, setOperation] = useState("add");
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const googleSheetsUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL as string | undefined;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyMutation.mutateAsync({ password });
      setIsAuthenticated(true);
      setPassword("");
      toast.success("Dostop Odobren");
    } catch {
      toast.error("Napačno Geslo");
    }
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input1 || !input2) {
      toast.error("Vnesite obe vrednosti");
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      let calculatedResult: number;

      switch (operation) {
        case "add":
          calculatedResult = parseFloat(input1) + parseFloat(input2);
          break;
        case "subtract":
          calculatedResult = parseFloat(input1) - parseFloat(input2);
          break;
        case "multiply":
          calculatedResult = parseFloat(input1) * parseFloat(input2);
          break;
        case "divide":
          if (parseFloat(input2) === 0) {
            setResult({ success: false, error: "Deljenje z nič ni mogoče" });
            setIsSubmitting(false);
            return;
          }
          calculatedResult = parseFloat(input1) / parseFloat(input2);
          break;
        default:
          calculatedResult = 0;
      }

      if (googleSheetsUrl) {
        fetch(googleSheetsUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation,
            value1: parseFloat(input1),
            value2: parseFloat(input2),
            result: calculatedResult,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {});
      }

      setResult({ success: true, result: calculatedResult });
      toast.success(googleSheetsUrl ? "Rezultat poslan na Google Sheets" : "Izračun uspešen");
    } catch {
      setResult({ success: false, error: "Napaka pri izračunu" });
      toast.error("Napaka pri izračunu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setInput1("");
    setInput2("");
    setResult(null);
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="card-elegant max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-6 w-6 text-accent" />
              <CardTitle>Skrit Kalkulator</CardTitle>
            </div>
            <CardDescription>
              Vnesite geslo za dostop do kalkulatorja
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Geslo</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input-elegant"
                  placeholder="Vnesite geslo"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={verifyMutation.isPending}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="showPassword" className="cursor-pointer text-sm">
                  Prikaži Geslo
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={verifyMutation.isPending}
              >
                {verifyMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Preverjam...
                  </>
                ) : (
                  "Vstopi"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setLocation("/")}
              >
                Nazaj
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold text-accent">Kalkulator</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setLocation("/")}>
              Domača Stran
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Odjava
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Kalkulator</CardTitle>
              {googleSheetsUrl && (
                <CardDescription>
                  Rezultat bo samodejno poslan na Google Sheets
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCalculate} className="space-y-6">
                <div>
                  <Label htmlFor="operation">Operacija</Label>
                  <select
                    id="operation"
                    className="input-elegant"
                    value={operation}
                    onChange={(e) => setOperation(e.target.value)}
                  >
                    <option value="add">Seštevanje (+)</option>
                    <option value="subtract">Odštevanje (-)</option>
                    <option value="multiply">Množenje (×)</option>
                    <option value="divide">Deljenje (÷)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="input1">Prva Vrednost</Label>
                    <Input
                      id="input1"
                      type="number"
                      step="0.01"
                      className="input-elegant"
                      placeholder="npr. 100"
                      value={input1}
                      onChange={(e) => setInput1(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="input2">Druga Vrednost</Label>
                    <Input
                      id="input2"
                      type="number"
                      step="0.01"
                      className="input-elegant"
                      placeholder="npr. 50"
                      value={input2}
                      onChange={(e) => setInput2(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {result && (
                  <div className={`p-4 rounded-lg border ${
                    result.success
                      ? "bg-brand/10 border-brand/20"
                      : "bg-destructive/10 border-destructive/20"
                  }`}>
                    {result.success ? (
                      <div>
                        <p className="text-sm font-semibold text-brand mb-2">Rezultat:</p>
                        <p className="text-3xl font-bold text-brand">
                          {result.result?.toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-destructive">Napaka:</p>
                        <p className="text-destructive">{result.error}</p>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2"
                  disabled={isSubmitting || !input1 || !input2}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Izračunavam...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {googleSheetsUrl ? "Izračunaj in Pošlji" : "Izračunaj"}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
