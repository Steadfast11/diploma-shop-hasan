/* ============================================================
   pages/product.js — страница товара
   product.html?id=<_id товара>
     1) header/footer
     2) api.getProduct(id) -> галерея + информация + отзывы
     3) qty +/- , Add to cart, "Write a Review" (модал), удаление отзыва

   В документации API не описаны `description` товара / несколько
   изображений — код готов к обоим случаям (если их нет, скрываем).
   ============================================================ */

import { initLayout } from "../components.js";
import * as api from "../core/api.js";
import * as cartStore from "../core/cart-store.js";
import { isLoggedIn, currentUser } from "../core/auth.js";
import {
  money,
  esc,
  openModal,
  closeModal,
  showError,
  toast,
  friendlyError,
  revealCards,
  flyToBag,
  playOnce,
} from "../ui.js";

initLayout();

const id = new URLSearchParams(location.search).get("id");
const galleryEl = document.querySelector("[data-gallery]");
const infoEl = document.querySelector("[data-info]");
const reviewsEl = document.querySelector("[data-reviews]");
const countEl = document.querySelector("[data-review-count]");

/* Назад: если есть история — на один шаг назад, если страница открыта
   напрямую по ссылке (история пуста) — возвращаемся в каталог. */
document.querySelector("[data-back]").addEventListener("click", () => {
  if (history.length > 1) history.back();
  else location.href = "/pages/catalog.html";
});

let product = null;

/* --- HTML-фрагменты --- */
function galleryHTML(p) {
  const images = p.images?.length ? p.images : p.image ? [p.image] : [];
  // Обёрточный div: на его месте остаётся серый placeholder -> изображение
  // плавно появляется после загрузки, а при клике на thumbnail получается crossfade.
  const main = images[0]
    ? `<div class="product-main"><img class="product-main-image img-fallback" src="${esc(images[0])}" alt="${esc(p.title)}" data-main /></div>`
    : `<div class="product-main"><div class="product-main-image"></div></div>`;
  const thumbs =
    images.length > 1
      ? `<div class="product-thumbs">${images
          .map(
            (src, i) =>
              `<img class="product-thumb ${i === 0 ? "product-thumb-active" : ""}" src="${esc(src)}" alt="" data-thumb />`
          )
          .join("")}</div>`
      : "";
  return main + thumbs;
}

function infoHTML(p) {
  return `
    <h1 class="product-title">${esc(p.title)}</h1>
    <p class="product-price">${money(p.price)}</p>
    ${p.description ? `<p class="product-desc">${esc(p.description)}</p>` : ""}
    <div class="product-actions">
      <div class="qty">
        <button class="qty-btn" type="button" data-dec aria-label="Decrease"><img src="/assets/icons/minus.svg" alt="" width="20" height="20" /></button>
        <span class="qty-value" data-qty>1</span>
        <button class="qty-btn" type="button" data-inc aria-label="Increase"><img src="/assets/icons/plus.svg" alt="" width="20" height="20" /></button>
      </div>
      <button class="product-add" type="button" data-add>Add to cart</button>
    </div>`;
}

function reviewCardHTML(c) {
  const me = currentUser();
  const normalize = (value) => String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
  const mine =
    isLoggedIn() &&
    me &&
    normalize(c.author) === normalize(`${me.name || ""} ${me.surname || ""}`);
  const date = c.at
    ? new Date(c.at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";
  return `
    <div class="review" data-comment-id="${esc(c._id)}">
      <div class="review-author">${esc(c.author)}<img src="/assets/icons/verified.svg" alt="" width="24" height="24" /></div>
      <p class="review-text">${esc(c.text)}</p>
      ${date ? `<p class="review-date">Posted on ${esc(date)}</p>` : ""}
      ${mine ? `<button class="review-delete" type="button" data-delete>Remove</button>` : ""}
    </div>`;
}

function renderReviews(comments) {
  countEl.textContent = `(${comments.length})`;
  reviewsEl.innerHTML = comments.length
    ? comments.map(reviewCardHTML).join("")
    : `<p class="state-message">No reviews yet</p>`;
  revealCards(reviewsEl); // отзывы появляются друг за другом
}

// SEO: после получения данных о товаре из API добавляем структурированные данные Product.
function injectProductSchema(p) {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    image: p.image || undefined,
    description: p.description || undefined,
    offers: {
      "@type": "Offer",
      url: location.href,
      price: p.price,
      priceCurrency: "USD",
    },
  });
  document.head.appendChild(script);
}

