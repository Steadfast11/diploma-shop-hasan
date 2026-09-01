# Qaror jurnali (nega shunday yozdik)

Har muhim qaror shu yerda: **qaror -> sabab -> muqobil va nega yo'q**.
Doskada "nega bunday?" degan savolga tayyor javob.

## Umumiy tuzilish

### Framework ishlatmadik (toza HTML/CSS/JS)
- **Sabab:** ТЗ talabi; va pixel-perfect uchun CSS'ni to'liq nazorat qilish kerak.
- **Muqobil:** React/Vue — kerak emas, sayt kichik, SEO va oddiylik muhim.

### Ko'p sahifali (MPA), SPA emas
- **Sabab:** har sahifa alohida `.html` — oddiy, router yozish shart emas,
  Netlify'da to'g'ridan-to'g'ri ishlaydi.
- **Muqobil:** bitta `index.html` + JS router — ortiqcha murakkablik.

### Header/Footer — `components/` + JS injeksiya
- **Sabab:** ТЗ shuni talab qiladi. 7 sahifada header'ni takrorlasak: ko'p kod,
  bittasini tuzatib qolganini unutish -> buglar.
- **Qanday:** har sahifada bo'sh `<div id="header">`, `components.js` uni to'ldiradi.
- **Muqobil:** HTML `import` / SSR — vanilla'da yo'q; iframe — stil va navigatsiya muammosi.

### `js/` = modullar, `js/pages/` = har sahifaning bosh skripti
- **Sabab:** bir xil pattern. Sahifa skripti faqat "ulaydi", mantiq modullarda.
- Bitta sahifani tushunsang — hammasi bir xil.

### `api.js` — yagona fetch nuqtasi
- **Sabab:** token qo'shish, xatoni ushlash, base URL — bir joyda. Endpoint o'zgarsa bitta joy.
- **Muqobil:** har sahifada `fetch` — takror kod, xato ishlovi tarqoq.

### CSS bir necha faylga bo'lingan (reset/variables/base/ui/pages)
- **Sabab:** "product sahifasi stili qayerda?" -> darrov topiladi. Yuklanish tartibi aniq.
- **Muqobil:** bitta `style.css` — kattalashib ketadi, konfliktlar.

## Maket ↔ API qarorlari

### Kirish — EMAIL bilan (telefon emas)
- **Sabab:** o'qituvchi shunday dedi; API `POST /login` faqat `{email, password}` qabul qiladi.
- Maketдаги "Phone" input o'rniga "Email" input. Register'да ikkalasi ham bor.

### Mahsulot kartochkasi — UNIVERSAL, faqat backend maydonlari
- **Sabab:** maketдаги eski narx / chegirma / "-20%" — dizayner to'ldiruvi, real emas.
- Bitta `.product-card` andozasi: `image`, `title`, `price` — nima backendда bo'lsa, shu chiziladi.
  Soxta eski narx yo'q, soxta chegirma yo'q.

### Savat "Order Summary" — Discount doim 0
- **Sabab:** API savatида chegirma tushunchasi yo'q (`{items, total}`).
- Karta strukturasi maketдаgiday: `Subtotal` / `Discount (~0%)` / `Total`.
  `Subtotal = Total = ` API `total`. `Discount = 0` (bo'sh savat maketида ham "~0%" ko'rsatilgan).
- Muqobil: chegirma qatorini olib tashlash — maketдан chetlashish, shart emas.

## Keyingi qarorlar
(Kod yozgan sari shu yerga qo'shib boramiz: flex vs grid, rem vs px, breakpointlar, ...)
