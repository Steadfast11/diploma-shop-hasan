# Diploma Shop

Sandbox Shop API uchun frontend. Toza HTML / CSS / JavaScript — framework yo'q.
Dizayn: Figma maketi (pixel-perfect). Backend: `https://api.wepro.uz/sandbox-shop`.

## Ishga tushirish (dev)

`fetch()` (header/footer va API) `file://` da ishlamaydi — kichik server kerak:

```bash
npm run dev
# yoki
npx serve -l 5173 .
# yoki
python3 -m http.server 5173
```

Keyin brauzerda: `http://localhost:5173`

## Papka tuzilishi

```
index.html              Bosh sahifa (ildizda)
pages/                   Qolgan sahifalar (catalog, product, cart, login, register, orders)
components/              Header va Footer — HTML + CSS yonma-yon. Har sahifaga JS orqali qo'yiladi.
css/
  reset.css              Brauzer defoltlarini tenglashtirish
  variables.css          Figma tokenlari (rang/shrift/oraliq) — :root o'zgaruvchilari
  base.css               body, tipografiya, .container (1200px)
  ui.css                 Qayta ishlatiladigan bo'laklar: .btn, .input, .card, .badge ...
  pages/                 Har sahifaning o'ziga xos stili
js/
  config.js              API manzili va konstantalar
  api.js                 SERVER bilan gaplashadigan yagona fayl (barcha fetch shu yerda)
  storage.js             localStorage ustidan qobiq (token, mehmon savati)
  auth.js                "Kim kirgan" holati
  cart-store.js          Savat mantig'i (mehmon = localStorage, kirgan = server)
  components.js           Header/footer'ni sahifaga joylash
  ui.js                  Mayda JS yordamchilar (element yaratish, narx formati, toast)
  pages/                 Har HTML faylning bosh skripti
assets/                  images / icons / fonts (Figmadan eksport)
docs/                    Himoya materiali: decisions, data-flow, qa-bank, api-reference
```

## Deploy

GitHub repo -> Netlify (reponi ulash yoki `netlify deploy`). Build yo'q, `publish = "."`.
