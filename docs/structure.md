# Loyiha tuzilmasi — qaysi fayl nima uchun

Asosiy g'oya: **kodni "kim yozgan" va "nima qiladi" bo'yicha ajratish.**
Papka nomini o'qish bilan ichida nima borligi ma'lum bo'lishi kerak.

```
diploma-shop/
├── index.html          bosh sahifa (yagona ildizdagi sahifa)
├── 404.html            topilmadi sahifasi
├── pages/              qolgan sahifalar: catalog, product, cart, login, register, profile
├── components/         har sahifada TAKRORLANADIGAN bo'laklar (html + css yonma-yon)
│   ├── header.html/.css
│   ├── footer.html/.css
│   └── modal.html/.css
├── css/
│   ├── base/           BUTUN saytga tegishli poydevor
│   │   ├── reset.css       brauzer standart uslublarini nolga tushiradi
│   │   ├── variables.css   ranglar, shriftlar, o'lchamlar (--color-*, --fs-*)
│   │   ├── fonts.css       Inter shriftini loyiha ichidan ulaydi
│   │   └── base.css        umumiy matn/havola uslublari
│   ├── ui.css          KO'P JOYDA ishlatiladigan bo'laklar: kartochka, qty, skeleton, toast
│   └── pages/          har sahifaga bittadan: home, catalog, product, cart, auth, profile
├── js/
│   ├── core/           SAYT MIYASI — ma'lumot bilan ishlash (ko'rinishga aloqasi yo'q)
│   │   ├── config.js       API manzili, sahifa o'lchami kabi sozlamalar
│   │   ├── api.js          serverga so'rovlar (fetch) — bitta joyda
│   │   ├── storage.js      localStorage kalitlari (token, mehmon savati)
│   │   ├── auth.js         kirish / chiqish / "kim kirgan?"
│   │   ├── cart-store.js   savat holati (mehmon = localStorage, akkaunt = server)
│   │   └── validation.js   forma tekshiruvlari (ism, email, parol)
│   ├── ui.js           ko'rinish yordamchilari: money(), esc(), kartochka HTML, modal
│   ├── components.js   header/footer'ni sahifaga qo'yadi, burger, savat raqami
│   ├── pages/          har sahifaga bittadan skript (home.js, catalog.js, ...)
│   ├── effects/        BEZAK va qo'shimchalar — sayt busiz ham to'liq ishlaydi
│   │   ├── motion.js       GSAP animatsiyalari (hero, scroll reveal)
│   │   ├── reveal.js       GSAP bo'lmasa ishlaydigan sodda zaxira
│   │   └── phone-input.js  telefon maydoni (davlat kodi bilan)
│   └── vendor/         MENING KODIM EMAS — tayyor kutubxonalar
│       ├── gsap.min.js, ScrollTrigger.min.js, lenis.min.js
│       └── intl-tel-input/
├── assets/             fonts / icons / images + favicon
└── docs/               loyiha hujjatlari (himoyaga tayyorgarlik shu yerda)
```

## Qaysi papkani qachon ochaman

| Savol | Papka |
|---|---|
| "Serverdan ma'lumot qanday keladi?" | `js/core/api.js` |
| "Bu rang qayerdan?" | `css/base/variables.css` |
| "Bu sahifadagi tugma nega bunday?" | `css/pages/<sahifa>.css` |
| "Bu animatsiya qayerda?" | `js/effects/motion.js` |
| "Bu kodni men yozganman?" | `js/vendor/` dan tashqari hammasi — ha |

## `vendor/` haqida

`js/vendor/` ichidagi fayllar tayyor kutubxonalar (GSAP, Lenis, intl-tel-input).
Ular loyiha ichida saqlanadi — CDN'ga bog'liq emas, internetsiz ham ishlaydi.
Bu fayllar **tahrirlanmaydi**; ularni faqat ishlatamiz.
