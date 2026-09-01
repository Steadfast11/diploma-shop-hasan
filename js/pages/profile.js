/* ============================================================
   pages/profile.js — Profil + "My orders"
   Kirilmagan bo'lsa requireAuth() login sahifasiga yuboradi.
     1) header/footer
     2) profil: saqlangan user (tez) -> GET /me (yangi)
     3) "Log out" -> doLogout -> bosh sahifa
     4) "My orders": GET /orders -> buyurtmalardagi mahsulotlar to'ri
   ============================================================ */

import { initLayout } from "../components.js";
import * as api from "../api.js";
import { requireAuth, currentUser, doLogout } from "../auth.js";
import { esc, showError, showEmpty } from "../ui.js";

initLayout();

if (requireAuth()) {
  const headEl = document.querySelector("[data-profile-head]");
  const ordersEl = document.querySelector("[data-orders]");

  function renderHead(u) {
    headEl.innerHTML = `
      <p class="profile__eyebrow">My Profile</p>
      <p class="profile__name">${esc(u.name)} ${esc(u.surname)}</p>
      <p class="profile__phone">${esc(u.phone || "")}</p>
      <p class="profile__email">${esc(u.email || "")}</p>
      <button class="profile__logout" type="button" data-logout>Log out</button>`;
  }

  // 1) saqlangan profil bilan darrov chizamiz
  const cached = currentUser();
  if (cached) renderHead(cached);

  // 2) serverdan yangisini olamiz
  api
    .getMe()
    .then(({ user }) => renderHead(user))
    .catch(() => {
      /* cached bo'lsa yetadi */
    });

  headEl.addEventListener("click", async (e) => {
    if (!e.target.closest("[data-logout]")) return;
    await doLogout();
    location.href = "/index.html";
  });

  // 3) buyurtmalar
  api
    .getOrders()
    .then(({ orders }) => {
      const items = orders.flatMap((o) => o.items || []);
      if (!items.length) return showEmpty(ordersEl, "Hali buyurtma yo'q");
      ordersEl.innerHTML = items
        .map(
          (it) => `
        <a class="product-card" href="/pages/product.html?id=${encodeURIComponent(it.productId)}">
          ${
            it.image
              ? `<img class="product-card__image" src="${esc(it.image)}" alt="${esc(it.title)}" loading="lazy" />`
              : `<div class="product-card__image"></div>`
          }
          <div class="product-card__info"><p class="product-card__title">${esc(it.title)}</p></div>
        </a>`
        )
        .join("");
    })
    .catch((e) => showError(ordersEl, e.message));
}
