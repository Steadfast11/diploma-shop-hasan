/* ============================================================
   auth.js — управляет состоянием "кто вошёл".
   api.js отправляет запрос; auth.js сохраняет результат (токен + профиль)
   и отвечает на вопрос "сейчас есть вход?".
   ============================================================ */

import * as api from "./api.js";
import { getToken, setToken, clearToken, getUser, setUser, clearUser } from "./storage.js";

export const isLoggedIn = () => Boolean(getToken());
export const currentUser = () => getUser();

// `next` должен быть путём только внутри этого сайта. `//example.com` тоже
// считается внешним адресом, поэтому не может начинаться с двух слэшей.
export function safeNext(value, fallback = "/index.html") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  try {
    const url = new URL(value, location.origin);
    return url.origin === location.origin ? url.pathname + url.search + url.hash : fallback;
  } catch {
    return fallback;
  }
}

// Вход: сохраняем токен + профиль
export async function doLogin(credentials) {
  const { token, user } = await api.login(credentials);
  setToken(token);
  setUser(user);
  return user;
}

// Регистрация: API сразу возвращает токен -> сохраняем
export async function doRegister(data) {
  const { token, user } = await api.register(data);
  setToken(token);
  setUser(user);
  return user;
}

// Выход: сообщаем серверу (даже если будет ошибка) и очищаем локально
export async function doLogout() {
  try {
    await api.logout();
  } catch {
    /* токен мог уже стать недействительным — не важно */
  }
  clearToken();
  clearUser();
}

// Вызывается на защищённой странице (checkout корзины, профиль).
// Если входа нет — перенаправляет на страницу логина и возвращает false.
export function requireAuth() {
  if (isLoggedIn()) return true;
  const back = encodeURIComponent(location.pathname + location.search);
  location.href = `/pages/login.html?next=${back}`;
  return false;
}
