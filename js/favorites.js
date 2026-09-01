/* ============================================================
   favorites.js — Sevimlilar (wishlist)
   API'da bunday endpoint yo'q -> localStorage'da saqlanadi
   (brauzerga tegishli, akkauntlararo sinxron emas — API cheklovi).
   ============================================================ */

import { getFavorites, setFavorites } from "./storage.js";

export function isFavorite(id) {
  return getFavorites().some((p) => p._id === id);
}

// p: { _id, title, price, image } — kartochka/mahsulot ma'lumoti
export function toggleFavorite(p) {
  const list = getFavorites();
  const idx = list.findIndex((x) => x._id === p._id);
  if (idx >= 0) list.splice(idx, 1);
  else list.push({ _id: p._id, title: p.title, price: p.price, image: p.image });
  setFavorites(list);
  return idx < 0; // true = endi sevimli bo'ldi
}

export { getFavorites };
