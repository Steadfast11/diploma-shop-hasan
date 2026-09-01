# Ma'lumot oqimi (bosqichma-bosqich)

Doska savoli: *"Foydalanuvchi X qilsa, nima bo'ladi? Boshidan oxirigacha ayt."*

Umumiy: **har sahifa skripti bir xil 4 bosqich** —
1) `initLayout()` (header/footer) → 2) URL/holatni o'qish → 3) `api.*` dan ma'lumot → 4) DOM'ga chizish + hodisalarni ulash.

---

## 0. Har sahifa yuklanganda
1. HTML `<head>` stillarni ulaydi (reset → variables → base → ui → component → page)
2. `<body>` oxirida `<script type="module" src=".../page.js">`
3. `page.js` → `import { initLayout } from "../components.js"` → `initLayout()`:
   - `fetch("/components/header.html?v=1")` va `footer` → `<div id="header/footer">` ichiga `innerHTML`
   - `wireHeaderAuth()` — kirilmagan bo'lsa "Account" havolasi `login.html` ga
   - `wireHeaderMenu()` — mobil burger toggle
   - `refreshCartCount()` — `cart-store.getCount()` → header "Bag (N)"
   - `cart-store.subscribe(refreshCartCount)` — savat o'zgarsa "Bag (N)" yangilanadi
   - `initReveal()` — `[data-reveal]` bloklarni IntersectionObserver bilan kuzatadi

## 1. Katalog: "Apply Filter" bosilganda (RELOAD YO'Q)
1. `catalog.js` tugma hodisasini eshitadi
2. `filter.category = pendingCategory`, `filter.minPrice/maxPrice` = slider qiymatlari
3. `syncUrl()` → `history.replaceState` bilan `?category=...&minPrice=...` (sahifa yangilanmaydi)
4. `loadProducts()` → `api.getProducts({category, minPrice, maxPrice, page:1, limit})`
   → `request("/products?...")`
5. `{ total, page, pages, products }` → `products.length` bo'lsa `productCardHTML` bilan grid,
   bo'lmasa "No products found"
6. `refreshClearBtn()` → biror filtr faol bo'lsa "Clear filters" ko'rinadi

## 2. Kategoriya bosilganda (katalog) — faqat tanlov, filtr EMAS
1. `catalog.js` `[data-category-list]` click → `data-category` li tugma topiladi
2. `pendingCategory` yangilanadi (toggle: qayta bossa bekor). Bitta kategoriya rejimi —
   qolganlarining `aria-pressed` i `false` ga o'tadi, chevron pastga buriladi
3. **Hech narsa yuklanmaydi** — mahsulotlar faqat "Apply Filter" da yangilanadi (1-oqim)

