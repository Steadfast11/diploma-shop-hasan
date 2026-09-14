/* ============================================================
   pages/cart.js — Корзина ("Your bag")
     1) header/footer
     2) корзина из cart-store (гость = localStorage, вошёл = сервер)
     3) количество +/-, удаление, "Go to checkout"

   Решение по скидке (docs/decisions.md): в корзине API скидки нет ->
   Subtotal = Total = total с сервера, Discount = 0.
   ============================================================ */

import { initLayout } from "../components.js";
import * as cartStore from "../core/cart-store.js";
import * as api from "../core/api.js";
import { isLoggedIn } from "../core/auth.js";
import { money, esc, showError, toast, friendlyError, openModal, countUp, playOnce } from "../ui.js";

initLayout();

const mainEl = document.querySelector("[data-cart-main]");
const summaryEl = document.querySelector("[data-cart-summary]");

function itemHTML(it) {
  // изображение и название -> ссылка на страницу товара
  const href = `/pages/product.html?id=${encodeURIComponent(it.productId)}`;
  const image = it.image
    ? `<img class="cart-item-image img-fallback" src="${esc(it.image)}" alt="${esc(it.title)}" />`
    : `<div class="cart-item-image"></div>`;
  return `
    <div class="cart-item" data-id="${esc(it.productId)}">
      <a class="cart-item-media" href="${href}">${image}</a>
      <div class="cart-item-info">
        <a class="cart-item-title" href="${href}">${esc(it.title)}</a>
        <p class="cart-item-price">${money(it.price)}</p>
        <button class="cart-item-remove" type="button" data-remove aria-label="Remove">
          <img src="/assets/icons/trash.svg" alt="" width="24" height="24" />
        </button>
      </div>
      <div class="qty">
        <button class="qty-btn" type="button" data-dec aria-label="Decrease">
          <img src="/assets/icons/minus.svg" alt="" width="20" height="20" />
        </button>
        <span class="qty-value">${it.qty}</span>
        <button class="qty-btn" type="button" data-inc aria-label="Increase">
          <img src="/assets/icons/plus.svg" alt="" width="20" height="20" />
        </button>
      </div>
    </div>`;
}

function summaryHTML(total, isEmpty) {
  return `
    <p class="summary-title">Order Summary</p>
    <div class="summary-rows">
      <div class="summary-row"><span>Subtotal</span><span>${money(total)}</span></div>
      <div class="summary-row summary-row-discount"><span>Discount (~0%)</span><span>${money(0)}</span></div>
      <div class="summary-divider"></div>
      <div class="summary-row summary-row-total"><span>Total</span><span>${money(total)}</span></div>
    </div>
    <button class="summary-checkout" type="button" data-checkout ${isEmpty ? "disabled" : ""}>Go to checkout</button>`;
}

async function render() {
  try {
    const { items, total } = await cartStore.getCart();
    mainEl.innerHTML = items.length
      ? items.map(itemHTML).join("")
      : `<div class="cart-empty">No products in your bag</div>`;
    summaryEl.innerHTML = summaryHTML(total, items.length === 0);
  } catch (e) {
    showError(mainEl, e.message);
  }
}

// Небольшая пауза — чтобы дождаться завершения анимации (в виде setTimeout-промиса).
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* "Отсчитывает" Subtotal и Total в "Order Summary" до новой суммы
   (не перерисовываем всю карточку -> число не скачет). */
function updateSummary(total) {
  // И Subtotal, и Total равны `total` из API (docs/decisions.md:
  // в корзине API скидки нет). Строка "Discount" всегда 0 -> её не трогаем.
  summaryEl
    .querySelectorAll(".summary-row:not(.summary-row-discount) span:last-child")
    .forEach((cell) => countUp(cell, total, money));
}

/* --- события (делегирование) --- */
mainEl.addEventListener("click", async (e) => {
  const row = e.target.closest(".cart-item");
  if (!row) return;
  const id = row.dataset.id;
  const qtyEl = row.querySelector(".qty-value");
  const qty = Number(qtyEl.textContent);

  /* УДАЛЕНИЕ: строка сначала плавно гаснет, затем список перерисовывается. */
  if (e.target.closest("[data-remove]")) {
    row.classList.add("is-removing");
    try {
      await cartStore.removeItem(id);
      await wait(280); // дождаться завершения анимации затухания
      await render();
    } catch (err) {
      row.classList.remove("is-removing"); // ошибка -> строка остаётся на месте
      toast(friendlyError(err), "error");
    }
    return;
  }

  /* КОЛИЧЕСТВО: весь список не перерисовываем — обновляется только
     число в этой строке и "Order Summary" (список не "мигает"). */
  const dec = e.target.closest("[data-dec]");
  const inc = e.target.closest("[data-inc]");
  if (!dec && !inc) return;
  const next = inc ? qty + 1 : qty - 1;

  // если стало меньше 1 — это фактически удаление, значит перерисовываем полностью
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

  const buttons = row.querySelectorAll(".qty-btn");
  buttons.forEach((b) => (b.disabled = true)); // чтобы не кликали слишком часто
  try {
    await cartStore.setQty(id, next);
    const { items, total } = await cartStore.getCart();
    // сервер может ограничить количество (макс. 20) -> берём реальное значение
    const fresh = items.find((it) => it.productId === id);
    qtyEl.textContent = String(fresh ? fresh.qty : next);
    playOnce(qtyEl, "is-changed");
    updateSummary(total);
  } catch (err) {
    toast(friendlyError(err), "error");
    await render(); // чтобы не было путаницы в состоянии — перерисовываем реальную корзину
  } finally {
    buttons.forEach((b) => (b.disabled = false));
  }
});

summaryEl.addEventListener("click", async (e) => {
  if (!e.target.closest("[data-checkout]")) return;

  // гость -> сначала вход (корзина переносится на сервер после логина)
  if (!isLoggedIn()) {
    location.href =
      "/pages/login.html?next=" + encodeURIComponent("/pages/cart.html");
    return;
  }
  const checkoutBtn = e.target.closest("[data-checkout]");
  checkoutBtn.disabled = true; // чтобы не ушло два заказа
  try {
    await api.createOrder(); // заказ из всей корзины
    cartStore.refresh(); // сервер сам очистил корзину -> обновляем число в шапке
    await render(); // корзина теперь пуста -> перерисовываем список ("No products...")
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
