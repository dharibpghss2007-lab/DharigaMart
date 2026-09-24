/* ============================================================
   DHARIGA MART - product-details.js
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    if (!isLoggedIn()) { window.location.href = "login.html"; return; }
    bootPage();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) {
        document.getElementById("productLoader").classList.add("d-none");
        document.getElementById("productNotFound").classList.remove("d-none");
        return;
    }

    loadProduct(id);
});

async function loadProduct(id) {
    const loader   = document.getElementById("productLoader");
    const content  = document.getElementById("productContent");
    const notFound = document.getElementById("productNotFound");

    try {
        const p = await api("/api/products/" + id);

        document.title = p.name + " | DHARIGA MART";
        document.getElementById("breadcrumbName").textContent = p.name;
        document.getElementById("pImage").src = p.imageUrl || "assets/images/products/placeholder.svg";
        document.getElementById("pImage").onerror = function () { this.src = "assets/images/products/placeholder.svg"; };
        document.getElementById("pName").textContent = p.name;
        document.getElementById("pCategory").textContent = p.category;
        document.getElementById("pDesc").textContent = p.description || "No description available.";
        document.getElementById("pPrice").textContent = money(p.price);
        document.getElementById("pRating").innerHTML = Number(p.rating).toFixed(1) + " <i class='bi bi-star-fill'></i>";
        document.getElementById("pStock").innerHTML = stockHtml(p.stock);
        document.getElementById("pMaxStock").textContent = p.stock;

        const qtyInput = document.getElementById("qtyInput");
        qtyInput.max = p.stock;
        if (p.stock <= 0) {
            document.getElementById("addToCartBtn").disabled = true;
            document.getElementById("buyNowBtn").classList.add("disabled");
            return;
        }

        loader.classList.add("d-none");
        content.classList.remove("d-none");

        // quantity controls
        document.getElementById("qtyMinus").addEventListener("click", () => {
            const v = parseInt(qtyInput.value) || 1;
            if (v > 1) qtyInput.value = v - 1;
        });
        document.getElementById("qtyPlus").addEventListener("click", () => {
            const v = parseInt(qtyInput.value) || 1;
            if (v < p.stock) qtyInput.value = v + 1;
        });
        qtyInput.addEventListener("change", () => {
            let v = parseInt(qtyInput.value) || 1;
            if (v < 1) v = 1;
            if (v > p.stock) v = p.stock;
            qtyInput.value = v;
        });

        // Add to cart
        document.getElementById("addToCartBtn").addEventListener("click", async (e) => {
            const btn = e.currentTarget;
            btn.disabled = true;
            try {
                await addToCart(p.id, parseInt(qtyInput.value));
            } finally {
                btn.disabled = false;
            }
        });

        // Buy now -> add to cart (keep quantity) then go to checkout
        document.getElementById("buyNowBtn").addEventListener("click", async (e) => {
            e.preventDefault();
            const btn = e.currentTarget;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Placing...';
            try {
                await api("/api/cart", "POST", { productId: p.id, quantity: parseInt(qtyInput.value) });
                window.location.href = "checkout.html";
            } catch (err) {
                showToast(err.message, "error");
                btn.innerHTML = '<i class="bi bi-lightning-charge"></i> Buy Now';
            }
        });
    } catch (err) {
        loader.classList.add("d-none");
        notFound.classList.remove("d-none");
    }
}