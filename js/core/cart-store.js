/* ============================================================
   cart-store.js — логика КОРЗИНЫ (единый источник).
   Два состояния, снаружи выглядят одинаково:
     - ГОСТЬ    : корзина в localStorage (storage.js)
     - ВОШЁЛ    : корзина на сервере (api.js)
   Страница не думает "какое сейчас состояние?" — просто вызывает addItem/setQty/...

   Каждый ответ в одном и том же виде:
     { items: [{ productId, title, price, image, qty, sum }], total }
   ============================================================ */

import * as api from "./api.js";
import { isLoggedIn } from "./auth.js";
import { getGuestCart, setGuestCart, clearGuestCart } from "./storage.js";

/* --- подписчики (чтобы "Bag (N)" в шапке всегда обновлялся) --- */
const listeners = new Set();
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function notify() {
  listeners.forEach((fn) => fn());
}

/* --- приводит гостевую корзину к виду { items, total } --- */
function guestCartShaped() {
  const items = getGuestCart().map((it) => ({ ...it, sum: it.price * it.qty }));
  const total = items.reduce((s, it) => s + it.sum, 0);
  return { items, total };
}

/* --- ЧТЕНИЕ --- */
export async function getCart() {
  return isLoggedIn() ? api.getCart() : guestCartShaped();
}

export async function getCount() {
  try {
    const { items } = await getCart();
    return items.reduce((s, it) => s + it.qty, 0);
  } catch {
    return 0;
  }
}

/* --- ЗАПИСЬ --- */
export async function addItem(product, qty = 1) {
  if (isLoggedIn()) {
    await api.addToCart(product._id, qty);
  } else {
    const cart = getGuestCart();
    const found = cart.find((it) => it.productId === product._id);
    if (found) found.qty = Math.min(20, found.qty + qty); // тот же лимит, что и в API
    else {
      if (cart.length >= 20) {
        const err = new Error("Your bag can contain at most 20 different products");
        err.status = 409;
        throw err;
      }
      cart.push({
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.image,
        qty,
      });
    }
    setGuestCart(cart);
  }
  notify();
}

export async function setQty(productId, qty) {
  if (qty < 1) return removeItem(productId);
  if (isLoggedIn()) {
    await api.updateCartItem(productId, qty);
  } else {
    const cart = getGuestCart();
    const it = cart.find((x) => x.productId === productId);
    if (it) it.qty = Math.min(20, qty);
    setGuestCart(cart);
  }
  notify();
}

export async function removeItem(productId) {
  if (isLoggedIn()) await api.removeCartItem(productId);
  else setGuestCart(getGuestCart().filter((x) => x.productId !== productId));
  notify();
}

export async function clear() {
  if (isLoggedIn()) await api.clearCart();
  else clearGuestCart();
  notify();
}

// Когда сервер сам изменил корзину (например, после заказа) —
// заставляет перечитать число в шапке без лишнего запроса к API.
export function refresh() {
  notify();
}

/* Во время входа: переносим товары из гостевой корзины на сервер, затем очищаем её. */
export async function mergeGuestCartIntoAccount() {
  const guest = getGuestCart();
  const failed = [];
  for (const it of guest) {
    try {
      await api.addToCart(it.productId, it.qty);
    } catch {
      // Товар, который не удалось перенести, не теряем — оставляем в гостевой корзине.
      failed.push(it);
    }
  }
  if (failed.length) {
    setGuestCart(failed);
    try {
      sessionStorage.setItem("diploma_shop_cart_merge_warning", "1");
    } catch {
      /* если sessionStorage заблокирован, продолжаем без предупреждения */
    }
  } else {
    clearGuestCart();
  }
  notify();
  return { failed: failed.length };
}
