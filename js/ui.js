/* ============================================================
   ui.js — takrorlanadigan mayda JS yordamchilar.
   Maqsad: sahifa skriptlari qisqa va o'qishli bo'lsin.
   ============================================================ */

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

  return `
    <a class="product-card" href="/pages/product.html?id=${encodeURIComponent(p._id)}">
      ${image}
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
