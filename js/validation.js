/* ============================================================
   validation.js — Register formasi uchun sof (toza) tekshiruvchilar
   Har funksiya bitta qiymatni oladi va:
     - hammasi joyida bo'lsa  -> "" (bo'sh satr)
     - xato bo'lsa            -> foydalanuvchiga ko'rsatiladigan inglizcha matn
   DOM bilan ishlamaydi -> oson sinab ko'rsa bo'ladi, doskada tushuntirish oson.

   Telefon logikasi bu yerda YO'Q: yuzlab davlat qoidasini qo'lda yozib
   bo'lmaydi -> u alohida `phone-input.js` da (intl-tel-input kutubxonasi).
   ============================================================ */

// Email formati. Qo'lda, lekin qat'iy:
//  - local qism: harf/raqam/ba'zi belgilar, nuqta bilan ajratiladi
//    (ketma-ket nuqta yoki chekka nuqta -> rad)
//  - domen: kamida ikki "label" (masalan  example . com), oxiri >=2 harf
//  - bo'shliq umuman yo'q
const LOCAL = "[a-z0-9!#$%&'*+/=?^_`{|}~-]+";
const LABEL = "[a-z0-9](?:[a-z0-9-]*[a-z0-9])?";
export const EMAIL_RE = new RegExp(
  `^${LOCAL}(?:\\.${LOCAL})*@(?:${LABEL}\\.)+[a-z]{2,}$`,
  "i"
);

// Ism: faqat Unicode harflar, 3–10 belgi.
// \p{L} — har qanday tildagi harf (kirill, lotin, arab ...). "u" bayrog'i shart.
export function validateName(value) {
  const v = value.trim();
  if (!v) return "Enter your name";
  if (/[^\p{L}]/u.test(v)) return "Name can contain letters only";
  if (v.length < 3 || v.length > 10) return "Name must be 3–10 letters";
  return "";
}

// Familiya: faqat harflar, 3–15 belgi.
export function validateSurname(value) {
  const v = value.trim();
  if (!v) return "Enter your surname";
  if (/[^\p{L}]/u.test(v)) return "Surname can contain letters only";
  if (v.length < 3 || v.length > 15) return "Surname must be 3–15 letters";
  return "";
}

// Email: kuchli FORMAT tekshiruvi.
// MUHIM: pochta qutisi haqiqatan mavjudligini frontend BILA OLMAYDI.
// Buni faqat backend tasdiqlash havolasi (verification link) orqali aniqlash
// mumkin. Shu sabab bu yerda DNS yoki uchinchi tomon "email checker" API yo'q.
export function validateEmail(value) {
  const v = value.trim();
  if (!v) return "Enter your email";
  if (/\s/.test(v)) return "Email cannot contain spaces";
  if (v.length > 254) return "Email is too long";
  if (!EMAIL_RE.test(v)) return "Enter a valid email address";
  return "";
}

// Parol: 8–64 belgi, kamida bitta harf va bitta raqam.
// Regex ekvivalenti: /^(?=.*\p{L})(?=.*\d).{8,64}$/u
// Alohida tekshiramiz -> xato matni aniq bo'ladi.
export function validatePassword(value) {
  if (value.length < 8) return "Password must be at least 8 characters";
  if (value.length > 64) return "Password must be at most 64 characters";
  if (!/\p{L}/u.test(value)) return "Password must include at least one letter";
  if (!/\d/.test(value)) return "Password must include at least one digit";
  return "";
}

// Parolni takrorlash: bo'sh emas va asosiy parol bilan bir xil.
export function validatePasswordConfirmation(password, confirmation) {
  if (!confirmation) return "Repeat your password";
  if (password !== confirmation) return "Passwords do not match";
  return "";
}
