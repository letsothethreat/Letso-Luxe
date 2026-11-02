// LETSO LUXE - CART AND WISHLIST SYSTEM
// References: [2] Dynamic Content Extraction, [3] W3Schools Form Validation
// =========================
// CART
// =========================

const CART_KEY = "letsoCart";
const WISHLIST_KEY = "letsoWishlist";

function getStoredList(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

function saveStoredList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
}

function updateCartCount() {
    const cartCount = document.getElementById("cartCount");
    if (!cartCount) return;

    const cart = getStoredList(CART_KEY);
    const total = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    cartCount.textContent = total;
}

function updateWishlistCount() {
    const wishlistCount = document.getElementById("wishlistCount");
    if (!wishlistCount) return;

    wishlistCount.textContent = getStoredList(WISHLIST_KEY).length;
}

function isSavedInWishlist(name) {
    return getStoredList(WISHLIST_KEY).some(item => item.name === name);
}

function syncWishlistButtons() {
    document.querySelectorAll(".heart-btn").forEach((button) => {
        const saved = isSavedInWishlist(button.dataset.name);
        button.classList.toggle("active", saved);
        button.textContent = saved ? "♥" : "♡";
        button.style.color = saved ? "#d72638" : "#1f1f1f";
        button.setAttribute("aria-pressed", saved ? "true" : "false");
    });
}

function toggleWishlistItem(name, price, image) {
    const list = getStoredList(WISHLIST_KEY);
    const exists = list.some(item => item.name === name);

    if (exists) {
        const updated = list.filter(item => item.name !== name);
        saveStoredList(WISHLIST_KEY, updated);
    } else {
        list.push({ name, price, image });
        saveStoredList(WISHLIST_KEY, list);
    }

    updateWishlistCount();
    syncWishlistButtons();
    return !exists;
}

function addToCart(name, price, image = "") {
    const cart = getStoredList(CART_KEY);
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity = (Number(existingItem.quantity) || 1) + 1;
    } else {
        cart.push({ name, price: Number(price) || 0, image, quantity: 1 });
    }

    saveStoredList(CART_KEY, cart);
    updateCartCount();
    renderCart();
}

function removeFromCart(index) {
    const cart = getStoredList(CART_KEY);
    cart.splice(index, 1);
    saveStoredList(CART_KEY, cart);
    renderCart();
    updateCartCount();
}

function renderCart() {
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    if (!cartItems || !cartTotal) return;

    const cart = getStoredList(CART_KEY);
    if (!cart.length) {
        cartItems.innerHTML = "<p class='empty-cart'>Your cart is empty.</p>";
        cartTotal.textContent = "0";
        updateCartCount();
        return;
    }

    let total = 0;

    cartItems.innerHTML = cart.map((item, index) => {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        const lineTotal = price * qty;
        total += lineTotal;

        return `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong><br>
                    <small>${qty} x R${price}</small>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <span>R${lineTotal}</span>
                    <button type="button" onclick="removeFromCart(${index})">Remove</button>
                </div>
            </div>
        `;
    }).join("");

    cartTotal.textContent = total.toFixed(2);
    updateCartCount();
}

const productCatalog = [
    { name: "Vintage Band Tee", category: "fashion", price: 120, image: "images/vintagetee.jpeg" },
    { name: "Statement Set", category: "fashion", price: 1500, image: "images/statementset.jpg" },
    { name: "Oversized Graphic Hoodie", category: "fashion", price: 200, image: "images/hoodie.png" },
    { name: "Distressed Denim Jacket", category: "fashion", price: 300, image: "images/jeanjacket.png" },
    { name: "Minimal Heels", category: "beauty", price: 980, image: "images/minimalheels.jpg" },
    { name: "Cotton Tote Bag", category: "accessories", price: 450, image: "images/cottontotebag.jpeg" },
    { name: "Hoop Earrings", category: "accessories", price: 40, image: "images/hoopearrings.jpeg" },
    { name: "Home Accent", category: "home", price: 600, image: "images/home-item.jpg" }
];

function getSearchValue() {
    const productSearch = document.getElementById("productSearch");
    const searchInput = document.getElementById("searchInput");
    const value = (productSearch?.value || searchInput?.value || "").trim();
    return value.toLowerCase();
}

