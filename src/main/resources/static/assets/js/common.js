/* ============================================================
   DHARIGA MART - common.js
   Shared API helper, auth helpers, navbar + footer injection
   ============================================================ */
const API_BASE = "";

const NAV_CATEGORIES = [
    "Women's Dresses", "Men's Wear", "Western Wear", "Traditional Wear",
    "Kurtis", "Sarees", "Cosmetics", "Makeup", "Skincare", "Accessories"
];

/* ---------------- Auth helpers ---------------- */
function getToken() {
    return localStorage.getItem("dm_token");
}
function getStoredUser() {
    try { return JSON.parse(localStorage.getItem("dm_user")); }
    catch (e) { return null; }
}
function setAuth(token, user) {
    localStorage.setItem("dm_token", token);
    localStorage.setItem("dm_user", JSON.stringify(user));
}
function clearAuth() {
    localStorage.removeItem("dm_token");
    localStorage.removeItem("dm_user");
}
function isLoggedIn() {
    return !!getToken();
}
function logout() {
    clearAuth();
    window.location.href = "login.html";
}

/* ---------------- API helper ---------------- */
async function api(path, method = "GET", body) {
    const headers = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;

    const res = await fetch(API_BASE + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    if (res.status === 401 && !path.startsWith("/api/auth")) {
        clearAuth();
        const pages = ["cart.html", "checkout.html", "my-account.html"];
        if (pages.some(p => location.pathname.endsWith(p))) {
            window.location.href = "login.html?expired=1";
        }
        throw new Error("Session expired. Please login again.");
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        if (data.fieldErrors) {
            const first = Object.values(data.fieldErrors)[0];
            throw new Error(first || "Validation failed");
        }
        throw new Error(data.message || "Something went wrong. Please try again.");
    }
    return data;
}

/* ---------------- Money & rating helpers ---------------- */
function money(n) {
    if (n === null || n === undefined) return "";
    return "\u20B9" + Number(n).toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function renderRating(rating) {
    const r = Math.round(Number(rating || 0));
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        stars += `<i class="bi ${i <= r ? "bi-star-fill" : "bi-star"}"></i>`;
    }
    return stars;
}

function stockHtml(stock) {
    if (stock <= 0) {
        return `<span class="p-stock out-stock"><i class="bi bi-x-circle"></i> Out of Stock</span>`;
    }
    if (stock <= 10) {
        return `<span class="p-stock low-stock">Only ${stock} left in stock</span>`;
    }
    return `<span class="p-stock in-stock"><i class="bi bi-check-circle"></i> In Stock</span>`;
}

/* ---------------- Toast helper ---------------- */
function showToast(message, type = "success") {
    if (typeof bootstrap === "undefined") { alert(message); return; }
    const toastEl = document.getElementById("cartToast");
    if (!toastEl) return;
    const body = toastEl.querySelector(".toast-body");
    body.innerHTML = message;
    toastEl.classList.toggle("bg-success", type === "success");
    toastEl.classList.toggle("text-white", type === "success");
    toastEl.classList.toggle("bg-danger", type === "error");
    toastEl.classList.toggle("text-white", type === "error");
    const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
    toast.show();
}

/* ---------------- Product card template ---------------- */
function productCard(p) {
    const out = p.stock <= 0;
    return `
    <div class="col-6 col-md-4 col-lg-3">
        <div class="product-card">
            <div class="p-img">
                ${out ? '<span class="p-badge out-of-stock">Out of Stock</span>' : `<span class="p-badge">${p.category}</span>`}
                <img src="${p.imageUrl || 'assets/images/products/placeholder.svg'}"
                     alt="${p.name}" loading="lazy"
                     onerror="this.src='assets/images/products/placeholder.svg'">
            </div>
            <div class="p-card-body">
                <span class="p-category">${p.category}</span>
                <h5 class="p-name">${p.name}</h5>
                <div class="p-rating">
                    <span class="rate">${Number(p.rating).toFixed(1)}</span>
                    ${renderRating(p.rating)}
                </div>
                <div class="p-price">${money(p.price)}</div>
                <div class="p-stock mb-3">${stockHtml(p.stock)}</div>
                <div class="mt-auto d-flex gap-2">
                    <button class="btn btn-brand btn-sm flex-fill" ${out ? "disabled" : ""}
                            onclick="addToCart(${p.id}, 1, this)">
                        <i class="bi bi-cart-plus"></i> Add
                    </button>
                    <a href="product-details.html?id=${p.id}" class="btn btn-outline-brand btn-sm">
                        Details
                    </a>
                </div>
            </div>
        </div>
    </div>`;
}

/* Global add-to-cart used by product cards */
async function addToCart(productId, quantity = 1, btn) {
    if (!isLoggedIn()) { window.location.href = "login.html"; return; }
    if (btn && btn.getAttribute("aria-busy") === "true") return;
    if (btn) { btn.setAttribute("aria-busy", "true"); btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>'; }
    try {
        await api("/api/cart", "POST", { productId, quantity });
        showToast("<i class='bi bi-check-circle'></i> Added to cart", "success");
        refreshCartCount();
    } catch (err) {
        showToast(err.message, "error");
    } finally {
        if (btn) {
            btn.innerHTML = '<i class="bi bi-cart-plus"></i> Add';
            btn.removeAttribute("aria-busy");
        }
    }
}

/* ---------------- Cart count ---------------- */
async function refreshCartCount() {
    const badge = document.getElementById("cartCount");
    if (!badge || !isLoggedIn()) return;
    try {
        const data = await api("/api/cart/count");
        badge.textContent = data.count;
        badge.classList.toggle("d-none", data.count === 0);
    } catch (e) { /* ignore */ }
}

/* ---------------- Navbar ---------------- */
function renderNavbar(activePage = "") {
    const categories = NAV_CATEGORIES.map(c =>
        `<li><a class="dropdown-item" href="products.html?category=${encodeURIComponent(c)}">${c}</a></li>`
    ).join("");

    const authed = isLoggedIn();
    const navItems = authed ? `
        <li class="nav-item"><a class="nav-link ${activePage === "home" ? "active" : ""}" href="index.html"><i class="bi bi-house me-1"></i>Home</a></li>
        <li class="nav-item"><a class="nav-link ${activePage === "products" ? "active" : ""}" href="products.html"><i class="bi bi-grid me-1"></i>Products</a></li>
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle ${activePage === "categories" ? "active" : ""}" href="#" data-bs-toggle="dropdown">
                <i class="bi bi-collection me-1"></i>Categories
            </a>
            <ul class="dropdown-menu">${categories}</ul>
        </li>
        <li class="nav-item"><a class="nav-link ${activePage === "cart" ? "active" : ""}" href="cart.html"><i class="bi bi-cart3 me-1"></i>Cart <span class="cart-badge d-none" id="cartCount">0</span></a></li>
        <li class="nav-item"><a class="nav-link ${activePage === "account" ? "active" : ""}" href="my-account.html"><i class="bi bi-person me-1"></i>My Account</a></li>
        <li class="nav-item"><a class="nav-link text-danger" href="#" id="logoutLink"><i class="bi bi-box-arrow-right me-1"></i>Logout</a></li>
    ` : `
        <li class="nav-item"><a class="nav-link" href="login.html"><i class="bi bi-box-arrow-in-right me-1"></i>Login</a></li>
        <li class="nav-item"><a class="nav-link" href="register.html">Register</a></li>
    `;

    const html = `
    <nav class="navbar navbar-expand-lg navbar-dm sticky-top">
        <div class="container">
            <a class="navbar-brand-dm" href="index.html">
                <span class="brand-chip"><i class="bi bi-gem"></i></span>
                <span>
                    <span class="brand-text">DHARIGA MART</span>
                    <span class="brand-sub">Style. Beauty. Confidence. Easy Shopping.</span>
                </span>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#dmNavbar"
                    aria-controls="dmNavbar" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="dmNavbar">
                <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1">
                    ${navItems}
                </ul>
            </div>
        </div>
    </nav>`;

    const el = document.getElementById("siteNavbar");
    if (el) el.innerHTML = html;

    const logoutLink = document.getElementById("logoutLink");
    if (logoutLink) logoutLink.addEventListener("click", (e) => { e.preventDefault(); logout(); });

    refreshCartCount();
}

/* ---------------- Footer ---------------- */
function renderFooter() {
    const el = document.getElementById("siteFooter");
    if (!el) return;
    el.innerHTML = `
    <footer class="footer-dm">
        <div class="container">
            <div class="row g-4">
                <div class="col-lg-4">
                    <div class="d-flex align-items-center gap-2 mb-3">
                        <span class="brand-chip"><i class="bi bi-gem"></i></span>
                        <span class="brand-text">DHARIGA MART</span>
                    </div>
                    <p class="mb-2">Style. Beauty. Confidence. Easy Shopping.</p>
                    <p class="small mb-0">Your one-stop online store for dresses, cosmetics, makeup, skincare,
                    hair care and accessories.</p>
                </div>
                <div class="col-6 col-lg-2">
                    <h6>Shop</h6>
                    <a href="index.html">Home</a>
                    <a href="products.html">All Products</a>
                    <a href="cart.html">Cart</a>
                    <a href="my-account.html">My Account</a>
                </div>
                <div class="col-6 col-lg-3">
                    <h6>Categories</h6>
                    ${NAV_CATEGORIES.slice(0, 6).map(c => `<a href="products.html?category=${encodeURIComponent(c)}">${c}</a>`).join("")}
                </div>
                <div class="col-lg-3">
                    <h6>Contact</h6>
                    <p class="small mb-2"><i class="bi bi-envelope me-2"></i>support@dharigamart.com</p>
                    <p class="small mb-2"><i class="bi bi-telephone me-2"></i>+91 98765 43210</p>
                    <p class="small mb-0"><i class="bi bi-geo-alt me-2"></i>MG Road, Bengaluru, India</p>
                </div>
            </div>
            <div class="footer-bottom text-center">
                &copy; <span id="footerYear"></span> DHARIGA MART. All rights reserved.
            </div>
        </div>
    </footer>`;
    const yearEl = document.getElementById("footerYear");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------------- Boot ---------------- */
function bootPage(activePage = "") {
    renderNavbar(activePage);
    renderFooter();
    if (getToken()) refreshCartCount();
}

document.addEventListener("DOMContentLoaded", () => {
    // year on auth pages
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
});