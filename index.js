const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Simple product catalog and inventory
const catalog = {
    'product a': { name: 'Product A', price: 100, stock: 5 },
    'product b': { name: 'Product B', price: 150, stock: 2 }
};

// Store user sessions (for demo purposes, use a database in production)
const sessions = {};

app.post('/whatsapp', (req, res) => {
    const twiml = new twilio.twiml.MessagingResponse();
    const incomingMsg = req.body.Body.trim().toLowerCase();
    const from = req.body.From;

    // Initialize session if not exists
    if (!sessions[from]) {
        sessions[from] = { step: 'start' };
    }

    const session = sessions[from];

    if (incomingMsg === 'hi' || incomingMsg === 'hello') {
        session.step = 'start';
        twiml.message('Welcome to ClickPulse! Reply with "catalog" to see our products.');
    } else if (incomingMsg === 'catalog') {
        session.step = 'catalog';
        let msg = 'Here are our products:\n';
        Object.values(catalog).forEach((item, idx) => {
            msg += `${idx + 1}. ${item.name} - $${item.price} (Stock: ${item.stock})\n`;
        });
        msg += 'Reply with the product name to order.';
        twiml.message(msg);
    } else if (catalog[incomingMsg]) {
        session.step = 'product_selected';
        session.product = incomingMsg;
        twiml.message(`${catalog[incomingMsg].name} selected. How many units would you like to order?`);
    } else if (session.step === 'product_selected' && !isNaN(incomingMsg)) {
        const quantity = parseInt(incomingMsg);
        const product = catalog[session.product];
        if (quantity > 0 && quantity <= product.stock) {
            session.quantity = quantity;
            twiml.message(`You are ordering ${quantity} x ${product.name} for $${product.price * quantity}.\nReply with "confirm" to place your order.`);
        } else {
            twiml.message(`Sorry, only ${product.stock} units of ${product.name} are available. Please enter a valid quantity.`);
        }
    } else if (session.step === 'product_selected' && incomingMsg === 'confirm' && session.quantity) {
        const product = catalog[session.product];
        product.stock -= session.quantity; // Reduce stock
        twiml.message(`Order confirmed for ${session.quantity} x ${product.name}. Thank you for shopping with ClickPulse!`);
        session.step = 'start'; // Reset session
        session.product = null;
        session.quantity = null;
    } else {
        twiml.message('Sorry, I did not understand. Please reply with "catalog" to see products.');
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});

app.listen(3000, () => {
    console.log('WhatsApp bot running on port 3000');
});