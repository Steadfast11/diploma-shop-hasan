/* ============================================================
   pages/home.js — "home" sahifasi
     1) header/footer
     2) API'dan: bestsellers (4) + categories + newest (12)
     3) har bo'limni o'z gridiga chizish

   Har bo'lim mustaqil yuklanadi: biri yiqilsa qolgani ishlayveradi.
   ============================================================ */

import { initLayout } from "../components.js";
import * as api from "../api.js";
import {
  productCardHTML,
  showError,
  showEmpty,
  esc,
  skeletonCardsHTML,
  revealCards,
} from "../ui.js";

initLayout();

/* Kategoriya kartochkasi — FAQAT bosh sahifada ("Shop by category").
   c: { _id, title, image } — backenddan. */
function categoryCardHTML(c) {
  const bg = c.image
    ? `<img class="img-fallback" src="${esc(c.image)}" alt="" loading="lazy" />`
    : "";
  return `
    <a class="category-card" href="/pages/catalog.html?category=${encodeURIComponent(c._id)}">
      ${bg}
      <span class="btn-glass category-card__btn">${esc(c.title)}</span>
    </a>`;
}

// Bir bo'limni yuklab, gridga chizadigan umumiy yordamchi.
//   selector    : grid elementi
//   loader      : () => Promise  (api chaqiruvi)
//   pick        : javobdan massiv olish (masalan d => d.products)
//   render      : bitta element -> HTML
async function loadSection(selector, loader, pick, render, emptyText, skeletonCount = 4) {
  const box = document.querySelector(selector);
  if (!box) return;
  box.innerHTML = skeletonCardsHTML(skeletonCount);
  box.setAttribute("aria-busy", "true"); // skrinrider: "yuklanmoqda"
  try {
    const list = pick(await loader());
    if (!list.length) return showEmpty(box, emptyText);
    box.innerHTML = list.map(render).join("");
    revealCards(box); // kartochkalar birin-ketin chiqadi
  } catch (e) {
    showError(box, e.message);
  } finally {
    box.setAttribute("aria-busy", "false");
  }
}

loadSection(
  "[data-bestsellers]",
  () => api.getBestsellers(4),
  (d) => d.products,
  productCardHTML,
  "No bestsellers yet"
);

loadSection(
  "[data-categories]",
  () => api.getCategories(),
  (d) => d.categories,
  categoryCardHTML,
  "No categories yet"
);

loadSection(
  "[data-featured]",
  () => api.getNewest(12),
  (d) => d.products,
  productCardHTML,
  "No products yet",
  8
);
