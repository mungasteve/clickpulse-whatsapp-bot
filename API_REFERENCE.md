# 🔌 ClickPulse API Reference

## Base URL
```
http://localhost:5000/api
```

## 📦 Products API

### Get All Products
```http
GET /api/products
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "ClickPulse Smartphone",
    "price": 999,
    "description": "Latest 5G smartphone with advanced features",
    "category": "Electronics",
    "stock": 10,
    "rating": 4.5,
    "reviews": 45
  }
]
```

### Get Product by ID
```http
GET /api/products/:id
```

### Create Product
```http
POST /api/products
Content-Type: application/json

{
  "name": "Product Name",
  "price": 99.99,
  "description": "Product description",
  "category": "Electronics",
  "stock": 50
}
```

### Update Product
```http
PUT /api/products/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 149.99,
  "stock": 25
}
```

### Delete Product
```http
DELETE /api/products/:id
```

### Search Products
```http
GET /api/products/search?q=smartphone&category=Electronics
```

### Get AI Recommendations
```http
GET /api/products/:id/recommendations?customerId=254768009064@c.us
```

## 🛒 Orders API

### Get All Orders
```http
GET /api/orders
```

**Response:**
```json
[
  {
    "id": "ORD-001",
    "customerName": "John Doe",
    "phone": "254768009064@c.us",
    "items": [
      {
        "productId": 1,
        "quantity": 2,
        "price": 999
      }
    ],
    "total": 2003.98,
    "status": "confirmed",
    "paymentMethod": "Cash on Delivery",
    "shippingAddress": "123 Main St, City",
    "trackingNumber": "TRK123456789",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "customerName": "John Doe",
  "phone": "254768009064@c.us",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 999
    }
  ],
  "couponCode": "SAVE10",
  "shippingId": 1,
  "paymentMethod": "Credit Card",
  "address": "123 Main St, City, State 12345"
}
```

### Update Order Status
```http
PUT /api/orders/:id
Content-Type: application/json

{
  "status": "shipped",
  "trackingNumber": "TRK987654321"
}
```

### Track Order
```http
GET /api/orders/:id/track
```

**Response:**
```json
{
  "orderId": "ORD-001",
  "trackingNumber": "TRK123456789",
  "status": "shipped",
  "estimatedDelivery": "2024-01-18",
  "updates": [
    {
      "status": "Order Confirmed",
      "date": "2024-01-15",
      "description": "Your order has been confirmed"
    },
    {
      "status": "Processing",
      "date": "2024-01-16",
      "description": "Order is being prepared"
    }
  ]
}
```

## 📊 Analytics API

### Get Basic Analytics
```http
GET /api/analytics
```

**Response:**
```json
{
  "totalSales": 15750.50,
  "totalOrders": 25,
  "totalCustomers": 18,
  "averageOrderValue": 630.02,
  "topProducts": [
    {
      "id": 1,
      "name": "ClickPulse Smartphone",
      "sales": 8
    }
  ],
  "recentOrders": [],
  "salesTrend": [
    { "date": "2024-01-01", "sales": 1200 },
    { "date": "2024-01-02", "sales": 1500 }
  ]
}
```

### Get Advanced Analytics
```http
GET /api/analytics/advanced
```

### Get Customer Segments
```http
GET /api/customers/segments
```

**Response:**
```json
{
  "new": 5,
  "returning": 8,
  "vip": 3,
  "atRisk": 2
}
```

## 🎫 Coupons API

### Get All Coupons
```http
GET /api/coupons
```

### Validate Coupon
```http
POST /api/coupons/validate
Content-Type: application/json

{
  "code": "SAVE10",
  "orderTotal": 100
}
```

**Response:**
```json
{
  "valid": true,
  "discount": 10,
  "type": "percentage",
  "message": "10% discount applied"
}
```

## 🚚 Shipping API

### Get Shipping Options
```http
GET /api/shipping
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Standard Shipping",
    "price": 5.99,
    "days": "5-7",
    "description": "Standard delivery"
  },
  {
    "id": 2,
    "name": "Express Shipping",
    "price": 12.99,
    "days": "2-3",
    "description": "Fast delivery"
  }
]
```

