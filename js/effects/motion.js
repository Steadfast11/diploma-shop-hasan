/* ============================================================
   motion.js — "wow"-анимации (GSAP + ScrollTrigger + Lenis)
   Библиотеки лежат в js/vendor/, загружаются в HTML <head> через
   <script defer> -> window.gsap / window.ScrollTrigger / window.Lenis.

   СТИЛЬ: МАКСИМАЛЬНО ПЛАВНО. Долгая длительность, мягкие кривые
   (power2.out / expo.out), небольшое смещение. Резких/быстрых движений нет.

   Если библиотеки нет или включён prefers-reduced-motion -> возвращает false,
   тогда components.js использует обычный CSS reveal (reveal.js).
   ============================================================ */

// Делит строку на "слово > внутренний span" (для эффекта mask-reveal).
function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words
    .map((w) => `<span class="m-word"><span class="m-word-in">${w}</span></span>`)
    .join(" ");
}

export function initMotion() {
  const { gsap, ScrollTrigger, Lenis } = window;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !gsap || !ScrollTrigger || !Lenis) return false;

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power2.out" }); // плавная остановка
  document.documentElement.classList.add("has-motion");

  /* --- СТРАХОВОЧНАЯ СЕТКА ---
     СПЕЦИАЛЬНО регистрируем В САМОМ НАЧАЛЕ: даже если какой-то из
     блоков анимации ниже выдаст ошибку, сетка всё равно будет построена.
     (Иначе сетка не успела бы зарегистрироваться именно тогда, когда она
     нужнее всего.)

     Если анимация почему-то не завершилась, контент не должен остаться
     скрытым. Самый опасный случай: страница открыта в ФОНОВОЙ ВКЛАДКЕ —
     браузер приостанавливает кадры анимации, и gsap.from(...) оставляет
     элемент в состоянии "from" (opacity 0 / visibility hidden). Для `main`
     это особенно плохо: всё внутри наследует его `visibility`.

     Поэтому: через 2с И каждый раз, когда страница снова становится
     видимой, принудительно показываем то, что осталось скрытым на экране.
     То, что за пределами экрана, не трогаем — оно появится при скролле. */
  const inView = (el) => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  };

  function safetyNet() {
    // 1) main — может скрыть собой всю страницу
    const mainEl = document.querySelector("main");
    if (mainEl && getComputedStyle(mainEl).visibility === "hidden") {
      gsap.set(mainEl, { autoAlpha: 1, clearProps: "transform" });
    }
    // 2) блоки reveal
    document.querySelectorAll("[data-reveal], [data-reveal-stagger]").forEach((el) => {
      if (parseFloat(getComputedStyle(el).opacity) === 0 && inView(el)) {
        gsap.set(el, { autoAlpha: 1, y: 0 });
        gsap.set(el.children, { autoAlpha: 1, y: 0 });
      }
    });
    // 3) словесная маска (hero + заголовки [data-split]) — слова не должны
    //    "зависнуть" за маской
    //    ВАЖНО: ScrollTrigger срабатывает на "top 92%". Поэтому
    //    исправляем только заголовки, прошедшие ЭТУ точку — заголовок,
    //    стоящий у самого края экрана и ещё не дождавшийся своей очереди, не трогаем.
    document.querySelectorAll("[data-hero-line], [data-split]").forEach((title) => {
      const r = title.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight * 0.92) {
        gsap.set(title.querySelectorAll(".m-word-in"), { yPercent: 0 });
      }
    });
    // 4) кнопка hero — она появляется с задержкой (delay), поэтому
    //    вероятность "застрять" у неё самая высокая
    const btn = document.querySelector(".hero-btn");
    if (btn && inView(btn) && getComputedStyle(btn).visibility === "hidden") {
      gsap.set(btn, { autoAlpha: 1, y: 0 });
    }
  }

  setTimeout(safetyNet, 2000);
  // Проверяем и тогда, когда страница, открытая в фоновой вкладке, снова становится видимой
  // (анимации в этот момент запускаются заново -> даём им время).
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) setTimeout(safetyNet, 1500);
  });


  /* --- Lenis: плавный, медленно-инерционный скролл ---
     ТОЛЬКО на устройствах с мышью/колесом. На сенсорном экране Lenis
     перехватывает движение пальца и "догоняет" его анимацией за 1.5 секунды:
     пока палец двигается, страница застывает, а при отпускании
     резко "прыгает". Собственный скролл мобильного браузера уже
     плавный — поэтому там Lenis не включаем. */
  const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  if (!isTouch) {
    const lenis = new Lenis({
      duration: 1.5,        // дольше -> плавнее остановка
      smoothWheel: true,
      wheelMultiplier: 0.9, // колесо чуть "легче"
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)), // expo.out
    });
    // Другие модули (например список стран для телефона) могут временно
    // остановить скролл: window.__lenis?.stop() / .start().
    // На сенсорном экране __lenis не будет -> вызовы написаны через `?.`.
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
  }
  gsap.ticker.lagSmoothing(0);

  /* --- Reveal блоков: [data-reveal] / [data-reveal-stagger] плавно
     выезжают снизу при появлении в области видимости. Небольшое смещение, долгая длительность. --- */
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

  /* --- Hero: слова заголовка МЕДЛЕННО поднимаются из-за маски --- */
  const heroLines = document.querySelectorAll("[data-hero-line]");
  if (heroLines.length) {
    heroLines.forEach(splitWords);
    gsap.fromTo(
      "[data-hero-line] .m-word-in",
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
  const heroBtn = document.querySelector(".hero-btn");
  if (heroBtn) {
    gsap.fromTo(
      heroBtn,
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out", delay: 1.4 }
    );
  }

  /* --- Заголовки секций: ТОЧНО такой же эффект словесной маски, как у hero,
     но срабатывает при появлении по скроллу. Работает на заголовках с
     [data-split] (НЕ на тех, чей текст меняется через JS —
     splitWords перезаписывает innerHTML). --- */
  document.querySelectorAll("[data-split]").forEach((el) => {
    splitWords(el);
    gsap.fromTo(
      el.querySelectorAll(".m-word-in"),
      { yPercent: 105 },
      {
        yPercent: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.05,
        scrollTrigger: { trigger: el, start: "top 92%" },
      }
    );
  });

  /* --- Фон hero: очень лёгкий параллакс со скроллом (scrub 1с "с отставанием") --- */
  const heroBg = document.querySelector("[data-parallax]");
  if (heroBg) {
    gsap.to(heroBg, {
      yPercent: 10,
      ease: "none",
      scrollTrigger: {
        trigger: heroBg.closest(".hero"),
        start: "top top",
        end: "bottom top",
        scrub: 1, // 1с "догонки" -> плавнее
      },
    });
  }

  /* --- Открытие страницы: main плавно появляется, слегка снизу --- */
  gsap.from("main", {
    autoAlpha: 0,
    y: 8,
    duration: 0.9,
    ease: "power2.out",
    // Если после завершения останется transform, модальное окно
    // с position:fixed внутри main привяжется не к viewport, а к длинному блоку main.
    clearProps: "transform",
  });

  ScrollTrigger.refresh();
  window.addEventListener("load", () => ScrollTrigger.refresh());

  return true;
}
