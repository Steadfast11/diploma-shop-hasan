/* ============================================================
   components.js — вставляет header/footer в страницу + состояние header
   На каждой HTML-странице стоят пустые <div id="header"> и <div id="footer">.

   ВАЖНО: чтобы fetch() работал, сайт должен быть открыт через DEV-SERVER
   (не работает через file://). README: `npm run dev`.
   ============================================================ */

import { isLoggedIn } from "./core/auth.js";
import { getCount, subscribe } from "./core/cart-store.js";
import { initReveal } from "./effects/reveal.js";
import { initMotion } from "./effects/motion.js";
import { toast, playOnce } from "./ui.js";

// Загружает один компонент и вставляет его в нужный div.
async function loadComponent(name, mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return; // на этой странице такого div нет -> молча выходим

  // ?v=1 — сброс кеша (и чтобы некоторые dev-серверы не отрезали ".html")
  const res = await fetch(`/components/${name}.html?v=1`);
  const html = await res.text();
  mount.innerHTML = html;
}

// Приравнивает "Bag (N)" в шапке к текущему количеству в корзине (+ лёгкий подскок).
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

// Если пользователь не вошёл, ссылка "Account" должна вести на страницу логина.
function wireHeaderAuth() {
  if (isLoggedIn()) return;
  const acc = document.querySelector('.header-account a[href$="profile.html"]');
  if (acc) acc.href = "/pages/login.html";
}

// Мобильный бургер: открывает/закрывает панель Home/Products.
function wireHeaderMenu() {
  const burger = document.querySelector("[data-burger]");
  if (!burger) return;
  burger.addEventListener("click", () => {
    const header = burger.closest(".header");
    const open = header.classList.toggle("header-menu-open");
    burger.setAttribute("aria-expanded", String(open));
  });
}

// Интро логотипа срабатывает при первом входе и при RELOAD.
// При обычном переходе на другую страницу в этой же вкладке повторно не запускается.
function initLogoIntro() {
  const logo = document.querySelector(".header-logo");
  const header = logo?.closest(".header");
  if (!logo || !header) return;

  let alreadyPlayed = false;
  try {
    alreadyPlayed = sessionStorage.getItem("diploma_shop_logo_intro") === "1";
  } catch {
    /* если sessionStorage заблокирован, может показываться на каждой странице */
  }
  const navigation = performance.getEntriesByType("navigation")[0];
  const isReload = navigation?.type === "reload";
  if (alreadyPlayed && !isReload) return;

  header.classList.add("header-intro");
  logo.classList.add("is-intro");
  try {
    sessionStorage.setItem("diploma_shop_logo_intro", "1");
  } catch {
    /* если не удалось записать, сама анимация всё равно сработает */
  }
}

// Сломанное изображение (404/ошибка) -> вместо иконки broken-image
// остаётся чистый серый блок. Событие "error" не всплывает (bubble) -> ловим
// его на уровне document с capture=true (не нужен отдельный listener на каждую картинку).
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

// После загрузки изображение плавно появляется (не выскакивает резко "рывком").
// "load" тоже не всплывает, как и "error" -> тот же приём:
// уровень document, capture=true.
function wireImageFade() {
  // "is-loaded" — ПОКАЗЫВАЕТ изображение (обязательно).
  // "img-fade" — только украшение; playOnce не применяет его, если страница в фоне.
  const show = (img) => {
    img.classList.add("is-loaded");
    playOnce(img, "img-fade");
  };

  document.addEventListener(
    "load",
    (e) => {
      const img = e.target;
      if (img.tagName !== "IMG" || !img.classList.contains("img-fallback")) return;
      show(img);
    },
    true
  );

  // "Подметание" для изображений, уже загруженных из кеша до подключения listener'а.
  // Открываем только УЖЕ загруженные (complete) изображения.
  const sweep = () =>
    document.querySelectorAll("img.img-fallback:not(.is-loaded)").forEach((img) => {
      if (img.complete) show(img);
    });
  window.addEventListener("load", sweep);
  setTimeout(sweep, 3000); // страховочная сетка
}

// Когда курсор наводится на ссылку, браузер заранее подгружает эту страницу
// -> при клике она открывается почти мгновенно.
// Каждый адрес — один раз; "?id=..." не важен, HTML-файл один.
function wirePrefetch() {
  const done = new Set();
  document.addEventListener("pointerover", (e) => {
    const link = e.target.closest?.("a");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    // только обычные страницы этого сайта (не внешние/новое окно)
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

function showCartMergeWarning() {
  try {
    if (sessionStorage.getItem("diploma_shop_cart_merge_warning") !== "1") return;
    sessionStorage.removeItem("diploma_shop_cart_merge_warning");
    toast("Some guest items could not sync and remain saved on this device", "error");
  } catch {
    /* если sessionStorage заблокирован, продолжаем без предупреждения */
  }
}

// Вызывается на каждой странице.
export async function initLayout() {
  await Promise.all([
    loadComponent("header", "header"),
    loadComponent("footer", "footer"),
  ]);
  wireHeaderAuth();
  wireHeaderMenu();
  initLogoIntro();
  wireImageFallback();
  wireImageFade();
  wirePrefetch();
  refreshCartCount();
  subscribe(refreshCartCount); // при изменении корзины "Bag (N)" обновляется
  showCartMergeWarning();

  // Анимация: если есть GSAP — "wow" (motion.js), иначе обычный CSS reveal.
  const motionOn = initMotion();
  if (!motionOn) initReveal();
}

export { initReveal };
