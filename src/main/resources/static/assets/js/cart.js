/* ============================================================
   DHARIGA MART - cart.js
   View cart, increase / decrease / remove items, totals
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    if (!isLoggedIn()) { window.location.href = "login.html"; return; }
    bootPage("cart");
    loadCart();
});

async function loadCart() {
    const loader  = document.getElementById("cartLoader");
    const empty   = document.getElementById("cartEmpty");
    const content = document.getElementById("cartContent");
    const itemsEl = document.getElementById("cartItems");

    try {
        const items = await api("/api/cart");

        if (items.length === 0) {
            loader.classList.add("d-none");
            empty.classList.remove("d-none");
            content.classList.add("d-none");
            return;
        }

        itemsEl.innerHTML = items.map((item, idx) => `
            <div class="cart-item mb-3">
                <div class="d-flex gap-3 align-items-center flex-wrap">
                    <img src="${item.imageUrl || 'assets/images/products/placeholder.svg'}"
                         alt="${item.name}"
                         onerror="this.src='assets/images/products/placeholder.svg'">
                    <div class="flex-grow-1 min-w-150">
                        <h6 class="item-name mb-1">${item.name}</h6>
                        <div class="item-price">${money(item.price)} each</div>
                        <div class="small text-muted">Stock available: ${item.stock}</div>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <button class="btn btn-sm btn-outline-brand rounded-circle" onclick="changeQty(${item.productId}, ${item.quantity} - 1, '${idx}')"><i class="bi bi-dash"></i></button>
                        <span class="fw-semibold qty-text" id="qty-${idx}">${item.quantity}</span>
                        <button class="btn btn-sm btn-outline-brand rounded-circle" onclick="changeQty(${item.productId}, ${item.quantity} + 1, '${idx}')"><i class="bi bi-plus"></i></button>
                    </div>
                    <div class="item-total fs-5" id="line-${idx}">${money(item.subtotal)}</div>
                    <button class="remove-btn" onclick="removeItem(${item.productId})" title="Remove">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join("");

        renderTotals(items);
        loader.classList.add("d-none");
        content.classList.remove("d-none");
    } catch (err) {
        loader.classList.add("d-none");
        empty.classList.remove("d-none");
        empty.querySelector("h5").textContent = "Could not load cart";
        empty.querySelector("p").textContent = err.message;
    }
}

function renderTotals(items) {
    const subtotal = items.reduce((s, i) => s + Number(i.subtotal), 0);
    const shipping = subtotal >= 999 ? 0 : 49;
    const total = subtotal + shipping;
    const count = items.reduce((s, i) => s + i.quantity, 0);

    document.getElementById("cartCountLabel").textContent = count;
    document.getElementById("cartSubtotal").textContent = money(subtotal);
    document.getElementById("cartShipping").textContent = shipping === 0 ? "Free" : money(shipping);
    document.getElementById("cartTotal").textContent = money(total);
}

async function changeQty(productId, newQty, idx) {
    if (newQty < 1) { removeItem(productId); return; }
    try {
        await api("/api/cart/" + productId, "PUT", { productId, quantity: newQty });
        loadCart();
        refreshCartCount();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function removeItem(productId) {
    try {
        await api("/api/cart/" + productId, "DELETE");
        showToast("Item removed from cart", "success");
        loadCart();
        refreshCartCount();
    } catch (err) {
        showToast(err.message, "error");
    }
}