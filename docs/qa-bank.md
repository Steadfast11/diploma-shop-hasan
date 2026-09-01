# Savol-javob banki (40 daqiqalik himoyaga tayyorgarlik)

O'qituvchi xohlagan fayl/qatordan so'raydi. Har mavzu: **savol → qisqa javob**.

---

## HTML / tuzilish

**`index.html` ildizda, qolganlari `pages/` da — nega?**
Bosh sahifa saytning "kirish nuqtasi" (`/`). Qolgan sahifalar `pages/` da guruhlangan.
Shuning uchun `pages/*.html` dagi nisbiy yo'llar `../css/...`.

**`<script type="module">` — oddiy `<script>` dan farqi?**
`module`: `import`/`export` ishlaydi, o'z scope'i bor (global o'zgaruvchi hosil qilmaydi),
avtomatik `defer` (HTML tayyor bo'lgach ishlaydi), `"use strict"`.

**`<div id="header">` bo'sh — kim to'ldiradi?**
`js/components.js` `fetch("/components/header.html?v=1")` qilib, javob matnini
`div.innerHTML` ga qo'yadi. Header 7 marta yozilmaydi — 1 marta `components/` da.

**`data-*` va `id` farqi? Nega `data-cart-count`?**
`id` sahifada YAGONA bo'lishi kerak. `data-*` — JS uchun erkin "belgi", takrorlanishi mumkin.
`data-cart-count` — JS shu `<span>` ni topib son yozadi.

**`aria-label` nega bor?**
Sahifada 2 ta `<nav>` — screen reader ularni ajrata olsin ("Asosiy menyu" / "Akkaunt menyusi").

---

## CSS

**`.container` markazlashuvi qanday ishlaydi?**
`width: min(100% - 48px, 1200px)` + `margin-inline: auto`. `auto` — ortiqcha bo'sh joyni
chap/o'ng teng bo'ladi → markaz. `min()` → katta ekranda 1200px, kichikda `100% - 48px`.

**Nega `min()`, oddiy `max-width` emas?**
`max-width: 1200px` + `padding: 24px` → desktop'da kontent 1152px chiqadi (padding ichkarida).
`min()` bilan desktop'da AYNAN 1200px (Figma talabi).

**CSS o'zgaruvchisi (`--color-*`) nega `:root` da?**
`:root` = `<html>`, eng yuqori element. O'zgaruvchi meros bo'yicha pastga tarqaladi →
hamma element ko'radi. Rang o'zgarsa — bitta qator.

**`box-sizing: border-box` nima beradi?**
`width` ichiga `padding` va `border` kiradi. `width: 282px` desak — aynan 282px,
grid buzilmaydi.

**`reset.css` nima uchun?**
Brauzerlar (Chrome/Safari/FF) default `margin`, `font-size` beradi — har xil.
Reset ularni tenglaydi → toza asos, har piksel bizniki (pixel-perfect).

**Nega ba'zi joyda SF Pro, ba'zi joyda Inter?**
Figma shunday chizilgan (dizayner UI-kit aralashtirgan). Filtr paneli, Order Summary,
mahsulot sahifasi — SF Pro (`--font-system`, Mac'da `-apple-system`). Qolgani — Inter.

**Breakpoint qiymatlari qayerdan?**
768px — mobil (Figma mobil frame 390px), 900/1024/560 — grid ustunlarini kamaytirish uchun
oraliq nuqtalar (kontent siqilib qolmasin).

**`flex` yoki `grid` — qayerda qaysi?**
Bir o'lchovli qatorlar (nav, tugmalar yonma-yon) → `flex`. Ikki o'lchovli to'r
(mahsulotlar 4 ustun) → `grid`. Header `grid: 1fr auto 1fr` — logo aniq markazda.

**Trash ikonka qanday qizil bo'ldi?**
SVG qora edi. `.cart-item__remove img { filter: ... }` — CSS filter bilan qizilga bo'yadik.

---

## JavaScript

**`api.js` nima uchun kerak? Har joyda `fetch` yozsak nima yomon?**
Base URL, token qo'shish, xato ishlovi — takrorlanadi. `api.js` da bir marta.
Endpoint o'zgarsa — bitta joy.

**`async/await` — `.then()` dan farqi?**
Ikkalasi ham "Promise" bilan ishlaydi. `await` kodni tepadan pastga o'qiladigan qiladi
(`const x = await fn()`). `try/catch` bilan xatoni ushlash oson.

**`request()` da `if (!res.ok)` — nega `throw`, `return` emas?**
`throw` bilan chaqiruvchi `try { muvaffaqiyat } catch { xato }` deb yozadi.
`return` bo'lsa har joyda `if (result.error)` tekshirish kerak edi.

**401 kelganda nima bo'ladi?**
`request()` `clearToken()` chaqiradi (sessiya tugagan). Keyingi `isLoggedIn()` — `false`.
Foydalanuvchi qayta kirishi kerak.

**Mehmon savati va kirgan foydalanuvchi savati — farqi, qayerda?**
Mehmon → `localStorage` (`storage.js`). Kirgan → server (`api.js`).
`cart-store.js` ikkisini yashiradi — sahifa "qaysi holat?" demайdi.
Login paytida serverga o'tmagan mahsulot o'chirilmaydi; mahalliy savatda qoladi.

**`localStorage` va `sessionStorage`?**
`localStorage` — brauzer yopilsa ham qoladi. `sessionStorage` — tab yopilsa o'chadi.
Bizga token uzoq turishi kerak → `localStorage`.

**`storage.js` da `try/catch` nega?**
`localStorage` to'la bo'lsa yoki brauzer bloklagan bo'lsa — xato beradi.
Bir joyda ushlab, `null` qaytaramiz, sayt yiqilmaydi.

**`esc()` nima qiladi va nega kerak?**
Mahsulot nomi / izoh backenddan keladi. Ichida `<script>` yoki `<` `>` bo'lsa —
ular MATN bo'lib chizilsin, HTML kod bo'lib emas. XSS himoyasi.

**Event delegation nima? (`cart.js` da)**
Har `.cart-item` ga alohida `addEventListener` o'rniga, BITTA listener ota elementга
(`[data-cart-main]`). Bosilganda `e.target.closest(...)` bilan qaysi element ekanini topamiz.
Kamroq listener, dinamik qo'shilgan elementlar ham ishlaydi.

**`IntersectionObserver` — nima?**
Brauzer elementning ekranда ko'rinishini kuzatadi. Ko'ringanda callback → `.is-visible`
klassi → CSS animatsiyani boshlaydi. Scroll hodisasini har millisekund tekshirishdan tez.

**Animatsiya xavfsizlik to'ri — nega?**
Agar observer biror sabab bilan ishlamasa, `[data-reveal]` element `opacity: 0` bo'lib
abadiy yashirin qolardi. `setTimeout(1500)` — har holda ko'rsatamiz.

**`URLSearchParams` — nima uchun?**
URL query'ni (`?category=1&minPrice=10`) o'qish/yozishning toza yo'li.
Qo'lда `split("&")` qilmaymiz.

**Filtr o'zgarganда nega butun sahifa qayta yuklanadi?**
Holat bitta joyда — URL. Qayta chizish mantig'i shart emas. "Orqaga" tugmasi va
havola ulashish (`?category=...`) ishlaydi. Kod sodda.

**`Promise.all` (components.js) — nega?**
Header va footer'ni PARALLEL yuklaydi (biri ikkinchisini kutmaydi) → tezroq.

**Rasm nega `opacity: 0` dan boshlanadi, ko'rinmay qolib ketmaydimi?**
Yo'q. `img.img-fallback:not(.is-loaded)` — ya'ni FAQAT hali yuklanmagan
rasm ko'rinmaydi (ortida kulrang joy-tutgich turadi). Yuklangach
`components.js` `is-loaded` qo'yadi va `opacity` o'zining oddiy 1
qiymatiga qaytadi; fade esa `animation` bilan ustidan qo'shiladi.
Ataylab `transition` ishlatmadik: unda asosiy holat `opacity: 0` bo'lardi
va animatsiya ishlamay qolsa rasm butunlay ko'rinmay ketardi.

**`revealCards()` nima qiladi?**
Uchta ish: (1) `ScrollTrigger.refresh()` — kontent API'dan keyin qo'shilgani
uchun skroll o'lchovlari eskirgan bo'ladi; (2) ekranda ko'rinib turgan
grid bolalarini birin-ketin chiqaradi; (3) "Load more" da `from` argumenti
bilan faqat YANGI kartochkalarni. GSAP yo'q yoki `prefers-reduced-motion`
bo'lsa hech narsa qilmaydi — kartochkalar shundoq ham ko'rinadi.

**Savatda `+` bosilganda nega butun ro'yxat qayta chizilmaydi?**
Chizilsa ro'yxat ko'z oldida "yaltirab" ketardi. Endi faqat o'sha qatordagi
son va "Order Summary" yangilanadi (`countUp` bilan raqam sanab o'tadi).
O'chirishda esa qator avval so'nadi (0.28s), keyin ro'yxat yangilanadi.

**`.cart-item` da `transition` nega alohida qoidada?**
Agar `transition` `.is-removing` ichida bo'lsa, klass qo'shilgan payt
transition ham, yangi qiymat ham bir vaqtda paydo bo'ladi — brauzer bunda
animatsiya qilmaydi, element birdan yo'qoladi. Shuning uchun `transition`
asosiy `.cart-item` da turadi, `.is-removing` faqat yakuniy holatni beradi.

**`[data-split]` nima?**
Bo'lim sarlavhasini hero kabi so'zlarga bo'lib, maska ortidan chiqaradi
(`motion.js` -> `splitWords`). Matni JS bilan almashadigan sarlavhalarga
qo'yilmagan, chunki `splitWords` `innerHTML` ni qayta yozadi va ichidagi
elementlarni (masalan `<span data-review-count>`) yo'qotadi.

**Prefetch nima uchun kerak?**
Sichqoncha havola ustiga kelganda brauzer sahifani fon rejimida yuklab
qo'yadi -> bosilganda deyarli darrov ochiladi. Har manzil bir marta,
`?id=...` hisobga olinmaydi (HTML fayl bitta), tashqi havolalar tegilmaydi.

**Register formasi qanday tekshiriladi?**
Har maydon ostida alohida `.field__error`. `blur` da tekshiramiz; xato chiqса
`input` da qayta baholaymiz; `submit` da hammasini. Noto'g'ri maydon —
`aria-invalid="true"` + `aria-describedby`. Birinchi noto'g'riga `focus`.
Valid bo'lmaguncha API'ga so'rov yubormaymiz. Mantiq `js/validation.js` daги
sodda funksiyalarда (`validateName` va h.k.), `register.js` faqat ulaydi.

**Nega telefon uchun kutubxona (intl-tel-input), qo'lда regex emas?**
190+ davlat, har birининг telefon uzunligи/formати har xil. Qo'лда regex —
xato va tez eskиради. Kutubxona (libphonenumber ma'lумотлари) `isValidNumber()`
bilan har davlатни tekshiради. Loyиха ичида (`js/vendor/`), CDN yo'q → CSP toza.
`initialCountry:"uz"`, `separateDialCode` (`+998`), `strictMode`. API'ga E.164.
`isValidNumberPrecise()` ni ishlатмадик — docs uni beqарор deydi.

**Email haqiqий эканини tekshirасанми?**
Yo'q — frontend pochta қутиси borлигини BILA OLMAYDI. Faqat qat'iy format
tekshiруви. Haqiqийлигини faqat backend tasдиқлаш havolаси aniqлаyди. Server
409 (email band) qайтарса — xatoни Email maydonига bog'лаймиз.

---

## API

**Token qayerда saqlanadi va qanday yuboriladi?**
`localStorage` (`storage.setToken`). Har privat so'rovда `request()`
`headers["Authorization"] = "Bearer " + token` qo'shadi.

**429 xatosi nima? Undan qanday qochamiz?**
"Juda ko'p so'rov" (120/daqiqa). Cheksiz `fetch` sikli yozmaymiz, keraksiz
so'rovlarni takrorlamaymiz.

**Buyurtмадаги narx nega "snapshot"?**
`POST /orders` da server narx/nomни buyurtmага ko'chiradi. Keyin mahsulot narxi
o'zgarsa ham, tarixда eski narx qoladi.

**`GET /cart` javobi qanday keladi?**
`{ message, cart: { items, total } }`. `api.js` `unwrapCart` bilan ichini
(`{ items, total }`) qaytaradi.

**"My orders" narxsiz — nega?**
Figma shunday (faqat rasm + nom). Har buyurtмадаги `items` ni yig'ib grid qilamiz.

---

## Loyihaviy

**Nega framework ishlatmadingiz?**
ТЗ talabi. Va pixel-perfect uchun CSS'ни to'liq nazorat qilish kerak.

**Deploy qanday?**
Statik sayt → GitHub → Netlify. `netlify.toml`: `publish = "."`, build yo'q.

**Pixel-perfect'ni qanday ta'minladingiz?**
Figma MCP bilan har frame'дан aniq o'lchov/rang/shrift olinди, `variables.css` da
token qilinди, har komponent brauzerда Figma qiymati bilan solиштирилди (±1px).
