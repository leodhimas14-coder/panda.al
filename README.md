# Panda.al

Dyqan online (website + aplikacion) për **rroba, këpucë, çanta dhe portofola**.
Mallrat blihen në Kinë, mblidhen dhe kontrollohen në magazinën tonë atje,
vijnë me kargo në Shqipëri dhe i dorëzohen klientit me **pagesë në dorëzim**.

## Çfarë ka brenda

**Për klientët** (website që del në Google + aplikacion që instalohet në telefon):
- Katalog me kategori, kërkim, masa dhe ngjyra
- Shportë dhe porosi me pagesë në dorëzim (pa llogari, vetëm emër/telefon/adresë)
- Gjurmim i porosisë me numrin e porosisë + telefonin
- Butoni "Instalo aplikacionin" (Android/desktop direkt, iPhone me udhëzime)
- Butoni i WhatsApp-it

**Për ty dhe stafin** (`/admin`):
- **Paneli**: të ardhurat, shpenzimet dhe fitimi i muajit, porositë sipas statusit, më të shiturat
- **Porositë**: konfirmo, ndrysho statusin, telefono/WhatsApp klientin, shëno kostot
- **Për të blerë**: lista e gjithçkaje që duhet blerë në Kinë, e grupuar sipas produktit/masës/ngjyrës, me linkun e furnitorit
- **Dërgesat (kargo)**: krijo një dërgesë, ngarko porositë, shëno "U nis" / "Mbërriti". Porositë dhe gjurmimi i klientit ndryshojnë automatikisht
- **Produktet**: shto/ndrysho produkte, foto, masa, ngjyra, stok në Shqipëri, çmimi i furnitorit (nuk i shfaqet klientit)
- Njoftim në Telegram për çdo porosi të re (opsionale)

### Rruga e një porosie

```
Porosi e re → E konfirmuar → Blerë te furnitori → Në magazinë në Kinë
→ Në rrugë për Shqipëri → Mbërriti në Shqipëri → Te korrieri → E dorëzuar
```

Nëse produkti është në stok në Shqipëri (fusha "Stok AL"), porosia shkon direkt
nga "E konfirmuar" te "Te korrieri" dhe klientit i shfaqet "Gati në Shqipëri · 1–3 ditë".

## Provoje në kompjuter (pa instaluar databazë)

Duhet Node.js 20 ose më i ri.

```bash
cd backend && npm install && npm run dev:memory     # API + databazë e përkohshme
cd frontend && npm install && npm run dev           # http://localhost:5173
```

Admin: http://localhost:5173/admin, me `admin@panda.al` / `panda1234`.
Të dhënat fshihen kur ndalon serverin.

## Vendosja online

1. **Databaza**: krijo një cluster falas në [MongoDB Atlas](https://www.mongodb.com/atlas) dhe merr `MONGODB_URI`.
2. **Backend-i** (Render, Railway, ose një VPS):
   - `cp backend/.env.example backend/.env` dhe plotëso vlerat
   - `npm install && npm run seed` (krijon adminin nga `ADMIN_EMAIL`/`ADMIN_PASSWORD`)
   - `npm start`
3. **Frontend-i** (Netlify, Vercel, Cloudflare Pages):
   - `VITE_API_URL=https://api.panda.al` dhe `VITE_WHATSAPP=355XXXXXXXXX`
   - `npm run build`, pastaj publiko dosjen `dist/`
   - Vendos një rregull që çdo faqe të kthejë `index.html` (SPA fallback)
4. **Domain-i**: lidh `panda.al` me frontend-in dhe `api.panda.al` me backend-in.
5. **Google**: shto faqen te [Google Search Console](https://search.google.com/search-console) që të dalë në kërkime.

### Google Play Store

Website-i është PWA, kështu që mund të publikohet në Play Store pa e rishkruar app-in:

1. Hap faqen online te [PWABuilder](https://www.pwabuilder.com), shkruaj `https://panda.al` dhe zgjidh **Android → Generate**.
2. Do të marrësh një skedar `.aab` dhe një `assetlinks.json`. Vendose `assetlinks.json` te `frontend/public/.well-known/`.
3. Krijo llogari zhvilluesi në Google Play Console (25 $ një herë) dhe ngarko `.aab`.

App-i në Play Store hap të njëjtin dyqan, kështu që çdo ndryshim në website shfaqet menjëherë edhe në app.

## Struktura teknike

```
backend/   Node.js + Express + MongoDB (Mongoose)
  src/models        Product, Order, Shipment, User, Counter
  src/services      krijimi i porosive (çmimet llogariten në server), stoku, Telegram
  src/controllers   dyqani publik, admin: produktet, porositë, dërgesat, raportet
  test/             testet e API-së (`npm test`, me MongoDB në memorie)
frontend/  React 18 + Vite + vite-plugin-pwa
  src/pages/shop    kryefaqja, katalogu, produkti, shporta, porosia, gjurmimi
  src/pages/admin   paneli, porositë, për të blerë, dërgesat, produktet
```

Shënime:
- Çmimet ruhen në lekë të plota; çmimi i furnitorit në juan (CNY). Kursi vendoset me `CNY_TO_ALL`.
- Fitimi llogaritet vetëm nga porositë e dorëzuara: shitja − (blerja × kursi + kargo + korrieri).
  Kosto e kargos së një dërgese ndahet njësoj midis porosive brenda saj.
- Roli `admin` sheh gjithçka; roli `staff` (p.sh. magazina) sheh porositë, listën e blerjeve dhe dërgesat, por jo produktet dhe fitimin.
- Fotot e produkteve ruhen si linke (p.sh. Cloudinary). Ngarkimi direkt i fotove do të vijë në fazën tjetër.

## Hapat e ardhshëm

- Ngarkim fotosh direkt nga paneli
- Pagesë me kartë / POK
- Faturë fiskale (fiskalizimi)
- Lidhje me korrierin vendas për kodin e gjurmimit
- Njoftime push për klientët ("Porosia jote u nis")

## Demo pa server

`cd frontend && npm run build:demo` krijon `frontend/dist-demo/panda-demo.html`: një faqe e vetme
që përmban dyqanin dhe panelin e adminit, me të dhëna shembull që ruhen vetëm në shfletues.
Admin në demo: `admin@panda.al` / `panda1234`.
