/* ============================================================
   pages/login.js — Вход
     1) header/footer
     2) при отправке формы — auth.doLogin
     3) при успехе: перенос гостевой корзины в аккаунт -> ?next или главная страница
   ============================================================ */

import { initLayout } from "../components.js";
import { doLogin, safeNext } from "../core/auth.js";
import { mergeGuestCartIntoAccount } from "../core/cart-store.js";

initLayout();

const form = document.querySelector("[data-login-form]");
const errEl = form.querySelector("[data-error]");
const submitBtn = form.querySelector(".auth-submit");
const nextUrl = safeNext(new URLSearchParams(location.search).get("next"));
const registerLink = document.querySelector(".auth-alt a");
registerLink.href = "/pages/register.html?next=" + encodeURIComponent(nextUrl);

function showError(message) {
  errEl.textContent = message;
  errEl.hidden = false;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errEl.hidden = true;

  const email = form.email.value.trim();
  const password = form.password.value;
  if (!email || !password) return showError("Please fill in all fields");

  submitBtn.disabled = true;
  try {
    await doLogin({ email, password });
    await mergeGuestCartIntoAccount(); // товары из гостевой корзины переносятся на сервер
    location.href = nextUrl;
  } catch (err) {
    showError(err.status === 401 ? "Incorrect email or password" : err.message);
    submitBtn.disabled = false;
  }
});
