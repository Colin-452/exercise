//Colin
// Global variables
const dbName = "EcommerceDB";
const dbVersion = 1;
let currentUser = null;
let products = [];
let cart = [];

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDB();
    setupEventListeners();
    checkLoginStatus();
    loadPageSpecificContent();
    updateNavigation();
    
    // Load products and cart if on cart page
    if (window.location.pathname.includes('cart.html')) {
        loadProducts();
        loadCart();
    }
});

// Database initialization
function initializeDB() {
    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = function(event) {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('users')) {
            db.createObjectStore('users', { keyPath: 'username' });
        }

        if (!db.objectStoreNames.contains('products')) {
            const productsStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
            productsStore.createIndex('name', 'name', { unique: false });
        }

        if (!db.objectStoreNames.contains('cart')) {
            db.createObjectStore('cart', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('orders')) {
            db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
        }
    };

    request.onerror = function(event) {
        console.error("Database error:", event.target.error);
    };
}

// Setup event listeners
function setupEventListeners() {
    // Registration form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Bulk actions
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('select-all-items')) {
            const checkboxes = document.querySelectorAll('.cart-item-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
        }
        
        if (e.target.classList.contains('bulk-remove')) {
            bulkRemoveItems();
        }
        
        if (e.target.classList.contains('bulk-update')) {
            bulkUpdateQuantity();
        }
        
        if (e.target.classList.contains('bulk-add-to-cart')) {
            bulkAddToCart();
        }
        
        if (e.target.classList.contains('add-to-cart')) {
            addToCart(e);
        }
        
        if (e.target.classList.contains('decrease-qty')) {
            if (e.target.closest('.cart-item')) {
                decreaseCartQuantity(e);
            } else {
                decreaseQuantity(e);
            }
        }
        
        if (e.target.classList.contains('increase-qty')) {
            if (e.target.closest('.cart-item')) {
                increaseCartQuantity(e);
            } else {
                increaseQuantity(e);
            }
        }
        
        if (e.target.classList.contains('remove-item')) {
            removeFromCart(e);
        }
    });

    // Quantity input changes
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('cart-item-quantity')) {
            updateCartQuantity(e);
        }
    });

    // Order confirmation buttons
    const downloadJsonBtn = document.getElementById('download-json');
    if (downloadJsonBtn) {
        downloadJsonBtn.addEventListener('click', downloadOrderAsJson);
    }

    const clearDataBtn = document.getElementById('clear-data');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', clearAllData);
    }

    const logoutNowBtn = document.getElementById('logout-now');
    if (logoutNowBtn) {
    logoutNowBtn.addEventListener('click', logoutUser);
    }
}

// User authentication functions
function handleRegistration(event) {
    event.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    
    const request = indexedDB.open(dbName, dbVersion);
    
    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        
        const getUserRequest = store.get(username);
        
        getUserRequest.onsuccess = function() {
            if (getUserRequest.result) {
                showMessage('Username already exists. Please choose another.', 'error');
            } else {
                const addUserRequest = store.add({ username, password });
                
                addUserRequest.onsuccess = function() {
                    showMessage('Registration successful! Please login.', 'success');
                    document.getElementById('regUsername').value = '';
                    document.getElementById('regPassword').value = '';
                };
            }
        };
    };
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const request = indexedDB.open(dbName, dbVersion);
    
    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        
        const getUserRequest = store.get(username);
        
        getUserRequest.onsuccess = function() {
            const user = getUserRequest.result;
            
            if (user && user.password === password) {
                currentUser = user;
                // Store username in sessionStorage instead of localStorage
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                updateUserGreeting();
                showMessage('Login successful! Redirecting to your cart...', 'success');
                setTimeout(() => {
                    window.location.href = 'cart.html';
                }, 1500);
            } else {
                showMessage('Invalid username or password.', 'error');
            }
        };
        
        getUserRequest.onerror = function() {
            showMessage('Error during login. Please try again.', 'error');
        };
    };
    
    request.onerror = function() {
        showMessage('Database error. Please try again later.', 'error');
    };
}

function checkLoginStatus() {
    const user = sessionStorage.getItem('currentUser'); // Changed to sessionStorage
    if (user) {
        currentUser = JSON.parse(user);
        updateUserGreeting();
    }
}

function updateUserGreeting() {
    const greetingElement = document.getElementById('user-greeting');
    if (greetingElement && currentUser) {
        greetingElement.textContent = `Welcome, ${currentUser.username}!`;
    }
}
// Product functions
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error('Failed to load product data');
        }
        products = await response.json();
        displayProducts();
    } catch (error) {
        console.error('Error loading product data:', error);
        document.getElementById('product-list').innerHTML = 
            '<p class="error">Failed to load products, please try again later.</p>';
    }
}

