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

### Katalog filtri — reload YO'Q, faqat "Apply Filter" da ishlaydi
- **Sabab:** kategoriya bosilganda yoki slider surilganда sahifa qayta
  yuklanishi foydalanuvchiga yoqmadi (sakrash, skroll yo'qoladi).
- **Qanday:** kategoriya bosish / slider — faqat "kutilayotgan" tanlovni
  belgilaydi (vizual: `aria-pressed`, chevron pastga buriladi). "Apply Filter"
  bosilganda: `filter` holati yangilanadi -> `loadProducts()` mahsulotlarni
  qayta oladi (grid almashadi) -> `history.replaceState` bilan URL ham
  yangilanadi (reload'siz) -> `?category=...&minPrice=...` havolani ulashса bo'ladi.
- **Price sarlavhasi** — bosilganda slider paneli ochilib/yopiladi (`aria-expanded`).
- **Muqobil (eski):** har o'zgarishda `location.search = ...` -> reload. Sodda edi,
  lekin UX yomon. Yangi variant biroz ko'proq kod, lekin bitta sahifada qoladi.

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

### O'qituvchi Figma'ni yangiladi (2026-09-02) — 5 ta o'zgarish
1. **Kategoriya sahifasi olib tashlandi.** `pages/category.html`,
   `js/pages/category.js`, `css/pages/category.css` o'chirildi.
   Bosh sahifadagi "Shop by category" kartochkalari endi katalogga,
   o'sha kategoriya tanlangan holda ketadi:
   `/pages/catalog.html?category=<id>`. Katalog `?category=` ni
   allaqachon o'qiydi -> qo'shimcha kod kerak bo'lmadi va "har bir
   ko'rinadigan control ishlasin" qoidasi buzilmadi.
2. **Login va Register sahifalarida footer yo'q.** `<div id="footer">`
   va endi keraksiz `footer.css` havolasi olib tashlandi.
   `components.js` footer div'ini topmasa jimgina to'xtaydi — xato yo'q.
3. **Profil: TELEFON versiyasida faqat akkaunt bloki qoladi.**
   Ism / telefon / email / "Log out" — shu. "My orders" va "Favorites"
   bo'limlari ko'rinmaydi. ("Language" bo'limi keyinchalik butunlay
   olib tashlandi — pastdagi "Sayt tili" qaroriga qarang.)
   `@media (max-width: 768px) { .profile > *:not(.profile__head) { display: none } }`
   Qoida ataylab "head dan BOSHQA hammasi" deb yozilgan: keyin yangi
   bo'lim qo'shilsa ham telefonda o'z-o'zidan yashirin bo'ladi.
   768px — saytdagi "telefon" chegarasi (header shu yerda burger'ga o'tadi).
   Yashirish faqat CSS'da: ekran kattalashsa bo'limlar qaytadan ko'rinadi.
   Ma'lumot baribir olinadi (bitta so'rov) — shunda ekran burilganda
   qayta so'rov kerak bo'lmaydi.
4. **Narx filtri 0–100$** (avval 0–500$). Slider `max` va tutqichlarning
   boshlang'ich qiymati ($0 / $100 — to'liq oraliq), "Clear filters" ham
   shu qiymatlarga qaytadi.
5. **Mahsulot sahifasi butunlay SF Pro Display** (header/footer'dan
   tashqari). Shrift bitta joyda — `<main class="product">` da beriladi,
   ichidagi hamma element (sarlavha, matn, tugma) meros oladi.
   Ilgari har qoidada alohida yozilgan `font-family` takrorlari olib
   tashlandi. Header/footer `<main>` dan tashqarida -> ularga tegmaydi.

### Qo'shimcha animatsiyalar — dizaynga TEGMASDAN
Qoida: har bir animatsiya faqat "bezak". Ishlamay qolsa sayt to'g'ri
ko'rinishi SHART. Shuning uchun hamma joyda "xavfsiz yo'nalish" tanlandi.

