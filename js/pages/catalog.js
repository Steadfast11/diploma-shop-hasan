/* ============================================================
   pages/catalog.js — "Katalog" sahifasi
     1) header/footer
     2) URL query'dan filtr holatini o'qish
     3) API'dan kategoriyalar + mahsulotlar
     4) kategoriya bosish / slider / Apply Filter hodisalari

   MUHIM QAROR: kategoriya bosish / slider surish SAHIFANI QAYTA
   YUKLAMAYDI. Ular faqat "kutilayotgan" tanlovni belgilaydi. Filtr
   faqat "Apply Filter" bosilganda ishga tushadi: mahsulotlar qayta
   olinadi (grid almashadi), URL query esa reload'siz yangilanadi
   (history.replaceState) — havola ulashish/orqaga tugmasi ishlaydi.
   ============================================================ */

import { initLayout } from "../components.js";
import * as api from "../api.js";
import { PAGE_SIZE } from "../config.js";
import { productCardHTML, showError, showEmpty, esc, toast, friendlyError, skeletonCardsHTML, revealCards } from "../ui.js";

initLayout();

/* --- 1. URL query'dan filtr holati --- */
const params = new URLSearchParams(location.search);
const filter = {
  category: params.get("category") || "",
  minPrice: params.get("minPrice") || "",
  maxPrice: params.get("maxPrice") || "",
  page: Number(params.get("page")) || 1,
};

const grid = document.querySelector("[data-products]");
const categoryList = document.querySelector("[data-category-list]");
const categoryGroup = categoryList.closest(".filters__group");

/* --- Mobil filter modal --- */
const filterPanel = document.querySelector(".filters");
const filterOpenBtn = document.querySelector("[data-filter-open]");
const filterCloseBtn = document.querySelector("[data-filter-close]");
const mobileFilter = window.matchMedia("(max-width: 768px)");

function setMobileFilter(open, returnFocus = false) {
  const shouldOpen = open && mobileFilter.matches;
  document.body.classList.toggle("catalog-filter-open", shouldOpen);
  filterOpenBtn.setAttribute("aria-expanded", String(shouldOpen));

  if (mobileFilter.matches) {
    filterPanel.setAttribute("role", "dialog");
    filterPanel.setAttribute("aria-modal", "true");
    filterPanel.setAttribute("aria-label", "Product filters");
  } else {
    filterPanel.removeAttribute("role");
    filterPanel.removeAttribute("aria-modal");
    filterPanel.removeAttribute("aria-label");
  }

  if (shouldOpen) {
    window.__lenis?.stop();
    filterPanel.querySelector("button")?.focus();
  } else {
    window.__lenis?.start();
    if (returnFocus && mobileFilter.matches) filterOpenBtn.focus();
  }
}

filterOpenBtn.addEventListener("click", () => setMobileFilter(true));
filterCloseBtn.addEventListener("click", () => setMobileFilter(false, true));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.body.classList.contains("catalog-filter-open")) {
    setMobileFilter(false, true);
  }
});
mobileFilter.addEventListener("change", () => setMobileFilter(false));

/* --- 2. Kategoriyalar --- */
async function loadCategories() {
  try {
    const { categories } = await api.getCategories();
    if (!categories.length) {
      categoryGroup.hidden = true; // hali kategoriya yo'q -> guruhni yashiramiz
      return;
    }
    categoryList.innerHTML = categories
      .map(
        (c) => `
      <button class="filters__row" type="button" data-category="${esc(c._id)}"
              aria-pressed="${c._id === filter.category}">
        <span>${esc(c.title)}</span>
        <img class="filters__chevron" src="/assets/icons/chevron.svg" alt="" width="16" height="16" />
      </button>`
      )
      .join("");
  } catch (e) {
    categoryGroup.hidden = true;
    console.warn("Kategoriyalar yuklanmadi:", e.message);
  }
}

