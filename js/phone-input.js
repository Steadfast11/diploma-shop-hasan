/* ============================================================
   phone-input.js — telefon maydoni (barcha davlatlar)

   NEGA kutubxona?  Har davlatning telefon uzunligi/formati har xil.
   Ularni qo'lda yuzlab regex bilan yozish -> xato va eskirish manbai.
   `intl-tel-input` (libphonenumber ma'lumotlari ustida) buni biz uchun qiladi.

   Kutubxona LOYIHA ICHIDA (js/vendor/intl-tel-input/) — CDN yo'q, CSP toza.
   `utils.js` (uzunlik/format ma'lumotlari) faqat kerak bo'lганда yuklanadi.
   ============================================================ */

import intlTelInput from "/js/vendor/intl-tel-input/intlTelInput.mjs";

// Kutubxonaning xato kodlari -> inglizcha sabab.
const ERROR_TEXT = {
  INVALID_COUNTRY_CODE: "Invalid country code",
  TOO_SHORT: "Phone number is too short",
  TOO_LONG: "Phone number is too long",
  IS_POSSIBLE_LOCAL_ONLY: "Enter the full number, including the area code",
  INVALID_LENGTH: "Invalid phone number length",
};

// O'zbekiston milliy qismini XX-XXX-XX-XX ko'rinishida chizadi (maks 9 raqam).
function formatUz(digits) {
  const d = digits.replace(/\D/g, "").slice(0, 9);
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)];
  return parts.filter(Boolean).join("-");
}

// input — <input type="tel">. onInteract — foydalanuvchi qiymatni o'zgartirsa
// chaqiriladi (xato holatini "tuzatishni boshladi" deb yangilash uchun).
export function createPhoneInput(input, onInteract) {
  const iti = intlTelInput(input, {
    initialCountry: "uz",          // default O'zbekiston
    separateDialCode: true,        // "+998" flagning yonida ko'rinsin
    strictMode: true,              // ortiqcha/xato belgi kiritishga yo'l qo'ymaydi
    countrySearch: true,           // dropdown'da qidiruv (barcha davlatlar ro'yxati)
    // uzunlik/format ma'lumotlari — lokal fayldan, faqat kerak bo'lганда:
    loadUtils: () => import("/js/vendor/intl-tel-input/utils.js"),
  });

  // Kutubxona nusxasini input'ga ilib qo'yamiz — brauzer konsolidan
  // tekshirish uchun qulay (majburiy emas, lekin zararsiz).
  input.iti = iti;

  const isUz = () => iti.getSelectedCountry()?.iso2 === "uz";

  // O'zbekiston uchun o'z formatimiz; boshqa davlatда kutubxona o'zi format qiladi.
  input.addEventListener("input", () => {
    if (isUz()) input.value = formatUz(input.value);
    if (typeof onInteract === "function") onInteract();
  });

  // Davlat ro'yxati ochilганда — sahifa orqa fondan siljimasin.
  // overflow:hidden qo'yгач skrollbar yo'qolib sahifa "sakrайди" —
  // shu kenglikni padding bilan qoplaymiz.
  const lockScroll = () => {
    const barWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (barWidth > 0) document.body.style.paddingRight = barWidth + "px";
    window.__lenis?.stop(); // yumshoq skroll (Lenis) ham to'xtasin
    // Lenis g'ildirak hodisasini "yeб qo'yadi" — davlat ro'yxati ichida
    // skroll ishlashi uchun uni bu elementда e'tiborsiz qoldiramiz.
    document
      .querySelector(".iti__country-list")
      ?.setAttribute("data-lenis-prevent", "");
  };
  const unlockScroll = () => {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
    window.__lenis?.start();
  };
  input.addEventListener("open:countryselector", lockScroll);
  input.addEventListener("close:countryselector", unlockScroll);

  // Davlat almашса — format va tekshiruv qaytadan.
  input.addEventListener("countrychange", () => {
    if (isUz()) input.value = formatUz(input.value);
    if (typeof onInteract === "function") onInteract();
  });

  return {
    // Kutubxona to'liq tayyor bo'lganда (utils ham yuklangач) resolve bo'ladi.
    ready: iti.promise,

    // API'ga yuboriladigan qiymat: E.164 (masalan +998901234567).
    // Server "+", bo'shliq, "()" va "-" ni o'zi tashlab yuboradi (docs/api-reference.md).
    getE164() {
      return iti.getNumber();
    },

    // "" -> joyida; aks holda inglizcha xato matni.
    validate() {
      const raw = input.value.trim();
      if (!raw) return "Enter your phone number";
      // utils hali yuklanmagan bo'lsa isValidNumber() null qaytaradi ->
      // bu holатда tekshiruvni submit paytiga qoldiramiz (ready'ni kutamiz).
      const ok = iti.isValidNumber();
      if (ok === null) return "";
      if (ok) return "";
      const code = iti.getValidationError();
      return ERROR_TEXT[code] || "Enter a valid phone number";
    },
  };
}