/* --- загрузка --- */
async function load() {
  if (!id) return showError(infoEl, "No product selected");
  const canonicalUrl = `${location.origin}${location.pathname}?id=${encodeURIComponent(id)}`;
  document.querySelector('link[rel="canonical"]')?.setAttribute("href", canonicalUrl);
  document.querySelector('meta[property="og:url"]')?.setAttribute("content", canonicalUrl);
  try {
    const data = await api.getProduct(id);
    product = data.product || data;
    document.title = `Diploma Shop — ${product.title}`;
    galleryEl.innerHTML = galleryHTML(product);
    infoEl.innerHTML = infoHTML(product);
    renderReviews(data.comments || product.comments || []);
    injectProductSchema(product); // SEO: JSON-LD (через JS — данные приходят из API)
  } catch (e) {
    showError(infoEl, e.status === 404 ? "Product not found" : e.message);
  }
}

async function refreshReviews() {
  try {
    const fresh = await api.getProduct(id);
    renderReviews(fresh.comments || fresh.product?.comments || []);
  } catch {
    /* не важно */
  }
}

/* --- события --- */
galleryEl.addEventListener("click", (e) => {
  const thumb = e.target.closest("[data-thumb]");
  if (!thumb) return;
  const main = galleryEl.querySelector("[data-main]");
  if (main.src === thumb.src) return;
  // Crossfade: убираем классы -> изображение становится невидимым; после
  // загрузки нового src обработчик "load" в components.js вернёт их
  // обратно, и анимация fade запустится заново.
  main.classList.remove("is-loaded", "img-fade");
  main.src = thumb.src;
  galleryEl
    .querySelectorAll("[data-thumb]")
    .forEach((t) => t.classList.toggle("product-thumb-active", t === thumb));
});

infoEl.addEventListener("click", async (e) => {
  const qtyEl = infoEl.querySelector("[data-qty]");
  const qty = Number(qtyEl.textContent);

  // При смене числа оно должно появляться сдвигом сверху (класс убирается после завершения анимации)
  const showQty = (value) => {
    if (String(value) === qtyEl.textContent) return;
    qtyEl.textContent = String(value);
    playOnce(qtyEl, "is-changed");
  };

  if (e.target.closest("[data-dec]")) showQty(Math.max(1, qty - 1));
  else if (e.target.closest("[data-inc]")) showQty(Math.min(20, qty + 1));
  else if (e.target.closest("[data-add]")) {
    const btn = infoEl.querySelector("[data-add]");
    btn.disabled = true; // чтобы двойной клик подряд не добавил дважды
    try {
      await cartStore.addItem(product, Number(qtyEl.textContent));
      // копия изображения летит к "Bag (N)" в шапке
      flyToBag(galleryEl.querySelector("[data-main]"));
      toast(`${product.title} added to cart`);
    } catch (err) {
      toast(friendlyError(err), "error");
    } finally {
      btn.disabled = false;
    }
  }
});

document.querySelector("[data-write-review]").addEventListener("click", () => {
  if (!isLoggedIn()) {
    location.href =
      "/pages/login.html?next=" + encodeURIComponent(location.pathname + location.search);
    return;
  }
  openModal({
    title: "Leave a comment",
    bodyHTML: `<label class="modal-label">Text</label><textarea class="modal-textarea" placeholder="Your comment"></textarea>`,
    buttonText: "Send",
    onConfirm: async (modalEl) => {
      const text = modalEl.querySelector(".modal-textarea").value.trim();
      if (text.length < 2 || text.length > 300) {
        toast("Comment must be 2–300 characters", "error");
        return;
      }
      const sendBtn = modalEl.querySelector("[data-confirm]");
      sendBtn.disabled = true; // чтобы не отправилось дважды
      try {
        await api.addComment(id, text);
        closeModal();
        openModal({ title: "Thank you!", bodyHTML: "<p>You left new comment</p>", buttonText: "Okey" });
        refreshReviews();
      } catch (err) {
        toast(friendlyError(err), "error"); // например 409: больше 3 отзывов на один товар
        sendBtn.disabled = false;
      }
    },
  });
});

reviewsEl.addEventListener("click", async (e) => {
  if (!e.target.closest("[data-delete]")) return;
  const card = e.target.closest("[data-comment-id]");
  try {
    await api.deleteComment(id, card.dataset.commentId);
    refreshReviews();
  } catch (err) {
    toast(friendlyError(err), "error");
  }
});

load();
