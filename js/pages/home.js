/* ============================================================
   pages/home.js — страница "home"
     1) header/footer
     2) из API: bestsellers (4) + categories + newest (12)
     3) отрисовать каждый раздел в свой grid

   Каждый раздел загружается независимо: если один упадёт, остальные продолжат работать.
   ============================================================ */

import { initLayout } from "../components.js";
import * as api from "../core/api.js";
import {
  productCardHTML,
  showError,
  showEmpty,
  esc,
  skeletonCardsHTML,
  revealCards,
} from "../ui.js";

initLayout();

/* Карточка категории — ТОЛЬКО на главной странице ("Shop by category").
   c: { _id, title, image } — с бэкенда. */
function categoryCardHTML(c) {
  const bg = c.image
    ? `<img class="img-fallback" src="${esc(c.image)}" alt="" loading="lazy" />`
    : "";
  return `
    <a class="category" href="/pages/catalog.html?category=${encodeURIComponent(c._id)}">
      ${bg}
      <span class="btn-glass category-btn">${esc(c.title)}</span>
    </a>`;
}

// Общий помощник: загружает один раздел и отрисовывает его в grid.
//   selector    : элемент grid
//   loader      : () => Promise  (вызов api)
//   pick        : получить массив из ответа (например d => d.products)
//   render      : один элемент -> HTML
async function loadSection(selector, loader, pick, render, emptyText, skeletonCount = 4) {
  const box = document.querySelector(selector);
  if (!box) return;
  box.innerHTML = skeletonCardsHTML(skeletonCount);
  box.setAttribute("aria-busy", "true"); // для скринридера: "загружается"
  try {
    const list = pick(await loader());
    if (!list.length) return showEmpty(box, emptyText);
    box.innerHTML = list.map(render).join("");
    revealCards(box); // карточки появляются друг за другом
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
