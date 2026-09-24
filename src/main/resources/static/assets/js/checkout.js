/* ============================================================
   DHARIGA MART - checkout.js
   Delivery details, order summary, place order, success
   ============================================================ */
const INDIAN_STATES = [
    "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
    "Meghalaya", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

let currentOrder = null;

document.addEventListener("DOMContentLoaded", () => {
    if (!isLoggedIn()) { window.location.href = "login.html"; return; }
    bootPage("cart");

    // populate states
    const stateSel = document.getElementById("cState");
    stateSel.innerHTML = '<option value="">Select state</option>' +
        INDIAN_STATES.map(s => `<option value="${s}">${s}</option>`).join("");

    prefillAndLoad();
});

async function prefillAndLoad() {
    const loader  = document.getElementById("checkoutLoader");
    const empty   = document.getElementById("checkoutEmpty");
    const content = document.getElementById("checkoutContent");

    try {
        // prefill profile
        const user = await api("/api/users/me");
        document.getElementById("cName").value = user.name || "";
        document.getElementById("cPhone").value = user.phone || "";
        document.getElementById("cEmail").value = user.email || "";

        const items = await api("/api/cart");
        if (items.length === 0) {
            loader.classList.add("d-none");
            empty.classList.remove("d-none");
            return;
        }

        // render summary
        const itemsEl = document.getElementById("checkoutItems");
        itemsEl.innerHTML = items.map(i => `
            <div class="checkout-item">
                <img src="${i.imageUrl || 'assets/images/products/placeholder.svg'}" alt="${i.name}"
                     onerror="this.src='assets/images/products/placeholder.svg'">
                <div class="flex-grow-1">
                    <div class="ci-name">${i.name}</div>
                    <div class="small text-muted">${money(i.price)} x ${i.quantity}</div>
                </div>
                <span class="fw-semibold">${money(i.subtotal)}</span>
            </div>
        `).join("");

        renderTotals(items);

        loader.classList.add("d-none");
        content.classList.remove("d-none");
    } catch (err) {
        loader.classList.add("d-none");
        empty.classList.remove("d-none");
        empty.querySelector("h5").textContent = "Could not load checkout";
        empty.querySelector("a").insertAdjacentHTML("beforebegin", `<p class="text-danger small">${err.message}</p>`);
    }
}

function renderTotals(items) {
    const subtotal = items.reduce((s, i) => s + Number(i.subtotal), 0);
    const shipping = subtotal >= 999 ? 0 : 49;
    const total    = subtotal + shipping;
    const count    = items.reduce((s, i) => s + i.quantity, 0);

    document.getElementById("checkoutCountLabel").textContent = count;
    document.getElementById("checkoutSubtotal").textContent = money(subtotal);
    document.getElementById("checkoutShipping").textContent = shipping === 0 ? "Free" : money(shipping);
    document.getElementById("checkoutTotal").textContent = money(total);
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("checkoutForm");
    if (!form) return;

    const feedbacks = [
        ["cName",    "cNameError",    v => v.trim().length >= 2 ? "" : "Name is required."],
        ["cPhone",   "cPhoneError",   v => /^[6-9]\d{9}$/.test(v.trim()) ? "" : "Enter a valid 10-digit mobile number."],
        ["cEmail",   "cEmailError",   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter a valid email address."],
        ["cAddress", "cAddressError", v => v.trim().length >= 5 ? "" : "Enter your full address."],
        ["cCity",    "cCityError",    v => v.trim().length >= 2 ? "" : "City is required."],
        ["cState",   "cStateError",   v => v ? "" : "Select your state."],
        ["cPincode", "cPincodeError", v => /^[1-9]\d{5}$/.test(v.trim()) ? "" : "Enter a valid 6-digit pincode."]
    ];

    async function placeOrder(e) {
        e.preventDefault();
        const alertBox = document.getElementById("checkoutAlert");
        alertBox.classList.add("d-none");

        let valid = true;
        for (const [id, errId, validate] of feedbacks) {
            const msg = validate(document.getElementById(id).value);
            document.getElementById(id).classList.toggle("is-invalid", !!msg);
            document.getElementById(errId).textContent = msg;
            if (msg) valid = false;
        }
        if (!valid) return;

        const btn = document.getElementById("placeOrderBtn");
        btn.disabled = true;
        document.getElementById("placeOrderSpinner").classList.remove("d-none");

        const payload = {
            customerName:  document.getElementById("cName").value.trim(),
            phone:         document.getElementById("cPhone").value.trim(),
            email:         document.getElementById("cEmail").value.trim(),
            address:       document.getElementById("cAddress").value.trim(),
            city:          document.getElementById("cCity").value.trim(),
            state:         document.getElementById("cState").value,
            pincode:       document.getElementById("cPincode").value.trim()
        };

        try {
            currentOrder = await api("/api/orders", "POST", payload);
            showSuccess(currentOrder);
            const successBox = document.getElementById("checkoutSuccess");
            successBox.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch (err) {
            alertBox.textContent = err.message;
            alertBox.classList.remove("d-none");
            btn.disabled = false;
            document.getElementById("placeOrderSpinner").classList.add("d-none");
        }
    }

    // The Place Order button sits OUTSIDE the <form> (it is in the summary
    // card), so it must trigger the same placement + validation directly.
    form.addEventListener("submit", placeOrder);
    const orderBtn = document.getElementById("placeOrderBtn");
    if (orderBtn) orderBtn.addEventListener("click", placeOrder, { once: false });
});

function showSuccess(order) {
    document.getElementById("checkoutLoader").classList.add("d-none");
    document.getElementById("checkoutContent").classList.add("d-none");
    document.getElementById("checkoutEmpty").classList.add("d-none");
    const success = document.getElementById("checkoutSuccess");
    success.classList.remove("d-none");
    document.getElementById("orderNumber").textContent = order.orderNumber;
    document.getElementById("orderStatusText").textContent =
        "Your order of " + money(order.total) + " has been confirmed. Thank you for shopping with DHARIGA MART.";
    refreshCartCount();
}