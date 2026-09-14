# Имена классов — словарь

## Правило (три, других правил нет)

1. **`блок-часть`** — одно тире. `__` и `--` не используются вообще.
   Первое слово — какой блок, второе — какая часть этого блока.
   `header-inner` = обёртка внутри header. `card-price` = цена в карточке.
2. **Для варианта тоже тире:** `summary-row` → `summary-row-total`,
   `price-input` → `price-input-min`.
3. **Состояние всегда с `is-`:** `is-open`, `is-visible`, `is-removing`,
   `is-loaded`, `is-changed`. Состояние — временное, JS добавляет и убирает.

Благодаря этому, прочитав один класс, сразу понятно, в каком файле его искать:
`filter-*` → `css/pages/catalog.css`, `summary-*` → `css/pages/cart.css`.

## Блоки — какой префикс где

| Префикс | Что | Файл |
|---|---|---|
| `header-*` | верхняя панель (логотип, меню, корзина) | `components/header.css` |
| `footer-*` | нижняя панель (ссылки, соцсети) | `components/footer.css` |
| `modal-*` | всплывающее окно (написание отзыва, "Thank you!") | `components/modal.css` |
| `hero-*` | большое изображение и заголовок на главной странице | `css/pages/home.css` |
| `section-*` | заголовок раздела на главной странице | `css/pages/home.css` |
| `card-*` | карточка товара (на всех страницах) | `css/ui.css` |
| `category-*` | карточка категории | `css/ui.css` |
| `qty-*` | кнопка количества (− 1 +) | `css/ui.css` |
| `skeleton-*`, `state-message*`, `toast-*` | загрузка / пусто / сообщение | `css/ui.css` |
| `catalog-*` | сама страница каталога (заголовок, поиск, "load more") | `css/pages/catalog.css` |
| `filter-*` | панель фильтра слева | `css/pages/catalog.css` |
| `price-*` | слайдер диапазона цены | `css/pages/catalog.css` |
| `product-*` | страница товара (галерея, цена, "Add to cart") | `css/pages/product.css` |
| `reviews-*` | раздел отзывов (заголовок, сетка, "Write a Review") | `css/pages/product.css` |
| `review-*` | ОДНА карточка отзыва | `css/pages/product.css` |
| `cart-*` | страница корзины; `cart-item-*` — строка одного товара | `css/pages/cart.css` |
| `summary-*` | чёрная карточка "Order Summary" | `css/pages/cart.css` |
| `auth-*`, `field-*` | форма входа / регистрации | `css/pages/auth.css` |
| `profile-*` | страница профиля | `css/pages/profile.css` |
| `notfound-*` | страница 404 | `css/ui.css` |

## Часто задаваемые

| класс | что делает |
|---|---|
| `container` | ограничивает контент 1200px и центрирует |
| `card-media` | серый блок изображения товара (место остаётся, пока изображение не загружено) |
| `filter-col` | "колонка" панели фильтра — растягивается на высоту страницы, панель внутри неё `sticky` |
| `summary-row-total` | строка "Total" на чёрной карточке |
| `product-thumb-active` | сейчас выбранная миниатюра в галерее |
| `catalog-filter-open` | добавляется на `<body>`: на телефоне окно фильтра открыто |
| `has-motion` | добавляется на `<html>`: GSAP загружен, CSS-анимация не нужна |
| `img-fallback` | если изображение не загрузилось, остаётся серое место (сломанная иконка не видна) |
| `skip-link` | ссылка "перейти к контенту" для тех, кто работает с клавиатуры |

## Старое → новое (полный список)

Эта таблица только для истории: в старом коде был `__`, всё заменено один раз.

