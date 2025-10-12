const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Products data
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

let orders = [];

// API Routes
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/orders', (req, res) => {
  const order = {
    id: Date.now(),
    ...req.body,
    timestamp: new Date()
  };
  orders.push(order);
  res.json({ success: true, order });
});

app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}/api/products`);
});