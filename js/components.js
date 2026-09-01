/* ============================================================
   components.js — header/footer'ni sahifaga joylaydi + header holati
   Har HTML'da bo'sh <div id="header"> va <div id="footer"> turadi.

   MUHIM: fetch() ishlashi uchun sayt DEV-SERVERdan ochilishi kerak
   (file:// da ishlamaydi). README: `npm run dev`.
   ============================================================ */

import { isLoggedIn } from "./auth.js";
import { getCount, subscribe } from "./cart-store.js";

// Bitta komponentni yuklab, kerakli div ichiga qo'yadi.
async function loadComponent(name, mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return; // bu sahifada bunday div yo'q -> jimgina to'xtaymiz

  const res = await fetch(`/components/${name}.html`);
  const html = await res.text();
  mount.innerHTML = html;
}

// Header'dagi "Bag (N)" ni joriy savat soniga tenglaydi.
async function refreshCartCount() {
  const el = document.querySelector("[data-cart-count]");
  if (el) el.textContent = String(await getCount());
}

// Kirilmagan bo'lsa "Account" havolasi login sahifasiga ketsin.
function wireHeaderAuth() {
  if (isLoggedIn()) return;
  const acc = document.querySelector('.site-header__account a[href$="profile.html"]');
  if (acc) acc.href = "/pages/login.html";
}

// Har sahifa shuni chaqiradi.
export async function initLayout() {
  await Promise.all([
    loadComponent("header", "header"),
    loadComponent("footer", "footer"),
  ]);
  wireHeaderAuth();
  refreshCartCount();
  subscribe(refreshCartCount); // savat o'zgarsa "Bag (N)" yangilanadi
}
