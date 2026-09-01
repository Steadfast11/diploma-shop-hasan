/* ============================================================
   pages/home.js — "home" sahifasining BOSH skripti
   Har sahifa skripti bir xil 4 bosqichda ishlaydi:
     1) DOM tayyor bo'lishini kutish
     2) components.js -> header/footer
     3) api.js -> kerakli ma'lumot   (hozircha: namuna)
     4) ma'lumotni DOM'ga chizish + hodisalarni ulash

   BU SAHIFA: hero + Best sellers + Shop by category + Featured products.
   ============================================================ */

import { initLayout } from "../components.js";

// 1) header + footer
initLayout();

/* --- VAQTINCHA: grid oralig'ini ko'z bilan tekshirish uchun namuna kartochkalar.
   2-haftada bular api.js orqali real mahsulotlar bilan almashtiriladi. --- */

// Bitta bo'sh mahsulot kartochkasi (rasm/nom/narx BACKENDDAN keladi)
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

// Bitta kategoriya kartochkasi
function skeletonCategoryCard(name) {
  return `
    <a class="category-card" href="/pages/category.html">
      <span class="btn-glass category-card__btn">${name}</span>
    </a>`;
}

function fill(selector, html) {
  const box = document.querySelector(selector);
  if (box) box.innerHTML = html;
}

fill("[data-bestsellers]", Array.from({ length: 4 }, skeletonProductCard).join(""));
fill("[data-featured]", Array.from({ length: 12 }, skeletonProductCard).join(""));
fill(
  "[data-categories]",
  ["Creams", "Serums", "Lotion"].map(skeletonCategoryCard).join("")
);
