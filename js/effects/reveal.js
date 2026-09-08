/* ============================================================
   reveal.js — scroll-reveal (element ko'rinishga kirganda paydo bo'ladi)
   IntersectionObserver: brauzer elementning ekranda ko'rinishini
   kuzatadi. Ko'ringanda .is-visible klassini qo'shamiz (CSS qolganini
   qiladi — ui.css'dagi [data-reveal] qoidalari).

   Belgilash:
     <section data-reveal>            -> butun blok paydo bo'ladi
     <div class="grid" data-reveal-stagger> -> bolalari birin-ketin
   ============================================================ */

// Ko'rinishga kirdi -> .is-visible qo'shamiz (CSS qolganini qiladi),
// kuzatishni to'xtatamiz (bir marta).
function onIntersect(entries, observer) {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  }
}

export function initReveal(root = document) {
  // allaqachon ko'rsatilganlarni tashlab ketamiz (qayta chaqirilsa xavfsiz)
  const targets = [...root.querySelectorAll("[data-reveal], [data-reveal-stagger]")].filter(
    (t) => !t.classList.contains("is-visible")
  );
  if (!targets.length) return;

  // brauzer eski bo'lsa yoki reduced-motion — hammasini darrov ko'rsatamiz
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

  // XAVFSIZLIK TO'RI: agar biror sabab bilan observer ishlamasa
  // (eski brauzer, fon tab va h.k.) — kontent abadiy yashirin qolmasin.
  setTimeout(() => {
    targets.forEach((t) => t.classList.add("is-visible"));
  }, 1500);
}