function displayProducts() {
    const productList = document.getElementById('product-list');
    if (!productList) return;
    
    productList.innerHTML = `
        <div class="bulk-actions">
            <button class="bulk-add-to-cart">Add Selected to Cart</button>
            <div class="quantity-selector">
                <label>Quantity:</label>
                <input type="number" class="bulk-quantity" min="1" value="1">
            </div>
        </div>
        <div class="products-container"></div>
    `;

    const productsContainer = productList.querySelector('.products-container');
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-selector">
                <input type="checkbox" class="product-checkbox" data-id="${product.id}">
            </div>
            <img src="images/${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="description">${product.description}</p>
            <p class="price">$${product.price.toFixed(2)}</p>
            <div class="quantity-control">
                <button class="decrease-qty" data-id="${product.id}">-</button>
                <input type="number" class="product-quantity" data-id="${product.id}" min="1" value="1">
                <button class="increase-qty" data-id="${product.id}">+</button>
            </div>
            <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
        `;
        productsContainer.appendChild(productCard);
    });
}
// Cart functions
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    displayCart();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function displayCart() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;
    
    cartItems.innerHTML = '';

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        return;
    }

    cartItems.innerHTML = `
        <div class="cart-bulk-actions">
            <div class="select-all">
                <input type="checkbox" class="select-all-items" id="select-all-items">
                <label for="select-all-items">Select All</label>
            </div>
            <div class="bulk-buttons">
                <button class="bulk-remove">Remove Selected</button>
                <div class="bulk-update-container">
                    <input type="number" class="bulk-update-quantity" min="1" value="1">
                    <button class="bulk-update">Update Quantity</button>
                </div>
            </div>
        </div>
        <div class="cart-items-container"></div>
    `;

    const cartItemsContainer = cartItems.querySelector('.cart-items-container');
    let total = 0;
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-select">
                <input type="checkbox" class="cart-item-checkbox" data-id="${item.id}">
            </div>
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <div class="quantity-control">
                    <button class="decrease-qty" data-id="${item.id}">-</button>
                    <input type="number" class="cart-item-quantity" data-id="${item.id}" min="1" value="${item.quantity}">
                    <button class="increase-qty" data-id="${item.id}">+</button>
                </div>
            </div>
            <div class="cart-item-price">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
            <button class="remove-item" data-id="${item.id}">Remove</button>
        `;
        cartItemsContainer.appendChild(cartItem);
        total += item.price * item.quantity;
    });

    const totalElement = document.createElement('div');
    totalElement.className = 'cart-total';
    totalElement.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
    cartItems.appendChild(totalElement);

    // 在 loadCart() 函数中修改 checkoutBtn 的事件监听器
const checkoutBtn = document.createElement('button');
checkoutBtn.className = 'checkout-btn';
checkoutBtn.textContent = 'Confirm';
checkoutBtn.addEventListener('click', function() {
    // 检查登录状态
    if (!currentUser) {
        showMessage('Please login to proceed to checkout', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return;
    }
    
    // 检查购物车是否为空
    if (cart.length === 0) {
        showMessage('Your cart is empty. Add some items first!', 'error');
        return;
    }
    
    // 直接跳转到确认页面
    window.location.href = 'confirm.html';
});
cartItems.appendChild(checkoutBtn);
}
// Quantity functions
function decreaseQuantity(event) {
    const productId = parseInt(event.target.dataset.id);
    const quantityInput = document.querySelector(`.product-quantity[data-id="${productId}"]`);
    if (quantityInput.value > 1) {
        quantityInput.value--;
    }
}

function increaseQuantity(event) {
    const productId = parseInt(event.target.dataset.id);
    const quantityInput = document.querySelector(`.product-quantity[data-id="${productId}"]`);
    quantityInput.value++;
}

function decreaseCartQuantity(event) {
    const productId = parseInt(event.target.dataset.id);
    const item = cart.find(item => item.id === productId);
    
    if (item && item.quantity > 1) {
        item.quantity--;
        saveCart();
        displayCart();
    }
}

function increaseCartQuantity(event) {
    const productId = parseInt(event.target.dataset.id);
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity++;
        saveCart();
        displayCart();
    }
}

function updateCartQuantity(event) {
    const productId = parseInt(event.target.dataset.id);
    const newQuantity = parseInt(event.target.value) || 1;
    const item = cart.find(item => item.id === productId);
    
    if (item && newQuantity > 0) {
        item.quantity = newQuantity;
        saveCart();
        displayCart();
    }
}

