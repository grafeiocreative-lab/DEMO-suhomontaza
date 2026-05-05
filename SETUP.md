# Suhomontažerska Spletna Stran - Navodila za Namestitev

Dobrodošli! To je profesionalna spletna stran za suhomontažerja s kalkulatorjem in upravljanjem ponudb.

## Značilnosti

### Javni Del
- **Domača stran** - Predstavitev storitev in kontaktni podatki
- **Cenik** - Prikazuje cene storitev z in brez DDV (22%)
- Eleganten dizajn s polno podporo za slovenske šumnike (š, č, ž)

### Privatni Del (Zahteva Prijavo)
- **Popis Materiala** - Dinamično dodajanje in brisanje postavk
- **Generator Ponudb** - Avtomatski izračun skupne vrednosti
- **PDF Izvoz** - Izvoz ponudb v PDF format
- **Zgodovina Ponudb** - Shranjevanje in upravljanje preteklih ponudb

### Skrit Kalkulator (Zaščiten z Geslom)
- **Dostop:** `/kalkulator`
- **Geslo:** `suhomontaza2026` (spremenite v produkciji!)
- **Funkcionalnost:** Seštevanje, odštevanje, množenje, deljenje
- **Integracija:** Samodejno pošiljanje rezultatov na Google Sheets

## Namestitev Google Sheets Integracije

### Korak 1: Ustvarite Google Sheets Preglednico

1. Odprite [Google Sheets](https://sheets.google.com)
2. Ustvarite novo preglednico
3. Preimenuјte je na "Suhomontažer Kalkulator"

### Korak 2: Namestite Apps Script

1. V Google Sheets kliknite na **Extensions** → **Apps Script**
2. Izbrišite privzeto kodo
3. Kopirajte vsebino datoteke `google-apps-script.js` iz tega projekta
4. Prilepite kodo v Apps Script editor
5. Kliknite **Save** (Shrani)

### Korak 3: Razporedite Web App

1. Kliknite **Deploy** → **New deployment**
2. Izberite **Web app** kot tip
3. Nastavite:
   - **Execute as:** Vaš Google račun
   - **Who has access:** Anyone
4. Kliknite **Deploy**
5. Kopirajte prikazani URL

### Korak 4: Posodobite Kalkulator

1. Odprite datoteko `client/src/pages/Calculator.tsx`
2. Poiščite vrstico:
   ```typescript
   const GOOGLE_SHEETS_URL = "https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercallback";
   ```
3. Zamenjajte `YOUR_SCRIPT_ID` s pravim ID-jem iz koraka 3
4. Shranite datoteko

## Sprememba Gesla za Kalkulator

1. Odprite `client/src/pages/Calculator.tsx`
2. Poiščite vrstico:
   ```typescript
   const correctPassword = "suhomontaza2026";
   ```
3. Zamenjajte z novim geslom
4. Shranite datoteko

## Sprememba Cenika

1. Prijavite se na spletno stran
2. Pojdite na **Ponudbe** → **Upravljanje Cenika**
3. Dodajte ali spremenite postavke cenika
4. Spremembe se samodejno shranijo v bazo podatkov

## Struktura Projekta

```
suhomontazer-portal/
├── client/                 # Frontend (React)
│   └── src/
│       ├── pages/
│       │   ├── Home.tsx           # Domača stran
│       │   ├── Quotes.tsx         # Upravljanje ponudb
│       │   ├── Calculator.tsx     # Skrit kalkulator
│       │   └── QuoteDetail.tsx    # Podrobnosti ponudbe
│       └── index.css              # Stilizacija
├── server/                 # Backend (Express + tRPC)
│   ├── routers.ts         # tRPC procedure
│   ├── db.ts              # Funkcije za bazo podatkov
│   └── pdf-generator.ts   # Generiranje PDF ponudb
├── drizzle/               # Baza podatkov
│   └── schema.ts          # Definicija tabel
└── google-apps-script.js  # Google Apps Script koda
```

## Razvoj

### Namestitev Odvisnosti
```bash
pnpm install
```

### Zagon Razvojnega Strežnika
```bash
pnpm dev
```

### Gradnja za Produkcijo
```bash
pnpm build
pnpm start
```

### Testiranje
```bash
pnpm test
```

## Varnost

### Geslo za Kalkulator
- Spremenite privzeto geslo v `Calculator.tsx`
- Uporabite močno geslo v produkciji
- Razmislite o implementaciji pravega avtentifikacijskega sistema

### Baza Podatkov
- Vsi podatki so shranjeni v varni bazi podatkov
- Dostop je omejen na prijavljene uporabnike
- Samo administratorji lahko upravljajo cenik

### Google Sheets
- Apps Script je dostopen samo avtentificiranim uporabnikom
- Podatki se pošiljajo prek HTTPS
- Spremenite dostop v Apps Script, če je potrebno

## Pogosta Vprašanja

### V: Kako spremenem barvo spletne strani?
O: Odprite `client/src/index.css` in spremenite CSS spremenljivke v `:root` in `.dark` razredih.

### V: Kako dodam nove postavke v cenik?
O: Prijavite se in pojdite na Ponudbe → Upravljanje Cenika.

### V: Kako izvozim ponudbo v PDF?
O: Odprite ponudbo in kliknite na gumb "Prenesi PDF".

### V: Kaj je geslo za kalkulator?
O: Privzeto je `suhomontaza2026`. Spremenite ga v `Calculator.tsx`.

### V: Kako vidim podatke iz Google Sheets?
O: Odprite Google Sheets preglednico, ki ste jo ustvarili. Podatki se samodejno dodajajo v stolpec "Izračuni".

## Tehnični Sklad

- **Frontend:** React 19, TypeScript, Tailwind CSS 4
- **Backend:** Express 4, tRPC 11, Node.js
- **Baza Podatkov:** TiDB (MySQL kompatibilen)
- **Avtentifikacija:** Manus OAuth
- **PDF Generiranje:** pdf-lib
- **Stilizacija:** Tailwind CSS s Custom Theme

## Podpora

Če imate vprašanja ali težave, prosim kontaktirajte razvojni tim.

## Licenca

Vse pravice pridržane © 2026 Suhomontaža
