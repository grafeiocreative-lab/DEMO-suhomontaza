# Suhomontaža Portal — Navodila za Namestitev

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Wouter (routing), tRPC client
- **Backend:** Express 4, tRPC 11, Node.js
- **Baza podatkov:** TiDB (MySQL kompatibilen), Drizzle ORM
- **Avtentifikacija:** Manus OAuth
- **PDF:** pdf-lib (native binary rendering)

## Okoljespremenljivke (.env)

Ustvari datoteko `.env` v korenu projekta:

```env
# Baza podatkov (TiDB / MySQL)
DATABASE_URL=mysql://user:password@host:4000/dbname

# Session varnost
JWT_SECRET=dolg-nakljucni-niz-vsaj-32-znakov

# Manus OAuth
VITE_APP_ID=tvoj-app-id
VITE_OAUTH_PORTAL_URL=https://manus.im
OAUTH_SERVER_URL=https://manus.im
OWNER_OPEN_ID=tvoj-open-id

# Skrit kalkulator — geslo, ki ga uporabnik vnese
CALCULATOR_PASSWORD=tvojeVarinoGeslo

# Google Sheets (opcijsko)
VITE_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

## Zagon

```bash
pnpm install
pnpm dev       # razvojni strežnik
pnpm build     # produkcijska gradnja
pnpm start     # zaženi produkcijsko gradnjo
pnpm test      # testi
```

## Baza podatkov

```bash
pnpm drizzle-kit push    # ustvari tabele v bazi
pnpm drizzle-kit studio  # vizualni pregled baze
```

## Struktura projekta

```
DEMO-suhomontaza/
├── client/src/
│   ├── pages/
│   │   ├── Home.tsx           # Javna domača stran
│   │   ├── Quotes.tsx         # Upravljanje ponudb (zahteva prijavo)
│   │   ├── QuoteDetail.tsx    # Podrobnosti + PDF izvoz
│   │   └── Calculator.tsx     # Skrit kalkulator (geslo prek env)
│   ├── components/
│   │   └── Map.tsx            # Google Maps komponenta
│   └── _core/hooks/useAuth.ts # OAuth auth hook
├── server/
│   ├── routers.ts             # tRPC API procedure
│   ├── db.ts                  # Drizzle DB funkcije
│   └── pdf-generator.ts       # pdf-lib generator
├── drizzle/
│   └── schema.ts              # Definicija DB tabel
└── google-apps-script.js      # Apps Script koda za Google Sheets
```

## Google Sheets integracija (opcijsko)

1. Odpri Google Sheets → Extensions → Apps Script
2. Kopiraj vsebino `google-apps-script.js`
3. Deploy → New deployment → Web app → Anyone
4. Kopiraj URL in nastavi `VITE_GOOGLE_SHEETS_URL` v `.env`

## Cenik

Cenik se upravlja prek baze podatkov. Admin (lastnik računa) ima dostop prek
tRPC procedure `priceList.createOrUpdate`. Frontend UI za upravljanje cenika
**še ni implementiran** — začasno vstavi vnose neposredno v DB.

## Znane omejitve

- **PDF:** Helvetica pisava nima podpore za šumnike (ž, š, č). Za pravilno
  renderiranje je treba vdelati slovensko pisavo (npr. Roboto).
- **Kalkulator:** Ni zaščite pred brute-force napadi na geslo.
- **CSP:** Nastavljeni varnostni headerji morda zahtevajo prilagoditev za
  produkcijo (Google Maps, zunanji fonti).
