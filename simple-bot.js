const { Client, NoAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new NoAuth(),
    puppeteer: {
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let products = [];
let userSessions = {};

const fetchProducts = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/products');
        products = await response.json();
        console.log(`Loaded ${products.length} products`);
    } catch (error) {
        console.log('Error fetching products:', error);
    }
};

const createOrder = async (customerName, phone, items) => {
    try {
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerName, phone, items })
        });
        return await response.json();
    } catch (error) {
        console.log('Error creating order:', error);
        return null;
    }
};

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    console.log('Go to https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(qr));
    console.log('Open the above URL in browser and scan the QR code');
});

client.on('ready', () => {
    console.log('Client is ready!');
    fetchProducts();
});

client.on('message', async msg => {
    const userId = msg.from;
    const text = msg.body.toLowerCase();

    if (!userSessions[userId]) {
        userSessions[userId] = { cart: [], step: 'menu' };
    }

    const session = userSessions[userId];

    if (text === 'hi' || text === 'hello') {
        msg.reply(`🛍️ *ClickPulse Store*

📱 ELECTRONICS
1. Smartphone - $999
2. Laptop Pro - $1999  
3. Wireless Earbuds - $249
8. Bluetooth Speaker - $129

👕 CLOTHING
4. Premium T-Shirt - $29
5. Denim Collection - $79
6. Hoodie Edition - $59

🏠 HOME
7. Coffee Maker - $89
9. Smart Lamp - $45

Type number to add to cart
Type *cart* to view cart
Type *checkout* to order`);
    }
    else if (text === 'cart') {
        if (session.cart.length === 0) {
            msg.reply('🛒 Cart is empty');
        } else {
            let cartText = '🛒 *Your Cart:*\n\n';
            let total = 0;
            session.cart.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    cartText += `${product.name} x${item.quantity} - $${item.price * item.quantity}\n`;
                    total += item.price * item.quantity;
                }
            });
            cartText += `\n💰 *Total: $${total}*`;
            msg.reply(cartText);
        }
    }
    else if (text === 'checkout') {
        if (session.cart.length === 0) {
            msg.reply('🛒 Cart is empty');
        } else {
            session.step = 'name';
            msg.reply('📝 Enter your name:');
        }
    }
    else if (session.step === 'name') {
        session.customerName = msg.body;
        session.step = 'confirm';
        
        let total = session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        msg.reply(`📋 *Order Summary:*
Customer: ${session.customerName}
Total: $${total}

Reply *yes* to confirm`);
    }
    else if (session.step === 'confirm' && text === 'yes') {
        const order = await createOrder(session.customerName, userId, session.cart);
        if (order) {
            msg.reply(`✅ *Order Confirmed!*
Order ID: #${order.id}
Total: $${order.total}

Thank you!`);
            userSessions[userId] = { cart: [], step: 'menu' };
        }
    }
    else if (/^[1-9]$/.test(text)) {
        const productId = parseInt(text);
        const product = products.find(p => p.id === productId);
        
        if (product) {
            const existingItem = session.cart.find(item => item.productId === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                session.cart.push({ productId: product.id, quantity: 1, price: product.price });
            }
            msg.reply(`✅ Added ${product.name} to cart!`);
        }
    }
});

client.initialize();