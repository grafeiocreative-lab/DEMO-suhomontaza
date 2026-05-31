# Suhomontaža Portal — TODO

## Narejeno

- [x] Podatkovni modeli (Quote, QuoteItem, PriceList) + Drizzle schema
- [x] tRPC procedure za ponudbe, cenik, PDF, kalkulator
- [x] Domača stran (storitve, cenik, kontakt)
- [x] Forma za popis materiala z dinamičnimi vrsticami
- [x] PDF generator (pdf-lib, native binary)
- [x] Vitest testi (15 testov)
- [x] Čiščenje Manus debug infrastrukture (2026-05-31)
- [x] Varnostni popravki: geslo kalkulatorja → env var, CSP headerji, Zod max() omejitve
- [x] Popravljen login redirect (OAuth namesto /prijava)
- [x] Google Sheets URL → VITE_GOOGLE_SHEETS_URL env var
- [x] Posodobljen SETUP.md
- [x] Hero video loop (assets/hero-loop.mp4) z mehkim fade in/out na loopu
- [x] Barvni sistem — koherentna paleta: terracotta (CTA) + gozdna zelena --brand (hover, focus, subtitle) + topli nevtrali hue-75 (brez hladnih modrih)
- [x] Pisave — Inter lokalno (Regular/Medium/SemiBold), brez Google Fonts

## Odprto

### Kritično pred produkcijo
- [ ] Ustvariti `.env` datoteko z vsemi spremenljivkami (gl. SETUP.md)
- [ ] Preveriti, da DB migracije tečejo (`pnpm drizzle-kit push`)
- [ ] Testirati OAuth prijavo v produkcijskem okolju

### PDF — šumniki
- [ ] Vdelati pisavo z UTF-8 podporo (npr. Noto Sans ali Roboto) v pdf-lib
- [ ] Preveriti izpis ž, š, č v generiranem PDF

### Dizajn — naslednji koraki
- [ ] Heading pisava — Inter zaenkrat, iskati primeren serif/sans (ne umetniški, ne Google). Shraniti .woff2 v assets/fonts/ in poklicati.
- [ ] Pregled dizajna preostalih strani (Quotes, QuoteDetail, Calculator)
- [ ] Mobilna odzivnost — preveriti hero sekcijo z videom na mobilnem

### Manjkajoče funkcionalnosti
- [ ] Admin UI za upravljanje cenika — tRPC endpoint (`priceList.createOrUpdate`) obstaja, frontend stran ne
- [ ] Rate limiting na `/api/trpc/calculator.verify` (brute-force zaščita)

### Produkcija
- [ ] Preveriti CSP headerje z Google Maps API (dodati `maps.googleapis.com` v `script-src` če je Map v uporabi)
- [ ] Nastaviti prave kontaktne podatke v Home.tsx (naslov, telefon, email)
- [ ] Zamenjati placeholder cene v bazi z resničnim cenikom
