let cart = JSON.parse(localStorage.getItem('letsoCart')) || [];
let wishlist = JSON.parse(localStorage.getItem('letsoWishlist')) || [];

function parsePrice(value) {
    const parsed = Number(String(value).replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
}

function updateCartCount() {
    const badge = document.getElementById('cartCount');
    if (!badge) return;

    const totalQty = cart.reduce((sum, item) => sum + (Number(item.qty) || 1), 0);
    badge.textContent = totalQty;
}

function updateWishlistCount() {
    const badge = document.getElementById('wishlistCount');
    if (!badge) return;

    badge.textContent = wishlist.length;
}

function syncWishlistButtons() {
    document.querySelectorAll('.wish-btn, .heart-btn').forEach(button => {
        const id = button.getAttribute('data-id');
        const liked = wishlist.some(item => item.id === id);

        button.textContent = liked ? '♥' : '♡';
        button.classList.toggle('liked', liked);
        button.setAttribute('aria-label', liked ? 'Remove from wishlist' : 'Add to wishlist');
    });
}

function saveCart() {
    localStorage.setItem('letsoCart', JSON.stringify(cart));
    updateCartCount();
}

function saveWishlist() {
    localStorage.setItem('letsoWishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    syncWishlistButtons();
}

function normalizeCartItem(id, name, price, image) {
    const itemId = String(id || name || '').trim();
    const itemName = String(name || itemId).trim();
    const itemPrice = typeof price === 'number' ? price : parsePrice(price || 0);
    const itemImage = image || 'images/default.jpg';

    return {
        id: (itemId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || itemName.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
        name: itemName,
        price: itemPrice,
        image: itemImage,
        qty: 1
    };
}

function getCartItemPrice(item) {
    return parsePrice(item && item.price);
}

function addToCart(id, name, price, image) {
    if (arguments.length === 2 && typeof name !== 'string') {
        const productName = String(id).trim();
        const productPrice = Number(name) || 0;

        id = productName;
        name = productName;
        price = productPrice;
        image = 'images/default.jpg';
    }

    const normalized = normalizeCartItem(id, name, price, image);
    const existing = cart.find(item => item.id === normalized.id);

    if (existing) {
        existing.qty += 1;
        existing.price = getCartItemPrice(existing);
        existing.image = existing.image || normalized.image;
    } else {
        cart.push(normalized);
    }

    saveCart();
    openCart();
    alert(`${normalized.name} added to cart.`);
}

function removeCartItem(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    showCart();
}

function changeQty(id, delta) {
    cart = cart
        .map(item => {
            if (String(item.id) === String(id)) {
                const nextQty = (Number(item.qty) || 1) + delta;
                return nextQty > 0 ? { ...item, qty: nextQty } : null;
            }
            return item;
        })
        .filter(Boolean);

    localStorage.setItem('letsoCart', JSON.stringify(cart));
    updateCartCount();
    showCart();
}

window.changeQty = changeQty;
window.removeFromCart = removeCartItem;

function setCartModalState(isOpen) {
    const modal = document.getElementById('cartModal');
    if (!modal) return;

    modal.classList.toggle('open', isOpen);
    modal.style.display = isOpen ? 'flex' : 'none';
    modal.setAttribute('aria-hidden', String(!isOpen));
}

function openCart() {
    setCartModalState(true);
    showCart();
}

function closeCart() {
    setCartModalState(false);
}

function checkout() {
    return checkoutWhatsApp();
}

function checkoutToWhatsApp() {
    return checkoutWhatsApp();
}

function showCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    if (!cartItems || !cartTotal) return;

    if (!cart.length) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
        cartTotal.textContent = '0';
        return;
    }

    let total = 0;

    cartItems.innerHTML = cart.map(item => {
        const safePrice = getCartItemPrice(item);
        const qty = Number(item.qty) || 1;
        const itemTotal = safePrice * qty;
        total += itemTotal;

        return `
            <div class="cart-item">
                <img src="${item.image || 'images/default.jpg'}" alt="${item.name}">
                <div class="cart-copy">
                    <strong>${item.name}</strong>
                    <span>${safePrice} x ${qty} = R${itemTotal}</span>
                    <div class="qty-controls" style="display:flex; align-items:center; gap:8px; margin-top:10px;">
                        <button type="button" style="width:26px;height:26px;border-radius:50%;border:1px solid #ddd;background:#fff;cursor:pointer;" onclick="changeQty('${item.id}', -1)">−</button>
                        <span>${qty}</span>
                        <button type="button" style="width:26px;height:26px;border-radius:50%;border:1px solid #ddd;background:#fff;cursor:pointer;" onclick="changeQty('${item.id}', 1)">+</button>
                    </div>
                </div>
                <button type="button" class="remove-cart-item" data-id="${item.id}" onclick="removeCartItem('${item.id}')">Remove</button>
            </div>
        `;
    }).join('');

    cartTotal.textContent = total.toFixed(0);
}

function checkoutWhatsApp() {
    if (!cart.length) {
        alert('Your cart is empty.');
        return;
    }

    let total = 0;
    const messageLines = cart.map(item => {
        const lineTotal = parsePrice(item.price) * (item.qty || 1);
        total += lineTotal;
        return `- ${item.name} ${item.price} x ${item.qty} = R${lineTotal}`;
    });

    const message = [
        'Hello Letso Luxe! I want to order:',
        ...messageLines,
        '',
        `TOTAL: R${total}`
    ].join('\n');

    const whatsappNumber = '27XXXXXXXXX';
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
}

function renderWishlistPage() {
    const container = document.getElementById('wishlistItems');
    const countBox = document.getElementById('wishlistCount');

    if (!container) return;

    if (countBox) countBox.textContent = wishlist.length;

    if (!wishlist.length) {
        container.innerHTML = '<p class="empty-wishlist">No items liked yet.</p>';
        return;
    }

    container.innerHTML = wishlist.map(item => `
        <div class="wishlist-row">
            <span>${item.name}</span>
            <div class="wishlist-actions">
                <button type="button" class="move-cart" onclick="addToCart('${item.id}', '${item.name}', '${item.price}', '${item.image}'); alert('Added to Cart');">Move to Cart</button>
                <button type="button" class="remove-wishlist" onclick="toggleWishlist('${item.id}', '${item.name}', '${item.price}', '${item.image}'); renderWishlistPage();">Remove</button>
            </div>
        </div>
    `).join('');
}

function getActiveProductFilter() {
    const button = document.querySelector('.filter-btn.active');
    return button ? button.dataset.filter : 'all';
}

function getProductCategory(card) {
    const categoryText = (card.querySelector('.product-category')?.textContent || '').trim().toLowerCase();
    const categoryMap = {
        clothing: 'fashion',
        footwear: 'fashion',
        handbags: 'accessories',
        jewellery: 'accessories',
        beauty: 'beauty',
        home: 'home'
    };

    return categoryMap[categoryText] || 'all';
}

function applyProductFilters() {
    const productSearch = document.getElementById('productSearch');
    const toolbarSearch = document.getElementById('searchInput');
    const sortField = document.getElementById('productSort');
    const container = document.querySelector('.shop-products');

    if (!container) return;

    const searchField = productSearch || toolbarSearch;
    const term = (searchField ? searchField.value : '').toLowerCase().trim();
    const selectedCategory = getActiveProductFilter();

    const cards = [...document.querySelectorAll('.product-card')];
    const filteredCards = cards.filter(card => {
        const name = (card.dataset.name || card.querySelector('h3')?.textContent || '').toLowerCase();
        const matchesText = !term || name.includes(term);
        const matchesCategory = selectedCategory === 'all' || getProductCategory(card) === selectedCategory;
        return matchesText && matchesCategory;
    });

    const sortValue = sortField ? sortField.value : 'name-asc';

    filteredCards.sort((a, b) => {
        const aName = (a.dataset.name || a.querySelector('h3')?.textContent || '').toLowerCase();
        const bName = (b.dataset.name || b.querySelector('h3')?.textContent || '').toLowerCase();

        const aPrice = Number(a.dataset.price || parsePrice(a.querySelector('.price')?.textContent || '0'));
        const bPrice = Number(b.dataset.price || parsePrice(b.querySelector('.price')?.textContent || '0'));

        if (sortValue === 'name-asc') return aName.localeCompare(bName);
        if (sortValue === 'name-desc') return bName.localeCompare(aName);
        if (sortValue === 'price-asc') return aPrice - bPrice;
        if (sortValue === 'price-desc') return bPrice - aPrice;

        return aName.localeCompare(bName);
    });

    container.innerHTML = '';
    filteredCards.forEach(card => container.appendChild(card));
}

function searchProducts() {
    applyProductFilters();
}

document.addEventListener('DOMContentLoaded', () => {
    const searchFields = [
        document.getElementById('productSearch'),
        document.getElementById('searchInput')
    ].filter(Boolean);

    searchFields.forEach(field => {
        field.addEventListener('input', function () {
            searchFields.forEach(otherField => {
                if (otherField !== field) otherField.value = field.value;
            });
            applyProductFilters();
        });
    });

    document.getElementById('productSort')?.addEventListener('change', applyProductFilters);

    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn === button);
            });

            applyProductFilters();
        });
    });

    applyProductFilters();
});