function syncSearchFields(sourceId, value) {
    const productSearch = document.getElementById("productSearch");
    const searchInput = document.getElementById("searchInput");

    if (sourceId === "productSearch" && productSearch) productSearch.value = value;
    if (sourceId === "searchInput" && searchInput) searchInput.value = value;

    if (productSearch && sourceId !== "productSearch") productSearch.value = value;
    if (searchInput && sourceId !== "searchInput") searchInput.value = value;
}

function getActiveFilter() {
    return document.querySelector(".filter-btn.active")?.dataset.filter || "all";
}

function getFilteredProducts() {
    const search = getSearchValue();
    const sort = document.getElementById("productSort")?.value || "name-asc";
    const filter = getActiveFilter();

    let list = productCatalog.filter(product => {
        const matchesCategory = filter === "all" || product.category === filter;
        const matchesSearch = product.name.toLowerCase().includes(search);
        return matchesCategory && matchesSearch;
    });

    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "name-desc") list.sort((a, b) => b.name.localeCompare(a.name));

    return list;
}

function renderProducts() {
    const grid = document.getElementById("productGrid");
    if (!grid) return;

    const filtered = getFilteredProducts();

    if (!filtered.length) {
        grid.innerHTML = "<p>No products match your search.</p>";
        return;
    }

    grid.innerHTML = filtered.map((product) => `
        <article class="product-card" data-category="${product.category}">
            <div class="product-picture" data-image="${product.image}" data-name="${product.name}">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>Premium piece with effortless style.</p>
                <div class="price">R${product.price}</div>
                <button class="add-button" onclick="addToCart('${product.name}', ${product.price})">ADD TO CART</button>
            </div>
        </article>
    `).join("");

    document.querySelectorAll(".product-picture").forEach((picture) => {
        picture.addEventListener("click", () => {
            const lightbox = document.getElementById("lightbox");
            const image = document.getElementById("lightboxImage");
            if (!lightbox || !image) return;

            image.src = picture.dataset.image;
            image.alt = picture.dataset.name;
            lightbox.classList.add("open");
        });
    });
}

function getProductCategory(card) {
    const categoryText = (card.querySelector(".product-category")?.textContent || "").trim().toLowerCase();

    const map = {
        clothing: "fashion",
        footwear: "fashion",
        jewellery: "fashion",
        jewelry: "fashion",
        handbags: "fashion",
        beauty: "beauty",
        home: "home",
        accessories: "accessories"
    };

    return map[categoryText] || card.dataset.category || "all";
}

function getProductName(card) {
    return (card.dataset.name || card.querySelector("h3")?.textContent || "").trim();
}

function getProductPrice(card) {
    const text = card.dataset.price || card.querySelector(".price")?.textContent || "0";
    return Number(String(text).replace(/[^0-9.-]/g, "")) || 0;
}

function applyProductFilters() {
    const activeFilter = document.querySelector(".filter-btn.active")?.dataset.filter || "all";
    const searchTerm = getSearchValue();
    const sortValue = document.getElementById("productSort")?.value || "name-asc";

    const cards = Array.from(document.querySelectorAll(".product-card"));
    const container = cards[0]?.parentElement;
    if (!container) return;

    const filteredCards = cards.filter((card) => {
        const category = getProductCategory(card);
        const name = getProductName(card).toLowerCase();
        const matchesFilter = activeFilter === "all" || category === activeFilter;
        const matchesSearch = !searchTerm || name.includes(searchTerm) || (card.dataset.name || "").toLowerCase().includes(searchTerm);
        return matchesFilter && matchesSearch;
    });

    filteredCards.sort((a, b) => {
        if (sortValue === "price-asc") return getProductPrice(a) - getProductPrice(b);
        if (sortValue === "price-desc") return getProductPrice(b) - getProductPrice(a);
        if (sortValue === "name-desc") return getProductName(b).localeCompare(getProductName(a));
        return getProductName(a).localeCompare(getProductName(b));
    });

    filteredCards.forEach((card) => {
        card.style.display = "block";
        container.appendChild(card);
    });

    cards.forEach((card) => {
        if (!filteredCards.includes(card)) {
            card.style.display = "none";
        }
    });
}

