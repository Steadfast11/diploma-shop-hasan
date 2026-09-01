# Loyiha rejasi — WEPRO / Skin—Clinic do'koni

Figma maketi asosida. Backend: `https://api.wepro.uz/sandbox-shop` (`api-reference.md`).

---

## 1. Ekranlar (sahifalar)

| # | Sahifa | Fayl | API |
|---|--------|------|-----|
| 1 | Bosh sahifa | `index.html` | `GET /products/bestsellers`, `GET /categories`, `GET /products/newest` (yoki `/products`) |
| 2 | Katalog (All products) | `pages/catalog.html` | `GET /categories`, `GET /products?category=&minPrice=&maxPrice=&page=&limit=` |
| 3 | Kategoriya (Creams) | `pages/category.html` | `GET /categories/:id/products` |
| 4 | Mahsulot sahifasi | `pages/product.html` | `GET /products/:id` (+ comments), `POST /cart`, `POST /products/:id/comments`, `DELETE .../comments/:id` |
| 5 | Savatcha (Your bag) | `pages/cart.html` | `GET/PATCH/DELETE /cart`, `POST /orders` |
| 6 | Kirish (Log in) | `pages/login.html` | `POST /login` |
| 7 | Ro'yxatdan o'tish (Register) | `pages/register.html` | `POST /register` |
| 8 | Profil (Profile + My orders) | `pages/profile.html` | `GET /me`, `GET /orders`, `POST /logout` |

