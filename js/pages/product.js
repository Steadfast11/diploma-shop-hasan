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
import { money, esc, openModal, closeModal, showError } from "../ui.js";

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
  const main = images[0]
    ? `<img class="product__main-image" src="${esc(images[0])}" alt="${esc(p.title)}" data-main />`
    : `<div class="product__main-image"></div>`;
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
        <button class="qty__btn" type="button" data-dec aria-label="Kamaytirish"><img src="/assets/icons/minus.svg" alt="" width="20" height="20" /></button>
        <span class="qty__value" data-qty>1</span>
        <button class="qty__btn" type="button" data-inc aria-label="Ko'paytirish"><img src="/assets/icons/plus.svg" alt="" width="20" height="20" /></button>
      </div>
      <button class="product__add" type="button" data-add>Add to cart</button>
    </div>`;
}

function reviewCardHTML(c) {
  const me = currentUser();
  const mine =
    isLoggedIn() &&
    me &&
    String(c.author || "").toLowerCase().includes(String(me.name || "").toLowerCase());
  const date = c.at
    ? new Date(c.at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";
  return `
    <div class="review-card" data-comment-id="${esc(c._id)}">
      <div class="review-card__author">${esc(c.author)}<img src="/assets/icons/verified.svg" alt="" width="24" height="24" /></div>
      <p class="review-card__text">${esc(c.text)}</p>
      ${date ? `<p class="review-card__date">Posted on ${esc(date)}</p>` : ""}
      ${mine ? `<button class="review-card__delete" type="button" data-delete>O'chirish</button>` : ""}
    </div>`;
}

function renderReviews(comments) {
  countEl.textContent = `(${comments.length})`;
  reviewsEl.innerHTML = comments.length
    ? comments.map(reviewCardHTML).join("")
    : `<p class="state-message">Hali izoh yo'q</p>`;
}

/* --- yuklash --- */
async function load() {
  if (!id) return showError(infoEl, "Mahsulot tanlanmagan");
  try {
    const data = await api.getProduct(id);
    product = data.product || data;
    document.title = `Diploma Shop — ${product.title}`;
    galleryEl.innerHTML = galleryHTML(product);
    infoEl.innerHTML = infoHTML(product);
    renderReviews(data.comments || product.comments || []);
  } catch (e) {
    showError(infoEl, e.status === 404 ? "Mahsulot topilmadi" : e.message);
  }
}

async function refreshReviews() {
  try {
    const fresh = await api.getProduct(id);
    renderReviews(fresh.comments || []);
  } catch {
    /* muhim emas */
  }
}

/* --- hodisalar --- */
galleryEl.addEventListener("click", (e) => {
  const thumb = e.target.closest("[data-thumb]");
  if (!thumb) return;
  galleryEl.querySelector("[data-main]").src = thumb.src;
  galleryEl
    .querySelectorAll("[data-thumb]")
    .forEach((t) => t.classList.toggle("product__thumb--active", t === thumb));
});

infoEl.addEventListener("click", async (e) => {
  const qtyEl = infoEl.querySelector("[data-qty]");
  const qty = Number(qtyEl.textContent);
  if (e.target.closest("[data-dec]")) qtyEl.textContent = String(Math.max(1, qty - 1));
  else if (e.target.closest("[data-inc]")) qtyEl.textContent = String(Math.min(20, qty + 1));
  else if (e.target.closest("[data-add]")) {
    try {
      await cartStore.addItem(product, Number(qtyEl.textContent));
      openModal({
        title: "Savatga qo'shildi",
        bodyHTML: `<p>${esc(product.title)} savatga qo'shildi.</p>`,
        buttonText: "Yaxshi",
      });
    } catch (err) {
      alert(err.message);
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
        alert("Izoh 2–300 belgi bo'lishi kerak");
        return;
      }
      try {
        await api.addComment(id, text);
        closeModal();
        openModal({ title: "Thank you!", bodyHTML: "<p>You left new comment</p>", buttonText: "Okey" });
        refreshReviews();
      } catch (err) {
        alert(err.message); // masalan 409: bitta mahsulotga 3 tadan ko'p
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
    alert(err.message);
  }
});

load();
