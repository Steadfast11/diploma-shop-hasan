/* ============================================================
   pages/cart.js — Savatcha ("Your bag")
     1) header/footer
     2) cart-store'dan savat (mehmon = localStorage, kirgan = server)
     3) miqdor +/- , o'chirish, "Go to checkout"

   Chegirma qarori (docs/decisions.md): API savatida chegirma yo'q ->
   Subtotal = Total = server total, Discount = 0.
   ============================================================ */

import { initLayout } from "../components.js";
import * as cartStore from "../cart-store.js";
import * as api from "../api.js";
import { isLoggedIn } from "../auth.js";
import { money, esc, showError, toast, friendlyError, openModal } from "../ui.js";

initLayout();

const mainEl = document.querySelector("[data-cart-main]");
const summaryEl = document.querySelector("[data-cart-summary]");

function itemHTML(it) {
  // rasm va nom -> mahsulot sahifasiga havola
  const href = `/pages/product.html?id=${encodeURIComponent(it.productId)}`;
  const image = it.image
    ? `<img class="cart-item__image img-fallback" src="${esc(it.image)}" alt="${esc(it.title)}" />`
    : `<div class="cart-item__image"></div>`;
  return `
    <div class="cart-item" data-id="${esc(it.productId)}">
      <a class="cart-item__media" href="${href}">${image}</a>
      <div class="cart-item__info">
        <a class="cart-item__title" href="${href}">${esc(it.title)}</a>
        <p class="cart-item__price">${money(it.price)}</p>
        <button class="cart-item__remove" type="button" data-remove aria-label="Remove">
          <img src="/assets/icons/trash.svg" alt="" width="24" height="24" />
        </button>
      </div>
      <div class="qty">
        <button class="qty__btn" type="button" data-dec aria-label="Decrease">
          <img src="/assets/icons/minus.svg" alt="" width="20" height="20" />
        </button>
        <span class="qty__value">${it.qty}</span>
        <button class="qty__btn" type="button" data-inc aria-label="Increase">
          <img src="/assets/icons/plus.svg" alt="" width="20" height="20" />
        </button>
      </div>
    </div>`;
}

function summaryHTML(total, isEmpty) {
  return `
    <p class="order-summary__title">Order Summary</p>
    <div class="order-summary__rows">
      <div class="order-summary__row"><span>Subtotal</span><span>${money(total)}</span></div>
      <div class="order-summary__row order-summary__row--discount"><span>Discount (~0%)</span><span>${money(0)}</span></div>
      <div class="order-summary__divider"></div>
      <div class="order-summary__row order-summary__row--total"><span>Total</span><span>${money(total)}</span></div>
    </div>
    <button class="order-summary__checkout" type="button" data-checkout ${isEmpty ? "disabled" : ""}>Go to checkout</button>`;
}

async function render() {
  try {
    const { items, total } = await cartStore.getCart();
    mainEl.innerHTML = items.length
      ? items.map(itemHTML).join("")
      : `<div class="cart__empty">No products in your bag</div>`;
    summaryEl.innerHTML = summaryHTML(total, items.length === 0);
  } catch (e) {
    showError(mainEl, e.message);
  }
}

/* --- hodisalar (delegatsiya) --- */
mainEl.addEventListener("click", async (e) => {
  const row = e.target.closest(".cart-item");
  if (!row) return;
  const id = row.dataset.id;
  const qty = Number(row.querySelector(".qty__value").textContent);
  try {
    if (e.target.closest("[data-remove]")) await cartStore.removeItem(id);
    else if (e.target.closest("[data-dec]")) await cartStore.setQty(id, qty - 1);
    else if (e.target.closest("[data-inc]")) await cartStore.setQty(id, qty + 1);
    else return;
    await render();
  } catch (err) {
    toast(friendlyError(err), "error");
  }
});

summaryEl.addEventListener("click", async (e) => {
  if (!e.target.closest("[data-checkout]")) return;

  // mehmon -> avval kirish (savat login'dan keyin serverga ko'chiriladi)
  if (!isLoggedIn()) {
    location.href =
      "/pages/login.html?next=" + encodeURIComponent("/pages/cart.html");
    return;
  }
  const checkoutBtn = e.target.closest("[data-checkout]");
  checkoutBtn.disabled = true; // ikkita buyurtma ketmasin
  try {
    await api.createOrder(); // butun savatdan buyurtma
    cartStore.refresh(); // server savatni o'zi tozaladi -> header sonini yangilaymiz
    await render(); // savat endi bo'sh -> ro'yxatni ("No products...") qayta chizamiz
    openModal({
      title: "Order placed!",
      bodyHTML: "<p>Your order was placed successfully.</p>",
      buttonText: "View my orders",
      onConfirm: () => {
        location.href = "/pages/profile.html";
      },
    });
  } catch (err) {
    toast(friendlyError(err), "error");
    checkoutBtn.disabled = false;
  }
});

render();
