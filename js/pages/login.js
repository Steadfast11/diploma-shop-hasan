/* ============================================================
   pages/login.js — Kirish
     1) header/footer
     2) forma yuborilganda auth.doLogin
     3) muvaffaqiyatda: mehmon savatini akkauntga ko'chirish -> ?next yoki bosh sahifa
   ============================================================ */

import { initLayout } from "../components.js";
import { doLogin } from "../auth.js";
import { mergeGuestCartIntoAccount } from "../cart-store.js";

initLayout();

const form = document.querySelector("[data-login-form]");
const errEl = form.querySelector("[data-error]");
const submitBtn = form.querySelector(".auth__submit");
const nextUrl = new URLSearchParams(location.search).get("next") || "/index.html";

function showError(message) {
  errEl.textContent = message;
  errEl.hidden = false;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errEl.hidden = true;

  const email = form.email.value.trim();
  const password = form.password.value;
  if (!email || !password) return showError("Barcha maydonlarni to'ldiring");

  submitBtn.disabled = true;
  try {
    await doLogin({ email, password });
    await mergeGuestCartIntoAccount(); // mehmon savatidagilar serverga ko'chadi
    location.href = nextUrl;
  } catch (err) {
    showError(err.status === 401 ? "Email yoki parol noto'g'ri" : err.message);
    submitBtn.disabled = false;
  }
});
