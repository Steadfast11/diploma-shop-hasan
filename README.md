# Diploma Shop — WEPRO / Skin—Clinic

Sandbox Shop API uchun onlayn do'kon frontendi. **Toza HTML / CSS / JavaScript** —
framework yo'q. Dizayn: Figma maketi (pixel-perfect). Backend: `https://api.wepro.uz/sandbox-shop`.

## Ishga tushirish (dev)

`fetch()` (header/footer va API) `file://` da ishlamaydi — kichik server kerak:

```bash
npm run dev
# yoki:
npx serve -l 5173 .
# yoki:
python3 -m http.server 5173
```

Brauzerда: `http://localhost:5173`

> `serve.json` da `cleanUrls: false` — URL'дан `.html` va `?query` olib tashlanмаsин.

## Sahifalar

| Fayl | Nima |
|------|------|
| `index.html` | Bosh sahifa (hero + Best sellers + Shop by category + Featured products) |
| `pages/catalog.html` | "All products" + filtr paneli (kategoriya + narx slideri) |
| `pages/category.html` | Bitta kategoriya mahsulotlari (`?id=`) |
| `pages/product.html` | Mahsulot (`?id=`): galereya, narx, qty, Add to cart, izohlar |
| `pages/cart.html` | Savatcha + Order Summary + checkout |
| `pages/login.html` / `register.html` | Kirish (email) / Ro'yxatdan o'tish |
| `pages/profile.html` | Profil + "My orders" (kirish talab qiladi) |

## Papka tuzilishi

```
components/     header, footer, modal — HTML + CSS. JS orqali sahifaga qo'yiladi.
css/
  reset.css       brauzer defoltlarini tenglash
  variables.css   Figma tokenlari (:root o'zgaruvchilari)
  base.css        body tipografiyasi + .container (1200px)
  ui.css          qayta ishlatiladigan: .product-card, .product-grid, .qty,
                  .btn-glass, holat xabarlari, ANIMATSIYALAR
  pages/          har sahifaning o'ziga xos stili
js/
  config.js       API manzili
  api.js          SERVER bilan gaplashadigan yagona fayl (barcha fetch)
  storage.js      localStorage qobig'i (token, mehmon savati)
  auth.js         "kim kirgan" holati (doLogin/doRegister/doLogout/requireAuth)
  cart-store.js   savat mantig'i (mehmon = localStorage, kirgan = server)
  components.js   header/footer'ni sahifaga joylash + header holati
  reveal.js       scroll-reveal (IntersectionObserver)
  ui.js           yordamchilar: money, esc, productCardHTML, openModal
  pages/          har HTML faylning bosh skripti
assets/         icons / images / favicon.svg
docs/           plan, decisions, data-flow, qa-bank, api-reference, figma-nodes
```

## Deploy (Netlify)

Statik sayt — build bosqichi yo'q.

1. GitHub'ga push (`git push`)
2. Netlify → "Add new site" → "Import from Git" → reponi tanlang
3. Build command: bo'sh; Publish directory: `.`  (`netlify.toml` da yozilgan)
4. Deploy

Yoki: `npx netlify deploy --prod --dir=.`

## Himoya materiali

`docs/qa-bank.md` — kutiladigan savol-javoblar.
`docs/data-flow.md` — har amalning oqimi.
`docs/decisions.md` — nega shunday yozildi.
