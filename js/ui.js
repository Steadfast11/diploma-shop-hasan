/* ============================================================
   ui.js — takrorlanadigan mayda JS yordamchilar.
   Maqsad: sahifa skriptlari qisqa va o'qishli bo'lsin.
   ============================================================ */

import { isFavorite } from "./favorites.js";

// Narx: 19.99 -> "$19.99"
export const money = (n) => "$" + Number(n).toFixed(2);

// HTML'ga xavfsiz qo'yish uchun matnni "tozalash".
// Nega: mahsulot nomi/izoh backenddan keladi. Ichida <script> yoki
// < > belgilari bo'lsa, ular MATN bo'lib chizilsin, HTML bo'lib emas.
export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

/* Mahsulot kartochkasi (HTML matn).
   Bosh sahifa, katalog, kategoriya, profil — hammasi shuni ishlatadi.
   p: { _id, title, price, image } — BACKENDDAN keladi. */
export function productCardHTML(p) {
  const image = p.image
    ? `<img class="product-card__image" src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" />`
    : `<div class="product-card__image"></div>`; // rasm yo'q -> bo'sh kulrang
  const fav = isFavorite(p._id);

  return `
    <a class="product-card" href="/pages/product.html?id=${encodeURIComponent(p._id)}">
      <div class="product-card__media">
        ${image}
        <button class="product-card__fav${fav ? " is-fav" : ""}" type="button" data-fav
                data-id="${esc(p._id)}" data-title="${esc(p.title)}"
                data-price="${p.price}" data-image="${esc(p.image || "")}"
                aria-pressed="${fav}" aria-label="Sevimlilarga qo'shish">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M12 21s-7.5-4.6-10-9.3C.5 8.4 2 4.5 5.7 4.5c2 0 3.6 1.2 4.3 2.8.7-1.6 2.3-2.8 4.3-2.8 3.7 0 5.2 3.9 3.7 7.2C19.5 16.4 12 21 12 21z"/>
          </svg>
        </button>
      </div>
      <div class="product-card__info">
        <p class="product-card__title">${esc(p.title)}</p>
        <p class="product-card__price">${money(p.price)}</p>
      </div>
    </a>`;
}

// Konteynerga xato xabarini chizish (API yiqilganda)
export function showError(container, message) {
  if (container) {
    container.innerHTML = `<p class="state-message state-message--error">${esc(message)}</p>`;
  }
}

// Konteynerga "bo'sh" xabarini chizish (natija yo'q)
export function showEmpty(container, message) {
  if (container) {
    container.innerHTML = `<p class="state-message">${esc(message)}</p>`;
  }
}

/* ---------- Toast (mayda bildirishnoma) ----------
   alert() o'rniga: ekran pastida chiqib, o'zi yo'qoladi.
   type: "" (oddiy) yoki "error" (qizil). */
let toastTimer;
export function toast(message, type = "") {
  let box = document.querySelector(".toast");
  if (!box) {
    box = document.createElement("div");
    box.className = "toast";
    document.body.appendChild(box);
  }
  box.className = "toast" + (type ? " toast--" + type : "");
  box.textContent = message;
  box.classList.add("is-shown");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.remove("is-shown"), 3200);
}

/* API xatosini foydalanuvchiga tushunarli qilib beradi (API matni ruscha). */
export function friendlyError(err) {
  const byStatus = {
    401: "Sessiya tugadi — qaytadan kiring",
    403: "Bunga ruxsat yo'q",
    404: "Topilmadi",
    409: "Bajarib bo'lmadi (limit yoki ziddiyat)",
    429: "Juda ko'p so'rov — biroz kuting",
  };
  return byStatus[err?.status] || err?.message || "Xatolik yuz berdi";
}

/* ---------- Modal oyna (izoh yozish / "Thank you") ----------
   openModal o'z DOM'ini yaratadi (komponent fayl kerak emas).
   opts: { title, bodyHTML, buttonText, onConfirm(modalEl) } */
function onEsc(e) {
  if (e.key === "Escape") closeModal();
}
export function closeModal() {
  document.querySelector(".modal")?.remove();
  document.removeEventListener("keydown", onEsc);
  document.body.style.overflow = "";
}
export function openModal({ title, bodyHTML = "", buttonText = "OK", onConfirm }) {
  closeModal();
  const el = document.createElement("div");
  el.className = "modal";
  el.innerHTML = `
    <div class="modal__overlay" data-close></div>
    <div class="modal__box" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <p class="modal__title">${esc(title)}</p>
      <div class="modal__body">${bodyHTML}</div>
      <button class="modal__btn" type="button" data-confirm>${esc(buttonText)}</button>
    </div>`;
  el.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) return closeModal();
    if (e.target.closest("[data-confirm]")) onConfirm ? onConfirm(el) : closeModal();
  });
  document.addEventListener("keydown", onEsc);
  document.body.style.overflow = "hidden"; // orqa fon skroll qilinmasin
  document.body.appendChild(el);
  return el;
}
