const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false,
        args: ['--no-sandbox']
    }
});

let products = [];
let userSessions = {};
let customerProfiles = {};
let abandonedCarts = {};

// AI-powered smart search
const smartSearch = (query) => {
    const keywords = query.toLowerCase().split(' ');
    return products.filter(product => {
        const searchText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
        return keywords.some(keyword => searchText.includes(keyword));
    }).slice(0, 5);
};

// Simple AI Chat Engine
const aiChatEngine = (message, userId) => {
    const text = message.toLowerCase();
    
    if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
        return `🤖 *ClickPulse AI Assistant*\n\n👋 Hello! I'm here to help!\n\n🎯 I CAN HELP WITH:\n• Product information\n• Store policies\n• Shipping details\n• Order tracking\n\nWhat would you like to know? 😊`;
    }
    
    if (text.includes('smartphone') || text.includes('phone')) {
        return `📱 *ClickPulse Smartphone* - $999\n\n🔥 PREMIUM FEATURES:\n• 5G Technology\n• 128GB Storage\n• Triple Camera\n• Face ID Security\n\n✨ Latest 5G smartphone with advanced features\n📦 Stock: 10 available\n⭐ Rating: 4.5/5 (45 reviews)\n\nType *1* to add to cart!`;
    }
    
    if (text.includes('laptop')) {
        return `💻 *ClickPulse Laptop Pro* - $1999\n\n🚀 PRO SPECS:\n• Intel i7 CPU\n• 16GB RAM\n• 512GB SSD\n• 13.3" Display\n\n✨ High-performance laptop for professionals\n📦 Stock: 5 available\n⭐ Rating: 4.5/5 (32 reviews)\n\nType *2* to add to cart!`;
    }
    
    if (text.includes('earbuds') || text.includes('headphones')) {
        return `🎧 *ClickPulse Wireless Earbuds* - $249\n\n🎵 AUDIO FEATURES:\n• Noise Cancellation\n• Wireless Charging\n• 24hr Battery Life\n• Premium Sound\n\n✨ Premium wireless earbuds with noise cancellation\n📦 Stock: 15 available\n⭐ Rating: 4.5/5\n\nType *3* to add to cart!`;
    }
    
    if (text.includes('t-shirt') || text.includes('shirt')) {
        return `👕 *ClickPulse Premium T-Shirt* - $29\n\n👔 STYLE OPTIONS:\n• 100% Cotton\n• Multiple Colors\n• Sizes S-XXL\n• Comfortable Fit\n\n✨ Comfortable cotton t-shirt in various colors\n📦 Stock: 50 available\n⭐ Rating: 4.5/5\n\nType *4* to add to cart!`;
    }
    
    if (text.includes('coffee') || text.includes('maker')) {
        return `☕ *ClickPulse Coffee Maker* - $89\n\n☕ BREWING FEATURES:\n• Programmable Timer\n• Auto Shut-off\n• 12-Cup Capacity\n• Hot Plate Warmer\n\n✨ Automatic coffee maker with timer\n📦 Stock: 8 available\n⭐ Rating: 4.5/5\n\nType *7* to add to cart!`;
    }
    
    if (text.includes('shipping') || text.includes('delivery')) {
        return `🚚 *Shipping Options:*\n\n📦 DELIVERY CHOICES:\n• Standard - $5.99 (5-7 days)\n• Express - $12.99 (2-3 days)\n• Overnight - $24.99 (1 day)\n• FREE shipping on orders $100+\n\n🌍 Nationwide coverage\n📱 Real-time tracking\n\nReady to order? Type *checkout*!`;
    }
    
    if (text.includes('payment') || text.includes('pay')) {
        return `💳 *Payment Methods:*\n\n💰 SECURE OPTIONS:\n• Credit/Debit Cards\n• PayPal\n• Cash on Delivery\n• Bank Transfer\n\n🔒 All payments are secure!\n🛡️ SSL encrypted\n\nReady to shop? Type a product number (1-9)!`;
    }
    
    if (text.includes('return') || text.includes('refund')) {
        return `🔄 *Returns & Refunds:*\n\n✅ EASY PROCESS:\n• 30-day return window\n• Free return shipping\n• Full refund in 5-7 days\n• No questions asked\n\n📞 Need help? Type *contact*!\n🎯 Hassle-free experience!`;
    }
    
    if (text.includes('store') || text.includes('about')) {
        return `🏪 *ClickPulse Store*\n\n🌟 YOUR PREMIUM DESTINATION\n\n✅ WHAT WE OFFER:\n• 9 Amazing Products\n• Fast Delivery\n• Multiple Payments\n• Loyalty Rewards\n• 24/7 Support\n\nType *products* to browse our catalog!`;
    }
    
    return `🤖 *I can help with:*\n\n• "Tell me about smartphone"\n• "How does shipping work?"\n• "What payment methods?"\n• "About your store"\n\nOr type *hi* for main menu! 😊`;
};

// Get personalized recommendations
const getPersonalizedRecommendations = async (userId) => {
    try {
        const response = await fetch(`http://localhost:5000/api/products/1/recommendations?customerId=${userId}`);
        return await response.json();
    } catch (error) {
        return products.slice(0, 3);
    }
};

// Track abandoned cart
const trackAbandonedCart = (userId) => {
    if (userSessions[userId]?.cart?.length > 0) {
        abandonedCarts[userId] = {
            cart: [...userSessions[userId].cart],
            timestamp: Date.now(),
            reminderSent: false
        };
    }
};

