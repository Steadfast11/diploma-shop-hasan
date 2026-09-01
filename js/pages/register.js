/* ============================================================
   pages/register.js — Ro'yxatdan o'tish
   Validatsiya API qoidalariga mos (docs/api-reference.md):
     name/surname : 1–50 belgi
     phone        : faqat raqam, 9–15 ta
     email        : oddiy tekshiruv
     password     : 4–64 belgi, password2 bilan mos
   ============================================================ */

import { initLayout } from "../components.js";
import { doRegister } from "../auth.js";
import { mergeGuestCartIntoAccount } from "../cart-store.js";

initLayout();

const form = document.querySelector("[data-register-form]");
const errEl = form.querySelector("[data-error]");
const submitBtn = form.querySelector(".auth__submit");
const nextUrl = new URLSearchParams(location.search).get("next") || "/index.html";

function showError(message) {
  errEl.textContent = message;
  errEl.hidden = false;
}

// Formadan qiymatlarni olib, xato bo'lsa matn qaytaradi (yoki null)
function validate(v) {
  if (v.name.length < 1 || v.name.length > 50) return "Ism 1–50 belgi bo'lishi kerak";
  if (v.surname.length < 1 || v.surname.length > 50) return "Familiya 1–50 belgi bo'lishi kerak";
  if (!/^\S+@\S+\.\S+$/.test(v.email)) return "Email noto'g'ri";
  const digits = v.phone.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 15) return "Telefon 9–15 ta raqam bo'lishi kerak";
  if (v.password.length < 4 || v.password.length > 64) return "Parol 4–64 belgi bo'lishi kerak";
  if (v.password !== v.password2) return "Parollar mos kelmadi";
  return null;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errEl.hidden = true;

  const v = {
    name: form.name.value.trim(),
    surname: form.surname.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    password: form.password.value,
    password2: form.password2.value,
  };

  const problem = validate(v);
  if (problem) return showError(problem);

  submitBtn.disabled = true;
  try {
    await doRegister({
      name: v.name,
      surname: v.surname,
      email: v.email,
      phone: v.phone,
      password: v.password,
    });
    await mergeGuestCartIntoAccount();
    location.href = nextUrl;
  } catch (err) {
    // 409 — email band; 400 — server validatsiyasi
    showError(err.message);
    submitBtn.disabled = false;
  }
});
