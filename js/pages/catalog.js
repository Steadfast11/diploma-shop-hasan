/* ============================================================
   pages/catalog.js — "Katalog" sahifasi
     1) header/footer
     2) URL query'dan filtr holatini o'qish
     3) API'dan kategoriyalar + mahsulotlar
     4) kategoriya bosish / slider / Apply Filter hodisalari

   MUHIM QAROR: filtr o'zgarganda URL query yangilanadi va sahifa
   QAYTA YUKLANADI. Nega: holat bitta joyda (URL), qayta chizish
   mantig'i shart emas, "orqaga" tugmasi va havola ulashish ishlaydi.
   ============================================================ */

import { initLayout } from "../components.js";
import * as api from "../api.js";
import { PAGE_SIZE } from "../config.js";
import { productCardHTML, showError, showEmpty, esc, toast, friendlyError } from "../ui.js";

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

function fetchPage(page) {
  return api.getProducts({
    category: filter.category || undefined,
    minPrice: filter.minPrice || undefined,
    maxPrice: filter.maxPrice || undefined,
    page,
    limit: PAGE_SIZE,
  });
}

// "pages" > 1 bo'lsagina "Ko'proq yuklash" tugmasi ko'rinadi.
function updateMoreBtn(totalPages) {
  moreBtn.hidden = shownPage >= totalPages;
}

async function loadProducts() {
  grid.innerHTML = `<p class="state-message">Yuklanmoqda…</p>`;
  moreBtn.hidden = true;
  try {
    const data = await fetchPage(1);
    shownPage = 1;
    if (!data.products.length) return showEmpty(grid, "Bunday mahsulot topilmadi");
    grid.innerHTML = data.products.map(productCardHTML).join("");
    updateMoreBtn(data.pages);
  } catch (e) {
    showError(grid, e.message);
  }
}

// keyingi sahifani grid oxiriga QO'SHADI (almashtirmaydi)
moreBtn.addEventListener("click", async () => {
  moreBtn.disabled = true;
  try {
    const data = await fetchPage(shownPage + 1);
    shownPage += 1;
    grid.insertAdjacentHTML("beforeend", data.products.map(productCardHTML).join(""));
    updateMoreBtn(data.pages);
  } catch (e) {
    toast(friendlyError(e), "error");
  } finally {
    moreBtn.disabled = false;
  }
});

/* --- 4. Hodisalar --- */

// kategoriya bosilganda -> URL yangilanadi -> reload (yuqoridagi qaror)
categoryList.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-category]");
  if (!btn) return;
  const id = btn.dataset.category;
  const next = new URLSearchParams(location.search);
  // shu kategoriya allaqachon tanlangan bo'lsa -> olib tashlaymiz (toggle)
  if (next.get("category") === id) next.delete("category");
  else next.set("category", id);
  next.delete("page");
  location.search = next.toString();
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

// Apply Filter -> slider + kategoriya -> URL -> reload
document.querySelector("[data-apply-filter]").addEventListener("click", () => {
  const next = new URLSearchParams(location.search);
  next.set("minPrice", Math.min(Number(minInput.value), Number(maxInput.value)));
  next.set("maxPrice", Math.max(Number(minInput.value), Number(maxInput.value)));
  next.delete("page");
  location.search = next.toString();
});

// "Filtrni tozalash" — biror filtr faol bo'lsagina ko'rinadi
const clearBtn = document.querySelector("[data-clear-filter]");
clearBtn.hidden = !(filter.category || filter.minPrice || filter.maxPrice);
clearBtn.addEventListener("click", () => {
  location.href = location.pathname; // query'siz -> hammasi
});

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
      empty.textContent = "Hech narsa topilmadi";
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