// Cart item functions
function addToCart(event) {
    const productId = parseInt(event.target.dataset.id);
    const product = products.find(p => p.id === productId);
    const quantity = parseInt(document.querySelector(`.product-quantity[data-id="${productId}"]`).value) || 1;
    
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                ...product,
                quantity: quantity
            });
        }
        
        saveCart();
        displayCart();
        showMessage(`Added ${quantity} ${product.name} to cart`, 'success');
    }
}

function bulkAddToCart() {
    const checkboxes = document.querySelectorAll('.product-checkbox:checked');
    const bulkQuantity = parseInt(document.querySelector('.bulk-quantity').value) || 1;
    
    if (checkboxes.length === 0) {
        showMessage('Please select at least one product', 'error');
        return;
    }
    
    let addedCount = 0;
    
    checkboxes.forEach(checkbox => {
        const productId = parseInt(checkbox.dataset.id);
        const product = products.find(p => p.id === productId);
        
        if (product) {
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += bulkQuantity;
            } else {
                cart.push({
                    ...product,
                    quantity: bulkQuantity
                });
            }
            addedCount++;
        }
    });
    
    if (addedCount > 0) {
        saveCart();
        displayCart();
        showMessage(`Added ${addedCount} products to cart (${bulkQuantity} each)`, 'success');
    }
}

function removeFromCart(event) {
    const productId = parseInt(event.target.dataset.id);
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        const itemName = cart[itemIndex].name;
        cart.splice(itemIndex, 1);
        saveCart();
        displayCart();
        showMessage(`Removed ${itemName}`, 'success');
    }
}

function bulkRemoveItems() {
    const checkboxes = document.querySelectorAll('.cart-item-checkbox:checked');
    
    if (checkboxes.length === 0) {
        showMessage('Please select at least one item', 'error');
        return;
    }
    
    const removedItems = [];
    
    checkboxes.forEach(checkbox => {
        const productId = parseInt(checkbox.dataset.id);
        const itemIndex = cart.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            removedItems.push(cart[itemIndex].name);
            cart.splice(itemIndex, 1);
        }
    });
    
    if (removedItems.length > 0) {
        saveCart();
        displayCart();
        showMessage(`Removed ${removedItems.length} items`, 'success');
    }
}

function bulkUpdateQuantity() {
    const checkboxes = document.querySelectorAll('.cart-item-checkbox:checked');
    const newQuantity = parseInt(document.querySelector('.bulk-update-quantity').value) || 1;
    
    if (checkboxes.length === 0) {
        showMessage('Please select at least one item', 'error');
        return;
    }
    
    let updatedCount = 0;
    
    checkboxes.forEach(checkbox => {
        const productId = parseInt(checkbox.dataset.id);
        const item = cart.find(item => item.id === productId);
        
        if (item && newQuantity > 0) {
            item.quantity = newQuantity;
            updatedCount++;
        }
    });
    
    if (updatedCount > 0) {
        saveCart();
        displayCart();
        showMessage(`Updated ${updatedCount} items to quantity ${newQuantity}`, 'success');
    }
}

// Order functions
function displayOrderSummary() {
    if (!currentUser) {
        showMessage('Please login to complete your order', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return;
    }

    if (cart.length === 0) {
        showMessage('Your cart is empty. Add some items before checkout.', 'error');
        setTimeout(() => {
            window.location.href = 'cart.html';
        }, 1500);
        return;
    }

    let total = 0;
    const orderItemsList = document.getElementById('order-items-list');
    
    if (orderItemsList) {
        orderItemsList.innerHTML = '';
        cart.forEach(item => {
            const li = document.createElement('li');
            li.className = 'order-item';
            li.innerHTML = `
                <span class="item-name">${item.name}</span>
                <span class="item-quantity">Qty: ${item.quantity}</span>
                <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            `;
            orderItemsList.appendChild(li);
            total += item.price * item.quantity;
        });
    } else {
        cart.forEach(item => {
            total += item.price * item.quantity;
        });
    }
    
    const orderTotalDisplay = document.getElementById('order-total-display');
    if (orderTotalDisplay) {
        orderTotalDisplay.textContent = `Order Total: $${total.toFixed(2)}`;
    }
    showMessage('Order confirmed! Thank you for your purchase.', 'success');
    saveOrder(cart, total);
    
}

function saveOrder(items, total) {
    const request = indexedDB.open(dbName, dbVersion);
    
    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['orders', 'cart'], 'readwrite');
        const ordersStore = transaction.objectStore('orders');
        const cartStore = transaction.objectStore('cart');
        
        const order = {
            userId: currentUser.username,
            items: items,
            total: total,
            date: new Date()
        };

        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    existingOrders.push(order);
    localStorage.setItem('orders', JSON.stringify(existingOrders));
        
        const addOrderRequest = ordersStore.add(order);
        
        addOrderRequest.onsuccess = function() {
            const clearCartRequest = cartStore.clear();
            clearCartRequest.onsuccess = function() {
                console.log('Cart cleared after order placement');
            };
        };
    };
}

