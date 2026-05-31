import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Menu, X, CheckCircle2, Plus, Trash2 } from "lucide-react";
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
    title: "Merjenje in priprava",
    description: "Natančen popis prostora, meritev sten in priprava izvedbe pred montažo",
    icon: `${pictogramBase}/measurement.png`,
  },
  {
    title: "Natančni rezi",
    description: "Rezanje plošč in profilov po merah z milimetrsko natančnostjo",
    icon: `${pictogramBase}/precision-cut.png`,
  },
  {
    title: "Montaža suhomontažnih plošč",
    description: "Profesionalna montaža plošč, profilov in konstrukcijskih detajlov",
    icon: `${pictogramBase}/drywall-installation.png`,
  },
];

const features = [
  {
    title: "Izkušen tim",
    description: "Več kot 15 let izkušenj v industriji",
    icon: `${pictogramBase}/team.png`,
  },
  {
    title: "Kakovostni materiali",
    description: "Samo najboljši materiali za vaš projekt",
    icon: `${pictogramBase}/materials.png`,
  },
  {
    title: "Hitro izvajanje",
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

const navLinks = [
  { href: "#kalkulator", label: "Kalkulator" },
  { href: "#storitve",   label: "Storitve" },
  { href: "#cenik",      label: "Cenik" },
  { href: "#zakaj-mi",   label: "Zakaj mi" },
  { href: "#kontakt",    label: "Kontakt" },
];

// --- Kalkulator helpers ---

const PRICES = {
  predelnaStena:    22,
  spuscenStrop:     26,
  toplotnaIzolacija: 15,
  zvocnaIzolacija:  18,
  kitanje:          8.5,
  fasadnePlosce:    32,
  demontaza:        12,
} as const;

const VAT_RATE = 0.22;

const fmtEur = (n: number) =>
  n.toLocaleString("sl-SI", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type CalcItem = { label: string; m2: number; unitPrice: number };

function buildResult(items: CalcItem[]) {
  const net = items.reduce((s, i) => s + i.m2 * i.unitPrice, 0);
  const vat = net * VAT_RATE;
  return { items, net, vat, gross: net + vat };
}

function ResultPanel({ result }: { result: ReturnType<typeof buildResult> | null }) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Vnesite dimenzije levo<br />za takojšen izračun
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Orientacijska cena</p>
      <div className="space-y-2">
        {result.items.map((item) => (
          <div key={item.label} className="flex justify-between text-sm gap-2">
            <span className="text-muted-foreground">{item.label} <span className="text-xs">({item.m2.toFixed(1)} m²)</span></span>
            <span className="shrink-0 font-medium">€ {fmtEur(item.m2 * item.unitPrice)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-3 space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Brez DDV</span>
          <span>€ {fmtEur(result.net)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">DDV (22%)</span>
          <span>€ {fmtEur(result.vat)}</span>
        </div>
        <div className="flex justify-between font-bold text-base pt-0.5">
          <span>Skupaj z DDV</span>
          <span className="text-accent">€ {fmtEur(result.gross)}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">* ocena dela brez materiala</p>
    </div>
  );
}

function ToggleRow({ label, sub, checked, onChange }: {
  label: string; sub: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// --- Main component ---

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoOpacity, setVideoOpacity] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Kontaktni obrazec
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSent, setContactSent] = useState(false);
  const contactMutation = trpc.contact.submit.useMutation({
    onSuccess: () => setContactSent(true),
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate({
      name: contactName,
      phone: contactPhone || undefined,
      email: contactEmail || undefined,
      message: contactMessage || undefined,
    });
  };

  // Kalkulator — predelna stena
  const [stenaRows, setStenaRows] = useState([{ id: 1, w: "", h: "2.6" }]);
  const [stenaZvok, setStenaZvok] = useState(false);
  const [stenaKitanje, setStenaKitanje] = useState(false);

  // Kalkulator — spuščen strop
  const [stropRows, setStropRows] = useState([{ id: 1, w: "", l: "" }]);
  const [stropIzolacija, setStropIzolacija] = useState(false);

  // Kalkulator — fasadna obloga
  const [fasadaRows, setFasadaRows] = useState([{ id: 1, w: "", h: "2.6" }]);
  const [fasadaDemontaza, setFasadaDemontaza] = useState(false);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const fadeIn = Math.min(1, v.currentTime / 1.5);
    const fadeOut = Math.min(1, (v.duration - v.currentTime) / 1.5);
    setVideoOpacity(Math.min(fadeIn, fadeOut) * 0.55);
  };

  const closeMenu = () => setMenuOpen(false);
  const { data: priceList, isLoading: priceListLoading } = trpc.priceList.list.useQuery();

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("sl-SI", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const calculateVAT = (price: number, vat: number = 22) => {
    const vatAmount = Math.round(price * vat / 100);
    return { net: price, vat: vatAmount, gross: price + vatAmount };
  };

  // Live kalkulator rezultati
  const stenaM2 = stenaRows.reduce((s, r) => s + (parseFloat(r.w) || 0) * (parseFloat(r.h) || 0), 0);
  const stenaResult = (() => {
    if (stenaM2 <= 0) return null;
    const items: CalcItem[] = [{ label: "Montaža predelne stene", m2: stenaM2, unitPrice: PRICES.predelnaStena }];
    if (stenaZvok) items.push({ label: "Zvočna izolacija", m2: stenaM2, unitPrice: PRICES.zvocnaIzolacija });
    if (stenaKitanje) items.push({ label: "Kitanje in brušenje", m2: stenaM2, unitPrice: PRICES.kitanje });
    return buildResult(items);
  })();

  const stropM2 = stropRows.reduce((s, r) => s + (parseFloat(r.w) || 0) * (parseFloat(r.l) || 0), 0);
  const stropResult = (() => {
    if (stropM2 <= 0) return null;
    const items: CalcItem[] = [{ label: "Montaža spuščenega stropa", m2: stropM2, unitPrice: PRICES.spuscenStrop }];
    if (stropIzolacija) items.push({ label: "Toplotna izolacija", m2: stropM2, unitPrice: PRICES.toplotnaIzolacija });
    return buildResult(items);
  })();

  const fasadaM2 = fasadaRows.reduce((s, r) => s + (parseFloat(r.w) || 0) * (parseFloat(r.h) || 0), 0);
  const fasadaResult = (() => {
    if (fasadaM2 <= 0) return null;
    const items: CalcItem[] = [{ label: "Montaža fasadnih plošč", m2: fasadaM2, unitPrice: PRICES.fasadnePlosce }];
    if (fasadaDemontaza) items.push({ label: "Demontaža obstoječih", m2: fasadaM2, unitPrice: PRICES.demontaza });
    return buildResult(items);
  })();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="shrink-0 hover:opacity-80 transition-opacity">
            <img src="/assets/logo/suhomontaza-logo-horizontal.svg" alt="Suhomontaža" className="h-14 w-auto" />
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} className="text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <>
                <span className="hidden sm:block text-sm text-muted-foreground">{user?.name}</span>
                <Button variant="outline" size="sm" onClick={() => setLocation("/ponudbe")}>
                  Ponudbe
                </Button>
              </>
            )}

            {/* Hamburger — samo mobile */}
            <button
              className="md:hidden p-2 rounded-md text-foreground hover:bg-muted transition-colors"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Meni"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="container py-4 flex flex-col gap-1">
              {navLinks.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={closeMenu}
                  className="py-3 px-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
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
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Profesionalna Suhomontaža
            </h2>
            <p className="mt-4 sm:mt-6 text-lg sm:text-xl leading-8 text-muted-foreground">
              Ponujamo visokokakovostne storitve suhomontaže z izkušenim timom in najboljšimi materiali. Vaš projekt je v varnih rokah.
            </p>
            <div className="mt-8 sm:mt-10 flex items-center justify-center gap-4">
              {isAuthenticated ? (
                <Button size="lg" className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => setLocation("/ponudbe")}>
                  Ustvari Ponudbo
                </Button>
              ) : (
                <>
                  <Button size="lg" className="bg-brand text-brand-foreground hover:bg-brand/90" asChild>
                    <a href="#kontakt">Naroči ogled</a>
                  </Button>
                  <Button size="lg" variant="destructive" asChild>
                    <a href="#kalkulator">Izračunaj ceno</a>
                  </Button>
                </>
              )}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {[
                "Brezplačen ogled",
                "Garancija na dela",
                "Hitro izvajanje",
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <svg className="h-4 w-4 shrink-0 text-brand" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Kalkulator */}
      <section id="kalkulator" className="py-16 sm:py-24 lg:py-32 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold">Izračunajte ceno projekta</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">
              Vnesite dimenzije in brez registracije takoj prejmete orientacijsko ceno
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <Tabs defaultValue="stena">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="stena">Predelna stena</TabsTrigger>
                <TabsTrigger value="strop">Spuščen strop</TabsTrigger>
                <TabsTrigger value="fasada">Fasadna obloga</TabsTrigger>
              </TabsList>

              {/* Tab: Predelna stena */}
              <TabsContent value="stena">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="grid grid-cols-[1fr_1fr_2rem] gap-2 px-1">
                          <Label className="text-xs text-muted-foreground">Širina (m)</Label>
                          <Label className="text-xs text-muted-foreground">Višina (m)</Label>
                          <div />
                        </div>
                        {stenaRows.map((row) => (
                          <div key={row.id} className="grid grid-cols-[1fr_1fr_2rem] gap-2 items-center">
                            <Input type="number" min="0" step="0.1" placeholder="4.5"
                              value={row.w}
                              onChange={e => setStenaRows(rs => rs.map(r => r.id === row.id ? { ...r, w: e.target.value } : r))}
                            />
                            <Input type="number" min="0" step="0.1" placeholder="2.6"
                              value={row.h}
                              onChange={e => setStenaRows(rs => rs.map(r => r.id === row.id ? { ...r, h: e.target.value } : r))}
                            />
                            <button
                              onClick={() => setStenaRows(rs => rs.filter(r => r.id !== row.id))}
                              disabled={stenaRows.length === 1}
                              className="flex items-center justify-center h-9 w-8 rounded text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => setStenaRows(rs => [...rs, { id: Date.now(), w: "", h: "2.6" }])}
                          className="flex items-center gap-1.5 text-sm text-brand hover:text-brand/80 transition-colors font-medium"
                        >
                          <Plus className="h-4 w-4" /> Dodaj steno
                        </button>
                        <div className="pt-1 space-y-2">
                          <ToggleRow label="Zvočna izolacija" sub="+18 €/m²" checked={stenaZvok} onChange={setStenaZvok} />
                          <ToggleRow label="Kitanje in brušenje" sub="+8.50 €/m²" checked={stenaKitanje} onChange={setStenaKitanje} />
                        </div>
                        <div className="rounded-lg bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                          Skupna površina: <span className="font-medium text-foreground">{stenaM2.toFixed(1)} m²</span>
                        </div>
                      </div>
                      <ResultPanel result={stenaResult} />
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <Button className="flex-1" asChild>
                        <a href="#kontakt">Pridobi natančno ponudbo</a>
                      </Button>
                      {isAuthenticated && (
                        <Button variant="outline" onClick={() => setLocation("/ponudbe")}>Ustvari ponudbo</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Spuščen strop */}
              <TabsContent value="strop">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="grid grid-cols-[1fr_1fr_2rem] gap-2 px-1">
                          <Label className="text-xs text-muted-foreground">Širina (m)</Label>
                          <Label className="text-xs text-muted-foreground">Dolžina (m)</Label>
                          <div />
                        </div>
                        {stropRows.map((row) => (
                          <div key={row.id} className="grid grid-cols-[1fr_1fr_2rem] gap-2 items-center">
                            <Input type="number" min="0" step="0.1" placeholder="5.0"
                              value={row.w}
                              onChange={e => setStropRows(rs => rs.map(r => r.id === row.id ? { ...r, w: e.target.value } : r))}
                            />
                            <Input type="number" min="0" step="0.1" placeholder="6.0"
                              value={row.l}
                              onChange={e => setStropRows(rs => rs.map(r => r.id === row.id ? { ...r, l: e.target.value } : r))}
                            />
                            <button
                              onClick={() => setStropRows(rs => rs.filter(r => r.id !== row.id))}
                              disabled={stropRows.length === 1}
                              className="flex items-center justify-center h-9 w-8 rounded text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => setStropRows(rs => [...rs, { id: Date.now(), w: "", l: "" }])}
                          className="flex items-center gap-1.5 text-sm text-brand hover:text-brand/80 transition-colors font-medium"
                        >
                          <Plus className="h-4 w-4" /> Dodaj sobo
                        </button>
                        <div className="pt-1 space-y-2">
                          <ToggleRow label="Toplotna izolacija" sub="+15 €/m² (mineralna volna)" checked={stropIzolacija} onChange={setStropIzolacija} />
                        </div>
                        <div className="rounded-lg bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                          Skupna površina: <span className="font-medium text-foreground">{stropM2.toFixed(1)} m²</span>
                        </div>
                      </div>
                      <ResultPanel result={stropResult} />
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <Button className="flex-1" asChild>
                        <a href="#kontakt">Pridobi natančno ponudbo</a>
                      </Button>
                      {isAuthenticated && (
                        <Button variant="outline" onClick={() => setLocation("/ponudbe")}>Ustvari ponudbo</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Fasadna obloga */}
              <TabsContent value="fasada">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="grid grid-cols-[1fr_1fr_2rem] gap-2 px-1">
                          <Label className="text-xs text-muted-foreground">Širina (m)</Label>
                          <Label className="text-xs text-muted-foreground">Višina (m)</Label>
                          <div />
                        </div>
                        {fasadaRows.map((row) => (
                          <div key={row.id} className="grid grid-cols-[1fr_1fr_2rem] gap-2 items-center">
                            <Input type="number" min="0" step="0.1" placeholder="8.0"
                              value={row.w}
                              onChange={e => setFasadaRows(rs => rs.map(r => r.id === row.id ? { ...r, w: e.target.value } : r))}
                            />
                            <Input type="number" min="0" step="0.1" placeholder="2.6"
                              value={row.h}
                              onChange={e => setFasadaRows(rs => rs.map(r => r.id === row.id ? { ...r, h: e.target.value } : r))}
                            />
                            <button
                              onClick={() => setFasadaRows(rs => rs.filter(r => r.id !== row.id))}
                              disabled={fasadaRows.length === 1}
                              className="flex items-center justify-center h-9 w-8 rounded text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => setFasadaRows(rs => [...rs, { id: Date.now(), w: "", h: "2.6" }])}
                          className="flex items-center gap-1.5 text-sm text-brand hover:text-brand/80 transition-colors font-medium"
                        >
                          <Plus className="h-4 w-4" /> Dodaj površino
                        </button>
                        <div className="pt-1 space-y-2">
                          <ToggleRow label="Demontaža obstoječih plošč" sub="+12 €/m²" checked={fasadaDemontaza} onChange={setFasadaDemontaza} />
                        </div>
                        <div className="rounded-lg bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                          Skupna površina: <span className="font-medium text-foreground">{fasadaM2.toFixed(1)} m²</span>
                        </div>
                      </div>
                      <ResultPanel result={fasadaResult} />
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <Button className="flex-1" asChild>
                        <a href="#kontakt">Pridobi natančno ponudbo</a>
                      </Button>
                      {isAuthenticated && (
                        <Button variant="outline" onClick={() => setLocation("/ponudbe")}>Ustvari ponudbo</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      <section id="storitve" className="py-16 sm:py-24 lg:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold">Naše Storitve</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">
              Ponujamo celovite rešitve za vse vrste suhomontažnih del
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-3">
            {services.map((service) => (
              <div key={service.title} className="feature-tile flex flex-col items-center text-center">
                <div className="pictogram-frame mb-5">
                  <img
                    src={service.icon}
                    alt=""
                    aria-hidden="true"
                    className="pictogram-img"
                  />
                </div>
                <h3 className="font-semibold">{service.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cenik" className="py-16 sm:py-24 lg:py-32 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold">Cenik Storitev</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">
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
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2 text-sm">
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

      <section id="zakaj-mi" className="py-16 sm:py-24 lg:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold">Zakaj izbrati nas</h2>
          </div>

          <div className="grid gap-6 sm:gap-8 grid-cols-2 lg:grid-cols-4">
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

      <section id="kontakt" className="py-16 sm:py-24 lg:py-32 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold">Pošljite povpraševanje</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">
              Odgovorimo v 24 urah in brez obveznosti
            </p>
          </div>

          <div className="mx-auto max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Obrazec */}
            <Card>
              <CardContent className="pt-6">
                {contactSent ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                    <CheckCircle2 className="h-12 w-12 text-brand" />
                    <h3 className="text-lg font-semibold">Hvala za povpraševanje!</h3>
                    <p className="text-sm text-muted-foreground">Javili se vam bomo v 24 urah.</p>
                    <Button variant="outline" size="sm" onClick={() => {
                      setContactSent(false);
                      setContactName(""); setContactPhone(""); setContactEmail(""); setContactMessage("");
                    }}>
                      Pošlji novo povpraševanje
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="c-name">Ime in priimek *</Label>
                      <Input
                        id="c-name"
                        placeholder="npr. Janez Novak"
                        value={contactName}
                        onChange={e => setContactName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="c-phone">Telefon</Label>
                        <Input
                          id="c-phone"
                          type="tel"
                          placeholder="+386 41 123 456"
                          value={contactPhone}
                          onChange={e => setContactPhone(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="c-email">Email</Label>
                        <Input
                          id="c-email"
                          type="email"
                          placeholder="janez@email.si"
                          value={contactEmail}
                          onChange={e => setContactEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground -mt-2">Vnesite telefon ali email (vsaj eno)</p>
                    <div className="space-y-1.5">
                      <Label htmlFor="c-msg">Opis projekta</Label>
                      <textarea
                        id="c-msg"
                        rows={4}
                        placeholder="Opišite vaš projekt — npr. predelna stena 4×2.6m v pisarni..."
                        value={contactMessage}
                        onChange={e => setContactMessage(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
                      disabled={contactMutation.isPending || !contactName || (!contactPhone && !contactEmail)}
                    >
                      {contactMutation.isPending ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" />Pošiljam...</>
                      ) : "Pošlji povpraševanje"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Kontaktni podatki */}
            <div className="space-y-6 lg:pt-2">
              {contacts.map((contact) => (
                <div key={contact.title} className="flex items-start gap-4">
                  <div className="pictogram-frame shrink-0 !w-12 !h-12">
                    <img src={contact.icon} alt="" aria-hidden="true" className="pictogram-img" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{contact.title}</h3>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {contact.lines.map((line) => (
                        <span key={line} className="block">{line}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-10 sm:py-12">
        <div className="container">
          <div className="flex flex-col items-center gap-3">
            {!isAuthenticated && (
              <a
                href="#"
                onClick={e => { e.preventDefault(); window.location.href = getLoginUrl(); }}
                className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                Dostop za izvajalce
              </a>
            )}
            <p className="text-sm text-muted-foreground text-center">
              © 2026 Suhomontaža. Vse pravice pridržane.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
