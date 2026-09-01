# Sandbox Shop API — qisqa ma'lumotnoma (o'zbekcha)

Manba: `Sandbox_Shop_API_—_документация_для_студентов.docx`
Base URL: **https://api.wepro.uz/sandbox-shop**

## Umumiy
- Xato formati: `{ "message": "..." }` + to'g'ri HTTP status
- Narxlar — USD. Buyurtma jamini **server** hisoblaydi.
- Limit: **120 so'rov/daqiqa/IP** (cheksiz fetch sikli -> 429). Ro'yxatdan o'tish: 20/soat/IP.
- O'quv qumdoni: **haqiqiy parol ishlatmang**. Talaba ma'lumoti 45 kundan keyin o'chadi.
- Izohlar va buyurtma hisoblagichlari — hamma talabalar uchun umumiy ("jonli" do'kon).

## Avtorizatsiya
- `POST /register {name,surname,phone,email,password}` -> `{message, token, user}` (201)
- `POST /login {email,password}` -> `{message, token, user}` (200)
- Privat so'rovlarda sarlavha: `Authorization: Bearer <token>`
- Token **14 kun** yashaydi. `POST /logout` -> eski tokenlar o'ladi (401 -> qayta login).
- `GET /me` -> `{message, user}` (parolsiz profil)

### register maydonlari
| Maydon | Talab |
|---|---|
| name | 1–50 belgi |
| surname | 1–50 belgi |
| phone | faqat raqam 9–15 ta (bo'shliq, `()`, `-`, `+` tashlab yuboriladi) |
| email | noyob, kichik registrga o'tkaziladi |
| password | 4–64 belgi (haqiqiysini emas!) |

Xatolar: 400 (maydonlar), 409 (email band), 429 (soatiga 20 dan ko'p).

## Katalog (token kerak emas)
- `GET /products?category=&minPrice=&maxPrice=&page=&limit=`
  - `limit` default 12, max 50; `page` default 1
  - javob: `{ total, page, pages, products: [...] }`
  - mahsulot: `{ _id, title, price, image, categoryId, ordersCount, commentsCount, createdAt }`
- `GET /products/newest?limit=8` (max 20) -> `{ count, products }`
- `GET /products/bestsellers?limit=8` -> `{ count, products }` (ordersCount bo'yicha)
- `GET /products/:id` -> `{ product }` + `comments: [{ _id, author, text, at }]`; 404 topilmasa
- `GET /categories` -> `{ count, categories: [{ _id, title, image, productsCount }] }`
- `GET /categories/:id/products` -> `{ category, count, products }`

> Hujjatда mahsulotning `description`, bir nechta rasm yoki variant maydonlari
> yozilmagan. O'qituvchilar katalogni to'ldirгач aniqlaymiz.

## Savat (token kerak)
Barcha javoblar bir xil shaklda:
`{ items: [{ productId, title, price, image, qty, sum }], total }`

- `GET /cart`
- `POST /cart {productId, qty}` — qty butun 1–20 (default 1). Bor mahsulotга qo'shilsa —
  yig'iladi (shift 20). Maksimum **20 xil pozitsiya**. Xatolar: 404 / 400 / 409 (to'la).
- `PATCH /cart/:productId {qty}` — yangi miqdor 1–20. O'chirish uchun `qty:0` EMAS, `DELETE`.
- `DELETE /cart/:productId` — pozitsiyani olib tashlash
- `DELETE /cart` — savatni tozalash

## Buyurtma (token kerak)
- `POST /orders` — **tanasi yo'q**. Butun joriy savatdan yig'iladi:
  - nomlar va narxlar buyurtmaga "snapshot" bo'lib ko'chiriladi
  - jamini server hisoblaydi
  - savat tozalanadi
  - har mahsulotning `ordersCount` oshadi
  - javob 201: `{ message, order: { _id, items, total, createdAt } }`; 400 — savat bo'sh
- `GET /orders` -> `{ count, orders }` — faqat meniki, yangi birinchi

## Izohlar (token kerak)
- `POST /products/:id/comments {text}` — 2–300 belgi; bitta mahsulotга bir foydalanuvchidan
  **3 tadan ko'p emas** (409). Muallif profildan olinadi. Javob 201: `{ message, comment }`.
- `DELETE /products/:id/comments/:commentId` — faqat o'ziniki (aks holda 403)

## HTTP kodlar
| Kod | Qachon |
|---|---|
| 200 | O'qish/o'zgartirish/kirish muvaffaqiyatli |
| 201 | Yaratildi: akkaunt, savat pozitsiyasi, buyurtma, izoh |
| 400 | So'rov ma'lumotида xato — `message` ni o'qi |
| 401 | Token yo'q / muddati tugagan / logout qilingan |
| 403 | Begona obyekt (masalan birovning izohi) |
| 404 | Topilmadi |
| 409 | Konflikt: email band, savat/izoh limiti |
| 429 | Juda ko'p so'rov — sekinlash |
