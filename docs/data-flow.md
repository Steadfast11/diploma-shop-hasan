# Поток данных (пошагово)

Вопрос на доске: *"Что произойдёт, если пользователь сделает X? Расскажи от начала до конца."*

Общее: **скрипт каждой страницы проходит одни и те же 4 этапа** —
1) `initLayout()` (header/footer) → 2) чтение URL/состояния → 3) данные из `api.*` → 4) отрисовка в DOM + подключение событий.

---

## 0. При загрузке каждой страницы
1. `<head>` HTML подключает стили (reset → variables → base → ui → component → page)
2. В конце `<body>` — `<script type="module" src=".../page.js">`
3. `page.js` → `import { initLayout } from "../components.js"` → `initLayout()`:
   - `fetch("/components/header.html?v=1")` и `footer` → `innerHTML` в `<div id="header/footer">`
   - `wireHeaderAuth()` — если нет входа, ссылка "Account" ведёт на `login.html`
   - `wireHeaderMenu()` — переключение мобильного бургера
   - `refreshCartCount()` — `cart-store.getCount()` → `Bag (N)` в header
   - `cart-store.subscribe(refreshCartCount)` — при изменении корзины обновляется `Bag (N)`
   - `initReveal()` — следит за блоками `[data-reveal]` через IntersectionObserver

## 1. Каталог: при нажатии "Apply Filter" (RELOAD НЕТ)
1. `catalog.js` слушает событие клика по кнопке
2. `filter.category = pendingCategory`, `filter.minPrice/maxPrice` = значения слайдера
3. `syncUrl()` → через `history.replaceState` `?category=...&minPrice=...` (страница не обновляется)
4. `loadProducts()` → `api.getProducts({category, minPrice, maxPrice, page:1, limit})`
   → `request("/products?...")`
5. `{ total, page, pages, products }` → если `products.length` есть, grid через `productCardHTML`,
   если нет — "No products found"
6. `refreshClearBtn()` → если активен какой-то фильтр, появляется "Clear filters"

## 2. При клике по категории (каталог) — только выбор, НЕ фильтр
1. `catalog.js` клик по `[data-category-list]` → находится кнопка с `data-category`
2. Обновляется `pendingCategory` (toggle: повторный клик отменяет). Режим одной категории —
   у остальных `aria-pressed` становится `false`, chevron поворачивается вниз
3. **Ничего не загружается** — товары обновляются только при "Apply Filter" (поток 1)

## 2b. При клике по заголовку "Price"
- toggle `aria-expanded` → toggle `[data-price-panel].hidden` (слайдер показывается/скрывается)

## 3. "Add to cart" (страница товара)
1. `product.js` клик по `[data-add]`; количество берётся из `[data-qty]`
2. `cartStore.addItem(product, qty)`:
   - **вошёл:** `api.addToCart(product._id, qty)` → `POST /cart` (Bearer token)
   - **гость:** добавляется в массив `storage.getGuestCart()` (если уже есть, `qty` суммируется, лимит 20) → `setGuestCart`
3. `cart-store` `notify()` → подписчики (`refreshCartCount` в header) → обновляется `Bag (N)` + анимация bump
4. `openModal({ title: "Товар добавлен в корзину", ... })`

## 4. Количество / удаление в корзине
1. `cart.js` клик по `[data-cart-main]` (делегирование) → какой `.cart-item`, `data-id`, текущее qty
2. `[data-inc]` → `cartStore.setQty(id, qty+1)`, `[data-dec]` → `setQty(id, qty-1)` (если 0, то `removeItem`), `[data-remove]` → `removeItem(id)`
3. Каждое: вошёл→`api.*`, гость→`storage.*`; `notify()`
4. Заново вызывается `render()` → перерисовываются корзина + Order Summary

## 5. "Go to checkout" (корзина)
1. `cart.js` клик по `[data-checkout]`
2. **гость:** `location.href = "/pages/login.html?next=/pages/cart.html"`
3. **вошёл:** `api.createOrder()` → `POST /orders` (без тела — сервер собирает из всей корзины,
   делает "снимок" цены, очищает корзину, увеличивает `ordersCount`)
