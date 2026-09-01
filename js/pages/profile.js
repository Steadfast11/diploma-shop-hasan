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
import { esc, money, showError, showEmpty, productCardHTML } from "../ui.js";
import { getFavorites, isFavorite } from "../favorites.js";

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

  // 3) buyurtmalar — har biri o'z kartasida: sana, jami, ichidagi mahsulotlar
  //    (Figma faqat mahsulot to'ri ko'rsatgan; tafsilot biz qo'shdik — API'da
  //    sana/jami/items alohida-alohida bor edi, ulardan foydalanamiz)
  function orderCardHTML(order, index) {
    // "uz-UZ" ko'p brauzerda to'liq qo'llab-quvvatlanmaydi -> qo'lda DD.MM.YYYY
    const date = order.createdAt
      ? new Date(order.createdAt)
          .toLocaleDateString("en-GB") // "1/09/2026" uslubidagi kun/oy/yil tartibi
          .split("/")
          .map((n) => n.padStart(2, "0"))
          .join(".")
      : "";
    const items = (order.items || [])
      .map(
        (it) => `
      <a class="order-item" href="/pages/product.html?id=${encodeURIComponent(it.productId)}">
        ${
          it.image
            ? `<img class="order-item__image" src="${esc(it.image)}" alt="${esc(it.title)}" loading="lazy" />`
            : `<div class="order-item__image"></div>`
        }
        <span class="order-item__title">${esc(it.title)}</span>
        <span class="order-item__meta">${it.qty} × ${money(it.price)}</span>
      </a>`
      )
      .join("");
    return `
      <article class="order-card">
        <div class="order-card__head">
          <span>Buyurtma №${index}</span>
          <span>${esc(date)}</span>
          <span class="order-card__total">${money(order.total)}</span>
        </div>
        <div class="order-card__items">${items}</div>
      </article>`;
  }

  api
    .getOrders()
    .then(({ orders }) => {
      if (!orders.length) return showEmpty(ordersEl, "Hali buyurtma yo'q");
      // yangi birinchi (API shunday qaytaradi) -> raqamlashda eskisi #1 bo'lsin
      const total = orders.length;
      ordersEl.innerHTML = orders
        .map((o, i) => orderCardHTML(o, total - i))
        .join("");
    })
    .catch((e) => showError(ordersEl, e.message));

  // 4) sevimlilar (mahalliy, localStorage — API'da wishlist yo'q)
  const favEl = document.querySelector("[data-favorites]");
  function renderFavorites() {
    const favorites = getFavorites();
    if (!favorites.length) return showEmpty(favEl, "Hali sevimli mahsulot yo'q");
    favEl.innerHTML = favorites.map(productCardHTML).join("");
  }
  renderFavorites();
  // yurak bosilса (bekor qilинса) — shu ro'yxatdan darrov olib tashlaymiz
  favEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-fav]");
    if (!btn) return;
    setTimeout(() => {
      if (!isFavorite(btn.dataset.id)) renderFavorites();
    }, 0);
  });
}
