import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Check, MapPin, Phone, Mail } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: priceList, isLoading: priceListLoading } = trpc.priceList.list.useQuery();

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("sl-SI", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const calculateVAT = (price: number, vat: number = 22) => {
    const vatAmount = Math.round(price * vat / 100);
    return {
      net: price,
      vat: vatAmount,
      gross: price + vatAmount,
    };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-accent">Suhomontaža</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">{user?.name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation("/ponudbe")}
                >
                  Ponudbe
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setLocation("/prijava")}>
                Prijava
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 py-20 sm:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-5xl font-bold tracking-tight sm:text-6xl">
              Profesionalna Suhomontaža
            </h2>
            <p className="mt-6 text-xl leading-8 text-muted-foreground">
              Ponujamo visokokakovostne storitve suhomontaže z izkušenim timom in najboljšimi materiali. Vaš projekt je v varnih rokah.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              {isAuthenticated ? (
                <Button size="lg" onClick={() => setLocation("/ponudbe")}>
                  Ustvari Ponudbo
                </Button>
              ) : (
                <Button size="lg" onClick={() => setLocation("/prijava")}>
                  Začni Sedaj
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 sm:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold">Naše Storitve</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Ponujamo celovite rešitve za vse vrste suhomontažnih del
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Montaža Suhomontaže",
                description: "Profesionalna montaža suhomontažnih sistemov z garancijo kakovosti",
                icon: "🏗️",
              },
              {
                title: "Zaključna Dela",
                description: "Spravljivanje, brušenje in barvanje suhomontažnih površin",
                icon: "🎨",
              },
              {
                title: "Svetovanje",
                description: "Strokovni nasveti za izbiro najboljše rešitve za vaš projekt",
                icon: "💡",
              },
            ].map((service, idx) => (
              <Card key={idx} className="card-elegant">
                <CardHeader>
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Price List Section */}
      <section className="py-20 sm:py-32 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold">Cenik Storitev</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Transparentne cene z vključenim DDV (22%)
            </p>
          </div>

          {priceListLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : priceList && priceList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left font-semibold">Storitev</th>
                    <th className="px-4 py-3 text-left font-semibold">Enota</th>
                    <th className="px-4 py-3 text-right font-semibold">Cena Brez DDV</th>
                    <th className="px-4 py-3 text-right font-semibold">DDV (22%)</th>
                    <th className="px-4 py-3 text-right font-semibold">Cena z DDV</th>
                  </tr>
                </thead>
                <tbody>
                  {priceList.map((item) => {
                    const vat = calculateVAT(item.pricePerUnit, item.vat);
                    return (
                      <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3">{item.unit}</td>
                        <td className="px-4 py-3 text-right">€ {formatPrice(vat.net)}</td>
                        <td className="px-4 py-3 text-right">€ {formatPrice(vat.vat)}</td>
                        <td className="px-4 py-3 text-right font-semibold">€ {formatPrice(vat.gross)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <Card className="card-elegant">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Cenik bo kmalu dostopen</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold">Zakaj Nas Izbrati</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Izkušeni Tim", description: "Več kot 15 let izkušenj v industriji" },
              { title: "Kakovostni Materiali", description: "Samo najboljši materiali za vaš projekt" },
              { title: "Hitro Izvajanje", description: "Pravočasna dostava in montaža" },
              { title: "Garancija", description: "Polna garancija na vsa dela" },
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-accent/10 p-3">
                  <Check className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 sm:py-32 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold">Kontaktirajte Nas</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Vedno smo pripravljeni odgovoriti na vaša vprašanja
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="card-elegant">
              <CardHeader>
                <div className="mb-4 rounded-full bg-accent/10 p-3 w-fit">
                  <MapPin className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Naslov</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Slovenija<br />
                  Ljubljana
                </p>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardHeader>
                <div className="mb-4 rounded-full bg-accent/10 p-3 w-fit">
                  <Phone className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Telefon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  +386 1 234 5678<br />
                  Pon-Pet: 8:00 - 17:00
                </p>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardHeader>
                <div className="mb-4 rounded-full bg-accent/10 p-3 w-fit">
                  <Mail className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  info@suhomontaza.si<br />
                  Odgovori v 24 urah
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <h3 className="font-bold">Suhomontaža Portal</h3>
              <p className="text-sm text-muted-foreground">Profesionalne storitve suhomontaže</p>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Suhomontaža. Vse pravice pridržane.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
