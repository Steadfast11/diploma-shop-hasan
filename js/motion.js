/* ============================================================
   motion.js — "wow" animatsiyalar (GSAP + ScrollTrigger + Lenis)
   Kutubxonalar js/vendor/ da, HTML <head> da <script defer> bilan
   yuklanadi -> window.gsap / window.ScrollTrigger / window.Lenis.

   USLUB: MAKSIMAL SILLIQ. Uzoq davomiylik, yumshoq egri chiziqlar
   (power2.out / expo.out), kichik siljish. Keskin/tez harakat yo'q.

   Agar kutubxona yo'q yoki prefers-reduced-motion -> false qaytaradi,
   shunda components.js oddiy CSS reveal (reveal.js) ni ishlatadi.
   ============================================================ */

// Satrni "so'z > ichki span" ga bo'ladi (mask-reveal uchun).
function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words
    .map((w) => `<span class="m-word"><span class="m-word__in">${w}</span></span>`)
    .join(" ");
}

export function initMotion() {
  const { gsap, ScrollTrigger, Lenis } = window;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !gsap || !ScrollTrigger || !Lenis) return false;

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power2.out" }); // yumshoq to'xtash
  document.documentElement.classList.add("has-motion");

  /* --- Lenis: yumshoq, sekin inersiyali skroll --- */
  const lenis = new Lenis({
    duration: 1.5,        // uzoqroq -> silliqroq to'xtash
    smoothWheel: true,
    wheelMultiplier: 0.9, // g'ildirak biroz "yengil"
    easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)), // expo.out
  });
  // Boshqa modullar (masalan telefon davlat ro'yxati) skrollни vaqtincha
  // to'xtata olsin: window.__lenis.stop() / .start().
  window.__lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* --- Blok reveal: [data-reveal] / [data-reveal-stagger] ko'rinishga kirganda
     yumshoq pastdan chiqadi. Kichik siljish, uzoq davomiylik. --- */
  gsap.utils.toArray("[data-reveal], [data-reveal-stagger]").forEach((el) => {
    gsap.fromTo(
      el,
      { y: 14, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
      }
    );
  });

  /* --- Hero: sarlavha so'zlari maska ortidan SEKIN ko'tariladi --- */
  const heroLines = document.querySelectorAll("[data-hero-line]");
  if (heroLines.length) {
    heroLines.forEach(splitWords);
    gsap.fromTo(
      "[data-hero-line] .m-word__in",
      { yPercent: 105 },
      {
        yPercent: 0,
        duration: 1.4,
        ease: "expo.out",
        stagger: 0.055,
        delay: 0.25,
      }
    );
  }
  const heroBtn = document.querySelector(".hero__btn");
  if (heroBtn) {
    gsap.fromTo(
      heroBtn,
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out", delay: 1.4 }
    );
  }

  /* --- Hero foni: skroll bilan juda yengil parallaks (scrub 1s "kechikadi") --- */
  const heroBg = document.querySelector("[data-parallax]");
  if (heroBg) {
    gsap.to(heroBg, {
      yPercent: 10,
      ease: "none",
      scrollTrigger: {
        trigger: heroBg.closest(".hero"),
        start: "top top",
        end: "bottom top",
        scrub: 1, // 1s "quvib yetish" -> silliqroq
      },
    });
  }

  /* --- Sahifa ochilishi: main juda oz pastdan yumshoq paydo bo'ladi --- */
  gsap.from("main", { autoAlpha: 0, y: 8, duration: 0.9, ease: "power2.out" });

  ScrollTrigger.refresh();
  window.addEventListener("load", () => ScrollTrigger.refresh());

  /* Xavfsizlik to'ri: 2s dan keyin EKRANDA ko'rinib turgan, lekin hali
     yashirin bloklarni majburan ko'rsatamiz (ScrollTrigger ishlamay qolsa). */
  setTimeout(() => {
    document.querySelectorAll("[data-reveal], [data-reveal-stagger]").forEach((el) => {
      const r = el.getBoundingClientRect();
      const hidden = parseFloat(getComputedStyle(el).opacity) === 0;
      if (hidden && r.top < window.innerHeight && r.bottom > 0) {
        gsap.set(el, { autoAlpha: 1, y: 0 });
        gsap.set(el.children, { autoAlpha: 1, y: 0 });
      }
    });
  }, 2000);

  return true;
}
