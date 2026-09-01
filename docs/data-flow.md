# Ma'lumot oqimi (bosqichma-bosqich)

Doska savoli: "Foydalanuvchi X tugmani bossa, nima bo'ladi? Boshidan oxirigacha ayt."
Shu yerda har amalni yozamiz.

## Namuna: "Savatga qo'shish" (product sahifasi)
1. Foydalanuvchi miqdorni tanlaydi (−/+), "Add to cart" bosadi
2. `pages/product.js` tugma hodisasini eshitadi -> `cartStore.addItem(product, qty)`
3. `cart-store.js`:
   - kirilgan bo'lsa -> `api.addToCart(productId, qty)` (server savati)
   - mehmon bo'lsa -> `storage.setGuestCart(...)` (localStorage)
4. `cart-store` obunachilarni xabardor qiladi -> header'dagi savat soni yangilanadi
5. `ui.showToast("Savatga qo'shildi")`

## To'ldiriladi
- Login oqimi
- Katalog filtr oqimi (Apply filter -> URL query -> getProducts -> qayta chizish)
- Buyurtma berish oqimi (cart -> requireAuth -> createOrder -> savat tozalanadi -> orders)
- Izoh qo'shish oqimi