4. Когда сервер создаёт заказ, он сам очищает корзину; `cartStore.refresh()` только
   заставляет перечитать число в header (второй `DELETE /cart` не отправляется)
5. Заново вызывается `render()` → корзина теперь пуста → на экране "No products in your bag",
   "Go to checkout" `disabled` (товары исчезают автоматически)
6. Модал "Order placed!" → "View my orders" → `location.href = "/pages/profile.html"`

## 6. Вход
1. `login.js` `submit` формы → `e.preventDefault()`
2. Берутся `email`, `password`, если пусто — ошибка
3. `auth.doLogin({email, password})` → `api.login` → `POST /login` → `{token, user}`
   → `storage.setToken(token)`, `setUser(user)`
4. `cartStore.mergeGuestCartIntoAccount()` — каждый товар гостевой корзины через `api.addToCart` на сервер;
   товары, которые не удалось перенести, не теряются, остаются в локальной корзине, показывается предупреждение
5. `location.href = ?next || "/index.html"`
6. Ошибка 401 → "Неверный email или пароль"

## 7. Регистрация (встроенная валидация)
1. `register.js` только "соединяет". Проверка в простых функциях:
   - `js/core/validation.js` — `validateName` (3–10 букв, `\p{L}`), `validateSurname` (3–15 букв),
     `validateEmail` (строгий формат, пробел/подряд идущие точки отклоняются), `validatePassword`
     (8–64, минимум 1 буква + 1 цифра), `validatePasswordConfirmation`
   - `js/effects/phone-input.js` — телефон: библиотека `intl-tel-input` (внутри проекта,
     `js/vendor/intl-tel-input/`). `initialCountry:"uz"`, `separateDialCode`,
     `strictMode`. `utils.js` загружается через `import()` из локального файла.
     `isValidNumber()` + `getValidationError()` → причина на английском
     (too short / too long / invalid country code ...).
2. Когда: каждое поле проверяется при `blur`; если ошибка, перепроверяется при `input`;
   при `submit` — всё. Неверное поле → `aria-invalid="true"` + `.field-error` с
   `aria-describedby`. `focus` на первое неверное поле.
3. Если не валидно, запрос к API НЕ ОТПРАВЛЯЕТСЯ. Кнопка `submit` `disabled` во время запроса.
4. Телефон отправляется в формате E.164 (`iti.getNumber()` → `+998901234567`).
   Сервер сам отбрасывает `+ ( ) -` и пробелы (docs/api-reference.md).
5. `auth.doRegister(...)` → `POST /register` → `{token, user}` → сохраняется →
   `mergeGuestCartIntoAccount()` → `?next` или главная страница.
6. Сервер 409 → ошибка "This email is already registered" привязывается к полю Email;
   другая ошибка сервера → общая ошибка формы.

> Фронтенд НЕ МОЖЕТ доказать, что email действительно существует — это может определить
> только письмо-подтверждение (verification link) на бэкенде. Поэтому DNS/сторонний
> "email checker" не добавлен.

## 8. Написание отзыва (страница товара)
1. Клик "Write a Review" → если нет входа, `login.html?next=...`
2. `openModal("Leave a comment", textarea, "Send")`
3. "Send" → проверяется текст 2–300 символов → `api.addComment(id, text)` → `POST /products/:id/comments`
4. `closeModal()` → `openModal("Thank you!", ..., "Okey")`
5. `refreshReviews()` → `api.getProduct(id)` → список отзывов перерисовывается
6. 409 → "больше 3 на один товар"; удаление своего отзыва → `DELETE .../comments/:id`

## 9. Профиль / выход
1. `profile.js` `requireAuth()` — если нет токена, `login.html?next=...`, `false`
2. Сразу отрисовывается по `currentUser()` (сохранённому) → обновляется через `api.getMe()`
3. `api.getOrders()` → `orders.flatMap(o => o.items)` → сетка товаров (без цены)
4. "Log out" → `auth.doLogout()` → `api.logout()` (даже при ошибке) + `clearToken/clearUser`
   → `location.href = "/index.html"`

## 10. Главная страница
- 3 независимых `loadSection()`: `getBestsellers(4)`, `getCategories()`, `getNewest(12)`
- Если один упадёт, остальные продолжат работать (у каждого свой `try/catch`)
