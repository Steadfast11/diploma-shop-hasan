/* ============================================================
   pages/profile.js — Профиль + "My orders" + "Favorites"
   Если нет входа -> requireAuth() отправляет на логин.
     1) header/footer
     2) профиль: кешированный пользователь (быстро) -> GET /me (актуальный)
     3) "Log out" -> doLogout -> главная страница
     4) "My orders": GET /orders -> плоская сетка товаров (как в Figma —
        только изображение + название, без цены/даты; в самих данных заказа
        есть и то, и другое, если понадобится позже)
     5) "Favorites": localStorage (в API нет эндпоинта wishlist)
   ============================================================ */

import { initLayout } from "../components.js";
import * as api from "../core/api.js";
import { requireAuth, currentUser, doLogout } from "../core/auth.js";
import { esc, formatPhone, showError, showEmpty, productCardHTML, revealCards } from "../ui.js";

initLayout();

if (requireAuth()) {
  const headEl = document.querySelector("[data-profile-head]");
  const ordersEl = document.querySelector("[data-orders]");

  function renderHead(u) {
    headEl.innerHTML = `
      <p class="profile-eyebrow">My Profile</p>
      <p class="profile-name">${esc(u.name)} ${esc(u.surname)}</p>
      <p class="profile-phone">${esc(formatPhone(u.phone))}</p>
      <p class="profile-email">${esc(u.email || "")}</p>
      <button class="profile-logout" type="button" data-logout>Log out</button>`;
  }

  // 1) отрисовать сразу из кеша
  const cached = currentUser();
  if (cached) renderHead(cached);

  // 2) обновить с сервера
  api
    .getMe()
    .then(({ user }) => renderHead(user))
    .catch(() => {
      /* кешированной копии достаточно */
    });

  headEl.addEventListener("click", async (e) => {
    if (!e.target.closest("[data-logout]")) return;
    await doLogout();
    location.href = "/index.html";
  });

  // 3) заказы — собираем товары всех заказов в одну сетку (Figma: без цены)
  api
    .getOrders()
    .then(({ orders }) => {
      const items = orders.flatMap((o) => o.items || []);
      if (!items.length) return showEmpty(ordersEl, "No orders yet");
      ordersEl.innerHTML = items
        .map(
          (it) => `
        <a class="card" href="/pages/product.html?id=${encodeURIComponent(it.productId)}">
          <div class="card-media">
            ${
              it.image
                ? `<img class="card-image img-fallback" src="${esc(it.image)}" alt="${esc(it.title)}" loading="lazy" />`
                : `<div class="card-image"></div>`
            }
          </div>
          <div class="card-info"><p class="card-title">${esc(it.title)}</p></div>
        </a>`
        )
        .join("");
      revealCards(ordersEl); // карточки появляются друг за другом
    })
    .catch((e) => showError(ordersEl, e.message));
}
