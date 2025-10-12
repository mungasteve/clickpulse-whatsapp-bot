const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

app.get('/', (req, res) => {
  res.json({ message: "ClickPulse API Server", endpoints: ["/api/products", "/api/orders"] });
});

app.get('/admin', (req, res) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>ClickPulse Admin</title>
    <style>
        body { font-family: Arial; margin: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; border: 1px solid #ddd; }
        th { background: #f4f4f4; }
    </style>
</head>
<body>
    <h1>ClickPulse Admin Dashboard</h1>
    <h2>Products (${products.length} total)</h2>
    <table>
        <tr><th>ID</th><th>Name</th><th>Price</th><th>Category</th><th>Stock</th></tr>
        ${products.map(p => `<tr><td>${p.id}</td><td>${p.name}</td><td>$${p.price}</td><td>${p.category}</td><td>${p.stock}</td></tr>`).join('')}
    </table>
</body>
</html>`;
  res.send(html);
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const newOrder = {
    id: orders.length + 1,
    ...req.body,
    date: new Date().toISOString()
  };
  orders.push(newOrder);
  res.json(newOrder);
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;