window.onload = function () {
    updateCartCount();
    updateWishlistCount();
    syncWishlistButtons();
    renderWishlistPage();
    setCartModalState(false);
    showCart();
};

(function () {
    function setFieldError(field, message) {
        if (!field) return;

        const errorId = `${field.id || field.name}-error`;
        let errorBox = document.getElementById(errorId);

        if (!errorBox) {
            errorBox = document.createElement('div');
            errorBox.id = errorId;
            errorBox.className = 'field-error';
            field.parentNode.insertBefore(errorBox, field.nextSibling);
        }

        errorBox.textContent = message || '';
        field.setAttribute('aria-invalid', message ? 'true' : 'false');
        field.classList.toggle('is-invalid', Boolean(message));
    }

    function clearFieldError(field) {
        if (!field) return;
        const errorId = `${field.id || field.name}-error`;
        const errorBox = document.getElementById(errorId);
        if (errorBox) errorBox.textContent = '';
        field.setAttribute('aria-invalid', 'false');
        field.classList.remove('is-invalid');
    }

    function validateEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
    }

    function validateForm(form) {
        let valid = true;
        const fields = form.querySelectorAll('input, textarea, select');

        fields.forEach(field => {
            const name = (field.name || field.id || '').toLowerCase();
            const value = String(field.value || '').trim();

            clearFieldError(field);

            const isRequired = field.hasAttribute('required') || field.dataset.required === 'true';
            if (isRequired && !value) {
                setFieldError(field, 'This field is required.');
                valid = false;
                return;
            }

            if (name.includes('email') && value && !validateEmail(value)) {
                setFieldError(field, 'Please enter a valid email address.');
                valid = false;
                return;
            }

            if (field.dataset.minlength && value.length < Number(field.dataset.minlength)) {
                setFieldError(field, `Minimum ${field.dataset.minlength} characters required.`);
                valid = false;
                return;
            }
        });

        return valid;
    }

    async function submitFormAsync(form) {
        const action = form.getAttribute('action') || '';
        const method = (form.getAttribute('method') || 'POST').toUpperCase();
        const hasRealEndpoint = Boolean(action) && action !== '#' && !action.startsWith('mailto:') && !action.startsWith('javascript:');

        if (!hasRealEndpoint) {
            return new Promise((resolve) => {
                setTimeout(() => resolve({ ok: true, simulated: true }), 300);
            });
        }

        const formData = new FormData(form);

        const response = await fetch(action, {
            method,
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error('Submission failed.');
        }

        return response;
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('form').forEach(form => {
            if (form.dataset.validationBound === 'true') return;
            form.dataset.validationBound = 'true';

            form.addEventListener('submit', async (event) => {
                event.preventDefault();

                if (!validateForm(form)) {
                    return;
                }

                const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
                const originalText = submitButton ? submitButton.textContent : 'Submit';

                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Sending...';
                }

                try {
                    await submitFormAsync(form);

                    const successBox = document.getElementById('form-success-message') || document.createElement('div');
                    successBox.id = 'form-success-message';
                    successBox.className = 'form-success-message';
                    successBox.textContent = 'Your message was sent successfully.';
                    successBox.style.display = 'block';

                    if (!successBox.parentNode) {
                        form.parentNode.insertBefore(successBox, form.nextSibling);
                    }

                    form.reset();
                } catch (error) {
                    const failBox = document.getElementById('form-error-message') || document.createElement('div');
                    failBox.id = 'form-error-message';
                    failBox.className = 'form-error-message';
                    failBox.textContent = 'There was a problem sending your message. Please try again.';
                    failBox.style.display = 'block';

                    if (!failBox.parentNode) {
                        form.parentNode.insertBefore(failBox, form.nextSibling);
                    }
                } finally {
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = originalText;
                    }
                }
            });
        });
    });
})();
