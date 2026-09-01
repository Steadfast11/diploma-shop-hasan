/* ============================================================
   pages/catalog.js — "Katalog" sahifasining bosh skripti
     1) header/footer
     2) (keyingi bosqich) api.getCategories() + api.getProducts(filtr)
     3) mahsulotlarni chizish + Apply filter / kategoriya bosish

   BU SAHIFA: getProducts({category, minPrice, maxPrice, page});
   filtr holati URL query'da saqlanadi.
   ============================================================ */

import { initLayout } from "../components.js";

initLayout();

/* --- VAQTINCHA: grid'ni ko'z bilan tekshirish uchun namuna kartochkalar.
   2-haftada api.js almashtiradi. --- */
function skeletonProductCard() {
  return `
    <article class="product-card">
      <div class="product-card__image"></div>
      <div class="product-card__info">
        <p class="product-card__title">Face Toner</p>
        <p class="product-card__price">$47.99</p>
      </div>
    </article>`;
}

const grid = document.querySelector("[data-products]");
if (grid) {
  grid.innerHTML = Array.from({ length: 12 }, skeletonProductCard).join("");
}
