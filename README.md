# Diploma Shop — WEPRO / Skin—Clinic

Фронтенд онлайн-магазина для Sandbox Shop API. **Чистый HTML / CSS / JavaScript** —
без фреймворка. Дизайн: макет Figma (pixel-perfect). Бэкенд: `https://api.wepro.uz/sandbox-shop`.

## Запуск (dev)

`fetch()` (header/footer и API) не работает через `file://` — нужен небольшой сервер:

```bash
npm run dev
# или:
npx serve -l 5173 .
# или:
python3 -m http.server 5173
```

В браузере: `http://localhost:5173`

> В `serve.json` стоит `cleanUrls: false` — чтобы из URL не убирались `.html` и `?query`.

## Страницы

| Файл | Что это |
|------|------|
| `index.html` | Главная страница (hero + Best sellers + Shop by category + Featured products) |
| `pages/catalog.html` | "All products" + панель фильтра (категория + слайдер цены) |
| `pages/product.html` | Товар (`?id=`): галерея, цена, qty, Add to cart, отзывы |
| `pages/cart.html` | Корзина + Order Summary + checkout |
| `pages/login.html` / `register.html` | Вход (email) / Регистрация |
| `pages/profile.html` | Профиль + "My orders" (требует входа) |

## Структура папок

```
components/     header, footer, modal — HTML + CSS. Вставляются в страницу через JS.
css/
  reset.css       выравнивание стандартных стилей браузера
  variables.css   токены Figma (переменные :root)
  base.css        типографика body + .container (1200px)
  ui.css          переиспользуемое: .card, .product-grid, .qty,
                  .btn-glass, сообщения о состоянии, АНИМАЦИИ
  pages/          свой стиль для каждой страницы
js/
  config.js       адрес API
  api.js          единственный файл, общающийся с СЕРВЕРОМ (все fetch)
  storage.js      обёртка над localStorage (токен, гостевая корзина)
  auth.js         состояние "кто вошёл" (doLogin/doRegister/doLogout/requireAuth)
  cart-store.js   логика корзины (гость = localStorage, вошёл = сервер)
  components.js   вставляет header/footer в страницу + состояние header
  reveal.js       scroll-reveal (IntersectionObserver)
  ui.js           помощники: money, esc, productCardHTML, openModal
  pages/          стартовый скрипт для каждого HTML-файла
assets/         icons / images / favicon.svg
docs/           plan, decisions, data-flow, qa-bank, api-reference, figma-nodes
```

## Деплой (Netlify)

Статичный сайт — этапа сборки нет.

1. Push в GitHub (`git push`)
2. Netlify → "Add new site" → "Import from Git" → выбрать репозиторий
3. Build command: пусто; Publish directory: `.`  (указано в `netlify.toml`)
4. Deploy

Или: `npx netlify deploy --prod --dir=.`

## Материал для защиты

`docs/qa-bank.md` — ожидаемые вопросы-ответы.
`docs/data-flow.md` — поток каждого действия.
`docs/decisions.md` — почему написано именно так.