- **Rasm yumshoq ochilishi** — API rasmi birdan "sakramasin". Kulrang
  joy-tutgich endi o'rovchi elementda (`.product-card__media`,
  `.cart-item__media`, `.product__main`), rasmning o'zi `load` bo'lgach
  ochiladi (`components.js` da `load` ushlagichi — mavjud `error`
  ushlagichi bilan bir xil uslub: `capture: true`, chunki ikkalasi ham
  bubble bo'lmaydi).
  **Nega `transition` emas, `animation`:** `transition` bilan asosiy holat
  `opacity: 0` bo'lardi — animatsiya ishlamay qolsa rasm KO'RINMAY qolardi.
  `animation` da esa asosiy `opacity` — 1, fade faqat ustidan qo'shiladi.
- **Kartochkalar birin-ketin** (`ui.js` -> `revealCards`) — API javob
  bergach grid bolalari 0.06s farq bilan chiqadi. Ekrandan tashqaridagi
  grid uchun ishlamaydi (uni `[data-reveal-stagger]` skroll bilan chiqaradi).
  Shu funksiya `ScrollTrigger.refresh()` ham qiladi: kontent API'dan keyin
  qo'shilgani uchun skroll o'lchovlari eskirib qolardi.
- **Bo'lim sarlavhalari** (`[data-split]`) — hero'dagi AYNAN o'sha so'z-maska
  effekti, lekin skroll bilan. Matni JS bilan almashadigan sarlavhalarga
  qo'yilmadi (`splitWords` `innerHTML` ni qayta yozadi -> ichidagi
  `<span data-review-count>` yo'qolardi).
- **`.m-word` da `padding-bottom`/manfiy `margin-bottom`** — `overflow: hidden`
  pastga tushuvchi harflarni (g, y, p) kesmasin. Tashqi o'lcham o'zgarmaydi.
- **Savat**: `+`/`−` da butun ro'yxat QAYTA CHIZILMAYDI — faqat o'sha
  qatordagi son va "Order Summary" (raqam `countUp` bilan sanab o'tadi).
  O'chirishda qator avval yumshoq so'nadi (0.28s), keyin ro'yxat yangilanadi.
  **`transition` asosiy `.cart-item` qoidasida**: agar u `.is-removing` ichida
  bo'lsa, klass qo'shilganda transition va yangi qiymat bir vaqtda paydo
  bo'ladi va brauzer animatsiya qilmaydi.
- **"Bag"ga uchish** (`flyToBag`) — "Add to cart" da rasm nusxasi header'ga
  uchadi. Vaqtinchalik `position: fixed` element, 0.8s dan keyin o'chadi.
- **Yurakcha "pop"** — faqat QO'SHILGANDA (sahifa ochilganda emas, aks holda
  profil sahifasidagi hamma yurakcha birdan sakrardi).
- **Register**: noto'g'ri maydon yengil silkinadi, xato matni yuqoridan ochiladi.
- Hammasi `prefers-reduced-motion: reduce` da o'chadi; GSAP bo'lmasa
  `revealCards`/`flyToBag` shunchaki hech narsa qilmaydi.

### Ko'rinmaydigan tezlik (animatsiya emas, lekin "silliq his")
- **Havolani oldindan yuklash** (`wirePrefetch`) — sichqoncha havola ustiga
  kelganda `<link rel="prefetch">` qo'shiladi. Har manzil bir marta;
  `?id=...` tashlab yuboriladi (HTML fayl bitta). Tashqi havolalar va
  `target` li havolalar tegilmaydi.
- **Hero rasmiga `preload` + `fetchpriority="high"`** — Google "LCP" deb
  o'lchaydigan eng katta element shu; oldindan yuklash SEO ballini oshiradi.
- **`aria-busy`** — grid yuklanayotganda skrinrider "yuklanmoqda" deb biladi.

### Rad etilgan: sahifalar orasida cross-fade (View Transitions)
Chiroyli bo'lardi, lekin bizdagi scroll-reveal bilan to'qnashadi: yangi
sahifa "surat"i olinayotganda bloklar hali `opacity: 0` da bo'lib, oq
yaltirash beradi. JS bilan havolani ushlab qolish esa `Ctrl+click`,
"orqaga" tugmasi va bfcache'ni buzish xavfini tug'diradi. Foydasidan
zarari ko'p -> qilinmadi.

### Dev server: `serve` + `serve.json` (`cleanUrls: false`)
- `cleanUrls: false` — URL'dan `.html` va `?query` olib tashlanmasin
  (Netlify ham `.html` ni saqlaydi, statik sayt).
- `components.js` `/components/x.html?v=1` — kesh-buzish.

### `esc()` — backend matnini HTML'ga xavfsiz qo'yish
- Mahsulot nomi / izoh backenddan keladi. `< > & " '` belgilari MATN bo'lib
  chizilsin, HTML bo'lib emas (XSS himoya).

### Sayt tili — faqat INGLIZCHA (tarjima tizimi YO'Q)
- Barcha foydalanuvchiga ko'rinadigan matn (label, xato, toast, sarlavha) —
  inglizcha. `<html lang="en">`. Kod izohlari o'zbekcha qoladi — ular Hasan
  uchun, sayt kontenti emas.
- **Google Translate widgeti OLIB TASHLANDI** (o'qituvchi so'radi).
  Nima o'chdi: `js/translate.js`, har sahifadagi yashirin
  `#google_translate_element` div va skript, profil sahifasidagi
  "Language" bo'limi, `css/ui.css` dagi widget stillari.
- **Foydasi:** endi tashqi (vendor qilib bo'lmaydigan, jonli) xizmatga
  bog'liqlik yo'q. Yagona tashqi manba — Google Fonts (Inter shrifti).
  CSP ancha qattiqlashdi: `script-src 'self'` (endi `'unsafe-inline'` ham,
  `translate.google.com` ham kerak emas), `frame-src 'none'`,
  `connect-src` da faqat bizning API.
- **Muqobil:** har matnni qo'lda 190+ tilga tarjima qilish — imkonsiz;
  server tomonda tarjima — bizda backend yo'q. Shuning uchun sayt
  bir tilli (inglizcha) qoldi.

### Buzilgan rasm -> toza kulrang quti (broken-icon emas)
- API'дан kelgan `image` URL 404 bo'lsa (yoki bo'sh), brauzer "buzilgan
  rasm" ikonkасини ko'rsatади. `.img-fallback` klassi + `error` hodisаси
  (document darajasида, `capture: true` — bu hodisa bubble bo'lмайди) —
  `<img>` ni bir xil klasslи `<div>` ga almаштиради (fon rangi qoladi).

### Ikki marta bosilса — ikkита amal bo'lмасин
- "Add to cart", "Go to checkout", izoh "Send" — so'rov ketaётганда
  tugma `disabled` bo'lади. Sabab: sekin internetда foydalanuvchi ikki
  marta bossа, ikkита buyurtма/izoh yaratilib qolиши mumkin edi.

### Register — inline validatsiya + telefon uchun kutubxona
- **Har maydon ostida alohida xato** (`.field__error`), bitta umumiy xato emas.
  `blur` da tekshiriladi, tuzatil boshlansa qayta baholanadi, `submit` da hammasi.
  `aria-invalid` + `aria-describedby` — skrinrider ham biladi. Valid bo'lmaguncha
  API'ga so'rov yo'q.
- **Tekshiruv mantig'i alohida sodda funksiyalarда** (`js/validation.js`) — chalkash
  katta `submit` callback emas. Doskада bitta funksiyани ko'rsatib tushuntirса bo'ladi.
- **Nega barcha davlat regexlari qo'lda yozilmagan:** har davlatning telefon
  uzunligi/formati har xil (190+ davlat). Ularni qo'lда regex bilan yozish — xato
  va tez eskirish manbai. `intl-tel-input@29` (libphonenumber ma'lumotlari ustида)
  buni biz uchun qiladi: `isValidNumber()` har davlat uzunligини tekshiradi.
  `isValidNumberPrecise()` ISHLATILMADI — rasmiy docs uni tez eskirishi mumkin deydi.
- **Kutubxona loyiha ичида** (`js/vendor/intl-tel-input/`: `intlTelInput.mjs`,
  `utils.js`, `css/`, `img/flags*.webp`). CDN yo'q → mavjud CSP (`script-src 'self'`)
  o'zgармаyди, offline ham ishlaydi. `node_modules` deployга tayanmaydi
  (`package.json` + `package-lock.json` saqlanган, faqat kelib chiqish uchun).
- **Sozlama:** `initialCountry:"uz"` (default O'zbekiston), `separateDialCode:true`
  (`+998` flag yonида), `strictMode:true` (xato belgi kiритишга yo'l qo'ymaydi),
  `countrySearch:true` (dropdown'да barcha davlat). O'zbekiston milliy qismi —
  maks 9 raqam, `XX-XXX-XX-XX` (o'z formatimiz); boshqa davlатда kutubxona formati.
  API'ga E.164 (`+998901234567`).
- **Email:** faqat kuchli FORMAT tekshiruvи. Pochta qутиси haqiqатан bor-yo'qлигини
  frontend bilmaydi — buni faqat backend verification link aniqлаyди. DNS/«email
  checker» API qo'shилмади. Server 409 (email band) → xato Email maydonига bog'lанади.

### API javob shakllari (kutilmagan)
- `/products/:id` -> `{ product: {...} }` (ichida `comments` ham)
- `/cart` va o'zgartirishlar -> `{ message, cart: {...} }` (api.js ichini ochib beradi)
- `/orders` (POST) -> `{ message, order: {...} }`
