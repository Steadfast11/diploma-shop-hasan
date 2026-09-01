/* ============================================================
   cart-store.js — SAVAT mantig'i (bitta manba)
   Ikki holat:
     - MEHMON: savat localStorage'da (storage.js orqali)
     - KIRGAN foydalanuvchi: savat serverda (api.js orqali)
   cart-store shu ikkisini yashiradi — sahifa "qaysi holat?"
   deb o'ylamaydi, faqat addItem / setQty / remove / getItems deydi.
   ------------------------------------------------------------
   REJALASHTIRILGAN:
     getItems()  getCount()  getTotal()
     addItem(product, qty)  setQty(productId, qty)  removeItem(productId)  clear()
     mergeGuestCartIntoAccount()   // login paytida mehmon savatini serverga ko'chirish
     subscribe(fn)                 // header'dagi savat soni yangilanib tursin
   Nega alohida modul: header ham (savat soni), cart sahifasi ham,
   product sahifasi ham (add to cart) — hammasi shuni ishlatadi.
   ============================================================ */
