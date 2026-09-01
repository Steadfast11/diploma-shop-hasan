/* ============================================================
   components.js — header/footer'ni sahifaga joylaydi + header holati
   Har HTML'da bo'sh <div id="header"> va <div id="footer"> turadi.

   MUHIM: fetch() ishlashi uchun sayt DEV-SERVERdan ochilishi kerak
   (file:// da ishlamaydi). README: `npm run dev`.
   ============================================================ */

import { isLoggedIn } from "./auth.js";
import { getCount, subscribe } from "./cart-store.js";
import { initReveal } from "./reveal.js";
import { initMotion } from "./motion.js";

// Bitta komponentni yuklab, kerakli div ichiga qo'yadi.
async function loadComponent(name, mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return; // bu sahifada bunday div yo'q -> jimgina to'xtaymiz

  // ?v=1 — kesh-buzish (va ba'zi dev-serverlar ".html" ni olib tashlamasin)
  const res = await fetch(`/components/${name}.html?v=1`);
  const html = await res.text();
  mount.innerHTML = html;
}

// Header'dagi "Bag (N)" ni joriy savat soniga tenglaydi (+ mayda sakrash).
async function refreshCartCount() {
  const el = document.querySelector("[data-cart-count]");
  if (!el) return;
  const next = String(await getCount());
  if (el.textContent !== next) {
    el.textContent = next;
    el.classList.add("bump");
    setTimeout(() => el.classList.remove("bump"), 450);
  }
}

// Kirilmagan bo'lsa "Account" havolasi login sahifasiga ketsin.
function wireHeaderAuth() {
  if (isLoggedIn()) return;
  const acc = document.querySelector('.site-header__account a[href$="profile.html"]');
  if (acc) acc.href = "/pages/login.html";
}

// Mobil burger: Home/Products panelini ochib/yopadi.
function wireHeaderMenu() {
  const burger = document.querySelector("[data-burger]");
  if (!burger) return;
  burger.addEventListener("click", () => {
    const header = burger.closest(".site-header");
    const open = header.classList.toggle("site-header--menu-open");
    burger.setAttribute("aria-expanded", String(open));
  });
}

// Har sahifa shuni chaqiradi.
export async function initLayout() {
  await Promise.all([
    loadComponent("header", "header"),
    loadComponent("footer", "footer"),
  ]);
  wireHeaderAuth();
  wireHeaderMenu();
  refreshCartCount();
  subscribe(refreshCartCount); // savat o'zgarsa "Bag (N)" yangilanadi

  // Animatsiya: GSAP bo'lsa "wow" (motion.js), bo'lmasa oddiy CSS reveal.
  const motionOn = initMotion();
  if (!motionOn) initReveal();
}

export { initReveal };
