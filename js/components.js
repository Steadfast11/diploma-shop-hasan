/* ============================================================
   components.js — header/footer'ni sahifaga joylaydi
   Har HTML'da bo'sh <div id="header"> va <div id="footer"> turadi.
   Bu fayl components/header.html va footer.html ni fetch qilib,
   o'sha div'lar ichiga qo'yadi. Shunday qilib header bitta joyda
   yoziladi, 7 sahifada takrorlanmaydi.

   MUHIM: fetch() ishlashi uchun sayt DEV-SERVERdan ochilishi kerak
   (file:// da ishlamaydi). README ga qarang: `npm run dev`.
   ============================================================ */

// Bitta komponentni yuklab, kerakli div ichiga qo'yadi.
//   name    -> "header" yoki "footer"  (components/<name>.html fayli)
//   mountId -> qaysi div  ("header" yoki "footer")
async function loadComponent(name, mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return; // bu sahifada bunday div yo'q -> jimgina to'xtaymiz

  const res = await fetch(`/components/${name}.html`); // faylni so'raymiz
  const html = await res.text(); // javobni matn sifatida olamiz
  mount.innerHTML = html; // div ichiga joylaymiz
}

// Har sahifa shuni chaqiradi: header + footer birga (parallel) yuklanadi.
export async function initLayout() {
  await Promise.all([
    loadComponent("header", "header"),
    loadComponent("footer", "footer"),
  ]);
}
