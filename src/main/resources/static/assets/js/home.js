/* ============================================================
   DHARIGA MART - home.js
   Home page: hero, category cards, featured products
   ============================================================ */
const CATEGORIES_DATA = [
    { name: "Women's Dresses", img: "assets/images/products/dress-floral.svg", desc: "Floral dresses for every occasion." },
    { name: "Men's Wear",      img: "assets/images/products/shirt-casual.svg", desc: "Casual & formal men's collection." },
    { name: "Western Wear",    img: "assets/images/products/skirt-floral.svg", desc: "Trendy western outfits." },
    { name: "Traditional Wear",img: "assets/images/products/sherwani.svg",     desc: "Embrace Indian tradition." },
    { name: "Kurtis",          img: "assets/images/products/anarkali.svg",     desc: "Elegant kurtis for daily wear." },
    { name: "Sarees",          img: "assets/images/products/saree-banarasi.svg", desc: "Classic Indian sarees." },
    { name: "Cosmetics",       img: "assets/images/products/cosmetics-kit.svg",  desc: "Essential cosmetic essentials." },
    { name: "Makeup",          img: "assets/images/products/lipstick-red.svg",   desc: "Lips, eyes & face makeup." },
    { name: "Skincare",        img: "assets/images/products/facewash.svg",       desc: "Healthy skin, healthy you." },
    { name: "Accessories",     img: "assets/images/products/handbag-bag.svg",    desc: "Complete your look." }
];

document.addEventListener("DOMContentLoaded", () => {
    if (!isLoggedIn()) { window.location.href = "login.html"; return; }
    bootPage("home");

    // Category cards
    const catGrid = document.getElementById("categoryCards");
    catGrid.innerHTML = CATEGORIES_DATA.map(c => `
        <div class="col-6 col-md-4 col-lg-3">
            <a href="products.html?category=${encodeURIComponent(c.name)}" class="category-card">
                <img src="${c.img}" alt="${c.name}" loading="lazy" onerror="this.src='assets/images/products/placeholder.svg'">
                <div class="category-overlay">
                    <h5>${c.name}</h5>
                    <p>${c.desc}</p>
                </div>
            </a>
        </div>
    `).join("");

    // Featured products (first 8)
    loadFeatured();
});

async function loadFeatured() {
    const container = document.getElementById("featuredProducts");
    try {
        const products = await api("/api/products");
        const featured = products.slice(0, 8);
        if (featured.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">No products available yet.</p>';
            return;
        }
        container.innerHTML = featured.map(p => productCard(p)).join("");
    } catch (err) {
        container.innerHTML = '<p class="text-center text-danger">Failed to load products: ' + err.message + '</p>';
    }
}