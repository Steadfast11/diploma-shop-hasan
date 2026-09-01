/* ============================================================
   api.js — SERVER bilan gaplashadigan YAGONA fayl
   Qoida: fetch() faqat shu yerda yoziladi. Sahifa skriptlari
   to'g'ridan-to'g'ri fetch qilmaydi — ular shu fayldagi
   funksiyalarni chaqiradi. Shunda:
     - xatoni bir joyda ushlaymiz
     - token'ni bir joyda qo'shamiz
     - endpoint o'zgarsa — bitta joyni tuzatamiz
   ------------------------------------------------------------
   REJALASHTIRILGAN funksiyalar (API hujjatiga mos):
     request(path, options)          -> ichki yordamchi (base URL + token + xato)
     // auth
     register({name,surname,phone,email,password})
     login({email,password})
     logout()
     getMe()
     // katalog (token kerak emas)
     getProducts({category,minPrice,maxPrice,page,limit})
     getNewest(limit)
     getBestsellers(limit)
     getProduct(id)                  -> mahsulot + izohlar
     getCategories()
     // savat (token)
     getCart() / addToCart(productId, qty)
     updateCartItem(productId, qty) / removeCartItem(productId) / clearCart()
     // buyurtma (token)
     createOrder() / getOrders()
     // izoh (token)
     addComment(productId, text) / deleteComment(productId, commentId)
   ------------------------------------------------------------
   Cheklov: 120 so'rov/daqiqa. Cheksiz fetch sikli = 429. Kesh + ehtiyotkorlik.
   ============================================================ */
