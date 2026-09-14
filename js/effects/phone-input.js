/* ============================================================
   phone-input.js — поле телефона (все страны)

   ЗАЧЕМ библиотека? У каждой страны своя длина/формат телефона.
   Прописывать это вручную сотнями regex — источник ошибок и устаревания.
   `intl-tel-input` (на основе данных libphonenumber) делает это за нас.

   Библиотека ВНУТРИ ПРОЕКТА (js/vendor/intl-tel-input/) — без CDN, CSP чистый.
   `utils.js` (данные о длине/формате) загружается только когда нужен.
   ============================================================ */

import intlTelInput from "/js/vendor/intl-tel-input/intlTelInput.mjs";

// Коды ошибок библиотеки -> причина на английском.
const ERROR_TEXT = {
  INVALID_COUNTRY_CODE: "Invalid country code",
  TOO_SHORT: "Phone number is too short",
  TOO_LONG: "Phone number is too long",
  IS_POSSIBLE_LOCAL_ONLY: "Enter the full number, including the area code",
  INVALID_LENGTH: "Invalid phone number length",
};

// Отрисовывает национальную часть Узбекистана в виде XX-XXX-XX-XX (макс. 9 цифр).
function formatUz(digits) {
  const d = digits.replace(/\D/g, "").slice(0, 9);
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)];
  return parts.filter(Boolean).join("-");
}

// input — <input type="tel">. onInteract — вызывается, когда пользователь
// меняет значение (чтобы обновить состояние "начал исправлять" ошибку).
export function createPhoneInput(input, onInteract) {
  const iti = intlTelInput(input, {
    initialCountry: "uz",          // по умолчанию Узбекистан
    separateDialCode: true,        // "+998" отображается рядом с флагом
    strictMode: true,              // не даёт вводить лишние/неверные символы
    countrySearch: true,           // поиск в выпадающем списке (список всех стран)
    // данные о длине/формате — из локального файла, только при необходимости:
    loadUtils: () => import("/js/vendor/intl-tel-input/utils.js"),
  });

  // Прикрепляем экземпляр библиотеки к input — удобно для проверки
  // из консоли браузера (не обязательно, но безвредно).
  input.iti = iti;

  const isUz = () => iti.getSelectedCountry()?.iso2 === "uz";

  // Для Узбекистана — свой формат; для остальных стран форматирует сама библиотека.
  input.addEventListener("input", () => {
    if (isUz()) input.value = formatUz(input.value);
    if (typeof onInteract === "function") onInteract();
  });

  // Когда открывается список стран — фон страницы не должен сдвигаться.
  // После overflow:hidden исчезает скроллбар и страница "прыгает" —
  // компенсируем эту ширину через padding.
  const lockScroll = () => {
    const barWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (barWidth > 0) document.body.style.paddingRight = barWidth + "px";
    window.__lenis?.stop(); // плавный скролл (Lenis) тоже должен остановиться
    // Lenis "перехватывает" событие колеса мыши — чтобы скролл внутри
    // списка стран работал, игнорируем его на этом элементе.
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

  // Смена страны — формат и проверка заново.
  input.addEventListener("countrychange", () => {
    if (isUz()) input.value = formatUz(input.value);
    if (typeof onInteract === "function") onInteract();
  });

  return {
    // Становится resolve, когда библиотека полностью готова (после загрузки utils тоже).
    ready: iti.promise,

    // Значение, отправляемое в API: E.164 (например +998901234567).
    // Сервер сам отбрасывает "+", пробелы, "()" и "-" (docs/api-reference.md).
    getE164() {
      return iti.getNumber();
    },

    // "" -> всё в порядке; иначе текст ошибки на английском.
    validate() {
      const raw = input.value.trim();
      if (!raw) return "Enter your phone number";
      // Если utils ещё не загружен, isValidNumber() вернёт null ->
      // в этом случае откладываем проверку до отправки формы (ждём ready).
      const ok = iti.isValidNumber();
      if (ok === null) return "";
      if (ok) return "";
      const code = iti.getValidationError();
      return ERROR_TEXT[code] || "Enter a valid phone number";
    },
  };
}
