import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useRef, useState } from "react";

const pictogramBase = "/assets/icons/pictograms";

const mockPriceList = [
  { id: 1,  name: "Montaža lahke predelne stene",   unit: "m²", pricePerUnit: 2200, vat: 22 },
  { id: 2,  name: "Montaža spuščenega stropa",       unit: "m²", pricePerUnit: 2600, vat: 22 },
  { id: 3,  name: "Toplotna izolacija (mineralna volna)", unit: "m²", pricePerUnit: 1500, vat: 22 },
  { id: 4,  name: "Zvočna izolacija",                unit: "m²", pricePerUnit: 1800, vat: 22 },
  { id: 5,  name: "Kitanje in brušenje",             unit: "m²", pricePerUnit:  850, vat: 22 },
  { id: 6,  name: "Montaža fasadnih plošč",          unit: "m²", pricePerUnit: 3200, vat: 22 },
  { id: 7,  name: "Demontaža obstoječih sten",       unit: "m²", pricePerUnit: 1200, vat: 22 },
  { id: 8,  name: "Svetovanje in izmera",            unit: "uro", pricePerUnit: 5500, vat: 22 },
];

const services = [
  {
    title: "Merjenje in Priprava",
    description: "Natančen popis prostora, meritev sten in priprava izvedbe pred montažo",
    icon: `${pictogramBase}/measurement.png`,
  },
  {
    title: "Natančni Rezi",
    description: "Rezanje plošč in profilov po merah z milimetrsko natančnostjo",
    icon: `${pictogramBase}/precision-cut.png`,
  },
  {
    title: "Montaža Suhomontaže",
    description: "Profesionalna montaža plošč, profilov in konstrukcijskih detajlov",
    icon: `${pictogramBase}/drywall-installation.png`,
  },
];

const features = [
  {
    title: "Izkušen Tim",
    description: "Več kot 15 let izkušenj v industriji",
    icon: `${pictogramBase}/team.png`,
  },
  {
    title: "Kakovostni Materiali",
    description: "Samo najboljši materiali za vaš projekt",
    icon: `${pictogramBase}/materials.png`,
  },
  {
    title: "Hitro Izvajanje",
    description: "Pravočasna dostava in montaža",
    icon: `${pictogramBase}/fast-workflow.png`,
  },
  {
    title: "Garancija",
    description: "Polna garancija na vsa dela",
    icon: `${pictogramBase}/warranty.png`,
  },
];

const contacts = [
  {
    title: "Naslov",
    lines: ["Slovenija", "Ljubljana"],
    icon: `${pictogramBase}/location.png`,
  },
  {
    title: "Telefon",
    lines: ["+386 1 234 5678", "Pon-Pet: 8:00 - 17:00"],
    icon: `${pictogramBase}/phone.png`,
  },
  {
    title: "Email",
    lines: ["info@suhomontaza.si", "Odgovori v 24 urah"],
    icon: `${pictogramBase}/email.png`,
  },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoOpacity, setVideoOpacity] = useState(0);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const fadeIn = Math.min(1, v.currentTime / 1.5);
    const fadeOut = Math.min(1, (v.duration - v.currentTime) / 1.5);
    setVideoOpacity(Math.min(fadeIn, fadeOut) * 0.55);
  };
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
              <Button size="sm" onClick={() => { window.location.href = getLoginUrl(); }}>
                Prijava
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onTimeUpdate={handleTimeUpdate}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: videoOpacity, transition: "opacity 0.2s linear" }}
        >
          <source src="/assets/hero-loop.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/60" />
        <div className="container relative z-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-5xl font-bold tracking-tight sm:text-6xl">
              Profesionalna Suhomontaža
            </h2>
            <p className="mt-6 text-xl leading-8 font-medium text-brand">
              Ponujamo visokokakovostne storitve suhomontaže z izkušenim timom in najboljšimi materiali. Vaš projekt je v varnih rokah.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              {isAuthenticated ? (
                <Button size="lg" onClick={() => setLocation("/ponudbe")}>
                  Ustvari Ponudbo
                </Button>
              ) : (
                <Button size="lg" onClick={() => { window.location.href = getLoginUrl(); }}>
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
            {services.map((service) => (
              <Card key={service.title} className="card-elegant group">
                <CardHeader>
                  <div className="pictogram-frame mb-5">
                    <img
                      src={service.icon}
                      alt=""
                      aria-hidden="true"
                      className="pictogram-img"
                    />
                  </div>
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
          ) : (
            <div className="mx-auto max-w-3xl rounded-lg border border-border overflow-hidden">
              <Accordion type="single" collapsible>
                {(priceList && priceList.length > 0 ? priceList : mockPriceList).map((item) => {
                  const vat = calculateVAT(item.pricePerUnit, item.vat);
                  return (
                    <AccordionItem key={item.id} value={String(item.id)}>
                      <AccordionTrigger className="px-6 hover:no-underline hover:bg-muted/40 [&[data-state=open]]:bg-muted/40">
                        <span className="font-medium">{item.name}</span>
                        <span className="ml-auto mr-4 text-sm text-muted-foreground shrink-0">{item.unit}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-5">
                        <div className="grid grid-cols-3 gap-4 pt-2 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1">Brez DDV</p>
                            <p className="font-medium">€ {formatPrice(vat.net)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">DDV (22%)</p>
                            <p className="font-medium">€ {formatPrice(vat.vat)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Skupaj z DDV</p>
                            <p className="text-lg font-bold text-accent">€ {formatPrice(vat.gross)}</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
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
            {features.map((feature) => (
              <div key={feature.title} className="feature-tile flex flex-col items-center text-center">
                <div className="pictogram-frame mb-4">
                  <img
                    src={feature.icon}
                    alt=""
                    aria-hidden="true"
                    className="pictogram-img"
                  />
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
            {contacts.map((contact) => (
              <Card key={contact.title} className="card-elegant group">
                <CardHeader>
                  <div className="pictogram-frame mb-5">
                    <img
                      src={contact.icon}
                      alt=""
                      aria-hidden="true"
                      className="pictogram-img"
                    />
                  </div>
                  <CardTitle>{contact.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {contact.lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                </CardContent>
              </Card>
            ))}
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
