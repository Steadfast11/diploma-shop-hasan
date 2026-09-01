/* ============================================================
   pages/product.js — Mahsulot sahifasi
   product.html?id=<mahsulot _id>
     1) header/footer
     2) api.getProduct(id) -> galereya + ma'lumot + izohlar
     3) qty +/- , Add to cart, "Write a Review" (modal), izoh o'chirish

   API hujjatida mahsulotning `description` / ko'p rasm yozilmagan —
   kod ikkalasiga ham tayyor (bo'lmasa yashiramiz).
   ============================================================ */

import { initLayout } from "../components.js";
import * as api from "../api.js";
import * as cartStore from "../cart-store.js";
import { isLoggedIn, currentUser } from "../auth.js";
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
} from "../ui.js";
import { isFavorite } from "../favorites.js";

initLayout();

const id = new URLSearchParams(location.search).get("id");
const galleryEl = document.querySelector("[data-gallery]");
const infoEl = document.querySelector("[data-info]");
const reviewsEl = document.querySelector("[data-reviews]");
const countEl = document.querySelector("[data-review-count]");

let product = null;

/* --- HTML qismlari --- */
function galleryHTML(p) {
  const images = p.images?.length ? p.images : p.image ? [p.image] : [];
  // O'rovchi div: kulrang joy-tutgich shunda turadi -> rasm yuklangach
  // yumshoq ochiladi, thumbnail bosilganda esa crossfade bo'ladi.
  const main = images[0]
    ? `<div class="product__main"><img class="product__main-image img-fallback" src="${esc(images[0])}" alt="${esc(p.title)}" data-main /></div>`
    : `<div class="product__main"><div class="product__main-image"></div></div>`;
  const thumbs =
    images.length > 1
      ? `<div class="product__thumbs">${images
          .map(
            (src, i) =>
              `<img class="product__thumb ${i === 0 ? "product__thumb--active" : ""}" src="${esc(src)}" alt="" data-thumb />`
          )
          .join("")}</div>`
      : "";
  return main + thumbs;
}

function infoHTML(p) {
  return `
    <h1 class="product__title">${esc(p.title)}</h1>
    <p class="product__price">${money(p.price)}</p>
    ${p.description ? `<p class="product__desc">${esc(p.description)}</p>` : ""}
    <div class="product__actions">
      <div class="qty">
        <button class="qty__btn" type="button" data-dec aria-label="Decrease"><img src="/assets/icons/minus.svg" alt="" width="20" height="20" /></button>
        <span class="qty__value" data-qty>1</span>
        <button class="qty__btn" type="button" data-inc aria-label="Increase"><img src="/assets/icons/plus.svg" alt="" width="20" height="20" /></button>
      </div>
      <button class="product__add" type="button" data-add>Add to cart</button>
      <button class="product__fav${isFavorite(p._id) ? " is-fav" : ""}" type="button" data-fav
              data-id="${esc(p._id)}" data-title="${esc(p.title)}"
              data-price="${p.price}" data-image="${esc(p.image || "")}"
              aria-pressed="${isFavorite(p._id)}" aria-label="Add to favorites">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M12 21s-7.5-4.6-10-9.3C.5 8.4 2 4.5 5.7 4.5c2 0 3.6 1.2 4.3 2.8.7-1.6 2.3-2.8 4.3-2.8 3.7 0 5.2 3.9 3.7 7.2C19.5 16.4 12 21 12 21z"/>
        </svg>
      </button>
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
    <div class="review-card" data-comment-id="${esc(c._id)}">
      <div class="review-card__author">${esc(c.author)}<img src="/assets/icons/verified.svg" alt="" width="24" height="24" /></div>
      <p class="review-card__text">${esc(c.text)}</p>
      ${date ? `<p class="review-card__date">Posted on ${esc(date)}</p>` : ""}
      ${mine ? `<button class="review-card__delete" type="button" data-delete>Remove</button>` : ""}
    </div>`;
}

function renderReviews(comments) {
  countEl.textContent = `(${comments.length})`;
  reviewsEl.innerHTML = comments.length
    ? comments.map(reviewCardHTML).join("")
    : `<p class="state-message">No reviews yet</p>`;
  revealCards(reviewsEl); // izohlar birin-ketin chiqadi
}

// SEO: mahsulot ma'lumoti API'dan kelgach, Product structured data qo'shamiz.
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

/* --- yuklash --- */
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
    injectProductSchema(product); // SEO: JSON-LD (JS orqali — ma'lumot API'dan keladi)
  } catch (e) {
    showError(infoEl, e.status === 404 ? "Product not found" : e.message);
  }
}

async function refreshReviews() {
  try {
    const fresh = await api.getProduct(id);
    renderReviews(fresh.comments || fresh.product?.comments || []);
  } catch {
    /* muhim emas */
  }
}

/* --- hodisalar --- */
galleryEl.addEventListener("click", (e) => {
  const thumb = e.target.closest("[data-thumb]");
  if (!thumb) return;
  const main = galleryEl.querySelector("[data-main]");
  if (main.src === thumb.src) return;
  // Crossfade: "is-loaded" ni olib tashlaymiz -> rasm so'nadi; yangi src
  // yuklangach components.js dagi "load" ushlagichi uni qayta ochadi.
  main.classList.remove("is-loaded");
  main.src = thumb.src;
  galleryEl
    .querySelectorAll("[data-thumb]")
    .forEach((t) => t.classList.toggle("product__thumb--active", t === thumb));
});

infoEl.addEventListener("click", async (e) => {
  const qtyEl = infoEl.querySelector("[data-qty]");
  const qty = Number(qtyEl.textContent);

  // Raqam almashganda yuqoridan siljib kelsin (animatsiya tugagach klass o'chadi)
  const showQty = (value) => {
    if (String(value) === qtyEl.textContent) return;
    qtyEl.textContent = String(value);
    qtyEl.classList.add("is-changed");
    qtyEl.addEventListener("animationend", () => qtyEl.classList.remove("is-changed"), {
      once: true,
    });
  };

  if (e.target.closest("[data-dec]")) showQty(Math.max(1, qty - 1));
  else if (e.target.closest("[data-inc]")) showQty(Math.min(20, qty + 1));
  else if (e.target.closest("[data-add]")) {
    const btn = infoEl.querySelector("[data-add]");
    btn.disabled = true; // ketma-ket ikki marta bosilganda ikkita qo'shilmasin
    try {
      await cartStore.addItem(product, Number(qtyEl.textContent));
      // rasm nusxasi header'dagi "Bag (N)" tomon uchadi
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
    bodyHTML: `<label class="modal__label">Text</label><textarea class="modal__textarea" placeholder="Your comment"></textarea>`,
    buttonText: "Send",
    onConfirm: async (modalEl) => {
      const text = modalEl.querySelector(".modal__textarea").value.trim();
      if (text.length < 2 || text.length > 300) {
        toast("Comment must be 2–300 characters", "error");
        return;
      }
      const sendBtn = modalEl.querySelector("[data-confirm]");
      sendBtn.disabled = true; // ikki marta yuborilmasin
      try {
        await api.addComment(id, text);
        closeModal();
        openModal({ title: "Thank you!", bodyHTML: "<p>You left new comment</p>", buttonText: "Okey" });
        refreshReviews();
      } catch (err) {
        toast(friendlyError(err), "error"); // masalan 409: bitta mahsulotga 3 tadan ko'p
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
