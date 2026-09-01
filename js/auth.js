/* ============================================================
   auth.js — "kim kirgan" holatini boshqaradi
   api.js — so'rov yuboradi; auth.js — natijani saqlaydi va
   "hozir kirilganmi?" degan savolga javob beradi.
   ------------------------------------------------------------
   REJALASHTIRILGAN:
     isLoggedIn()                 -> token bormi
     currentUser()                -> saqlangan profil (yoki null)
     doLogin(credentials)         -> api.login + token saqlash
     doRegister(data)             -> api.register + token saqlash
     doLogout()                   -> api.logout + tozalash
     requireAuth()                -> kirilmagan bo'lsa login sahifasiga
   Eslatma: token 14 kun yashaydi; 401 kelsa — chiqarib yuboramiz.
   ============================================================ */
