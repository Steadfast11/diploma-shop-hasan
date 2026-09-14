/* ============================================================
   reveal.js — scroll-reveal (элемент появляется, когда попадает в область видимости)
   IntersectionObserver: браузер следит за видимостью элемента на
   экране. Когда виден, добавляем класс .is-visible (остальное делает
   CSS — правила [data-reveal] в ui.css).

   Разметка:
     <section data-reveal>            -> появляется весь блок
     <div class="grid" data-reveal-stagger> -> дочерние элементы друг за другом
   ============================================================ */

// Попал в область видимости -> добавляем .is-visible (остальное делает CSS),
// прекращаем наблюдение (один раз).
function onIntersect(entries, observer) {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  }
}

export function initReveal(root = document) {
  // пропускаем уже показанные (безопасно при повторном вызове)
  const targets = [...root.querySelectorAll("[data-reveal], [data-reveal-stagger]")].filter(
    (t) => !t.classList.contains("is-visible")
  );
  if (!targets.length) return;

  // старый браузер или reduced-motion — показываем всё сразу
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach((t) => t.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(onIntersect, {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px",
  });
  targets.forEach((t) => observer.observe(t));

  // СТРАХОВОЧНАЯ СЕТКА: если по какой-то причине observer не сработает
  // (старый браузер, фоновая вкладка и т.д.) — контент не должен остаться скрытым навсегда.
  setTimeout(() => {
    targets.forEach((t) => t.classList.add("is-visible"));
  }, 1500);
}
