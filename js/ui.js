/* ============================================================
   ui.js — takrorlanadigan mayda JS yordamchilar.
   Maqsad: sahifa skriptlari qisqa va o'qishli bo'lsin.
   ============================================================ */

import { isFavorite } from "./favorites.js";

// Narx: 19.99 -> "$19.99"
export const money = (n) => "$" + Number(n).toFixed(2);

// Telefon: "998901234500" -> "+998 90 123 45 00" (API faqat raqam saqlaydi).
export function formatPhone(digits) {
  const d = String(digits ?? "").replace(/\D/g, "");
  if (d.length < 9) return digits || "";
  const cc = d.slice(0, d.length - 9); // masalan "998"
  const rest = d.slice(-9); // "901234500"
  const parts = [rest.slice(0, 2), rest.slice(2, 5), rest.slice(5, 7), rest.slice(7, 9)];
  return `+${cc} ${parts.join(" ")}`.trim();
}

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
    ? `<img class="product-card__image img-fallback" src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" />`
    : `<div class="product-card__image"></div>`; // rasm yo'q -> bo'sh kulrang
  const fav = isFavorite(p._id);

  return `
    <article class="product-card">
      <a class="product-card__link" href="/pages/product.html?id=${encodeURIComponent(p._id)}">
        <div class="product-card__media">
          ${image}
        </div>
        <div class="product-card__info">
          <p class="product-card__title">${esc(p.title)}</p>
          <p class="product-card__price">${money(p.price)}</p>
        </div>
      </a>
      <button class="product-card__fav${fav ? " is-fav" : ""}" type="button" data-fav
              data-id="${esc(p._id)}" data-title="${esc(p.title)}"
              data-price="${p.price}" data-image="${esc(p.image || "")}"
              aria-pressed="${fav}" aria-label="${fav ? "Remove from" : "Add to"} favorites">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M12 21s-7.5-4.6-10-9.3C.5 8.4 2 4.5 5.7 4.5c2 0 3.6 1.2 4.3 2.8.7-1.6 2.3-2.8 4.3-2.8 3.7 0 5.2 3.9 3.7 7.2C19.5 16.4 12 21 12 21z"/>
        </svg>
      </button>
    </article>`;
}

// N ta "skelet" kartochka (yuklanayotganda ko'rsatiladi — "Loading…" matni
// o'rniga). Faqat kulrang, pulsatsiya qiladigan qutilar.
export function skeletonCardsHTML(n = 4) {
  return Array.from(
    { length: n },
    () => `
    <div class="product-card skeleton" aria-hidden="true">
      <div class="product-card__image"></div>
      <div class="product-card__info">
        <span class="skeleton__line"></span>
      </div>
    </div>`
  ).join("");
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
    box.setAttribute("aria-live", "polite");
    box.setAttribute("aria-atomic", "true");
    document.body.appendChild(box);
  }
  box.setAttribute("role", type === "error" ? "alert" : "status");
  box.className = "toast" + (type ? " toast--" + type : "");
  box.textContent = message;
  box.classList.add("is-shown");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.remove("is-shown"), 3200);
}

/* API xatosini foydalanuvchiga tushunarli qilib beradi (API matni ruscha). */
export function friendlyError(err) {
  const byStatus = {
    401: "Session expired — please log in again",
    403: "You don't have permission",
    404: "Not found",
    409: "Couldn't complete (limit or conflict)",
    429: "Too many requests — please wait",
  };
  return byStatus[err?.status] || err?.message || "Something went wrong";
}

/* ---------- Modal oyna (izoh yozish / "Thank you") ----------
   openModal o'z DOM'ini yaratadi (komponent fayl kerak emas).
   opts: { title, bodyHTML, buttonText, onConfirm(modalEl) } */
let returnFocus = null;
function onModalKeydown(e) {
  if (e.key === "Escape") return closeModal();
  if (e.key !== "Tab") return;
  const modal = document.querySelector(".modal");
  const focusable = [...modal.querySelectorAll("button, textarea, input, select, a[href]")]
    .filter((node) => !node.disabled && node.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
export function closeModal() {
  document.querySelector(".modal")?.remove();
  document.removeEventListener("keydown", onModalKeydown);
  document.body.style.overflow = "";
  returnFocus?.focus();
  returnFocus = null;
}
export function openModal({ title, bodyHTML = "", buttonText = "OK", onConfirm }) {
  closeModal();
  returnFocus = document.activeElement;
  const el = document.createElement("div");
  el.className = "modal";
  el.innerHTML = `
    <div class="modal__overlay" data-close></div>
    <div class="modal__box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <p class="modal__title" id="modal-title">${esc(title)}</p>
      <div class="modal__body">${bodyHTML}</div>
      <button class="modal__btn" type="button" data-confirm>${esc(buttonText)}</button>
    </div>`;
  el.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) return closeModal();
    if (e.target.closest("[data-confirm]")) onConfirm ? onConfirm(el) : closeModal();
  });
  document.addEventListener("keydown", onModalKeydown);
  document.body.style.overflow = "hidden"; // orqa fon skroll qilinmasin
  document.body.appendChild(el);
  (el.querySelector("textarea, input, select") || el.querySelector("[data-confirm]"))?.focus();
  return el;
}
