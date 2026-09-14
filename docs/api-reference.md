# Sandbox Shop API — краткий справочник (на русском)

Источник: `Sandbox_Shop_API_—_документация_для_студентов.docx`
Base URL: **https://api.wepro.uz/sandbox-shop**

## Общее
- Формат ошибки: `{ "message": "..." }` + правильный HTTP-статус
- Цены — в USD. Итог заказа считает **сервер**.
- Лимит: **120 запросов/минуту/IP** (бесконечный цикл fetch -> 429). Регистрация: 20/час/IP.
- Учебная песочница: **не используйте настоящий пароль**. Данные студента удаляются через 45 дней.
- Отзывы и счётчики заказов — общие для всех студентов ("живой" магазин).

## Авторизация
- `POST /register {name,surname,phone,email,password}` -> `{message, token, user}` (201)
- `POST /login {email,password}` -> `{message, token, user}` (200)
- В приватных запросах заголовок: `Authorization: Bearer <token>`
- Токен живёт **14 дней**. `POST /logout` -> старые токены становятся недействительны (401 -> повторный вход).
- `GET /me` -> `{message, user}` (профиль без пароля)

### Поля register
| Поле | Требование |
|---|---|
| name | 1–50 символов |
| surname | 1–50 символов |
| phone | только цифры, 9–15 шт. (пробел, `()`, `-`, `+` отбрасываются) |
| email | уникальный, приводится к нижнему регистру |
| password | 4–64 символа (не настоящий!) |

Ошибки: 400 (поля), 409 (email занят), 429 (больше 20 в час).

## Каталог (токен не нужен)
- `GET /products?category=&minPrice=&maxPrice=&page=&limit=`
  - `limit` по умолчанию 12, максимум 50; `page` по умолчанию 1
  - ответ: `{ total, page, pages, products: [...] }`
  - товар: `{ _id, title, price, image, categoryId, ordersCount, commentsCount, createdAt }`
- `GET /products/newest?limit=8` (максимум 20) -> `{ count, products }`
- `GET /products/bestsellers?limit=8` -> `{ count, products }` (по ordersCount)
- `GET /products/:id` -> `{ product }` + `comments: [{ _id, author, text, at }]`; 404 если не найдено
- `GET /categories` -> `{ count, categories: [{ _id, title, image, productsCount }] }`
- `GET /categories/:id/products` -> `{ category, count, products }`

> В документации не описаны поля `description` товара, несколько изображений или
> варианты. Уточним после того, как преподаватели заполнят каталог.

## Корзина (нужен токен)
Все ответы в одинаковом виде:
`{ items: [{ productId, title, price, image, qty, sum }], total }`

- `GET /cart`
- `POST /cart {productId, qty}` — qty целое 1–20 (по умолчанию 1). Если товар уже есть —
  суммируется (лимит 20). Максимум **20 разных позиций**. Ошибки: 404 / 400 / 409 (заполнено).
- `PATCH /cart/:productId {qty}` — новое количество 1–20. Для удаления НЕ `qty:0`, а `DELETE`.
- `DELETE /cart/:productId` — убрать позицию
- `DELETE /cart` — очистить корзину

## Заказ (нужен токен)
- `POST /orders` — **без тела**. Собирается из всей текущей корзины:
  - названия и цены копируются ("снимок") в заказ
  - итог считает сервер
  - корзина очищается
  - у каждого товара увеличивается `ordersCount`
  - ответ 201: `{ message, order: { _id, items, total, createdAt } }`; 400 — корзина пуста
- `GET /orders` -> `{ count, orders }` — только свои, новые сначала

## Отзывы (нужен токен)
- `POST /products/:id/comments {text}` — 2–300 символов; от одного пользователя на один товар
  **не более 3** (409). Автор берётся из профиля. Ответ 201: `{ message, comment }`.
- `DELETE /products/:id/comments/:commentId` — только свой (иначе 403)

## HTTP-коды
| Код | Когда |
|---|---|
| 200 | Чтение/изменение/вход прошли успешно |
| 201 | Создано: аккаунт, позиция корзины, заказ, отзыв |
| 400 | Ошибка в данных запроса — читай `message` |
| 401 | Нет токена / истёк / выполнен logout |
| 403 | Чужой объект (например чужой отзыв) |
| 404 | Не найдено |
| 409 | Конфликт: email занят, лимит корзины/отзывов |
| 429 | Слишком много запросов — сбавь темп |
