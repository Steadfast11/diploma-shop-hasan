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

## Qurilish davomidagi qarorlar

### `.container` — `width: min(100% - 2*gutter, 1200px)`
- **Sabab:** katta ekranda AYNAN 1200px (Figma), kichik ekranda `100% - 48px`
  (ikki chetda 24px). `min()` "ko'pi bilan" ma'nosini beradi -> gorizontal skroll yo'q.
- **Muqobil:** `max-width + padding` — desktop'da 1200px o'rniga 1160px chiqadi (padding ichkarida).

### Filtr holati URL query'da; o'zgarganda sahifa QAYTA yuklanadi
- **Sabab:** holat bitta manba (URL) — qayta chizish mantig'i shart emas,
  "orqaga" tugmasi va havola ulashish (`?category=...&minPrice=...`) ishlaydi.
- **Muqobil:** JS bilan holat saqlab, DOM'ni qayta chizish — ko'proq kod, holat bug'lari.

### `api.js` — yagona `fetch` nuqtasi, `request()` yordamchisi
- base URL, `Authorization: Bearer`, xato -> `throw` bir joyda.
- Chaqiruvchi joy `try/catch` bilan ushlaydi. 401 -> token tozalanadi.

### Xato -> `throw` (return emas)
- **Sabab:** muvaffaqiyatli javob va xato ikki xil "yo'l". `throw` bilan chaqiruvchi
  `try { ok } catch { xato }` deb yozadi — `if (result.error)` tekshiruvi kerak emas.

### Savat: mehmon (localStorage) / kirgan (server) — `cart-store.js` yashiradi
- Sahifa "qaysi holat?" demайdi. Login paytida mehmon savati serverga ko'chiriladi
  (`mergeGuestCartIntoAccount`).
- Ko'chirishda tarmoq/server xatosi bo'lgan mahsulotlar o'chirilmaydi: ular mahalliy
  savatda qoladi va foydalanuvchiga ogohlantirish ko'rsatiladi.
- **Chegirma:** API savatida chegirma yo'q -> "Order Summary" da `Subtotal = Total`,
  `Discount (~0%) = 0`.

### Ba'zi sahifalar SF Pro Display shriftida (Figma shunday)
- Katalog filtri, savat "Order Summary", mahsulot sahifasi mazmuni, kirish/profil
  tugmalari — Figma'da SF Pro. `--font-system` (`-apple-system`) Mac'da aynan SF Pro'ni beradi.
- Qolgan hammasi Inter. (Dizaynerning UI-kit aralashmasi.)

### Kirish — telefon o'rniga EMAIL
- O'qituvchi shunday dedi; API `POST /login` faqat `{email, password}`.

### Mahsulot kartochkasi UNIVERSAL — faqat backend maydonlari
- `image, title, price` — nima kelsa shu. Soxta eski narx / "-20%" / "New" belgilari
  (Figma'da bor) — chizilmaydi, chunki API'da bunday maydon yo'q.

### Animatsiya: 2 qatlam — GSAP ("wow") + CSS reveal (zaxira)
- **GSAP + ScrollTrigger + Lenis** (`js/vendor/` da, CDN'siz — Netlify'da ham,
  offline ham ishlaydi, ~128KB). `js/motion.js`:
  - Lenis yumshoq skroll
  - hero sarlavhasi so'zlarga bo'linib maska ortidan ko'tariladi (`gsap.fromTo`,
    `gsap.from` EMAS — `from` element'ni "from" holatida qoldirib ketardi)
  - hero foni skroll bilan parallaks (scrub)
  - `[data-reveal]` / `[data-reveal-stagger]` bloklari ScrollTrigger bilan pastdan chiqadi
    (grid BOLALARINI alohida emas — ular API'dan keyin keladi, poyga bo'lardi)
  - `main` sahifa ochilishida pastdan paydo bo'ladi
- **Zaxira (`js/reveal.js`):** GSAP yo'q yoki `prefers-reduced-motion` bo'lsa —
  IntersectionObserver + CSS. Bu ham 1.5s xavfsizlik to'ri bilan.
- motion.js'da ham 2s xavfsizlik: ekranda ko'rinib, hali yashirin bloklarni majburan ochadi.
- `.has-motion` klassi: GSAP faol bo'lganda CSS reveal qoidalarini o'chiradi (ikki xil animatsiya to'qnashmasin).

### Dev server: `serve` + `serve.json` (`cleanUrls: false`)
- `cleanUrls: false` — URL'dan `.html` va `?query` olib tashlanmasin
  (Netlify ham `.html` ni saqlaydi, statik sayt).
- `components.js` `/components/x.html?v=1` — kesh-buzish.

### `esc()` — backend matnini HTML'ga xavfsiz qo'yish
- Mahsulot nomi / izoh backenddan keladi. `< > & " '` belgilari MATN bo'lib
  chizilsin, HTML bo'lib emas (XSS himoya).

### Sayt tili — default INGLIZCHA, jahon tillariga Google Translate orqali
- Barcha foydalanuvchiga ko'rinadigan matn (label, xato, toast, sarlavha) —
  inglizcha. `<html lang="en">`. Kod izohlari o'zbekcha qoladi — ular Hasan
  uchun, sayt kontenti emas.
- **Jahon tiллariga tarjima:** loyihada backend/tarjima API yo'q, va 190+
  tilni qo'lda yozib bo'lmaydi. Yagona amaliy yechim — Google'ning bepul
  "Website Translator" widgeti (`js/translate.js`): butun sahifани JONLI
  tarjima qiladi, hech qanaqa matn qo'lda yozilmaydi.
- Widget faqat `profile.html`да ko'rinади ("Language" bo'limi); boshqa
  sahifаларда yashirin holда yuklanади, chunki tanlangan til `googtrans`
  cookie'да saqlanади va shu skript ishga tushган har qanaqa sahифада
  o'sha tilni o'qiб qo'llайди — shu sabab BUTUN sayt tarjима qilinади.
- **Cheklov:** bu tashqi (CDN emas — jonli) xizmat, vendor qila olmaymiz.
  Internet yo'q joyda yoki Google xizmatни o'zgartirsa ishlамaslиги mumkin.

### Buzilgan rasm -> toza kulrang quti (broken-icon emas)
- API'дан kelgan `image` URL 404 bo'lsa (yoki bo'sh), brauzer "buzilgan
  rasm" ikonkасини ko'rsatади. `.img-fallback` klassi + `error` hodisаси
  (document darajasида, `capture: true` — bu hodisa bubble bo'lмайди) —
  `<img>` ni bir xil klasslи `<div>` ga almаштиради (fon rangi qoladi).

### Ikki marta bosilса — ikkита amal bo'lмасин
- "Add to cart", "Go to checkout", izoh "Send" — so'rov ketaётганда
  tugma `disabled` bo'lади. Sabab: sekin internetда foydalanuvchi ikki
  marta bossа, ikkита buyurtма/izoh yaratilib qolиши mumkin edi.

### API javob shakllari (kutilmagan)
- `/products/:id` -> `{ product: {...} }` (ichida `comments` ham)
- `/cart` va o'zgartirishlar -> `{ message, cart: {...} }` (api.js ichini ochib beradi)
- `/orders` (POST) -> `{ message, order: {...} }`