function downloadOrderAsJson() {

    const savedOrders = localStorage.getItem('orders');
    
    if (!savedOrders || JSON.parse(savedOrders).length === 0) {
        showMessage('No orders found in your history.', 'error');
        return;
    }
    
    try {
        const orders = JSON.parse(savedOrders);
        const latestOrder = orders.reduce((latest, order) => {
            return new Date(order.date) > new Date(latest.date) ? order : latest;
        });
        
        const orderJson = JSON.stringify(latestOrder, null, 2);
        const blob = new Blob([orderJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `order_${currentUser.username}_${latestOrder.id || Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error processing orders:', error);
        showMessage('Failed to download order data.', 'error');
    }
}
// Utility functions
function showMessage(message, type) {
    // Remove any existing messages first
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageContainer = document.createElement('div');
    messageContainer.className = `message ${type}`;
    messageContainer.innerHTML = `
        <span class="message-icon">${type === 'success' ? '✓' : '⚠'}</span>
        <span class="message-text">${message}</span>
    `;
    
    document.body.appendChild(messageContainer);
    
    // Position and style the message
    messageContainer.style.position = 'fixed';
    messageContainer.style.top = '20px';
    messageContainer.style.left = '50%';
    messageContainer.style.transform = 'translateX(-50%)';
    messageContainer.style.zIndex = '1000';
    messageContainer.style.padding = '12px 24px';
    messageContainer.style.borderRadius = '4px';
    messageContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    messageContainer.style.display = 'flex';
    messageContainer.style.alignItems = 'center';
    messageContainer.style.gap = '10px';
    messageContainer.style.animation = 'fadeIn 0.3s, fadeOut 0.3s 2.7s';
    
    // Set colors based on message type
    if (type === 'success') {
        messageContainer.style.backgroundColor = '#4CAF50';
        messageContainer.style.color = 'white';
    } else if (type === 'error') {
        messageContainer.style.backgroundColor = '#F44336';
        messageContainer.style.color = 'white';
    } else {
        messageContainer.style.backgroundColor = '#2196F3';
        messageContainer.style.color = 'white';
    }
    
    setTimeout(() => {
        messageContainer.remove();
    }, 3000);
}

// Add this to script.js
function updateNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (currentPage === linkPage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
    
    // Update greeting if user is logged in
    if (currentUser) {
        const greetingElement = document.getElementById('user-greeting');
        if (greetingElement) {
            greetingElement.textContent = `Welcome, ${currentUser.username}!`;
            greetingElement.style.display = 'block';
        }
    }
}

function loadPageSpecificContent() {
    const path = window.location.pathname.split('/').pop();
    
    if (path === 'cart.html') {
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }
        loadProducts();
        loadCart();
    } else if (path === 'confirm.html') {
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }
        displayOrderSummary();
    }
}


function clearAllData() {
    if (confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
        localStorage.removeItem('orders');
        localStorage.removeItem('cart');
        
        cart = [];
        currentUser = null;
        
        showMessage('All your data has been cleared.', 'success');
        window.location.href = 'index.html';
    }
}
function logoutUser() {
    // Clear both sessionStorage and localStorage to be safe
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart'); // Clear cart as well
    
    // Reset global variables
    currentUser = null;
    cart = [];
    
    // Show logout message
    showMessage('You have been logged out successfully', 'success');
    
    // Redirect to home page after a short delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

function validateRegistrationForm(username, password) {
    if (!username.trim()) {
        showMessage('Username cannot be empty', 'error');
        document.getElementById('regUsername').focus();
        return false;
    }
    if (!password.trim()) {
        showMessage('Password cannot be empty', 'error');
        document.getElementById('regPassword').focus();
        return false;
    }
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        document.getElementById('regPassword').focus();
        return false;
    }
    if (username.length < 4) {
        showMessage('Username must be at least 4 characters', 'error');
        document.getElementById('regUsername').focus();
        return false;
    }
    return true;
}

function validateLoginForm(username, password) {
    if (!username.trim()) {
        showMessage('Username cannot be empty', 'error');
        document.getElementById('loginUsername').focus();
        return false;
    }
    if (!password.trim()) {
        showMessage('Password cannot be empty', 'error');
        document.getElementById('loginPassword').focus();
        return false;
    }
    return true;
}


