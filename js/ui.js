/* ============================================================
   ui.js — мелкие повторяющиеся JS-помощники.
   Цель: скрипты страниц должны быть короткими и читаемыми.
   ============================================================ */


// Цена: 19.99 -> "$19.99"
export const money = (n) => "$" + Number(n).toFixed(2);

// Телефон: "998901234500" -> "+998 90 123 45 00" (API хранит только цифры).
export function formatPhone(digits) {
  const d = String(digits ?? "").replace(/\D/g, "");
  if (d.length < 9) return digits || "";
  const cc = d.slice(0, d.length - 9); // например "998"
  const rest = d.slice(-9); // "901234500"
  const parts = [rest.slice(0, 2), rest.slice(2, 5), rest.slice(5, 7), rest.slice(7, 9)];
  return `+${cc} ${parts.join(" ")}`.trim();
}

// "Очистка" текста для безопасной вставки в HTML.
// Почему: название товара/комментарий приходят с бэкенда. Если внутри
// есть <script> или символы < >, они должны отрисовываться как ТЕКСТ, а не как HTML.
export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

/* Карточка товара (HTML-текст).
   Главная страница, каталог, категория, профиль — всё это использует её.
   p: { _id, title, price, image } — приходит С БЭКЕНДА. */
export function productCardHTML(p) {
  const image = p.image
    ? `<img class="card-image img-fallback" src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" />`
    : `<div class="card-image"></div>`; // нет изображения -> пустой серый блок
  return `
    <article class="card">
      <a class="card-link" href="/pages/product.html?id=${encodeURIComponent(p._id)}">
        <div class="card-media">
          ${image}
        </div>
        <div class="card-info">
          <p class="card-title">${esc(p.title)}</p>
          <p class="card-price">${money(p.price)}</p>
        </div>
      </a>
    </article>`;
}

// N штук "скелетных" карточек (показываются во время загрузки — вместо
// текста "Loading…"). Просто серые, пульсирующие блоки.
export function skeletonCardsHTML(n = 4) {
  return Array.from(
    { length: n },
    () => `
    <div class="card skeleton" aria-hidden="true">
      <div class="card-image"></div>
      <div class="card-info">
        <span class="skeleton-line"></span>
      </div>
    </div>`
  ).join("");
}

// Отрисовать сообщение об ошибке в контейнере (когда API упал)
export function showError(container, message) {
  if (container) {
    container.innerHTML = `<p class="state-message state-message-error">${esc(message)}</p>`;
  }
}

// Отрисовать сообщение "пусто" в контейнере (нет результатов)
export function showEmpty(container, message) {
  if (container) {
    container.innerHTML = `<p class="state-message">${esc(message)}</p>`;
  }
}

/* ---------- Toast (небольшое уведомление) ----------
   Вместо alert(): появляется внизу экрана и само исчезает.
   type: "" (обычный) или "error" (красный). */
let toastTimer;
export function toast(message, type = "") {
  let box = document.querySelector(".toast");
  if (!box) {
    box = document.createElement("div");
    box.className = "toast";
    box.setAttribute("aria-live", "polite");
    box.setAttribute("aria-atomic", "true");
    document.body.appendChild(box);
  }
  box.setAttribute("role", type === "error" ? "alert" : "status");
  box.className = "toast" + (type ? " toast-" + type : "");
  box.textContent = message;
  box.classList.add("is-shown");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.remove("is-shown"), 3200);
}

/* ---------- Помощники анимации ----------
   Все три — просто "украшение": если не сработают, сайт всё равно будет выглядеть правильно. */

// Включён ли у пользователя в системе режим "меньше движения"?
const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Добавляет класс одноразовой анимации и убирает его после завершения
   (чтобы в следующий раз она снова сработала).

   ВАЖНО: если страница в фоне (в другой вкладке), браузер
   приостанавливает анимацию, и элемент застревает в своём состоянии 0% —
   а наши анимации начинаются с `opacity: 0`, то есть
   элемент остался бы НЕВИДИМЫМ. Поэтому в фоне мы вообще её не запускаем:
   пользователь всё равно не смотрит, а контент при этом виден. */
export function playOnce(el, className) {
  if (!el || document.hidden) return;
  el.classList.add(className);
  el.addEventListener("animationend", () => el.classList.remove(className), {
    once: true,
  });
}

/* Показывает новые отрисованные карточки друг за другом (stagger).
   from — с какого индекса начинать (при "Load more" — только НОВЫЕ).
   Если нет GSAP или включён режим сниженного движения — ничего не делает,
   карточки и так видны. */
