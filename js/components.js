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

// Logo intro birinchi kirishda va RELOAD qilinganda ishlaydi.
// Shu tab ichida boshqa sahifaga oddiy o'tilganda qayta ishlamaydi.
function initLogoIntro() {
  const logo = document.querySelector(".site-header__logo");
  const header = logo?.closest(".site-header");
  if (!logo || !header) return;

  let alreadyPlayed = false;
  try {
    alreadyPlayed = sessionStorage.getItem("diploma_shop_logo_intro") === "1";
  } catch {
    /* sessionStorage bloklangan bo'lsa har sahifada ko'rinishi mumkin */
  }
  const navigation = performance.getEntriesByType("navigation")[0];
  const isReload = navigation?.type === "reload";
  if (alreadyPlayed && !isReload) return;

  header.classList.add("site-header--intro");
  logo.classList.add("is-intro");
  try {
    sessionStorage.setItem("diploma_shop_logo_intro", "1");
  } catch {
    /* yozib bo'lmasa animatsiyaning o'zi baribir ishlaydi */
  }
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

// Rasm yuklangach yumshoq ochilsin (birdan "sakrab" chiqmasin).
// "load" ham "error" kabi bubble bo'lmaydi -> yuqoridagi bilan bir xil
// uslub: document darajasida capture=true.
function wireImageFade() {
  document.addEventListener(
    "load",
    (e) => {
      const img = e.target;
      if (img.tagName !== "IMG" || !img.classList.contains("img-fallback")) return;
      img.classList.add("is-loaded");
    },
    true
  );

  // Listener ulanguncha keshdan yuklanib bo'lgan rasmlar uchun "supurgi".
  // Faqat ALLAQACHON yuklangan (complete) rasmlarni ochamiz.
  const sweep = () =>
    document.querySelectorAll("img.img-fallback:not(.is-loaded)").forEach((img) => {
      if (img.complete) img.classList.add("is-loaded");
    });
  window.addEventListener("load", sweep);
  setTimeout(sweep, 3000); // xavfsizlik to'ri
}

// Sichqoncha havola ustiga kelganda brauzer o'sha sahifani oldindan
// yuklab qo'yadi -> bosilganda deyarli darrov ochiladi.
// Har manzil bir marta; "?id=..." farq qilmaydi, HTML fayl bitta.
function wirePrefetch() {
  const done = new Set();
  document.addEventListener("pointerover", (e) => {
    const link = e.target.closest?.("a");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    // faqat shu saytdagi oddiy sahifalar (tashqi/yangi oyna emas)
    if (!href.startsWith("/") || href.startsWith("//") || link.target) return;
    const path = href.split("?")[0].split("#")[0];
    if (path === location.pathname || done.has(path)) return;
    done.add(path);
    const tag = document.createElement("link");
    tag.rel = "prefetch";
    tag.href = path;
    document.head.appendChild(tag);
  });
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
    // Faqat QO'SHILGANDA yurakcha bir marta sakraydi (sahifa ochilganda emas).
    if (nowFav) {
      btn.classList.add("fav-pop");
      btn.addEventListener("animationend", () => btn.classList.remove("fav-pop"), {
        once: true,
      });
    }
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
  initLogoIntro();
  wireFavorites();
  wireImageFallback();
  wireImageFade();
  wirePrefetch();
  refreshCartCount();
  subscribe(refreshCartCount); // savat o'zgarsa "Bag (N)" yangilanadi
  showCartMergeWarning();

  // Animatsiya: GSAP bo'lsa "wow" (motion.js), bo'lmasa oddiy CSS reveal.
  const motionOn = initMotion();
  if (!motionOn) initReveal();
}

export { initReveal };
