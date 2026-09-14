/* ============================================================
   storage.js — тонкая обёртка над localStorage
   Зачем обёртка:
     - localStorage хранит только ТЕКСТ -> JSON.parse/stringify здесь
     - если хранилище заполнено или заблокировано, будет ошибка -> try/catch в одном месте
     - имена ключей здесь (чтобы "diploma_shop_token" не было разбросано по коду)
   ============================================================ */

const KEYS = {
  token: "diploma_shop_token",
  user: "diploma_shop_user",
  guestCart: "diploma_shop_guest_cart",
};

// Внутреннее: безопасное чтение (при ошибке возвращает fallback)
function read(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}
// Внутреннее: безопасная запись
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* заполнено / заблокировано — молча пропускаем */
  }
}
function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* игнорируем */
  }
}

/* ---- Токен (признак входа) ---- */
export const getToken = () => read(KEYS.token);
export const setToken = (t) => write(KEYS.token, t);
export const clearToken = () => remove(KEYS.token);

/* ---- Сохранённый профиль ---- */
export const getUser = () => read(KEYS.user);
export const setUser = (u) => write(KEYS.user, u);
export const clearUser = () => remove(KEYS.user);

/* ---- Гостевая корзина (когда нет входа) ----
   Формат: [{ productId, title, price, image, qty }] */
export const getGuestCart = () => read(KEYS.guestCart, []);
export const setGuestCart = (items) => write(KEYS.guestCart, items);
export const clearGuestCart = () => remove(KEYS.guestCart);