// Send abandoned cart reminder
const sendAbandonedCartReminder = () => {
    Object.keys(abandonedCarts).forEach(userId => {
        const abandoned = abandonedCarts[userId];
        const timeDiff = Date.now() - abandoned.timestamp;
        
        if (timeDiff > 300000 && !abandoned.reminderSent) { // 5 minutes
            abandoned.reminderSent = true;
            const total = abandoned.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            client.sendMessage(userId, `🛒 *Don't Forget Your Cart!*\n\nYou left ${abandoned.cart.length} items worth $${total.toFixed(2)}\n\n🎁 Use code *COMEBACK10* for 10% off!\n\nType *restore* to continue shopping`);
        }
    });
};

// Check for abandoned carts every 2 minutes
setInterval(sendAbandonedCartReminder, 120000);

// Fetch products
const fetchProducts = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/products');
        products = await response.json();
        console.log(`✅ Loaded ${products.length} products`);
    } catch (error) {
        console.log('❌ Error fetching products. Make sure server is running on port 5000');
    }
};

// Create order
const createOrder = async (customerName, phone, items, couponCode = null, shippingChoice = 1, paymentMethod = 'Cash on Delivery', address = '') => {
    try {
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerName, phone, items, couponCode, shippingId: shippingChoice, paymentMethod, address })
        });
        return await response.json();
    } catch (error) {
        console.log('❌ Error creating order:', error);
        return null;
    }
};

client.on('qr', (qr) => {
    console.log('\n🔗 SCAN THIS QR CODE WITH WHATSAPP:');
    console.log('📱 WhatsApp → Settings → Linked Devices → Link a Device');
    console.log('\n' + qr);
    console.log('\n⏳ Waiting for scan...\n');
});

client.on('ready', () => {
    console.log('🚀 WhatsApp Bot is ready!');
    console.log('📞 Send "hi" to your WhatsApp to test the bot');
    console.log('🔍 Bot is listening for messages...');
    fetchProducts();
});

client.on('authenticated', () => {
    console.log('✅ WhatsApp authenticated successfully!');
});

client.on('auth_failure', (msg) => {
    console.log('❌ Authentication failed:', msg);
});

client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp disconnected:', reason);
});

client.on('message', async (message) => {
    console.log('\n=== NEW MESSAGE ===');
    console.log('📨 From:', message.from);
    console.log('📝 Text:', message.body);
    console.log('👤 From me:', message.fromMe);
    console.log('🕰 Time:', new Date().toLocaleTimeString());
    
    // Don't respond to own messages, status messages, or group messages
    if (message.fromMe || message.from === 'status@broadcast' || message.isGroupMsg) {
        console.log('⏭️ Skipping message (own/status/group)');
        return;
    }
    
    const userId = message.from;
    const text = message.body.toLowerCase().trim();

    if (!userSessions[userId]) {
        userSessions[userId] = { cart: [], step: 'menu' };
    }

    const session = userSessions[userId];
    console.log('🔄 Processing message:', text);
    
    if (text === 'hi' || text === 'hello' || text === 'start') {
        session.step = 'menu';
        
        // Initialize customer profile
        if (!customerProfiles[userId]) {
            customerProfiles[userId] = {
                visits: 0,
                purchases: 0,
                preferences: [],
                lastVisit: Date.now()
            };
        }
        customerProfiles[userId].visits++;
        customerProfiles[userId].lastVisit = Date.now();
        
        const isReturning = customerProfiles[userId].visits > 1;
        const greeting = isReturning ? `🎉 *Welcome Back to ClickPulse!*\n_Great to see you again!_` : `🛍️ *Welcome to ClickPulse Store!*\n_Your premium shopping destination_`;
        
        message.reply(`${greeting}\n\n📱 *ELECTRONICS*\n1️⃣ ClickPulse Smartphone - $999\n2️⃣ ClickPulse Laptop Pro - $1999\n3️⃣ ClickPulse Wireless Earbuds - $249\n8️⃣ ClickPulse Bluetooth Speaker - $129\n\n👕 *CLOTHING*\n4️⃣ ClickPulse Premium T-Shirt - $29\n5️⃣ ClickPulse Denim Collection - $79\n6️⃣ ClickPulse Hoodie Edition - $59\n\n🏠 *HOME*\n7️⃣ ClickPulse Coffee Maker - $89\n9️⃣ ClickPulse Smart Lamp - $45\n\n*🎯 Commands:*\n• Type *1-9* to add to cart\n• Type *search [item]* for smart search\n• Type *recommend* for AI suggestions\n• Type *cart* to view cart\n• Type *deals* for current offers\n• Type *checkout* to place order`);
        
        // Show personalized recommendations for returning customers
        if (isReturning) {
            setTimeout(async () => {
                const recommendations = await getPersonalizedRecommendations(userId);
                if (recommendations.length > 0) {
                    let recText = `🤖 *AI Recommendations Just For You:*\n\n`;
                    recommendations.forEach((product, index) => {
                        recText += `${index + 1}. ${product.name} - $${product.price}\n`;
                    });
                    recText += `\nType the number to add to cart!`;
                    client.sendMessage(userId, recText);
                }
            }, 2000);
        }
    }
    else {
        // Track abandoned cart when user stops responding
        if (session.cart.length > 0) {
            trackAbandonedCart(userId);
        }
        
        // Use AI Chat Engine for natural conversation
        const aiResponse = aiChatEngine(message.body, userId);
        console.log('🤖 AI Response:', aiResponse);
        message.reply(aiResponse);
        console.log('✅ Reply sent');
    }
});

console.log('\n🚀 Starting WhatsApp Bot...');
console.log('📋 Make sure your Express server is running: node server.js');
console.log('🔍 Initializing WhatsApp client...');
client.initialize();
console.log('⏳ Waiting for QR code or authentication...');