## 2b. "Price" sarlavhasi bosilganda
- `aria-expanded` toggle → `[data-price-panel].hidden` toggle (slider ko'rinadi/yashirinadi)

## 3. "Add to cart" (mahsulot sahifasi)
1. `product.js` `[data-add]` click; `[data-qty]` dan miqdor olinadi
2. `cartStore.addItem(product, qty)`:
   - **kirgan:** `api.addToCart(product._id, qty)` → `POST /cart` (Bearer token)
   - **mehmon:** `storage.getGuestCart()` massiviga qo'shiladi (bor bo'lsa `qty` yig'iladi, shift 20) → `setGuestCart`
3. `cart-store` `notify()` → obunachilar (header `refreshCartCount`) → "Bag (N)" yangilanadi + bump animatsiya
4. `openModal({ title: "Savatga qo'shildi", ... })`

## 4. Savatda miqdor / o'chirish
1. `cart.js` `[data-cart-main]` click (delegatsiya) → qaysi `.cart-item`, `data-id`, joriy qty
2. `[data-inc]` → `cartStore.setQty(id, qty+1)`, `[data-dec]` → `setQty(id, qty-1)` (0 bo'lsa `removeItem`), `[data-remove]` → `removeItem(id)`
3. Har biri kirgan→`api.*`, mehmon→`storage.*`; `notify()`
4. `render()` qayta chaqiriladi → savat + Order Summary qayta chiziladi

## 5. "Go to checkout" (savat)
1. `cart.js` `[data-checkout]` click
2. **mehmon:** `location.href = "/pages/login.html?next=/pages/cart.html"`
3. **kirgan:** `api.createOrder()` → `POST /orders` (tana yo'q — server butun savatdan yig'adi,
   narxni "snapshot" qiladi, savatni tozalaydi, `ordersCount` oshiradi)
4. Server buyurtma yaratganda savatni o'zi tozalaydi; `cartStore.refresh()` faqat
   header sonini qayta o'qitadi (ikkinchi `DELETE /cart` yuborilmaydi)
5. `render()` qayta chaqiriladi → savat endi bo'sh → ekranда "No products in your bag",
   "Go to checkout" `disabled` (tovarlar avtomatik yo'qoladi)
6. "Order placed!" modal → "View my orders" → `location.href = "/pages/profile.html"`

## 6. Kirish
1. `login.js` forma `submit` → `e.preventDefault()`
2. `email`, `password` olinadi, bo'sh bo'lsa xato
3. `auth.doLogin({email, password})` → `api.login` → `POST /login` → `{token, user}`
   → `storage.setToken(token)`, `setUser(user)`
4. `cartStore.mergeGuestCartIntoAccount()` — mehmon savatidagi har mahsulot `api.addToCart` bilan serverga;
   o'tmagan mahsulotlar yo'qolmaydi, mahalliy savatda qoladi va ogohlantirish chiqadi
5. `location.href = ?next || "/index.html"`
6. Xato 401 → "Email yoki parol noto'g'ri"

## 7. Ro'yxatdan o'tish (inline validatsiya)
1. `register.js` faqat "ulaydi". Tekshiruv sodda funksiyalarda:
   - `js/validation.js` — `validateName` (3–10 harf, `\p{L}`), `validateSurname` (3–15 harf),
     `validateEmail` (qat'iy format, bo'shliq/ketma-ket nuqta rad), `validatePassword`
     (8–64, kamida 1 harf + 1 raqam), `validatePasswordConfirmation`
   - `js/phone-input.js` — telefon: `intl-tel-input` kutubxonasi (loyiha ichida,
     `js/vendor/intl-tel-input/`). `initialCountry:"uz"`, `separateDialCode`,
     `strictMode`. `utils.js` lokal fayldan `import()` bilan yuklanadi.
     `isValidNumber()` + `getValidationError()` → inglizcha sabab
     (too short / too long / invalid country code ...).
2. Qachon: har maydon `blur` da tekshiriladi; xato bo'lsa `input` da qayta baholanadi;
   `submit` da hammasi. Noto'g'ri maydon → `aria-invalid="true"` + `aria-describedby`
   qilingan `.field__error`. Birinchi noto'g'ri maydonga `focus`.
3. Valid bo'lmasa API'ga so'rov YUBORILMAYDI. `submit` tugmasi so'rov paytida `disabled`.
4. Telefon E.164 ko'rinishda yuboriladi (`iti.getNumber()` → `+998901234567`).
   Server `+ ( ) -` va bo'shliqni o'zi tashlaydi (docs/api-reference.md).
5. `auth.doRegister(...)` → `POST /register` → `{token, user}` → saqlanadi →
   `mergeGuestCartIntoAccount()` → `?next` yoki bosh sahifa.
6. Server 409 → "This email is already registered" xatosi Email maydoniga bog'lanadi;
   boshqa server xatosi → umumiy forma xatosi.

> Email haqiqatan mavjudligini frontend ISBOTLAY OLMAYDI — buni faqat backend
> tasdiqlash havolasi (verification link) qiladi. Shu sabab DNS/uchinchi tomon
> "email checker" qo'shilmagan.

## 8. Izoh yozish (mahsulot sahifasi)
1. "Write a Review" click → kirilmagan bo'lsa `login.html?next=...`
2. `openModal("Leave a comment", textarea, "Send")`
3. "Send" → matn 2–300 belgi tekshiriladi → `api.addComment(id, text)` → `POST /products/:id/comments`
4. `closeModal()` → `openModal("Thank you!", ..., "Okey")`
5. `refreshReviews()` → `api.getProduct(id)` → izohlar ro'yxati qayta chiziladi
6. 409 → "bitta mahsulotga 3 tadan ko'p"; o'z izohini o'chirish → `DELETE .../comments/:id`

## 9. Profil / chiqish
1. `profile.js` `requireAuth()` — token yo'q bo'lsa `login.html?next=...`, `false`
2. `currentUser()` (saqlangan) bilan darrov chiziladi → `api.getMe()` bilan yangilanadi
3. `api.getOrders()` → `orders.flatMap(o => o.items)` → mahsulot to'ri (narxsiz)
4. "Log out" → `auth.doLogout()` → `api.logout()` (xato bo'lsa ham) + `clearToken/clearUser`
   → `location.href = "/index.html"`

## 10. Bosh sahifa
- 3 ta mustaqil `loadSection()`: `getBestsellers(4)`, `getCategories()`, `getNewest(12)`
- Biri yiqilsa qolgani ishlayveradi (har biri o'z `try/catch`)