/* --- 3. Mahsulotlar --- */
const moreBtn = document.querySelector("[data-load-more]");
let shownPage = 1;

// Grid o'zgarganda Lenis eski sahifa balandligida qolib ketmasin.
// Ikki kadr kutamiz: brauzer avval yangi kartalarni joylashtirib oladi,
// keyin skroll chegarasi va ScrollTrigger nuqtalari qayta hisoblanadi.
function refreshScrollLayout() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__lenis?.resize();
      window.ScrollTrigger?.refresh();
    });
  });
}

function fetchPage(page) {
  return api.getProducts({
    category: filter.category || undefined,
    minPrice: filter.minPrice || undefined,
    maxPrice: filter.maxPrice || undefined,
    page,
    limit: PAGE_SIZE,
  });
}

// "pages" > 1 bo'lsagina "Load more" tugmasi ko'rinadi.
function updateMoreBtn(totalPages) {
  moreBtn.hidden = shownPage >= totalPages;
}

async function loadProducts() {
  grid.innerHTML = skeletonCardsHTML(PAGE_SIZE);
  grid.setAttribute("aria-busy", "true"); // skrinrider: "yuklanmoqda"
  moreBtn.hidden = true;
  try {
    const data = await fetchPage(1);
    shownPage = 1;
    if (!data.products.length) return showEmpty(grid, "No products found");
    grid.innerHTML = data.products.map(productCardHTML).join("");
    revealCards(grid); // kartochkalar birin-ketin chiqadi
    updateMoreBtn(data.pages);
    refreshScrollLayout();
  } catch (e) {
    showError(grid, e.message);
  } finally {
    grid.setAttribute("aria-busy", "false");
  }
}

// keyingi sahifani grid oxiriga QO'SHADI (almashtirmaydi)
moreBtn.addEventListener("click", async () => {
  moreBtn.disabled = true;
  try {
    const data = await fetchPage(shownPage + 1);
    shownPage += 1;
    // yangi kartochkalar qayerdan boshlanishini eslab qolamiz ->
    // faqat ULAR animatsiya bilan chiqadi, eskilariga tegilmaydi
    const firstNew = grid.children.length;
    grid.insertAdjacentHTML("beforeend", data.products.map(productCardHTML).join(""));
    revealCards(grid, firstNew);
    updateMoreBtn(data.pages);
    refreshScrollLayout();
  } catch (e) {
    toast(friendlyError(e), "error");
  } finally {
    moreBtn.disabled = false;
  }
});

/* --- 4. Hodisalar ---
   MUHIM: kategoriya bosish yoki slider surish SAHIFANI QAYTA YUKLAMAYDI va
   darrov filtrlamaydi. Ular faqat "kutilayotgan" tanlovni belgilaydi.
   Filtr faqat "Apply Filter" bosilganda ishlaydi (mahsulotlar qayta
   olinadi, sahifa yangilanmaydi). URL ham shu payt yangilanadi
   (history.replaceState) — havola ulashsa bo'ladi, lekin reload yo'q. */

// kutilayotgan (hali qo'llanmagan) kategoriya tanlovi
let pendingCategory = filter.category;

categoryList.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-category]");
  if (!btn) return;
  const id = btn.dataset.category;
  // toggle: shu kategoriya tanlangan bo'lsa -> bekor
  pendingCategory = pendingCategory === id ? "" : id;
  // bitta kategoriya rejimida — boshqalarning belgisini olib tashlaymiz
  categoryList.querySelectorAll("[data-category]").forEach((row) => {
    row.setAttribute("aria-pressed", String(row.dataset.category === pendingCategory));
  });
});

// Price sarlavhasini bosish -> slider panelini och/yop
const priceToggle = document.querySelector("[data-price-toggle]");
const pricePanel = document.querySelector("[data-price-panel]");
priceToggle.addEventListener("click", () => {
  const open = priceToggle.getAttribute("aria-expanded") === "true";
  priceToggle.setAttribute("aria-expanded", String(!open));
  pricePanel.hidden = open;
});

