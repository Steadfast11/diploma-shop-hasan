/* ============================================================
   pages/register.js — Ro'yxatdan o'tish (inline validatsiya)

   Tekshiruv mantig'i bu faylда EMAS — u sodda funksiyalarga bo'lingan:
     js/validation.js   — name / surname / email / password / confirm
     js/phone-input.js  — telefon (intl-tel-input, barcha davlatlar)
   Bu fayl faqat "ulaydi": qachon tekshirish, xatoni qayerga ko'rsatish,
   valid bo'lса API'ga yuborish.

   API qoidalari (docs/api-reference.md) yumshoqroq (name 1–50 ...), lekin
   biz qat'iyroq UX qoidalarini qo'llaymiz. Server baribir oxirgi hakam:
   uning xatosi (masalan 409 — email band) tegishli maydonga bog'lanadi.
   ============================================================ */

import { initLayout } from "../components.js";
import { doRegister, safeNext } from "../auth.js";
import { mergeGuestCartIntoAccount } from "../cart-store.js";
import {
  validateName,
  validateSurname,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from "../validation.js";
import { createPhoneInput } from "../phone-input.js";

initLayout();

const form = document.querySelector("[data-register-form]");
const formError = form.querySelector("[data-error]"); // umumiy / server xatosi
const submitBtn = form.querySelector(".auth__submit");

// next: kirilgach qayerga qaytish (login/register orasida ham uzatamiz)
const nextUrl = safeNext(new URLSearchParams(location.search).get("next"));
const loginLink = document.querySelector(".auth__alt a");
loginLink.href = "/pages/login.html?next=" + encodeURIComponent(nextUrl);

// Telefon maydoni: kutubxona bilan o'raladi. Foydalanuvchi yozа boshlаsa,
// mavjud telefon xatosini tozalaymiz (pastdagi umumiy qoidага mos).
const phone = createPhoneInput(form.phone, () => {
  if (form.phone.getAttribute("aria-invalid") === "true") clearFieldError("phone");
});

const FIELDS = ["name", "surname", "email", "phone", "password", "password2"];

/* ---------- xato matnini ekranga qo'yish / olib tashlash ---------- */

function fieldParts(name) {
  return {
    input: form[name],
    errEl: form.querySelector(`[data-error-for="${name}"]`),
  };
}

function showFieldError(name, message) {
  const { input, errEl } = fieldParts(name);
  input.setAttribute("aria-invalid", "true"); // skrinrider "noto'g'ri" deб o'qiydi
  errEl.textContent = message;
  errEl.hidden = false;
}

function clearFieldError(name) {
  const { input, errEl } = fieldParts(name);
  input.removeAttribute("aria-invalid");
  errEl.textContent = "";
  errEl.hidden = true;
}

/* ---------- bitta maydonni tekshirish ---------- */
// Xato matnini qaytaradi ("" — joyida). Yon ta'siri: ekranni yangilaydi.
function checkField(name) {
  let message = "";
  if (name === "name") message = validateName(form.name.value);
  else if (name === "surname") message = validateSurname(form.surname.value);
  else if (name === "email") message = validateEmail(form.email.value);
  else if (name === "phone") message = phone.validate();
  else if (name === "password") message = validatePassword(form.password.value);
  else if (name === "password2")
    message = validatePasswordConfirmation(form.password.value, form.password2.value);

  if (message) showFieldError(name, message);
  else clearFieldError(name);
  return message;
}

// Hammasini tekshiradi. Birinchi xato maydon nomini qaytaradi (yoki null).
function validateForm() {
  let firstInvalid = null;
  for (const name of FIELDS) {
    const message = checkField(name);
    if (message && !firstInvalid) firstInvalid = name;
  }
  return firstInvalid;
}

/* ---------- qachon tekshiramiz ---------- */
for (const name of FIELDS) {
  const input = form[name];
  // maydondan chiqqanда (blur) — o'sha maydonni tekshir
  input.addEventListener("blur", () => checkField(name));
  // tuzatishni boshlаsa — faqat mavjud xato bo'lса qayta baholaymiz
  input.addEventListener("input", () => {
    if (input.getAttribute("aria-invalid") === "true") checkField(name);
  });
}
// asosiy parol o'zgarса, "takrorlash" maydoni ham qayta tekshirilsin
form.password.addEventListener("input", () => {
  if (form.password2.getAttribute("aria-invalid") === "true") checkField("password2");
});

/* ---------- yuborish ---------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.hidden = true;
  formError.textContent = "";

  // telefon kutubxonasi (uzunlik ma'lumotlari) to'liq yuklangunча kutamiz,
  // shunda isValidNumber() ishonchli javob beradi
  try {
    await phone.ready;
  } catch {
    /* utils yuklanmasa ham davom etamiz — server baribir tekshiradi */
  }

  const firstInvalid = validateForm();
  if (firstInvalid) {
    form[firstInvalid].focus(); // birinchi noto'g'ri maydonga fokus
    return; // valid bo'lmaguncha API'ga so'rov YO'Q
  }

  submitBtn.disabled = true; // ikki marta bosishdan himoya
  try {
    await doRegister({
      name: form.name.value.trim(),
      surname: form.surname.value.trim(),
      email: form.email.value.trim(),
      phone: phone.getE164(), // E.164, masalan +998901234567
      password: form.password.value,
    });
    await mergeGuestCartIntoAccount();
    location.href = nextUrl;
  } catch (err) {
    submitBtn.disabled = false;
    // 409 — email allaqachon ro'yxatdan o'tган: xatoni Email maydoniga bog'laymiz
    if (err.status === 409 || /email/i.test(err.message || "")) {
      showFieldError("email", "This email is already registered");
      form.email.focus();
    } else {
      formError.textContent =
        err.message || "Could not create your account. Please try again.";
      formError.hidden = false;
    }
  }
});
