/* ============================================================
   DHARIGA MART - my-account.js
   Profile + order history
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    if (!isLoggedIn()) { window.location.href = "login.html"; return; }
    bootPage("account");

    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", () => logout());

    loadAccount();
});

async function loadAccount() {
    try {
        const user = await api("/api/users/me");
        document.getElementById("accountName").textContent = user.name;
        document.getElementById("accountEmail").textContent = user.email;
        document.getElementById("accountPhone").textContent = "+91 " + user.phone;
    } catch (e) { /* profile prefill optional */ }

    const loader  = document.getElementById("ordersLoader");
    const noOrders = document.getElementById("noOrders");
    const list    = document.getElementById("orderList");

    try {
        const orders = await api("/api/orders");
        document.getElementById("totalOrders").textContent = orders.length;

        loader.classList.add("d-none");

        if (orders.length === 0) {
            noOrders.classList.remove("d-none");
            return;
        }

        noOrders.classList.add("d-none");
        list.innerHTML = orders.map(order => orderCard(order)).join("");
    } catch (err) {
        loader.classList.add("d-none");
        list.innerHTML = '<div class="empty-state border-0"><p class="text-danger">' + err.message + '</p></div>';
    }
}

function orderCard(order) {
    const items = order.items.map(i => `
        <div class="order-item-row">
            <img src="${i.imageUrl || 'assets/images/products/placeholder.svg'}" alt="${i.name}"
                 onerror="this.src='assets/images/products/placeholder.svg'">
            <span class="flex-grow-1">${i.name} <span class="text-muted">x${i.quantity}</span></span>
            <span class="fw-semibold">${money(i.subtotal)}</span>
        </div>
    `).join("");

    const date = new Date(order.createdAt).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });

    return `
    <div class="order-card">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div>
                <div class="order-num">${order.orderNumber}</div>
                <div class="small text-muted"><i class="bi bi-calendar3 me-1"></i>${date}</div>
            </div>
            <div class="text-end">
                <span class="status-pill">${order.status}</span>
                <div class="fw-bold fs-5 mt-1">${money(order.total)}</div>
            </div>
        </div>
        <hr class="my-3">
        ${items}
        <hr class="my-3">
        <div class="d-flex justify-content-between flex-wrap small text-muted">
            <span><i class="bi bi-geo-alt me-1"></i>${order.address}, ${order.city}, ${order.state} - ${order.pincode}</span>
            <span>${order.items.length} item(s) &middot; Delivery: ${order.shipping === 0 ? "Free" : money(order.shipping)}</span>
        </div>
    </div>`;
}