export function revealCards(container, from = 0) {
  if (!container) return;
  const { gsap, ScrollTrigger } = window;
  // После добавления контента высота страницы изменилась -> замеры скролла
  // не должны устареть (иначе нижние блоки откроются поздно/рано).
  ScrollTrigger?.refresh();
  if (!gsap || reducedMotion()) return;

  // Если страница в фоне (в другой вкладке), браузер приостанавливает
  // анимацию -> карточки застряли бы в СКРЫТОМ виде. В этом случае
  // анимацию вообще не делаем: они и так видны.
  if (document.hidden) return;

  const cards = [...container.children].slice(from);
  if (!cards.length) return;
  // Не нужно для полной сетки за пределами экрана — её сам покажет
  // [data-reveal-stagger] при скролле.
  const box = container.getBoundingClientRect();
  if (from === 0 && (box.top > window.innerHeight || box.bottom < 0)) return;

  const tween = gsap.fromTo(
    cards,
    { y: 12, autoAlpha: 0 },
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.06,
      clearProps: "all", // чтобы после завершения не оставались инлайн-стили
    }
  );

  // Страховочная сетка (как в motion.js): если анимация почему-то не
  // завершилась, принудительно показываем карточки — контент никогда
  // не должен остаться невидимым.
  setTimeout(() => {
    if (tween.progress() < 1) gsap.set(cards, { clearProps: "all" });
  }, 2500);
}

/* "Отсчитывает" число от старого значения к новому ($120 -> $145).
   format — функция, превращающая число в текст (например money). */
export function countUp(el, to, format = String, duration = 600) {
  if (!el) return;
  const from = Number(String(el.textContent).replace(/[^\d.-]/g, "")) || 0;
  if (reducedMotion() || from === to) {
    el.textContent = format(to);
    return;
  }
  const start = performance.now();
  function step(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3); // плавная остановка
    el.textContent = format(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* При нажатии "Add to cart" копия изображения товара летит к
   "Bag (N)" в шапке. Временный элемент — сам исчезает после завершения. */
export function flyToBag(sourceImg) {
  const target = document.querySelector("[data-cart-count]");
  if (!sourceImg || !target || reducedMotion()) return;

  const from = sourceImg.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (!from.width) return; // изображение ещё не загружено

  const ghost = document.createElement("img");
  ghost.src = sourceImg.currentSrc || sourceImg.src;
  ghost.alt = "";
  ghost.className = "fly-ghost";
  ghost.style.left = from.left + "px";
  ghost.style.top = from.top + "px";
  ghost.style.width = from.width + "px";
  ghost.style.height = from.height + "px";
  document.body.appendChild(ghost);

  // смещение от центра к центру
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  // Два раза rAF: сначала браузер отрисовывает начальное состояние,
  // потом изменение видно как transition.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      ghost.style.transform = `translate(${dx}px, ${dy}px) scale(0.08)`;
      ghost.style.opacity = "0";
    })
  );
  setTimeout(() => ghost.remove(), 800);
}

/* Превращает ошибку API в понятный для пользователя текст (текст API — по-русски). */
export function friendlyError(err) {
  const byStatus = {
    401: "Session expired — please log in again",
    403: "You don't have permission",
    404: "Not found",
    409: "Couldn't complete (limit or conflict)",
    429: "Too many requests — please wait",
  };
  return byStatus[err?.status] || err?.message || "Something went wrong";
}

/* ---------- Модальное окно (написание отзыва / "Thank you") ----------
   openModal сам создаёт свой DOM (отдельный файл компонента не нужен).
   opts: { title, bodyHTML, buttonText, onConfirm(modalEl) } */
let returnFocus = null;
function onModalKeydown(e) {
  if (e.key === "Escape") return closeModal();
  if (e.key !== "Tab") return;
  const modal = document.querySelector(".modal");
  const focusable = [...modal.querySelectorAll("button, textarea, input, select, a[href]")]
    .filter((node) => !node.disabled && node.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
export function closeModal() {
  document.querySelector(".modal")?.remove();
  document.removeEventListener("keydown", onModalKeydown);
  document.body.style.overflow = "";
  returnFocus?.focus();
  returnFocus = null;
}
export function openModal({ title, bodyHTML = "", buttonText = "OK", onConfirm }) {
  closeModal();
  returnFocus = document.activeElement;
  const el = document.createElement("div");
  el.className = "modal";
  // Карточка = <form>, кнопка = type="submit". Благодаря этому окно
  // отправляется и по Enter (стандартное поведение браузера), и по
  // нажатию кнопки — оба случая приводят к одному событию "submit".
  el.innerHTML = `
    <div class="modal-overlay" data-close></div>
    <form class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <p class="modal-title" id="modal-title">${esc(title)}</p>
      <div class="modal-body">${bodyHTML}</div>
      <button class="modal-btn" type="submit" data-confirm>${esc(buttonText)}</button>
    </form>`;
  el.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeModal();
  });
  el.addEventListener("submit", (e) => {
    e.preventDefault(); // чтобы страница не перезагрузилась
    onConfirm ? onConfirm(el) : closeModal();
  });
  // Внутри <textarea> Enter обычно добавляет новую строку и не
  // отправляет форму. Нам нужно, чтобы Enter = "отправить", а новая
  // строка оставалась на Shift+Enter.
  el.querySelector("textarea")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      el.querySelector(".modal-box").requestSubmit();
    }
  });
  document.addEventListener("keydown", onModalKeydown);
  document.body.style.overflow = "hidden"; // чтобы фон не скроллился
  document.body.appendChild(el);
  (el.querySelector("textarea, input, select") || el.querySelector("[data-confirm]"))?.focus();
  return el;
}
