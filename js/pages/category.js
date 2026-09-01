/* ============================================================
   pages/category.js — "Kategoriya" sahifasi
   URL'dan id oladi -> api.getCategoryProducts(id) -> sarlavha + grid.
   category.html?id=<kategoriya _id>
   ============================================================ */

import { initLayout } from "../components.js";
import * as api from "../api.js";
import { productCardHTML, showError, showEmpty, esc, skeletonCardsHTML } from "../ui.js";

initLayout();

const id = new URLSearchParams(location.search).get("id");
const titleEl = document.querySelector("[data-category-title]");
const grid = document.querySelector("[data-products]");

if (id) {
  const canonicalUrl = `${location.origin}${location.pathname}?id=${encodeURIComponent(id)}`;
  document.querySelector('link[rel="canonical"]')?.setAttribute("href", canonicalUrl);
  document.querySelector('meta[property="og:url"]')?.setAttribute("content", canonicalUrl);
}

async function load() {
  if (!id) {
    showError(grid, "No category selected");
    return;
  }
  grid.innerHTML = skeletonCardsHTML(8);
  try {
    const { category, products } = await api.getCategoryProducts(id);
    titleEl.textContent = category?.title || "Category";
    document.title = `Diploma Shop — ${titleEl.textContent}`;
    if (!products.length) {
      showEmpty(grid, "No products in this category");
      return;
    }
    grid.innerHTML = products.map(productCardHTML).join("");
  } catch (e) {
    if (e.status === 404) showError(grid, "Category not found");
    else showError(grid, e.message);
  }
}

load();
