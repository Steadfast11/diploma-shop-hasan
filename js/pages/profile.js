/* ============================================================
   pages/profile.js — Profile + "My orders" + "Favorites"
   Not logged in -> requireAuth() sends to login.
     1) header/footer
     2) profile: cached user (fast) -> GET /me (fresh)
     3) "Log out" -> doLogout -> home
     4) "My orders": GET /orders -> flattened product grid (matches Figma —
        image + title only, no price/date; order data itself has both if
        ever needed later)
     5) "Favorites": localStorage (API has no wishlist endpoint)
   ============================================================ */

import { initLayout } from "../components.js";
import * as api from "../api.js";
import { requireAuth, currentUser, doLogout } from "../auth.js";
import { esc, formatPhone, showError, showEmpty, productCardHTML } from "../ui.js";
import { getFavorites, isFavorite } from "../favorites.js";

initLayout();

if (requireAuth()) {
  const headEl = document.querySelector("[data-profile-head]");
  const ordersEl = document.querySelector("[data-orders]");
  const favEl = document.querySelector("[data-favorites]");

  function renderHead(u) {
    headEl.innerHTML = `
      <p class="profile__eyebrow">My Profile</p>
      <p class="profile__name">${esc(u.name)} ${esc(u.surname)}</p>
      <p class="profile__phone">${esc(formatPhone(u.phone))}</p>
      <p class="profile__email">${esc(u.email || "")}</p>
      <button class="profile__logout" type="button" data-logout>Log out</button>`;
  }

  // 1) render immediately from cache
  const cached = currentUser();
  if (cached) renderHead(cached);

  // 2) refresh from server
  api
    .getMe()
    .then(({ user }) => renderHead(user))
    .catch(() => {
      /* cached copy is enough */
    });

  headEl.addEventListener("click", async (e) => {
    if (!e.target.closest("[data-logout]")) return;
    await doLogout();
    location.href = "/index.html";
  });

  // 3) orders — flatten every order's items into one grid (Figma: no price)
  api
    .getOrders()
    .then(({ orders }) => {
      const items = orders.flatMap((o) => o.items || []);
      if (!items.length) return showEmpty(ordersEl, "No orders yet");
      ordersEl.innerHTML = items
        .map(
          (it) => `
        <a class="product-card" href="/pages/product.html?id=${encodeURIComponent(it.productId)}">
          <div class="product-card__media">
            ${
              it.image
                ? `<img class="product-card__image img-fallback" src="${esc(it.image)}" alt="${esc(it.title)}" loading="lazy" />`
                : `<div class="product-card__image"></div>`
            }
          </div>
          <div class="product-card__info"><p class="product-card__title">${esc(it.title)}</p></div>
        </a>`
        )
        .join("");
    })
    .catch((e) => showError(ordersEl, e.message));

  // 4) favorites (local only — API has no wishlist endpoint)
  function renderFavorites() {
    const favorites = getFavorites();
    if (!favorites.length) return showEmpty(favEl, "No favorites yet");
    favEl.innerHTML = favorites.map(productCardHTML).join("");
  }
  renderFavorites();
  // unfavorited here -> drop it from the list right away
  favEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-fav]");
    if (!btn) return;
    setTimeout(() => {
      if (!isFavorite(btn.dataset.id)) renderFavorites();
    }, 0);
  });
}
