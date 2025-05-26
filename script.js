// Cart Management System
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    initializeCartButtons();
    initializeWishlistButtons();
});

// Initialize Add to Cart buttons
function initializeCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const productId = productCard.dataset.id || generateProductId(productCard);
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = parseFloat(productCard.querySelector('.price').textContent.replace(/[^\d.]/g, ''));
            const productImage = productCard.querySelector('img').src;
            
            addToCart({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
            
            showToast(`${productName} ajouté au panier`);
        });
    });
    
    // Cart click handler
    document.querySelector('.cart').addEventListener('click', showCartModal);
}

// Initialize Wishlist buttons
function initializeWishlistButtons() {
    const wishlistButtons = document.querySelectorAll('.wishlist');
    
    wishlistButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.currentTarget.classList.toggle('active');
            e.currentTarget.innerHTML = e.currentTarget.classList.contains('active') ? 
                '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
            
            // You could add wishlist functionality here
        });
    });
}

// Cart Functions
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push(product);
    }
    
    cartCount++;
    updateCartCount();
    saveCartToLocalStorage();
}

function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        cartCount -= cart[itemIndex].quantity;
        cart.splice(itemIndex, 1);
        updateCartCount();
        saveCartToLocalStorage();
        return true;
    }
    
    return false;
}

function updateCartCount() {
    document.querySelector('.cart-count').textContent = cartCount;
    document.querySelector('.cart-count').style.display = cartCount > 0 ? 'flex' : 'none';
}

function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Cart Modal
function showCartModal() {
    if (cart.length === 0) {
        showToast("Votre panier est vide");
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'cart-modal';
    modal.innerHTML = `
        <div class="cart-modal-content">
            <div class="cart-modal-header">
                <h3>Votre Panier (${cartCount} article${cartCount > 1 ? 's' : ''})</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="cart-items">
                ${cart.map(item => `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p>${item.price.toFixed(2)} DH x ${item.quantity}</p>
                        </div>
                        <div class="cart-item-actions">
                            <button class="quantity-btn minus">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn plus">+</button>
                            <button class="remove-item"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="cart-summary">
                <p>Total: <span>${calculateTotal().toFixed(2)} DH</span></p>
                <button class="checkout-btn">Passer la commande</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Event listeners for modal
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = 'auto';
    });

    // Quantity controls
    modal.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const cartItem = e.target.closest('.cart-item');
            const productId = cartItem.dataset.id;
            const item = cart.find(item => item.id === productId);
            const quantityDisplay = cartItem.querySelector('.cart-item-actions span');

            if (e.target.classList.contains('plus')) {
                item.quantity++;
                cartCount++;
            } else if (e.target.classList.contains('minus') && item.quantity > 1) {
                item.quantity--;
                cartCount--;
            }

            quantityDisplay.textContent = item.quantity;
            updateCartCount();
            saveCartToLocalStorage();
            updateCartTotal(modal);
        });
    });

    // Remove item
    modal.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const cartItem = e.target.closest('.cart-item');
            const productId = cartItem.dataset.id;
            
            if (removeFromCart(productId)) {
                cartItem.remove();
                updateCartTotal(modal);
                
                if (cart.length === 0) {
                    modal.querySelector('.cart-modal-content').innerHTML = `
                        <div class="empty-cart">
                            <i class="fas fa-shopping-cart"></i>
                            <p>Votre panier est vide</p>
                            <button class="continue-shopping">Continuer vos achats</button>
                        </div>
                    `;
                    
                    modal.querySelector('.continue-shopping').addEventListener('click', () => {
                        document.body.removeChild(modal);
                        document.body.style.overflow = 'auto';
                    });
                }
            }
        });
    });

    // Checkout button
    modal.querySelector('.checkout-btn')?.addEventListener('click', () => {
        alert('Fonctionnalité de paiement à implémenter');
        // window.location.href = 'checkout.html';
    });
}

function updateCartTotal(modal) {
    if (modal) {
        modal.querySelector('.cart-summary span').textContent = calculateTotal().toFixed(2);
        modal.querySelector('h3').textContent = `Votre Panier (${cartCount} article${cartCount > 1 ? 's' : ''})`;
    }
}

function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Helper Functions
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

function generateProductId(productCard) {
    return 'prod_' + Math.random().toString(36).substr(2, 9);
}