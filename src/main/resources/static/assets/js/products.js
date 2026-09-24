/* ============================================================
   DHARIGA MART - products.js
   Product listing: search, category filter, sort
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    if (!isLoggedIn()) { window.location.href = "login.html"; return; }
    bootPage("products");

    const grid      = document.getElementById("productGrid");
    const loader    = document.getElementById("productsLoader");
    const empty     = document.getElementById("emptyState");
    const searchIn  = document.getElementById("searchInput");
    const chipsWrap = document.getElementById("categoryChips");
    const sortSel   = document.getElementById("sortSelect");
    const filterInfo= document.getElementById("activeFilter");

    const params = new URLSearchParams(window.location.search);
    let currentCategory = params.get("category") || "";
    let currentSearch   = params.get("search") || "";
    let currentSort     = params.get("sort") || "";

    if (currentSearch) searchIn.value = currentSearch;
    if (currentSort)   sortSel.value  = currentSort;

    async function loadProducts() {
        loader.classList.remove("d-none");
        empty.classList.add("d-none");
        grid.innerHTML = "";

        const qs = new URLSearchParams();
        if (currentSearch)   qs.set("search", currentSearch);
        if (currentCategory) qs.set("category", currentCategory);
        if (currentSort)     qs.set("sort", currentSort);

        try {
            const products = await api("/api/products?" + qs.toString());
            if (products.length === 0) {
                empty.classList.remove("d-none");
            } else {
                grid.innerHTML = products.map(p => productCard(p)).join("");
            }
        } catch (err) {
            grid.innerHTML = '<div class="col-12 text-center text-danger">Failed to load products: ' + err.message + '</div>';
        } finally {
            loader.classList.add("d-none");
        }

        // Update filter info
        let info = [];
        if (currentCategory) info.push("Category: " + currentCategory);
        if (currentSearch)   info.push("Search: \"" + currentSearch + "\"");
        if (currentSort)     info.push("Sort: " + (currentSort === "asc" ? "Low → High" : "High → Low"));
        filterInfo.innerHTML = info.length ? "Filtering: " + info.join(" &middot; ") : "";
    }

    // Render category chips
    async function loadChips() {
        try {
            const cats = await api("/api/categories");
            const allBtn = `<button class="chip ${!currentCategory ? 'active' : ''}" data-category="">All</button>`;
            const rest = cats.map(c =>
                `<button class="chip ${c === currentCategory ? 'active' : ''}" data-category="${c}">${c}</button>`
            ).join("");
            chipsWrap.innerHTML = allBtn + rest;
        } catch (e) {
            chipsWrap.innerHTML = `<button class="chip active" data-category="">All</button>`;
        }
    }

    chipsWrap.addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (!chip) return;
        currentCategory = chip.dataset.category;
        chipsWrap.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        loadProducts();
    });

    document.getElementById("searchBtn").addEventListener("click", () => {
        currentSearch = searchIn.value.trim();
        loadProducts();
    });
    searchIn.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { currentSearch = searchIn.value.trim(); loadProducts(); }
    });

    sortSel.addEventListener("change", () => {
        currentSort = sortSel.value;
        loadProducts();
    });

    loadChips();
    loadProducts();
});

function resetFilters() {
    document.getElementById("searchInput").value = "";
    document.getElementById("sortSelect").value = "";
    document.querySelectorAll("#categoryChips .chip").forEach(c => c.classList.remove("active"));
    const allChip = document.querySelector("#categoryChips .chip[data-category='']");
    if (allChip) allChip.classList.add("active");
    document.getElementById("activeFilter").innerHTML = "";
    // trigger reload via location change
    window.location.href = "products.html";
}