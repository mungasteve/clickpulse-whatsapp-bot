const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');

const client = new Client({
    authStrategy: new LocalAuth()
});

let products = [];
let userSessions = {};

// Fetch products from API
const fetchProducts = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/products');
        products = await response.json();
    } catch (error) {
        console.log('Error fetching products:', error);
    }
};

// Create order via API
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
    console.log('Scan this QR code with WhatsApp:');
    qrcode.generate(qr, { small: true });
    
    // Also save as image file
    QRCode.toFile('whatsapp-qr.png', qr, (err) => {
        if (!err) console.log('QR code saved as whatsapp-qr.png - open this file to scan!');
    });
});

client.on('ready', () => {
    console.log('WhatsApp bot is ready!');
    fetchProducts();
});

client.on('message', async (message) => {
    const userId = message.from;
    const text = message.body.toLowerCase();

    if (!userSessions[userId]) {
        userSessions[userId] = { cart: [], step: 'menu' };
    }

    const session = userSessions[userId];

    if (text === 'hi' || text === 'hello' || text === 'start') {
        session.step = 'menu';
        message.reply(`🛍️ Welcome to ClickPulse Store!

📱 *ELECTRONICS*
1. ClickPulse Smartphone - $999
2. ClickPulse Laptop Pro - $1999  
3. ClickPulse Wireless Earbuds - $249
8. ClickPulse Bluetooth Speaker - $129

👕 *CLOTHING*
4. ClickPulse Premium T-Shirt - $29
5. ClickPulse Denim Collection - $79
6. ClickPulse Hoodie Edition - $59

🏠 *HOME*
7. ClickPulse Coffee Maker - $89
9. ClickPulse Smart Lamp - $45

Reply with:
• Product number to add to cart
• *cart* to view cart
• *checkout* to place order
• *clear* to empty cart`);
    }
    else if (text === 'cart') {
        if (session.cart.length === 0) {
            message.reply('🛒 Your cart is empty. Reply with a product number to add items!');
        } else {
            let cartText = '🛒 *Your Cart:*\n\n';
            let total = 0;
            session.cart.forEach((item, index) => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    cartText += `${index + 1}. ${product.name} x${item.quantity} - $${item.price * item.quantity}\n`;
                    total += item.price * item.quantity;
                }
            });
            cartText += `\n💰 *Total: $${total}*\n\nReply *checkout* to place order or *clear* to empty cart`;
            message.reply(cartText);
        }
    }
    else if (text === 'clear') {
        session.cart = [];
        message.reply('🗑️ Cart cleared! Reply with a product number to start shopping.');
    }
    else if (text === 'checkout') {
        if (session.cart.length === 0) {
            message.reply('🛒 Your cart is empty. Add some products first!');
        } else {
            session.step = 'name';
            message.reply('📝 Please enter your full name:');
        }
    }
    else if (session.step === 'name') {
        session.customerName = message.body;
        session.step = 'confirm';
        
        let orderSummary = `📋 *Order Summary:*\n\n`;
        let total = 0;
        session.cart.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                orderSummary += `• ${product.name} x${item.quantity} - $${item.price * item.quantity}\n`;
                total += item.price * item.quantity;
            }
        });
        orderSummary += `\n💰 *Total: $${total}*`;
        orderSummary += `\n👤 *Customer: ${session.customerName}*`;
        orderSummary += `\n📞 *Phone: ${userId}*`;
        orderSummary += `\n\nReply *yes* to confirm order or *no* to cancel`;
        
        message.reply(orderSummary);
    }
    else if (session.step === 'confirm') {
        if (text === 'yes') {
            const order = await createOrder(session.customerName, userId, session.cart);
            if (order) {
                message.reply(`✅ *Order Confirmed!*

📦 Order ID: #${order.id}
💰 Total: $${order.total}
📅 Date: ${order.date}

Your order is being processed. We'll update you on the status!

Reply *hi* to start a new order.`);
                
                // Reset session
                userSessions[userId] = { cart: [], step: 'menu' };
            } else {
                message.reply('❌ Sorry, there was an error processing your order. Please try again.');
            }
        } else {
            message.reply('❌ Order cancelled. Reply *hi* to start over.');
            userSessions[userId] = { cart: [], step: 'menu' };
        }
    }
    else if (/^[1-9]$/.test(text)) {
        const productId = parseInt(text);
        const product = products.find(p => p.id === productId);
        
        if (product && product.stock > 0) {
            const existingItem = session.cart.find(item => item.productId === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                session.cart.push({
                    productId: product.id,
                    quantity: 1,
                    price: product.price
                });
            }
            
            message.reply(`✅ Added *${product.name}* to cart!

🛒 Cart: ${session.cart.length} items
💰 Total: $${session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}

Reply *cart* to view or continue shopping!`);
        } else {
            message.reply('❌ Product not found or out of stock. Please try another number.');
        }
    }
    else {
        message.reply('❓ I didn\'t understand that. Reply *hi* to see the menu!');
    }
});

client.initialize();