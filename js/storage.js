/* ============================================================
   storage.js — localStorage ustidan yupqa qobiq
   Nega qobiq:
     - localStorage faqat MATN saqlaydi -> JSON.parse/stringify shu yerda
     - to'la yoki bloklangan bo'lsa xato beradi -> try/catch bir joyda
     - kalit nomlari shu yerda (kod bo'ylab "diploma_shop_token" yozilmasin)
   ============================================================ */

const KEYS = {
  token: "diploma_shop_token",
  user: "diploma_shop_user",
  guestCart: "diploma_shop_guest_cart",
  favorites: "diploma_shop_favorites",
};

// Ichki: xavfsiz o'qish (xato bo'lsa fallback qaytaradi)
function read(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}
// Ichki: xavfsiz yozish
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* to'la / bloklangan — jimgina o'tamiz */
  }
}
function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* e'tiborsiz */
  }
}

/* ---- Token (kirish belgisi) ---- */
export const getToken = () => read(KEYS.token);
export const setToken = (t) => write(KEYS.token, t);
export const clearToken = () => remove(KEYS.token);

/* ---- Saqlangan profil ---- */
export const getUser = () => read(KEYS.user);
export const setUser = (u) => write(KEYS.user, u);
export const clearUser = () => remove(KEYS.user);

/* ---- Mehmon savati (kirilmagan holatda) ----
   Format: [{ productId, title, price, image, qty }] */
export const getGuestCart = () => read(KEYS.guestCart, []);
export const setGuestCart = (items) => write(KEYS.guestCart, items);
export const clearGuestCart = () => remove(KEYS.guestCart);

/* ---- Sevimlilar ----
   API'da wishlist endpointi yo'q -> mahalliy saqlanadi (brauzerga tegishli).
   Format: [{ _id, title, price, image }] */
export const getFavorites = () => read(KEYS.favorites, []);
export const setFavorites = (items) => write(KEYS.favorites, items);