function searchProducts() {
    const productSearch = document.getElementById("productSearch");
    const searchInput = document.getElementById("searchInput");

    if (productSearch && searchInput && productSearch.value.trim() !== searchInput.value.trim()) {
        productSearch.value = searchInput.value;
    }

    if (searchInput && productSearch && searchInput.value.trim() !== productSearch.value.trim()) {
        searchInput.value = productSearch.value;
    }

    applyProductFilters();
}

function setupProductFeatures() {
    document.querySelectorAll(".filter-btn").forEach((button) => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");
            applyProductFilters();
        });
    });

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            syncSearchFields("searchInput", searchInput.value);
            applyProductFilters();
        });
    }

    const productSearch = document.getElementById("productSearch");
    if (productSearch) {
        productSearch.addEventListener("input", () => {
            syncSearchFields("productSearch", productSearch.value);
            applyProductFilters();
        });
    }

    const sortSelect = document.getElementById("productSort");
    if (sortSelect) sortSelect.addEventListener("change", applyProductFilters);

    const lightbox = document.getElementById("lightbox");
    const closeButton = document.querySelector(".lightbox-close");
    if (lightbox && closeButton) {
        closeButton.addEventListener("click", () => lightbox.classList.remove("open"));
        lightbox.addEventListener("click", (event) => {
            if (event.target === lightbox) lightbox.classList.remove("open");
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    updateWishlistCount();
    syncWishlistButtons();
    setupProductFeatures();
    renderProducts();

    document.querySelectorAll(".heart-btn").forEach((button) => {
        button.addEventListener("click", () => {
            const item = {
                name: button.dataset.name,
                price: Number(button.dataset.price || 0),
                image: button.dataset.image || ""
            };
            toggleWishlistItem(item.name, item.price, item.image);
        });
    });

    document.querySelectorAll(".filter-btn").forEach((button) => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");
            applyProductFilters();
        });
    });

    const productSearch = document.getElementById("productSearch");
    if (productSearch) {
        productSearch.addEventListener("input", applyProductFilters);
    }

    const productSort = document.getElementById("productSort");
    if (productSort) {
        productSort.addEventListener("change", applyProductFilters);
    }

    window.searchProducts = searchProducts;
    applyProductFilters();
});

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.renderCart = renderCart;


function openCart() {
  let drawer = document.getElementById('cartDrawer');
  if (drawer) {
    drawer.style.display = 'block';
    drawer.style.transform = 'translateX(0)';
    showCart(); 
  } else {
    
    window.location.href = 'cart.html';
  }
}

function closeCart() {
  let drawer = document.getElementById('cartDrawer');
  if (drawer) {
    drawer.style.transform = 'translateX(100%)';
  }
}

function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem('letsoCart')) || [];
  let count = cart.reduce((sum, item) => sum + item.qty, 0);
  let badge = document.getElementById('cartCount');
  if (badge) badge.innerText = count;
}
function getCart() {
    try {
        return JSON.parse(localStorage.getItem('letsoCart')) || [];
    } catch {
        return [];
    }
}

function saveCart(c) {
    localStorage.setItem('letsoCart', JSON.stringify(c));
}

function addToCart(id, name, price, image) {
    let cart = getCart();
    let item = cart.find(i => i.id === id);

    if (item) {
        item.qty++;
    } else {
        cart.push({ id, name, price, image, qty: 1 });
    }

    saveCart(cart);
    updateCartBadge();
    alert(name + ' added to cart.');
}

function updateCartBadge() {
    let cart = getCart();
    let count = cart.reduce((s, i) => s + i.qty, 0);
    let badge = document.getElementById('cart-count');
    if (badge) badge.textContent = count;

    let cartBadge = document.getElementById('cartCount');
    if (cartBadge) cartBadge.textContent = count;
}

document.addEventListener('DOMContentLoaded', updateCartBadge);

function removeFromCart(id) {
    let cart = getCart().filter(i => i.id !== id);
    saveCart(cart);
    location.reload();
}

function showCart() {
  openCart();
  renderCart();
}
function showWishlist() {
  window.location.href = 'wishlist.html';
}
window.showCart = showCart;
window.showWishlist = showWishlist;
window.openCart = openCart;
window.closeCart = closeCart;