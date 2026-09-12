# Class nomlari — lug'at

## Qoida (uchta, boshqa qoida yo'q)

1. **`blok-qism`** — bitta chiziqcha. `__` va `--` umuman ishlatilmaydi.
   Birinchi so'z — qaysi blokda, ikkinchisi — o'sha blokning qaysi bo'lagi.
   `header-inner` = header ichidagi o'rovchi. `card-price` = kartochkadagi narx.
2. **Variant uchun ham chiziqcha:** `summary-row` → `summary-row-total`,
   `price-input` → `price-input-min`.
3. **Holat har doim `is-` bilan:** `is-open`, `is-visible`, `is-removing`,
   `is-loaded`, `is-changed`. Holat — vaqtincha, JS qo'yadi va oladi.

Shu tufayli bitta class'ni o'qib, uni qaysi faylda qidirishni bilasan:
`filter-*` → `css/pages/catalog.css`, `summary-*` → `css/pages/cart.css`.

## Bloklar — qaysi prefiks qayerda

| Prefiks | Nima | Fayl |
|---|---|---|
| `header-*` | yuqoridagi panel (logo, menyu, savat) | `components/header.css` |
| `footer-*` | pastdagi panel (havolalar, ijtimoiy tarmoq) | `components/footer.css` |
| `modal-*` | qalqib chiquvchi oyna (izoh yozish, "Thank you!") | `components/modal.css` |
| `hero-*` | bosh sahifadagi katta rasm va sarlavha | `css/pages/home.css` |
| `section-*` | bosh sahifadagi bo'lim sarlavhasi | `css/pages/home.css` |
| `card-*` | mahsulot kartochkasi (hamma sahifada) | `css/ui.css` |
| `category-*` | kategoriya kartochkasi | `css/ui.css` |
| `qty-*` | miqdor tugmasi (− 1 +) | `css/ui.css` |
| `skeleton-*`, `state-message*`, `toast-*` | yuklanmoqda / bo'sh / xabar | `css/ui.css` |
| `catalog-*` | katalog sahifasining o'zi (sarlavha, qidiruv, "yana yuklash") | `css/pages/catalog.css` |
| `filter-*` | chapdagi filtr paneli | `css/pages/catalog.css` |
| `price-*` | narx oralig'i slayderi | `css/pages/catalog.css` |
| `product-*` | mahsulot sahifasi (galereya, narx, "Add to cart") | `css/pages/product.css` |
| `reviews-*` | izohlar bo'limi (sarlavha, to'r, "Write a Review") | `css/pages/product.css` |
| `review-*` | BITTA izoh kartasi | `css/pages/product.css` |
| `cart-*` | savat sahifasi; `cart-item-*` — bitta mahsulot qatori | `css/pages/cart.css` |
| `summary-*` | qora "Order Summary" kartasi | `css/pages/cart.css` |
| `auth-*`, `field-*` | kirish / ro'yxatdan o'tish formasi | `css/pages/auth.css` |
| `profile-*` | profil sahifasi | `css/pages/profile.css` |
| `notfound-*` | 404 sahifasi | `css/ui.css` |

## Ko'p so'raladiganlari

| class | nima qiladi |
|---|---|
| `container` | kontentni 1200px ga cheklaydi va markazga qo'yadi |
| `card-media` | mahsulot rasmining kulrang qutisi (rasm yuklanmaguncha ham joy turadi) |
| `filter-col` | filtr panelining "ustuni" — sahifa balandligicha cho'ziladi, panel uning ichida `sticky` |
| `summary-row-total` | qora kartadagi "Total" qatori |
| `product-thumb-active` | galereyada hozir tanlangan kichik rasm |
| `catalog-filter-open` | `<body>` ga qo'yiladi: telefonda filtr oynasi ochiq |
| `has-motion` | `<html>` ga qo'yiladi: GSAP yuklandi, CSS animatsiyasi kerak emas |
| `img-fallback` | rasm yuklanmasa kulrang joy qoladi (singan ikonka ko'rinmaydi) |
| `skip-link` | klaviatura bilan yurganlar uchun "kontentga o't" havolasi |

## Eski → yangi (to'liq ro'yxat)

Bu jadval faqat tarix uchun: eski kodda `__` bor edi, hammasi bir marta almashtirildi.

| eski | yangi |
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
