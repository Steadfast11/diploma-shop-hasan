/* ============================================================
   pages/register.js — Регистрация (встроенная валидация)

   Логика проверки НЕ в этом файле — она разбита на простые функции:
     js/core/validation.js   — name / surname / email / password / confirm
     js/effects/phone-input.js  — телефон (intl-tel-input, все страны)
   Этот файл только "соединяет": когда проверять, куда показывать ошибку,
   и если всё валидно — отправляет в API.

   Правила API (docs/api-reference.md) мягче (name 1–50 ...), но мы
   применяем более строгие UX-правила. Сервер всё равно последний судья:
   его ошибка (например 409 — email занят) привязывается к нужному полю.
   ============================================================ */

import { initLayout } from "../components.js";
import { doRegister, safeNext } from "../core/auth.js";
import { mergeGuestCartIntoAccount } from "../core/cart-store.js";
import {
  validateName,
  validateSurname,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from "../core/validation.js";
import { createPhoneInput } from "../effects/phone-input.js";
import { playOnce } from "../ui.js";

initLayout();

const form = document.querySelector("[data-register-form]");
const formError = form.querySelector("[data-error]"); // общая ошибка / ошибка сервера
const submitBtn = form.querySelector(".auth-submit");

// next: куда вернуться после входа (передаём и между login/register)
const nextUrl = safeNext(new URLSearchParams(location.search).get("next"));
const loginLink = document.querySelector(".auth-alt a");
loginLink.href = "/pages/login.html?next=" + encodeURIComponent(nextUrl);

// Поле телефона: оборачивается библиотекой. Когда пользователь начинает
// печатать, убираем текущую ошибку телефона (по тому же общему правилу ниже).
const phone = createPhoneInput(form.phone, () => {
  if (form.phone.getAttribute("aria-invalid") === "true") clearFieldError("phone");
});

const FIELDS = ["name", "surname", "email", "phone", "password", "password2"];

/* ---------- показать / убрать текст ошибки на экране ---------- */

function fieldParts(name) {
  return {
    input: form[name],
    errEl: form.querySelector(`[data-error-for="${name}"]`),
  };
}

function showFieldError(name, message) {
  const { input, errEl } = fieldParts(name);
  input.setAttribute("aria-invalid", "true"); // скринридер прочитает как "неверно"
  errEl.textContent = message;
  errEl.hidden = false;
}

function clearFieldError(name) {
  const { input, errEl } = fieldParts(name);
  input.removeAttribute("aria-invalid");
  errEl.textContent = "";
  errEl.hidden = true;
}

/* ---------- проверка одного поля ---------- */
// Возвращает текст ошибки ("" — всё в порядке). Побочный эффект: обновляет экран.
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

// Проверяет всё. Возвращает имя первого невалидного поля (или null).
function validateForm() {
  let firstInvalid = null;
  for (const name of FIELDS) {
    const message = checkField(name);
    if (message && !firstInvalid) firstInvalid = name;
  }
  return firstInvalid;
}

/* ---------- когда проверяем ---------- */
for (const name of FIELDS) {
  const input = form[name];
  // при уходе с поля (blur) — проверить это поле
  input.addEventListener("blur", () => checkField(name));
  // если начал исправлять — перепроверяем, только если ошибка уже была
  input.addEventListener("input", () => {
    if (input.getAttribute("aria-invalid") === "true") checkField(name);
  });
}
// если меняется основной пароль, поле "повтор" тоже перепроверяется
form.password.addEventListener("input", () => {
  if (form.password2.getAttribute("aria-invalid") === "true") checkField("password2");
});

/* ---------- отправка ---------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.hidden = true;
  formError.textContent = "";

  // ждём, пока библиотека телефона (данные о длине) полностью загрузится,
  // чтобы isValidNumber() давала достоверный ответ
  try {
    await phone.ready;
  } catch {
    /* если utils не загрузился, всё равно продолжаем — сервер в любом случае проверит */
  }

  const firstInvalid = validateForm();
  if (firstInvalid) {
    const input = form[firstInvalid];
    input.focus(); // фокус на первое неверное поле
    playOnce(input, "is-shake"); // и лёгкая тряска -> бросается в глаза
    return; // пока не валидно — запроса к API НЕТ
  }

  submitBtn.disabled = true; // защита от двойного клика
  try {
    await doRegister({
      name: form.name.value.trim(),
      surname: form.surname.value.trim(),
      email: form.email.value.trim(),
      phone: phone.getE164(), // E.164, например +998901234567
      password: form.password.value,
    });
    await mergeGuestCartIntoAccount();
    location.href = nextUrl;
  } catch (err) {
    submitBtn.disabled = false;
    // 409 — email уже зарегистрирован: привязываем ошибку к полю Email
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