// slider
const minInput = document.querySelector(".price-range__input--min");
const maxInput = document.querySelector(".price-range__input--max");
const fillEl = document.querySelector(".price-range__fill");
const minLabel = document.querySelector("[data-price-min]");
const maxLabel = document.querySelector("[data-price-max]");
const sliderMax = Number(minInput.max);

function syncSlider() {
  const lo = Math.min(Number(minInput.value), Number(maxInput.value));
  const hi = Math.max(Number(minInput.value), Number(maxInput.value));
  minLabel.textContent = "$" + lo;
  maxLabel.textContent = "$" + hi;
  fillEl.style.left = (lo / sliderMax) * 100 + "%";
  fillEl.style.width = ((hi - lo) / sliderMax) * 100 + "%";
}
minInput.addEventListener("input", syncSlider);
maxInput.addEventListener("input", syncSlider);

const clearBtn = document.querySelector("[data-clear-filter]");

// Filtr faol bo'lsa "Clear filters" ko'rinadi
function refreshClearBtn() {
  clearBtn.hidden = !(filter.category || filter.minPrice || filter.maxPrice);
}

// filter holatini URL query'ga yozadi (reload YO'Q — faqat manzil satri)
function syncUrl() {
  const q = new URLSearchParams();
  if (filter.category) q.set("category", filter.category);
  if (filter.minPrice) q.set("minPrice", filter.minPrice);
  if (filter.maxPrice) q.set("maxPrice", filter.maxPrice);
  const s = q.toString();
  history.replaceState(null, "", s ? "?" + s : location.pathname);
}

// Apply Filter -> kutilayotgan tanlovlarni qo'llaymiz va mahsulotlarni qayta olamiz
document.querySelector("[data-apply-filter]").addEventListener("click", () => {
  filter.category = pendingCategory;
  filter.minPrice = String(Math.min(Number(minInput.value), Number(maxInput.value)));
  filter.maxPrice = String(Math.max(Number(minInput.value), Number(maxInput.value)));
  syncUrl();
  refreshClearBtn();
  loadProducts();
  setMobileFilter(false);
});

// "Clear filters" -> hamma filtrni bekor qilamiz (reload YO'Q)
clearBtn.addEventListener("click", () => {
  filter.category = "";
  filter.minPrice = "";
  filter.maxPrice = "";
  pendingCategory = "";
  categoryList.querySelectorAll("[data-category]").forEach((row) => {
    row.setAttribute("aria-pressed", "false");
  });
  minInput.value = 0;   // Figma (yangilangan): oraliq 0-100$
  maxInput.value = 100;
  syncSlider();
  syncUrl();
  refreshClearBtn();
  loadProducts();
});
refreshClearBtn();

/* --- Qidiruv: API'da server-tomon qidiruv yo'q (tekshirildi — ?search=
   e'tiborsiz qoldiriladi). Shuning uchun HOZIR YUKLANGAN kartochkalarni
   nomi bo'yicha mahalliy (client-side) filtrlaymiz. --- */
const searchInput = document.querySelector("[data-search]");
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  const cards = grid.querySelectorAll(".product-card");
  let visible = 0;
  cards.forEach((card) => {
    const title = card.querySelector(".product-card__title")?.textContent.toLowerCase() || "";
    const match = !q || title.includes(q);
    card.hidden = !match;
    if (match) visible++;
  });
  let empty = grid.querySelector(".state-message--search");
  if (visible === 0 && cards.length) {
    if (!empty) {
      empty = document.createElement("p");
      empty.className = "state-message state-message--search";
      empty.textContent = "Nothing found";
      grid.appendChild(empty);
    }
  } else {
    empty?.remove();
  }
});

/* --- boshlash --- */
if (filter.minPrice) minInput.value = filter.minPrice;
if (filter.maxPrice) maxInput.value = filter.maxPrice;
syncSlider();

loadCategories();
loadProducts();
