const fs = require('fs');
const path = require('path');

let users = [];
let sessions = {};

module.exports = (req, res) => {
  const products = [
    { id: 1, name: "ClickPulse Smartphone", price: 999, category: "electronics", stock: 10 },
    { id: 2, name: "ClickPulse Laptop Pro", price: 1999, category: "electronics", stock: 5 },
    { id: 3, name: "ClickPulse Wireless Earbuds", price: 249, category: "electronics", stock: 15 },
    { id: 4, name: "ClickPulse Premium T-Shirt", price: 29, category: "clothing", stock: 50 },
    { id: 5, name: "ClickPulse Denim Collection", price: 79, category: "clothing", stock: 25 },
    { id: 6, name: "ClickPulse Hoodie Edition", price: 59, category: "clothing", stock: 30 },
    { id: 7, name: "ClickPulse Coffee Maker", price: 89, category: "home", stock: 8 },
    { id: 8, name: "ClickPulse Bluetooth Speaker", price: 129, category: "home", stock: 12 },
    { id: 9, name: "ClickPulse Smart Lamp", price: 45, category: "home", stock: 20 }
  ];

  if (req.url === '/api/products') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(products));
  } else if (req.url === '/api/signup' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { email, password, name } = JSON.parse(body);
      if (users.find(u => u.email === email)) {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'User already exists' }));
      } else {
        const user = { id: Date.now(), email, password, name };
        users.push(user);
        const token = 'token_' + Date.now();
        sessions[token] = user.id;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, token, user: { id: user.id, email, name } }));
      }
    });
  } else if (req.url === '/api/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { email, password } = JSON.parse(body);
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        const token = 'token_' + Date.now();
        sessions[token] = user.id;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, token, user: { id: user.id, email: user.email, name: user.name } }));
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 401;
        res.end(JSON.stringify({ error: 'Invalid credentials' }));
      }
    });
  } else if (req.url === '/admin') {
    res.setHeader('Content-Type', 'text/html');
    res.end(`<h1>ClickPulse Admin</h1><h2>Products: ${products.length}</h2>`);
  } else if (req.url === '/' || req.url === '/index.html') {
    res.setHeader('Content-Type', 'text/html');
    res.end(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ClickPulse - Premium Shopping</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; background: #f8f9fa; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem 0; }
        .nav { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 2rem; }
        .logo { font-size: 2rem; font-weight: bold; }
        .cart-icon { position: relative; font-size: 1.5rem; cursor: pointer; }
        .cart-count { position: absolute; top: -8px; right: -8px; background: #ff6b6b; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 4rem 2rem; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.2rem; margin-bottom: 2rem; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .filters { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
        .filter-btn { padding: 10px 20px; border: 2px solid #ddd; background: white; border-radius: 20px; cursor: pointer; transition: all 0.3s ease; }
        .filter-btn.active { background: #667eea; color: white; border-color: #667eea; }
        .products-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
        .product-card { background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1); transition: transform 0.3s ease; cursor: pointer; }
        .product-card:hover { transform: translateY(-5px); }
        .product-image { width: 100%; height: 200px; background: linear-gradient(45deg, #f0f2f5, #e1e8ed); display: flex; align-items: center; justify-content: center; font-size: 3rem; color: #667eea; }
        .product-info { padding: 1.5rem; }
        .product-name { font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem; }
        .product-price { font-size: 1.5rem; font-weight: bold; color: #ff6b6b; margin-bottom: 0.5rem; }
        .product-category { color: #666; font-size: 0.9rem; margin-bottom: 1rem; text-transform: capitalize; }
        .add-to-cart { width: 100%; background: linear-gradient(45deg, #667eea, #764ba2); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .cart-sidebar { position: fixed; right: -400px; top: 0; width: 400px; height: 100vh; background: white; box-shadow: -5px 0 15px rgba(0,0,0,0.1); transition: right 0.3s ease; z-index: 1000; }
        .cart-sidebar.open { right: 0; }
        .cart-header { padding: 2rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .close-cart { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
        .cart-items { padding: 1rem; }
        .cart-total { padding: 2rem; border-top: 2px solid #eee; background: #f8f9fa; }
        .checkout-btn { width: 100%; background: linear-gradient(45deg, #ff6b6b, #feca57); color: white; border: none; padding: 15px; border-radius: 8px; font-size: 1.1rem; cursor: pointer; }
        .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999; opacity: 0; visibility: hidden; transition: all 0.3s ease; }
        .overlay.active { opacity: 1; visibility: visible; }
        @media (max-width: 768px) { .cart-sidebar { width: 100%; right: -100%; } }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">ClickPulse</div>
            <div style="display: flex; gap: 1rem; align-items: center;">
                <div id="userSection">
                    <button onclick="showLogin()" style="background: none; border: 1px solid white; color: white; padding: 8px 16px; border-radius: 20px; cursor: pointer;">Login</button>
                    <button onclick="showSignup()" style="background: white; color: #667eea; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; margin-left: 0.5rem;">Sign Up</button>
                </div>
                <div class="cart-icon" onclick="toggleCart()">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count" id="cartCount">0</span>
                </div>
            </div>
        </nav>
    </header>

    <section class="hero">
        <h1>Premium Shopping Experience</h1>
        <p>Discover amazing products with modern design</p>
    </section>

    <div class="container">
        <div class="filters">
            <button class="filter-btn active" onclick="filterProducts('all')">All Products</button>
            <button class="filter-btn" onclick="filterProducts('electronics')">Electronics</button>
            <button class="filter-btn" onclick="filterProducts('clothing')">Clothing</button>
            <button class="filter-btn" onclick="filterProducts('home')">Home</button>
        </div>

        <div class="products-grid" id="productsGrid"></div>
    </div>

    <div class="overlay" id="overlay" onclick="closeModals()"></div>
    
    <!-- Auth Modal -->
    <div id="authModal" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); z-index: 1001; width: 400px; max-width: 90vw; display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h2 id="modalTitle">Login</h2>
            <button onclick="closeModals()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>
        
        <form id="authForm">
            <div id="nameField" style="margin-bottom: 1rem; display: none;">
                <input type="text" id="name" placeholder="Full Name" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px;">
            </div>
            <div style="margin-bottom: 1rem;">
                <input type="email" id="email" placeholder="Email" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px;">
            </div>
            <div style="margin-bottom: 1.5rem;">
                <input type="password" id="password" placeholder="Password" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px;">
            </div>
            <button type="submit" id="authSubmit" style="width: 100%; background: linear-gradient(45deg, #667eea, #764ba2); color: white; border: none; padding: 12px; border-radius: 8px; font-size: 16px; cursor: pointer;">Login</button>
        </form>
        
        <div style="text-align: center; margin-top: 1rem;">
            <span id="switchText">Don't have an account?</span>
            <button id="switchBtn" onclick="switchAuthMode()" style="background: none; border: none; color: #667eea; cursor: pointer; text-decoration: underline;">Sign Up</button>
        </div>
    </div>
    <div class="cart-sidebar" id="cartSidebar">
        <div class="cart-header">
            <h2>Shopping Cart</h2>
            <button class="close-cart" onclick="toggleCart()"><i class="fas fa-times"></i></button>
        </div>
        <div class="cart-items" id="cartItems">
            <p style="text-align: center; color: #666; padding: 2rem;">Your cart is empty</p>
        </div>
        <div class="cart-total">
            <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: bold;">
                <span>Total: </span>
                <span id="cartTotal">$0.00</span>
            </div>
            <button class="checkout-btn" onclick="checkout()">Checkout via WhatsApp</button>
        </div>
    </div>

    <script>
        let products = ${JSON.stringify(products)};
        let cart = [];
        let currentUser = null;
        let isLoginMode = true;
        
        // Check for saved user session
        const savedToken = localStorage.getItem('authToken');
        if (savedToken) {
            currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
            updateUserUI();
        }

        function displayProducts(productsToShow) {
            const grid = document.getElementById('productsGrid');
            grid.innerHTML = productsToShow.map(product => \`
                <div class="product-card">
                    <div class="product-image">
                        <i class="fas fa-\${getProductIcon(product.category)}"></i>
                    </div>
                    <div class="product-info">
                        <div class="product-name">\${product.name}</div>
                        <div class="product-price">$\${product.price}</div>
                        <div class="product-category">\${product.category}</div>
                        <button class="add-to-cart" onclick="addToCart(\${product.id})">Add to Cart</button>
                    </div>
                </div>
            \`).join('');
        }

        function getProductIcon(category) {
            const icons = { electronics: 'laptop', clothing: 'tshirt', home: 'home' };
            return icons[category] || 'box';
        }

        function filterProducts(category) {
            const filtered = category === 'all' ? products : products.filter(p => p.category === category);
            displayProducts(filtered);
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
        }

        function addToCart(productId) {
            const product = products.find(p => p.id === productId);
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            updateCartUI();
        }

        function updateCartUI() {
            const cartCount = document.getElementById('cartCount');
            const cartItems = document.getElementById('cartItems');
            const cartTotal = document.getElementById('cartTotal');
            
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            cartCount.textContent = totalItems;
            cartTotal.textContent = \`$\${totalPrice.toFixed(2)}\`;
            
            if (cart.length === 0) {
                cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Your cart is empty</p>';
            } else {
                cartItems.innerHTML = cart.map(item => \`
                    <div style="display: flex; justify-content: space-between; padding: 1rem; border-bottom: 1px solid #eee;">
                        <div>
                            <div style="font-weight: 600;">\${item.name}</div>
                            <div style="color: #666;">$\${item.price} x \${item.quantity}</div>
                        </div>
                        <button onclick="removeFromCart(\${item.id})" style="background: #ff6b6b; color: white; border: none; padding: 5px 10px; border-radius: 5px;">×</button>
                    </div>
                \`).join('');
            }
        }

        function removeFromCart(productId) {
            cart = cart.filter(item => item.id !== productId);
            updateCartUI();
        }

        function toggleCart() {
            document.getElementById('cartSidebar').classList.toggle('open');
            document.getElementById('overlay').classList.toggle('active');
        }

        function checkout() {
            if (cart.length === 0) return alert('Your cart is empty!');
            const message = \`Hi! I'd like to order:\\n\${cart.map(item => \`\${item.name} x\${item.quantity} - $\${(item.price * item.quantity).toFixed(2)}\`).join('\\n')}\\n\\nTotal: $\${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}\`;
            window.open(\`https://wa.me/1234567890?text=\${encodeURIComponent(message)}\`);
        }

        displayProducts(products);
        
        function showLogin() {
            isLoginMode = true;
            document.getElementById('modalTitle').textContent = 'Login';
            document.getElementById('nameField').style.display = 'none';
            document.getElementById('authSubmit').textContent = 'Login';
            document.getElementById('switchText').textContent = "Don't have an account?";
            document.getElementById('switchBtn').textContent = 'Sign Up';
            document.getElementById('authModal').style.display = 'block';
            document.getElementById('overlay').classList.add('active');
        }
        
        function showSignup() {
            isLoginMode = false;
            document.getElementById('modalTitle').textContent = 'Sign Up';
            document.getElementById('nameField').style.display = 'block';
            document.getElementById('authSubmit').textContent = 'Sign Up';
            document.getElementById('switchText').textContent = 'Already have an account?';
            document.getElementById('switchBtn').textContent = 'Login';
            document.getElementById('authModal').style.display = 'block';
            document.getElementById('overlay').classList.add('active');
        }
        
        function switchAuthMode() {
            if (isLoginMode) showSignup(); else showLogin();
        }
        
        function closeModals() {
            document.getElementById('authModal').style.display = 'none';
            document.getElementById('cartSidebar').classList.remove('open');
            document.getElementById('overlay').classList.remove('active');
        }
        
        function updateUserUI() {
            const userSection = document.getElementById('userSection');
            if (currentUser) {
                userSection.innerHTML = \`
                    <span style="color: white; margin-right: 1rem;">Hi, \${currentUser.name}!</span>
                    <button onclick="logout()" style="background: none; border: 1px solid white; color: white; padding: 8px 16px; border-radius: 20px; cursor: pointer;">Logout</button>
                \`;
            } else {
                userSection.innerHTML = \`
                    <button onclick="showLogin()" style="background: none; border: 1px solid white; color: white; padding: 8px 16px; border-radius: 20px; cursor: pointer;">Login</button>
                    <button onclick="showSignup()" style="background: white; color: #667eea; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; margin-left: 0.5rem;">Sign Up</button>
                \`;
            }
        }
        
        function logout() {
            currentUser = null;
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            updateUserUI();
            cart = [];
            updateCartUI();
        }
        
        document.getElementById('authForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const name = document.getElementById('name').value;
            
            const endpoint = isLoginMode ? '/api/login' : '/api/signup';
            const body = isLoginMode ? { email, password } : { email, password, name };
            
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    currentUser = data.user;
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    updateUserUI();
                    closeModals();
                    document.getElementById('authForm').reset();
                } else {
                    alert(data.error || 'Authentication failed');
                }
            } catch (error) {
                alert('Network error. Please try again.');
            }
        });
    </script>
</body>
</html>`);
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: "ClickPulse API Server", endpoints: ["/api/products"] }));
  }
};