### Calculate Shipping Cost
```http
POST /api/shipping/calculate
Content-Type: application/json

{
  "items": [
    { "productId": 1, "quantity": 2 }
  ],
  "address": "123 Main St, City, State",
  "shippingId": 1
}
```

## 💳 Payments API

### Get Payment Methods
```http
GET /api/payments/methods
```

### Process Payment
```http
POST /api/payments/process
Content-Type: application/json

{
  "orderId": "ORD-001",
  "paymentMethod": "credit_card",
  "amount": 1999.99,
  "cardDetails": {
    "number": "****-****-****-1234",
    "expiry": "12/25",
    "cvv": "***"
  }
}
```

## ⭐ Reviews API

### Get Product Reviews
```http
GET /api/products/:id/reviews
```

### Submit Review
```http
POST /api/reviews
Content-Type: application/json

{
  "orderId": "ORD-001",
  "productId": 1,
  "rating": 5,
  "comment": "Excellent product!",
  "customerName": "John Doe"
}
```

## 🎯 Marketing API

### Get Campaigns
```http
GET /api/marketing/campaigns
```

### Create Campaign
```http
POST /api/marketing/campaigns
Content-Type: application/json

{
  "name": "Summer Sale",
  "type": "email",
  "targetSegment": "returning",
  "message": "Special offer just for you!",
  "discount": 20
}
```

### Send Abandoned Cart Email
```http
POST /api/marketing/abandoned-cart
Content-Type: application/json

{
  "customerId": "254768009064@c.us",
  "cartItems": [
    { "productId": 1, "quantity": 1 }
  ]
}
```

## 🏆 Loyalty API

### Get Customer Loyalty Points
```http
GET /api/loyalty/:phone
```

**Response:**
```json
{
  "phone": "254768009064@c.us",
  "points": 150,
  "tier": "Silver",
  "nextTierPoints": 100,
  "availableRewards": [
    {
      "id": 1,
      "name": "$5 Off",
      "points": 100,
      "description": "$5 discount on next order"
    }
  ]
}
```

### Redeem Loyalty Points
```http
POST /api/loyalty/:phone/redeem
Content-Type: application/json

{
  "rewardId": 1,
  "points": 100
}
```

### Add Loyalty Points
```http
POST /api/loyalty/:phone/add
Content-Type: application/json

{
  "points": 50,
  "reason": "Purchase reward"
}
```

## 📱 WhatsApp Integration API

### Send Message
```http
POST /api/whatsapp/send
Content-Type: application/json

{
  "to": "254768009064@c.us",
  "message": "Thank you for your order!"
}
```

### Get Chat History
```http
GET /api/whatsapp/history/:phone
```

### Update Customer Profile
```http
PUT /api/customers/:phone
Content-Type: application/json

{
  "name": "John Doe",
  "preferences": ["Electronics", "Gadgets"],
  "lastOrderDate": "2024-01-15"
}
```

## 🔄 WebSocket Events

### Real-time Events
```javascript
// Connect to WebSocket
const socket = io('http://localhost:5000');

// Listen for events
socket.on('newOrder', (order) => {
  console.log('New order received:', order);
});

socket.on('orderStatusUpdate', (update) => {
  console.log('Order status updated:', update);
});

socket.on('newCustomer', (customer) => {
  console.log('New customer registered:', customer);
});

socket.on('lowStock', (product) => {
  console.log('Low stock alert:', product);
});
```

## 🚨 Error Responses

### Standard Error Format
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## 🔐 Authentication

### API Key Authentication
```http
Authorization: Bearer your-api-key
```

### Rate Limiting
- 100 requests per minute per IP
- 1000 requests per hour per API key

## 📝 Request/Response Examples

### Complete Order Flow
```javascript
// 1. Get products
const products = await fetch('/api/products');

// 2. Create order
const order = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerName: 'John Doe',
    phone: '254768009064@c.us',
    items: [{ productId: 1, quantity: 1, price: 999 }],
    paymentMethod: 'Credit Card',
    address: '123 Main St'
  })
});

// 3. Track order
const tracking = await fetch(`/api/orders/${order.id}/track`);
```

This API reference provides comprehensive documentation for all endpoints available in the ClickPulse WhatsApp e-commerce bot system.