/* ============================================================
   pages/catalog.js — страница "Каталог"
     1) header/footer
     2) чтение состояния фильтра из URL query
     3) из API: категории + товары
     4) события клика по категории / слайдера / Apply Filter

   ВАЖНОЕ РЕШЕНИЕ: клик по категории / перетаскивание слайдера НЕ
   ПЕРЕЗАГРУЖАЕТ страницу. Они только задают "ожидающий" выбор. Фильтр
   применяется только при нажатии "Apply Filter": товары запрашиваются
   заново (grid обновляется), а URL query обновляется без reload
   (history.replaceState) — работают шаринг ссылки и кнопка "назад".
   ============================================================ */

import { initLayout } from "../components.js";
import * as api from "../core/api.js";
import { PAGE_SIZE } from "../core/config.js";
import { productCardHTML, showError, showEmpty, esc, toast, friendlyError, skeletonCardsHTML, revealCards } from "../ui.js";

initLayout();

/* --- 1. Состояние фильтра из URL query --- */
const params = new URLSearchParams(location.search);
const filter = {
  category: params.get("category") || "",
  minPrice: params.get("minPrice") || "",
  maxPrice: params.get("maxPrice") || "",
  page: Number(params.get("page")) || 1,
};

const grid = document.querySelector("[data-products]");
const categoryList = document.querySelector("[data-category-list]");
const categoryGroup = categoryList.closest(".filter-group");

/* --- Мобильное модальное окно фильтра --- */
const filterPanel = document.querySelector(".filter");
const filterOpenBtn = document.querySelector("[data-filter-open]");
/* Кнопок закрытия две: затемнённый фон и иконка сверху sheet. */
const filterCloseBtns = document.querySelectorAll("[data-filter-close]");
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

  // Фон не должен скроллиться. На сенсорном экране Lenis нет (motion.js),
  // поэтому блокируем скролл самого body.
  document.body.style.overflow = shouldOpen ? "hidden" : "";

  if (shouldOpen) {
    window.__lenis?.stop();
    filterPanel.querySelector("button")?.focus();
  } else {
    window.__lenis?.start();
    if (returnFocus && mobileFilter.matches) filterOpenBtn.focus();
  }
}

filterOpenBtn.addEventListener("click", () => setMobileFilter(true));
filterCloseBtns.forEach((btn) =>
  btn.addEventListener("click", () => setMobileFilter(false, true))
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.body.classList.contains("catalog-filter-open")) {
    setMobileFilter(false, true);
  }
});
mobileFilter.addEventListener("change", () => setMobileFilter(false));

/* --- 2. Категории --- */
async function loadCategories() {
  try {
    const { categories } = await api.getCategories();
    if (!categories.length) {
      categoryGroup.hidden = true; // категорий пока нет -> скрываем группу
      return;
    }
    categoryList.innerHTML = categories
      .map(
        (c) => `
      <button class="filter-row" type="button" data-category="${esc(c._id)}"
              aria-pressed="${c._id === filter.category}">
        <span>${esc(c.title)}</span>
        <img class="filter-chevron" src="/assets/icons/chevron.svg" alt="" width="16" height="16" />
      </button>`
      )
      .join("");
  } catch (e) {
    categoryGroup.hidden = true;
    console.warn("Kategoriyalar yuklanmadi:", e.message);
  }
}

/* --- 3. Товары --- */
const moreBtn = document.querySelector("[data-load-more]");
let shownPage = 1;

// Чтобы при изменении grid Lenis не застревал на старой высоте страницы.
// Ждём два кадра: сначала браузер размещает новые карточки,
// затем заново пересчитываются границы скролла и точки ScrollTrigger.
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

// Кнопка "Load more" видна, только если "pages" > 1.
function updateMoreBtn(totalPages) {
  moreBtn.hidden = shownPage >= totalPages;
}

async function loadProducts() {
  grid.innerHTML = skeletonCardsHTML(PAGE_SIZE);
  grid.setAttribute("aria-busy", "true"); // для скринридера: "загружается"
  moreBtn.hidden = true;
  try {
    const data = await fetchPage(1);
    shownPage = 1;
    if (!data.products.length) return showEmpty(grid, "No products found");
    grid.innerHTML = data.products.map(productCardHTML).join("");
    revealCards(grid); // карточки появляются друг за другом
    updateMoreBtn(data.pages);
    refreshScrollLayout();
  } catch (e) {
    showError(grid, e.message);
  } finally {
    grid.setAttribute("aria-busy", "false");
  }
}