| старое | новое |
|---|---|
| `auth__alt` | `auth-alt` |
| `auth__error` | `auth-error` |
| `auth__form` | `auth-form` |
| `auth__notice` | `auth-notice` |
| `auth__submit` | `auth-submit` |
| `auth__title` | `auth-title` |
| `cart-item__image` | `cart-item-image` |
| `cart-item__info` | `cart-item-info` |
| `cart-item__media` | `cart-item-media` |
| `cart-item__price` | `cart-item-price` |
| `cart-item__remove` | `cart-item-remove` |
| `cart-item__title` | `cart-item-title` |
| `cart__empty` | `cart-empty` |
| `cart__main` | `cart-main` |
| `cart__title` | `cart-title` |
| `catalog__content` | `catalog-content` |
| `catalog__filter-toggle` | `catalog-filter-toggle` |
| `catalog__head` | `catalog-head` |
| `catalog__more` | `catalog-more` |
| `catalog__search` | `catalog-search` |
| `catalog__title` | `catalog-title` |
| `category-card` | `category` |
| `category-card__btn` | `category-btn` |
| `field__error` | `field-error` |
| `field__input` | `field-input` |
| `field__label` | `field-label` |
| `filters` | `filter` |
| `filters-col` | `filter-col` |
| `filters__apply` | `filter-apply` |
| `filters__backdrop` | `filter-backdrop` |
| `filters__chevron` | `filter-chevron` |
| `filters__clear` | `filter-clear` |
| `filters__close` | `filter-close` |
| `filters__divider` | `filter-divider` |
| `filters__group` | `filter-group` |
| `filters__head` | `filter-head` |
| `filters__row` | `filter-row` |
| `filters__row--static` | `filter-row-static` |
| `filters__subtitle` | `filter-subtitle` |
| `filters__title` | `filter-title` |
| `hero__bg` | `hero-bg` |
| `hero__btn` | `hero-btn` |
| `hero__eyebrow` | `hero-eyebrow` |
| `hero__inner` | `hero-inner` |
| `hero__offer` | `hero-offer` |
| `hero__text` | `hero-text` |
| `hero__title` | `hero-title` |
| `m-word__in` | `m-word-in` |
| `modal__body` | `modal-body` |
| `modal__box` | `modal-box` |
| `modal__btn` | `modal-btn` |
| `modal__label` | `modal-label` |
| `modal__overlay` | `modal-overlay` |
| `modal__textarea` | `modal-textarea` |
| `modal__title` | `modal-title` |
| `not-found` | `notfound` |
| `not-found__code` | `notfound-code` |
| `not-found__link` | `notfound-link` |
| `not-found__text` | `notfound-text` |
| `not-found__title` | `notfound-title` |
| `order-summary` | `summary` |
| `order-summary__checkout` | `summary-checkout` |
| `order-summary__divider` | `summary-divider` |
| `order-summary__row` | `summary-row` |
| `order-summary__row--discount` | `summary-row-discount` |
| `order-summary__row--total` | `summary-row-total` |
| `order-summary__rows` | `summary-rows` |
| `order-summary__title` | `summary-title` |
| `price-range` | `price` |
| `price-range__fill` | `price-fill` |
| `price-range__input` | `price-input` |
| `price-range__input--max` | `price-input-max` |
| `price-range__input--min` | `price-input-min` |
| `price-range__labels` | `price-labels` |
| `price-range__track` | `price-track` |
| `product-card` | `card` |
| `product-card__image` | `card-image` |
| `product-card__info` | `card-info` |
| `product-card__link` | `card-link` |
| `product-card__media` | `card-media` |
| `product-card__price` | `card-price` |
| `product-card__title` | `card-title` |
| `product__actions` | `product-actions` |
| `product__add` | `product-add` |
| `product__back` | `product-back` |
| `product__desc` | `product-desc` |
| `product__gallery` | `product-gallery` |
| `product__info` | `product-info` |
| `product__main` | `product-main` |
| `product__main-image` | `product-main-image` |
| `product__price` | `product-price` |
| `product__thumb` | `product-thumb` |
| `product__thumb--active` | `product-thumb-active` |
| `product__thumbs` | `product-thumbs` |
| `product__title` | `product-title` |
| `product__top` | `product-top` |
| `profile__email` | `profile-email` |
| `profile__eyebrow` | `profile-eyebrow` |
| `profile__head` | `profile-head` |
| `profile__logout` | `profile-logout` |
| `profile__name` | `profile-name` |
| `profile__note` | `profile-note` |
| `profile__orders` | `profile-orders` |
| `profile__orders-title` | `profile-orders-title` |
| `profile__phone` | `profile-phone` |
| `qty__btn` | `qty-btn` |
| `qty__value` | `qty-value` |
| `review-card` | `review` |
| `review-card__author` | `review-author` |
| `review-card__date` | `review-date` |
| `review-card__delete` | `review-delete` |
| `review-card__text` | `review-text` |
| `reviews__count` | `reviews-count` |
| `reviews__grid` | `reviews-grid` |
| `reviews__head` | `reviews-head` |
| `reviews__title` | `reviews-title` |
| `reviews__write` | `reviews-write` |
| `section__title` | `section-title` |
| `site-footer` | `footer` |
| `site-footer__bottom` | `footer-bottom` |
| `site-footer__brand` | `footer-brand` |
| `site-footer__col` | `footer-col` |
| `site-footer__divider` | `footer-divider` |
| `site-footer__heading` | `footer-heading` |
| `site-footer__inner` | `footer-inner` |
| `site-footer__legal` | `footer-legal` |
| `site-footer__logo` | `footer-logo` |
| `site-footer__social` | `footer-social` |
| `site-footer__top` | `footer-top` |
| `site-header` | `header` |
| `site-header--intro` | `header-intro` |
| `site-header--menu-open` | `header-menu-open` |
| `site-header__account` | `header-account` |
| `site-header__burger` | `header-burger` |
| `site-header__inner` | `header-inner` |
| `site-header__logo` | `header-logo` |
| `site-header__nav` | `header-nav` |
| `skeleton__line` | `skeleton-line` |
| `state-message--error` | `state-message-error` |
| `state-message--search` | `state-message-search` |
| `toast--error` | `toast-error` |
