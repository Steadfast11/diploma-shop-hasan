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
import { money, esc, showError, toast, friendlyError, openModal, countUp, playOnce } from "../ui.js";

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

// Kichik kutish — animatsiya tugashini kutish uchun (setTimeout va'da shaklida).
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* "Order Summary" dagi Subtotal va Total ni yangi jamiga SANAB o'tkazadi
   (butun kartani qayta chizmaymiz -> raqam sakramaydi). */
function updateSummary(total) {
  // Subtotal ham, Total ham API'ning `total` iga teng (docs/decisions.md:
  // API savatida chegirma yo'q). "Discount" qatori doim 0 -> tegmaymiz.
  summaryEl
    .querySelectorAll(".order-summary__row:not(.order-summary__row--discount) span:last-child")
    .forEach((cell) => countUp(cell, total, money));
}

/* --- hodisalar (delegatsiya) --- */
mainEl.addEventListener("click", async (e) => {
  const row = e.target.closest(".cart-item");
  if (!row) return;
  const id = row.dataset.id;
  const qtyEl = row.querySelector(".qty__value");
  const qty = Number(qtyEl.textContent);

  /* O'CHIRISH: qator avval yumshoq so'nadi, keyin ro'yxat qayta chiziladi. */
  if (e.target.closest("[data-remove]")) {
    row.classList.add("is-removing");
    try {
      await cartStore.removeItem(id);
      await wait(280); // so'nish animatsiyasi tugasin
      await render();
    } catch (err) {
      row.classList.remove("is-removing"); // xato -> qator joyida qoladi
      toast(friendlyError(err), "error");
    }
    return;
  }

  /* MIQDOR: butun ro'yxatni qayta chizmaymiz — faqat shu qatordagi son
     va "Order Summary" yangilanadi (ro'yxat "yaltirab" ketmaydi). */
  const dec = e.target.closest("[data-dec]");
  const inc = e.target.closest("[data-inc]");
  if (!dec && !inc) return;
  const next = inc ? qty + 1 : qty - 1;

  // 1 dan pastga tushsa — bu aslida o'chirish, demak to'liq qayta chizamiz
  if (next < 1) {
    row.classList.add("is-removing");
    try {
      await cartStore.removeItem(id);
      await wait(280);
      await render();
    } catch (err) {
      row.classList.remove("is-removing");
      toast(friendlyError(err), "error");
    }
    return;
  }

  const buttons = row.querySelectorAll(".qty__btn");
  buttons.forEach((b) => (b.disabled = true)); // tez-tez bosilib ketmasin
  try {
    await cartStore.setQty(id, next);
    const { items, total } = await cartStore.getCart();
    // server miqdorni cheklashi mumkin (maks 20) -> haqiqiy qiymatni olamiz
    const fresh = items.find((it) => it.productId === id);
    qtyEl.textContent = String(fresh ? fresh.qty : next);
    playOnce(qtyEl, "is-changed");
    updateSummary(total);
  } catch (err) {
    toast(friendlyError(err), "error");
    await render(); // holat chalkashmasin — haqiqiy savatni qayta chizamiz
  } finally {
    buttons.forEach((b) => (b.disabled = false));
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