// следующую страницу ДОБАВЛЯЕТ в конец grid (не заменяет)
moreBtn.addEventListener("click", async () => {
  moreBtn.disabled = true;
  try {
    const data = await fetchPage(shownPage + 1);
    shownPage += 1;
    // запоминаем, с чего начинаются новые карточки ->
    // анимация появления только у НИХ, старые не трогаем
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

/* --- 4. События ---
   ВАЖНО: клик по категории или перетаскивание слайдера НЕ ПЕРЕЗАГРУЖАЕТ
   страницу и не фильтрует сразу. Они только задают "ожидающий" выбор.
   Фильтр срабатывает только при нажатии "Apply Filter" (товары
   запрашиваются заново, страница не обновляется). URL тоже обновляется
   в этот момент (history.replaceState) — ссылкой можно поделиться, но reload не происходит. */

// ожидающий (ещё не применённый) выбор категории
let pendingCategory = filter.category;

categoryList.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-category]");
  if (!btn) return;
  const id = btn.dataset.category;
  // toggle: если эта категория уже выбрана -> отмена
  pendingCategory = pendingCategory === id ? "" : id;
  // режим одной категории — снимаем отметку с остальных
  categoryList.querySelectorAll("[data-category]").forEach((row) => {
    row.setAttribute("aria-pressed", String(row.dataset.category === pendingCategory));
  });
});

// Клик по заголовку Price -> открыть/закрыть панель слайдера
const priceToggle = document.querySelector("[data-price-toggle]");
const pricePanel = document.querySelector("[data-price-panel]");
priceToggle.addEventListener("click", () => {
  const open = priceToggle.getAttribute("aria-expanded") === "true";
  priceToggle.setAttribute("aria-expanded", String(!open));
  pricePanel.hidden = open;
});

// слайдер
const minInput = document.querySelector(".price-input-min");
const maxInput = document.querySelector(".price-input-max");
const fillEl = document.querySelector(".price-fill");
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

// "Clear filters" виден, если фильтр активен
function refreshClearBtn() {
  clearBtn.hidden = !(filter.category || filter.minPrice || filter.maxPrice);
}

// записывает состояние фильтра в URL query (reload НЕТ — только адресная строка)
function syncUrl() {
  const q = new URLSearchParams();
  if (filter.category) q.set("category", filter.category);
  if (filter.minPrice) q.set("minPrice", filter.minPrice);
  if (filter.maxPrice) q.set("maxPrice", filter.maxPrice);
  const s = q.toString();
  history.replaceState(null, "", s ? "?" + s : location.pathname);
}

// Apply Filter -> применяем ожидающий выбор и заново запрашиваем товары
document.querySelector("[data-apply-filter]").addEventListener("click", () => {
  filter.category = pendingCategory;
  filter.minPrice = String(Math.min(Number(minInput.value), Number(maxInput.value)));
  filter.maxPrice = String(Math.max(Number(minInput.value), Number(maxInput.value)));
  syncUrl();
  refreshClearBtn();
  loadProducts();
  setMobileFilter(false);
});

// "Clear filters" -> сбрасываем все фильтры (reload НЕТ)
clearBtn.addEventListener("click", () => {
  filter.category = "";
  filter.minPrice = "";
  filter.maxPrice = "";
  pendingCategory = "";
  categoryList.querySelectorAll("[data-category]").forEach((row) => {
    row.setAttribute("aria-pressed", "false");
  });
  minInput.value = 0;   // Figma (обновлено): диапазон 0-100$
  maxInput.value = 100;
  syncSlider();
  syncUrl();
  refreshClearBtn();
  loadProducts();
});
refreshClearBtn();

/* --- Поиск: в API нет поиска на стороне сервера (проверено — ?search=
   игнорируется). Поэтому фильтруем УЖЕ ЗАГРУЖЕННЫЕ карточки локально
   (client-side) по названию. --- */
const searchInput = document.querySelector("[data-search]");
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  const cards = grid.querySelectorAll(".card");
  let visible = 0;
  cards.forEach((card) => {
    const title = card.querySelector(".card-title")?.textContent.toLowerCase() || "";
    const match = !q || title.includes(q);
    card.hidden = !match;
    if (match) visible++;
  });
  let empty = grid.querySelector(".state-message-search");
  if (visible === 0 && cards.length) {
    if (!empty) {
      empty = document.createElement("p");
      empty.className = "state-message state-message-search";
      empty.textContent = "Nothing found";
      grid.appendChild(empty);
    }
  } else {
    empty?.remove();
  }
});

/* --- инициализация --- */
if (filter.minPrice) minInput.value = filter.minPrice;
if (filter.maxPrice) maxInput.value = filter.maxPrice;
syncSlider();

loadCategories();
loadProducts();