Holatlar (bo'sh/xato) ham maketda bor:
- Savat bo'sh — "No products in your bag"
- Katalog: filtrdan keyin natija yo'q
- Profil: buyurtma yo'q
- Mahsulot: izoh yo'q

---

## 2. Umumiy komponentlar (`components/`)

| Komponent | Qayerda | Tarkib |
|-----------|---------|--------|
| `header` | hamma sahifa | chapda `Home` · `Products`; markazda `WEPRO` logo; o'ngda `Account`, `Bag (N)` — N jonli savat soni |
| `footer` | hamma sahifa | `Skin—Clinic` brend + ijtimoiy ikonlar; `PRODUCTS` / `SUPPORT` / `COMPANY` ustunlari; `© 2025` + Terms/Privacy/Cookies |
| `modal` | mahsulot sahifasi | "Leave a comment" (textarea + Send) va "Thank you!" (Okey) oynalari |

Takrorlanadigan UI (`css/ui.css` + `js/ui.js`):
- `.btn` (qora, to'la kenglikda formalar uchun) va `.btn--pill` (yumaloq: "Add to cart", "Write a Review")
- `.product-card` — rasm + nom + narx (bosh sahifa, katalog, kategoriya, profil — hammasida bir xil)
- `.qty` — miqdor tanlagich (`−` `1` `+`) — mahsulot va savat sahifalarida
- `.field` — label + input (formalar)
- `.stars` / verified belgi (izohlar)
- spinner, toast, bo'sh-holat quti

---

## 3. Maket ↔ API mos kelmagan joylar (QAROR kerak)

> Bularni oldindan hal qilamiz — himoyada "nega bunday?" degan savol bo'ladi.

### 3.1. Kirish: telefon (maket) ↔ email (API) — HAL QILINDI
O'qituvchi: **email bilan**. "Phone" input o'rniga "Email". (`decisions.md`)

### 3.2. Savatдаgi chegirma / eski narx — HAL QILINDI
Maketдаgi eski narx / "-20%" real emas (dizayner to'ldiruvi). Kartochka **universal**:
faqat backend maydonlari (`image, title, price`). "Order Summary" strukturasi maketдаgiday,
lekin `Subtotal = Total` = API `total`, `Discount = 0 (~0%)`. (`decisions.md`)

### 3.3. Mahsulot sahifasi: tavsif va bir nechta rasm
Maket: katta rasm + 3 thumbnail + tavsif matni.
API hujjati: mahsulotда `title, price, image` (bitta). `description` va rasm massivi **hujjatда yo'q**.
- **Qaror:** o'qituvchilar katalogni to'ldirгач tekshiramiz. Agar `description`/`images` bo'lsa — ishlatamiz;
  bo'lmasa: bitta rasm ko'rsatamiz, thumbnail bloki yashiriladi, tavsif o'rniga qisqa placeholder yoki yashiramiz.
  Kod ikkalasига ham tayyor bo'ladi (defensiv).

### 3.4. Izohlar: "verified" belgisi, sana, hisob (451)
API izoh: `{ _id, author, text, at }`.
- `author`, `text`, `at` (sana) — bor. "Verified" ✓ — **bezak**, hammaga qo'yamiz yoki olib tashlaymiz.
- "All Reviews (451)" — son = `comments.length`.
- Maketда izohni **o'chirish** tugmasi yo'q, lekin API + ТЗ "o'zinikini o'chirish" ni talab qiladi
  → o'z izohing ustида kichik "o'chirish" tugmasi qo'shamiz (hover'да).

### 3.5. Brend nomi: header "WEPRO" ↔ footer "Skin—Clinic"
Maket qoldig'i. Bittasini tanlaymiz (taklif: hamma joyда **WEPRO**).

### 3.6. "Account" havolasi
Kirilmagan → `login.html`. Kirilgan → `profile.html`.

---

## 4. Bosqichma-bosqich qurilish rejasi (~2 hafta)

Har bosqichда: men tushuntiraman → sen yozasan → men savol beraman → `docs/` ga qaror yoziladi.

### HAFTA 1 — asos + pixel-perfect statik

**B0. Tayyorgarlik**
- [ ] Figma o'lchov usuli (drafts nusxa yoki REST token)
- [ ] `variables.css` — ranglar, shriftlar, oraliqlar, radius, breakpoint'lar
- [ ] `reset.css` + `base.css` + `.container` (1200px, markazda)
- [ ] shrift ulash (Figmadagi shrift; Google Fonts yoki self-host)

**B1. Umumiy layout**
- [ ] `components.js` — header/footer injeksiya (dev-server bilan test)
- [ ] `header` — HTML + CSS, pixel-perfect, `Bag (N)` soni (hozircha 0)
- [ ] `footer` — HTML + CSS, pixel-perfect
- [ ] responsive: header mobil (burger yoki soddalashtirilgan)

**B2. Bosh sahifa (statik, mock data bilan)**
- [ ] hero (rasm + matn + "Shop now")
- [ ] `.product-card` komponenti (bu yerда bir marta, keyin hamma joyда)
- [ ] "Best sellers" (4 kartochka), "Shop by category" (3 karta), "Featured products" (12)
- [ ] to'liq responsive

**B3. Katalog + Kategoriya (statik)**
- [ ] filtr paneli (kategoriyalar, narx slider, Apply Filter)
- [ ] mahsulot grid + paginatsiya ko'rinishi
- [ ] `category.html` (filtrсiz variant)
- [ ] bo'sh-natija holati
- [ ] responsive (filtr panel mobil'да yuqoriга yoki drawer)

**B4. Mahsulot sahifasi (statik)**
- [ ] rasm + thumbnaillar, nom, narx, tavsif, `.qty`, "Add to cart"
- [ ] "All Reviews" — izoh kartochkalari (2 ustun), "Write a Review"
- [ ] `modal` — "Leave a comment" + "Thank you"
- [ ] responsive

**B5. Savat + Auth + Profil (statik)**
- [ ] savat: pozitsiya kartochkasi, `.qty`, o'chirish, "Order Summary" (qora karta)
- [ ] savat bo'sh holati
- [ ] login / register formalari + validatsiya ko'rinishi
- [ ] profil: ma'lumot + "Log out" + "My orders" grid
- [ ] responsive
- [ ] **1-hafta oxiri: barcha sahifalar pixel-perfect va responsive, lekin "jonsiz"**

### HAFTA 2 — funksiya (API) + animatsiya + sayqal

**B6. `api.js` + `config.js`**
- [ ] `request()` yordamchisi (base URL, `Authorization`, xato → `{message}`)
- [ ] barcha endpoint funksiyalari
- [ ] real API bilan test (katalog to'lgan bo'lsa)

**B7. Katalog jonli**
- [ ] `storage.js`, `ui.js` yordamchilar
- [ ] bosh sahifa: bestsellers / categories / featured — API'dan
- [ ] katalog: `getProducts` + filtr (kategoriya, narx) + paginatsiya, URL query bilan holat
- [ ] kategoriya sahifasi jonli
- [ ] `429` dan himoya (kesh, ortiqcha so'rov yo'q)

**B8. Auth jonli**
- [ ] `auth.js` — `doLogin` / `doRegister` / `doLogout` / `isLoggedIn` / `requireAuth`
- [ ] login / register — validatsiya + API + xato xabarlari (400/401/409)
- [ ] header holatga qarab: `Account` → login yoki profil, `Log out`
- [ ] profil: `GET /me` + `GET /orders`

**B9. Savat + buyurtma jonli**
- [ ] `cart-store.js` — mehmon (localStorage) + kirgan (API)
- [ ] mahsulot sahifasidan "Add to cart"
- [ ] savat sahifasi: `PATCH` / `DELETE`, jami, chegirma (3.2 qaroriga ko'ra)
- [ ] "Go to checkout": mehmon bo'lsa → login majburiy; kirgan bo'lsa → `POST /orders`
- [ ] login paytida mehmon savatini serverга ko'chirish
- [ ] header `Bag (N)` jonli yangilanadi

**B10. Izohlar jonli**
- [ ] mahsulot sahifasida izohlar ro'yxati (`at` sana formati)
- [ ] "Write a Review" → modal → `POST .../comments` → "Thank you" modal
- [ ] o'z izohini o'chirish (403 ni hisobga olish)
- [ ] limit: bitta mahsulotга 3 ta (409 xabari)

**B11. Animatsiya + sayqal**
- [ ] scroll-reveal (seksiyalar paydo bo'lishi), hover holatlar, tugma bosilishi
- [ ] sahifa/rasm yuklanish skeletonlari
- [ ] modal ochilish/yopilish animatsiyasi
- [ ] mayda: `Bag` soni o'zgarganда animatsiya, toast

**B12. Yakun**
- [ ] barcha qurilmalarda test (mobil/planshet/desktop), bug-hunt
- [ ] `401` / tarmoq uzilishi / bo'sh javob holatlari
- [ ] `docs/` yakunlash: `decisions.md`, `data-flow.md`, `qa-bank.md`
- [ ] GitHub + Netlify deploy
- [ ] **Mock himoya: 40 daqiqa, tasodifiy fayl/qatorlar**

---

## 5. Skelet o'zgarishlari (bajarildi)
- `orders.html/js/css` → `profile.html/js/css` (maketда profil + buyurtmalar bitta ekran)
- `pages/category.html` + `js/pages/category.js` qo'shildi
- `components/modal.html` + `modal.css` qo'shildi
