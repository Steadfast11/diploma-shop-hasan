/* ============================================================
   translate.js — Google Website Translator (avtomatik, jahon tillari)
   Nega: API'da/loyihada real tarjima tizimi yo'q, va har matnni
   qo'lda 190+ tilga tarjima qilib bo'lmaydi. Google'ning bepul
   "Website Translator" widgeti butun sahifani JONLI tarjima qiladi —
   biz hech qanday matn yozmaymiz, u avtomatik.

   Ishlash tamoyili:
   1) Bu skript HAR sahifada yuklanadi (pastda).
   2) Faqat profile.html da ko'rinadigan #google_translate_element bor —
      shu yerda til tanlanadi.
   3) Google tanlangan tilni "googtrans" cookie'ga yozadi.
   4) Boshqa sahifalarda ham shu skript ishga tushganda cookie'ni o'qib,
      sahifani avtomatik o'sha tilga o'giradi — hatto ko'rinadigan
      dropdown bo'lmasa ham.

   CHEKLOV: bu Google'ning tashqi (CDN) xizmati — vendor qila olmaymiz,
   chunki tarjima jonli xizmat, statik fayl emas. Internet yo'q joyda
   yoki Google xizmati o'zgarsa ishlamasligi mumkin.
   ============================================================ */

window.googleTranslateElementInit = function () {
  if (!window.google?.translate) return;
  new google.translate.TranslateElement(
    {
      pageLanguage: "en", // sayt manba tili — biz endi hammasini inglizcha yozdik
      autoDisplay: false, // brauzer tiliga qarab o'zi tarjima qilmasin
    },
    "google_translate_element"
  );
};

(function loadGoogleTranslate() {
  if (document.querySelector("#google_translate_element") === null) return; // bu sahifada joy yo'q
  if (document.querySelector('script[src*="translate.google.com"]')) return; // ikki marta yuklamaymiz
  const s = document.createElement("script");
  s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  s.async = true;
  document.head.appendChild(s);
})();
