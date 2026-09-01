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
import { toggleFavorite } from "./favorites.js";
import { toast } from "./ui.js";

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

// Buzilgan rasm (404/xato) -> broken-image ikonka o'rniga toza kulrang
// quti qoladi. "error" hodisasi bubble bo'lmaydi -> capture=true bilan
// document darajasida ushlaymiz (har rasmga alohida listener kerak emas).
function wireImageFallback() {
  document.addEventListener(
    "error",
    (e) => {
      const img = e.target;
      if (img.tagName !== "IMG" || !img.classList.contains("img-fallback")) return;
      const div = document.createElement("div");
      div.className = img.className;
      img.replaceWith(div);
    },
    true
  );
}

// Har qanaqa mahsulot kartochkasidagi "sevimlilar" (heart) tugmasi.
// Delegatsiya: kartochkalar API'dan keyin qo'shilsa ham ishlaydi.
// preventDefault/stopPropagation — kartochka <a> ichida, sahifaga o'tib
// ketmasin.
function wireFavorites() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-fav]");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const nowFav = toggleFavorite({
      _id: btn.dataset.id,
      title: btn.dataset.title,
      price: Number(btn.dataset.price),
      image: btn.dataset.image,
    });
    btn.classList.toggle("is-fav", nowFav);
    btn.setAttribute("aria-pressed", String(nowFav));
    btn.setAttribute("aria-label", nowFav ? "Remove from favorites" : "Add to favorites");
  });
}

function showCartMergeWarning() {
  try {
    if (sessionStorage.getItem("diploma_shop_cart_merge_warning") !== "1") return;
    sessionStorage.removeItem("diploma_shop_cart_merge_warning");
    toast("Some guest items could not sync and remain saved on this device", "error");
  } catch {
    /* sessionStorage bloklangan bo'lsa ogohlantirishsiz davom etamiz */
  }
}

// Har sahifa shuni chaqiradi.
export async function initLayout() {
  await Promise.all([
    loadComponent("header", "header"),
    loadComponent("footer", "footer"),
  ]);
  wireHeaderAuth();
  wireHeaderMenu();
  wireFavorites();
  wireImageFallback();
  refreshCartCount();
  subscribe(refreshCartCount); // savat o'zgarsa "Bag (N)" yangilanadi
  showCartMergeWarning();

  // Animatsiya: GSAP bo'lsa "wow" (motion.js), bo'lmasa oddiy CSS reveal.
  const motionOn = initMotion();
  if (!motionOn) initReveal();
}

export { initReveal };
