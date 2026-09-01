/* ============================================================
   pages/register.js — Ro'yxatdan o'tish
   Validatsiya API qoidalariga mos (docs/api-reference.md):
     name/surname : 1–50 belgi
     phone        : faqat raqam, 9–15 ta
     email        : oddiy tekshiruv
     password     : 4–64 belgi, password2 bilan mos
   ============================================================ */

import { initLayout } from "../components.js";
import { doRegister, safeNext } from "../auth.js";
import { mergeGuestCartIntoAccount } from "../cart-store.js";

initLayout();

const form = document.querySelector("[data-register-form]");
const errEl = form.querySelector("[data-error]");
const submitBtn = form.querySelector(".auth__submit");
const nextUrl = safeNext(new URLSearchParams(location.search).get("next"));
const loginLink = document.querySelector(".auth__alt a");
loginLink.href = "/pages/login.html?next=" + encodeURIComponent(nextUrl);

function showError(message) {
  errEl.textContent = message;
  errEl.hidden = false;
}

// Formadan qiymatlarni olib, xato bo'lsa matn qaytaradi (yoki null)
function validate(v) {
  if (v.name.length < 1 || v.name.length > 50) return "Name must be 1–50 characters";
  if (v.surname.length < 1 || v.surname.length > 50) return "Surname must be 1–50 characters";
  if (!/^\S+@\S+\.\S+$/.test(v.email)) return "Invalid email";
  const digits = v.phone.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 15) return "Phone must be 9–15 digits";
  if (v.password.length < 4 || v.password.length > 64) return "Password must be 4–64 characters";
  if (v.password !== v.password2) return "Passwords do not match";
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
