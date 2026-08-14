// CART SYSTEM FOR LETSO LUXE
let cart = [];

// LOAD CART WHEN PAGE LOADS
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartCount();
});

// GET CART FROM LOCALSTORAGE
function getCart() {
    return JSON.parse(localStorage.getItem("letsoCart")) || [];
}

// SAVE CART 
function saveCart(cart) {
    localStorage.setItem("letsoCart", JSON.stringify(cart));
    updateCartCount();
}

// ADD ITEM TO CART
function addToCart(name, price) {
    let cart = getCart(); 
    let existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ name: name, price: price, qty: 1 });
    }
    
    saveCart(cart);
    alert(name + " has been added to your cart!");
}

function updateCartCount() {
    let cart = getCart();
    let totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    let cartCountEl = document.getElementById("cartCount");
    if(cartCountEl) cartCountEl.textContent = totalQty;
}

// SHOW CART 
function showCart() {
    document.getElementById("cartModal").style.display = "flex";
    displayCart(); 
}

// CLOSE CART 
function closeCart() {
    document.getElementById("cartModal").style.display = "none";
}

// DISPLAY CART ITEMS
function displayCart() {
    let cart = getCart(); 
    let cartItems = document.getElementById("cartItems");
    let total = 0;
    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
        document.getElementById("cartTotal").textContent = "0";
        return;
    }

    cart.forEach(function(item, index) {
        let itemTotal = item.price * item.qty;
        total += itemTotal;
        let itemDiv = document.createElement("div");
        itemDiv.className = "cart-item";
        itemDiv.innerHTML =
            `<div><strong>${item.name}</strong><br>R${item.price} x ${item.qty} = R${itemTotal}</div>` +
            `<button onclick="removeFromCart(${index})">Remove</button>`;
        cartItems.appendChild(itemDiv);
    });

    document.getElementById("cartTotal").textContent = total; 
}

// REMOVE ITEM FROM CART
function removeFromCart(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    displayCart();
}

// CHECKOUT ON WHATSAPP
function checkout() {
    let cart = getCart();
    if (cart.length === 0) {
        alert("Your cart is empty. Please add a product first.");
        return;
    }
    
    let message = 'Hi Letso Luxe! I would like to order:%0A%0A';
    let total = 0;
    
    cart.forEach(item => {
        let itemTotal = item.price * item.qty;
        total += itemTotal;
        message += `• ${item.name} x ${item.qty} = R${itemTotal}%0A`;
    });
    
    message += `%0A*TOTAL: R${total}*`;
    
    let phoneNumber = '27600000000'; // <-- PUT YOUR WHATSAPP NUMBER HERE
    let url = `https://wa.me/${phoneNumber}?text=${message}`;
    
    window.open(url, '_blank');
    
    // Clear cart after checkout
    cart = []; 
    saveCart(cart);
    displayCart();
    closeCart();
}

// PRODUCTS BY CATEGORY
function filterProducts(category) {
    let products = document.querySelectorAll(".product-card");
    products.forEach(function(product) {
        if (category === "all" || product.dataset.category === category) {
            product.style.display = "block";
        } else {
            product.style.display = "none";
        }
    });
}

// SEARCH PRODUCTS
function searchProducts() {
    let search = document.getElementById("searchInput").value.toLowerCase();
    let products = document.querySelectorAll(".product-card");
    products.forEach(function(product) {
        let productName = product.dataset.name.toLowerCase();
        if (productName.includes(search)) {
            product.style.display = "block";
        } else {
            product.style.display = "none";
        }
    });
}

// CLOSE CART IF CLICK OUTSIDE
window.onclick = function(event) {
    let cartModal = document.getElementById("cartModal");
    if (event.target == cartModal) {
        cartModal.style.display = "none";
    }
}