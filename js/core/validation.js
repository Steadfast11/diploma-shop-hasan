/* ============================================================
   validation.js — чистые валидаторы для формы Register
   Каждая функция принимает одно значение и:
     - если всё в порядке  -> "" (пустая строка)
     - если ошибка         -> текст на английском, показываемый пользователю
   Не работает с DOM -> легко тестировать, легко объяснить на доске.

   Логики телефона здесь НЕТ: правила сотен стран вручную не пропишешь
   -> она отдельно в `phone-input.js` (библиотека intl-tel-input).
   ============================================================ */

// Формат email. Вручную, но строго:
//  - локальная часть: буквы/цифры/некоторые символы, разделённые точкой
//    (подряд идущие точки или точка по краям -> отклоняется)
//  - домен: минимум два "label" (например  example . com), в конце >=2 буквы
//  - пробелов быть не должно вообще
const LOCAL = "[a-z0-9!#$%&'*+/=?^_`{|}~-]+";
const LABEL = "[a-z0-9](?:[a-z0-9-]*[a-z0-9])?";
export const EMAIL_RE = new RegExp(
  `^${LOCAL}(?:\\.${LOCAL})*@(?:${LABEL}\\.)+[a-z]{2,}$`,
  "i"
);

// Имя: только Unicode-буквы, 3–10 символов.
// \p{L} — буква любого языка (кириллица, латиница, арабский ...). Флаг "u" обязателен.
export function validateName(value) {
  const v = value.trim();
  if (!v) return "Enter your name";
  if (/[^\p{L}]/u.test(v)) return "Name can contain letters only";
  if (v.length < 3 || v.length > 10) return "Name must be 3–10 letters";
  return "";
}

// Фамилия: только буквы, 3–15 символов.
export function validateSurname(value) {
  const v = value.trim();
  if (!v) return "Enter your surname";
  if (/[^\p{L}]/u.test(v)) return "Surname can contain letters only";
  if (v.length < 3 || v.length > 15) return "Surname must be 3–15 letters";
  return "";
}

// Email: строгая проверка ФОРМАТА.
// ВАЖНО: фронтенд НЕ МОЖЕТ узнать, существует ли почтовый ящик на самом деле.
// Это можно определить только через письмо-подтверждение (verification link) на
// бэкенде. Поэтому здесь нет ни DNS-проверки, ни стороннего API "email checker".
export function validateEmail(value) {
  const v = value.trim();
  if (!v) return "Enter your email";
  if (/\s/.test(v)) return "Email cannot contain spaces";
  if (v.length > 254) return "Email is too long";
  if (!EMAIL_RE.test(v)) return "Enter a valid email address";
  return "";
}

// Пароль: 8–64 символа, минимум одна буква и одна цифра.
// Эквивалент regex: /^(?=.*\p{L})(?=.*\d).{8,64}$/u
// Проверяем по отдельности -> текст ошибки получается точным.
export function validatePassword(value) {
  if (value.length < 8) return "Password must be at least 8 characters";
  if (value.length > 64) return "Password must be at most 64 characters";
  if (!/\p{L}/u.test(value)) return "Password must include at least one letter";
  if (!/\d/.test(value)) return "Password must include at least one digit";
  return "";
}

// Повтор пароля: не пустой и совпадает с основным паролем.
export function validatePasswordConfirmation(password, confirmation) {
  if (!confirmation) return "Repeat your password";
  if (password !== confirmation) return "Passwords do not match";
  return "";
}
