/* ============================================================
   auth.js — "kim kirgan" holatini boshqaradi.
   api.js so'rov yuboradi; auth.js natijani (token + profil) saqlaydi
   va "hozir kirilganmi?" degan savolga javob beradi.
   ============================================================ */

import * as api from "./api.js";
import { getToken, setToken, clearToken, getUser, setUser, clearUser } from "./storage.js";

export const isLoggedIn = () => Boolean(getToken());
export const currentUser = () => getUser();

// Kirish: token + profilni saqlaymiz
export async function doLogin(credentials) {
  const { token, user } = await api.login(credentials);
  setToken(token);
  setUser(user);
  return user;
}

// Ro'yxatdan o'tish: API darrov token qaytaradi -> saqlaymiz
export async function doRegister(data) {
  const { token, user } = await api.register(data);
  setToken(token);
  setUser(user);
  return user;
}

// Chiqish: serverga xabar beramiz (xato bo'lsa ham) va mahalliy tozalaymiz
export async function doLogout() {
  try {
    await api.logout();
  } catch {
    /* token allaqachon yaroqsiz bo'lishi mumkin — muhim emas */
  }
  clearToken();
  clearUser();
}

// Himoyalangan sahifada (savat checkout, profil) chaqiriladi.
// Kirilmagan bo'lsa login sahifasiga yuboradi va false qaytaradi.
export function requireAuth() {
  if (isLoggedIn()) return true;
  const back = encodeURIComponent(location.pathname + location.search);
  location.href = `/pages/login.html?next=${back}`;
  return false;
}
