/* ============================================================
   pages/category.js — "Kategoriya" sahifasi
   URL'dan id oladi -> api.getCategoryProducts(id) -> sarlavha + grid.
   category.html?id=<kategoriya _id>
   ============================================================ */

import { initLayout } from "../components.js";
import * as api from "../api.js";
import { productCardHTML, showError, showEmpty, esc } from "../ui.js";

initLayout();

const id = new URLSearchParams(location.search).get("id");
const titleEl = document.querySelector("[data-category-title]");
const grid = document.querySelector("[data-products]");

async function load() {
  if (!id) {
    showError(grid, "Kategoriya tanlanmagan");
    return;
  }
  grid.innerHTML = `<p class="state-message">Yuklanmoqda…</p>`;
  try {
    const { category, products } = await api.getCategoryProducts(id);
    titleEl.textContent = category?.title || "Kategoriya";
    document.title = `Diploma Shop — ${titleEl.textContent}`;
    if (!products.length) {
      showEmpty(grid, "Bu kategoriyada mahsulot yo'q");
      return;
    }
    grid.innerHTML = products.map(productCardHTML).join("");
  } catch (e) {
    if (e.status === 404) showError(grid, "Bunday kategoriya topilmadi");
    else showError(grid, e.message);
  }
}

load();
