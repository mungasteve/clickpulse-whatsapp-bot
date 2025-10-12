const express = require('express');
const app = express();

app.use(express.json());

const products = [
  { id: 1, name: "ClickPulse Smartphone", price: 999, category: "electronics", stock: 10 },
  { id: 2, name: "ClickPulse Laptop Pro", price: 1999, category: "electronics", stock: 5 },
  { id: 3, name: "ClickPulse Wireless Earbuds", price: 249, category: "electronics", stock: 15 }
];

app.get('/', (req, res) => {
  res.json({ message: "ClickPulse API Server", endpoints: ["/api/products"] });
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/admin', (req, res) => {
  res.send(`
    <h1>ClickPulse Admin</h1>
    <h2>Products: ${products.length}</h2>
    <ul>
      ${products.map(p => `<li>${p.name} - $${p.price}</li>`).join('')}
    </ul>
  `);
});

module.exports = app;