module.exports = (req, res) => {
  const products = [
    { id: 1, name: "ClickPulse Smartphone", price: 999, category: "electronics", stock: 10 },
    { id: 2, name: "ClickPulse Laptop Pro", price: 1999, category: "electronics", stock: 5 },
    { id: 3, name: "ClickPulse Wireless Earbuds", price: 249, category: "electronics", stock: 15 }
  ];

  if (req.url === '/api/products') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(products));
  } else if (req.url === '/admin') {
    res.setHeader('Content-Type', 'text/html');
    res.end(`<h1>ClickPulse Admin</h1><h2>Products: ${products.length}</h2>`);
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: "ClickPulse API Server", endpoints: ["/api/products"] }));
  }
};