/* ============================================================
   api.js — SERVER bilan gaplashadigan YAGONA fayl.
   Qoida: fetch() faqat shu yerda. Sahifa skriptlari bu fayldagi
   funksiyalarni chaqiradi, o'zi fetch qilmaydi. Shunda:
     - base URL bitta joyda
     - token bitta joyda qo'shiladi
     - xato bitta joyda ushlanadi (chaqiruvchi try/catch qiladi)
   API hujjati: docs/api-reference.md
   ============================================================ */

import { API_BASE } from "./config.js";
import { getToken } from "./storage.js";

/* Ichki yordamchi — HAR so'rov shu orqali o'tadi.
   path  : "/products" kabi (API_BASE oldiga qo'shiladi)
   method: "GET" (default), "POST", "PATCH", "DELETE"
   body  : obyekt bo'lsa JSON'ga aylantiriladi
   auth  : true bo'lsa Authorization: Bearer <token> qo'shiladi */
async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;
  }

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // API hamma javobni JSON qaytaradi (xato ham: { message: "..." })
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // xatoni "otamiz" -> chaqiruvchi joyda try/catch bilan ushlanadi
    const err = new Error(data.message || `Xatolik (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ---------- Auth (docs 5.1) ---------- */
export const register = (payload) => request("/register", { method: "POST", body: payload });
export const login = (payload) => request("/login", { method: "POST", body: payload });
export const logout = () => request("/logout", { method: "POST", auth: true });
export const getMe = () => request("/me", { auth: true });

/* ---------- Katalog (token kerak emas, docs 5.2) ---------- */
export function getProducts({ category, minPrice, maxPrice, page, limit } = {}) {
  const qs = new URLSearchParams();
  if (category) qs.set("category", category);
  if (minPrice != null) qs.set("minPrice", minPrice);
  if (maxPrice != null) qs.set("maxPrice", maxPrice);
  if (page) qs.set("page", page);
  if (limit) qs.set("limit", limit);
  const s = qs.toString();
  return request("/products" + (s ? "?" + s : ""));
}
export const getNewest = (limit = 8) => request(`/products/newest?limit=${limit}`);
export const getBestsellers = (limit = 8) => request(`/products/bestsellers?limit=${limit}`);
export const getProduct = (id) => request(`/products/${id}`);
export const getCategories = () => request("/categories");
export const getCategoryProducts = (id) => request(`/categories/${id}/products`);

/* ---------- Savat (token, docs 5.3) ---------- */
export const getCart = () => request("/cart", { auth: true });
export const addToCart = (productId, qty = 1) =>
  request("/cart", { method: "POST", auth: true, body: { productId, qty } });
export const updateCartItem = (productId, qty) =>
  request(`/cart/${productId}`, { method: "PATCH", auth: true, body: { qty } });
export const removeCartItem = (productId) =>
  request(`/cart/${productId}`, { method: "DELETE", auth: true });
export const clearCart = () => request("/cart", { method: "DELETE", auth: true });

/* ---------- Buyurtma (token, docs 5.4) ---------- */
export const createOrder = () => request("/orders", { method: "POST", auth: true });
export const getOrders = () => request("/orders", { auth: true });

/* ---------- Izoh (token, docs 5.5) ---------- */
export const addComment = (productId, text) =>
  request(`/products/${productId}/comments`, { method: "POST", auth: true, body: { text } });
export const deleteComment = (productId, commentId) =>
  request(`/products/${productId}/comments/${commentId}`, { method: "DELETE", auth: true });
