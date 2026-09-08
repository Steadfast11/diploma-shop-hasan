/* ============================================================
   cart-store.js — SAVAT mantig'i (bitta manba).
   Ikki holat, tashqaridan bir xil ko'rinadi:
     - MEHMON  : savat localStorage'da (storage.js)
     - KIRGAN  : savat serverda (api.js)
   Sahifa "qaysi holat?" deb o'ylamaydi — faqat addItem/setQty/... deydi.

   Har javob bir xil shaklda:
     { items: [{ productId, title, price, image, qty, sum }], total }
   ============================================================ */

import * as api from "./api.js";
import { isLoggedIn } from "./auth.js";
import { getGuestCart, setGuestCart, clearGuestCart } from "./storage.js";

/* --- obunachilar (header'dagi "Bag (N)" yangilanib tursin) --- */
const listeners = new Set();
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function notify() {
  listeners.forEach((fn) => fn());
}

/* --- mehmon savatini { items, total } shakliga keltirish --- */
function guestCartShaped() {
  const items = getGuestCart().map((it) => ({ ...it, sum: it.price * it.qty }));
  const total = items.reduce((s, it) => s + it.sum, 0);
  return { items, total };
}

/* --- O'QISH --- */
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

/* --- YOZISH --- */
export async function addItem(product, qty = 1) {
  if (isLoggedIn()) {
    await api.addToCart(product._id, qty);
  } else {
    const cart = getGuestCart();
    const found = cart.find((it) => it.productId === product._id);
    if (found) found.qty = Math.min(20, found.qty + qty); // API bilan bir xil shift
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

// Server savatni o'zi o'zgartirgan holatda (masalan buyurtmadan keyin)
// header sonini ortiqcha API so'rovisiz qayta o'qitadi.
export function refresh() {
  notify();
}

/* Login paytida: mehmon savatidagilarni serverga ko'chiramiz, keyin tozalaymiz. */
export async function mergeGuestCartIntoAccount() {
  const guest = getGuestCart();
  const failed = [];
  for (const it of guest) {
    try {
      await api.addToCart(it.productId, it.qty);
    } catch {
      // O'tmagan mahsulotni yo'qotmaymiz — mehmon savatida qoldiramiz.
      failed.push(it);
    }
  }
  if (failed.length) {
    setGuestCart(failed);
    try {
      sessionStorage.setItem("diploma_shop_cart_merge_warning", "1");
    } catch {
      /* sessionStorage bloklangan bo'lsa ogohlantirishsiz davom etamiz */
    }
  } else {
    clearGuestCart();
  }
  notify();
  return { failed: failed.length };
}
