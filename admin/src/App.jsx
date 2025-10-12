import { useState, useEffect } from 'react';

const ShopifyButton = ({ children, variant = 'primary', size = 'medium', onClick, disabled, style }) => {
  const baseStyle = {
    border: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'inherit',
    ...style
  };
  
  const variants = {
    primary: { background: '#008060', color: 'white', padding: size === 'small' ? '8px 12px' : '12px 16px' },
    secondary: { background: '#f6f6f7', color: '#202223', padding: size === 'small' ? '8px 12px' : '12px 16px', border: '1px solid #c9cccf' },
    danger: { background: '#d72c0d', color: 'white', padding: size === 'small' ? '8px 12px' : '12px 16px' },
    success: { background: '#00a047', color: 'white', padding: size === 'small' ? '8px 12px' : '12px 16px' }
  };
  
  return (
    <button 
      style={{...baseStyle, ...variants[variant]}} 
      onClick={onClick} 
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const ShopifyCard = ({ children, title, actions, style }) => {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e1e3e5',
      overflow: 'hidden',
      ...style
    }}>
      {title && (
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e1e3e5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#202223' }}>{title}</h3>
          {actions && <div style={{ display: 'flex', gap: '8px' }}>{actions}</div>}
        </div>
      )}
      <div style={{ padding: title ? '24px' : '20px' }}>
        {children}
      </div>
    </div>
  );
};

const ShopifyBadge = ({ children, status = 'default' }) => {
  const statusColors = {
    success: { background: '#d4f1d4', color: '#00a047' },
    warning: { background: '#fff4e6', color: '#bf5000' },
    error: { background: '#ffeaea', color: '#d72c0d' },
    info: { background: '#e6f2ff', color: '#0066cc' },
    default: { background: '#f6f6f7', color: '#6d7175' }
  };
  
  return (
    <span style={{
      ...statusColors[status],
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      {children}
    </span>
  );
};

function App() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [coupons, setCoupons] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formData, setFormData] = useState({ name: '', price: '', category: '', stock: '', image: '', description: '' });

  const fetchProducts = () => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => setError(err.message));
  };

  const fetchOrders = () => {
    fetch('http://localhost:5000/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => setError(err.message));
  };

  const fetchAnalytics = () => {
    fetch('http://localhost:5000/api/analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => setError(err.message));
  };

  const fetchCoupons = () => {
    fetch('http://localhost:5000/api/coupons')
      .then(res => res.json())
      .then(data => setCoupons(data))
      .catch(err => setError(err.message));
  };

  const fetchData = () => {
    Promise.all([fetchProducts(), fetchOrders(), fetchAnalytics(), fetchCoupons()])
      .then(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editingProduct 
      ? `http://localhost:5000/api/products/${editingProduct.id}`
      : 'http://localhost:5000/api/products';
    const method = editingProduct ? 'PUT' : 'POST';
    
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(() => {
      fetchProducts();
      fetchAnalytics();
      setFormData({ name: '', price: '', category: '', stock: '', image: '', description: '' });
      setEditingProduct(null);
      setShowAddForm(false);
    });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' })
        .then(() => {
          fetchProducts();
          fetchAnalytics();
        });
    }
  };

  const updateOrderStatus = (id, status) => {
    fetch(`http://localhost:5000/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    .then(() => fetchOrders());
  };

  const deleteOrder = (id) => {
    if (confirm('Are you sure you want to delete this order?')) {
      fetch(`http://localhost:5000/api/orders/${id}`, { method: 'DELETE' })
        .then(() => {
          fetchOrders();
          fetchAnalytics();
        });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      processing: '#17a2b8',
      shipped: '#007bff',
      completed: '#28a745',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const theme = {
    bg: darkMode ? '#1a1a1a' : '#f6f6f7',
    cardBg: darkMode ? '#2d2d2d' : '#ffffff',
    text: darkMode ? '#ffffff' : '#202223',
    border: darkMode ? '#404040' : '#e1e3e5',
    sidebar: darkMode ? '#202020' : '#f6f6f7',
    primary: '#008060',
    secondary: '#6d7175'
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      background: theme.bg,
      color: theme.text
    }}>
      {/* Sidebar */}
      <div style={{
        width: '240px',
        background: theme.sidebar,
        borderRight: `1px solid ${theme.border}`,
        padding: '24px 0',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <div style={{ padding: '0 24px', marginBottom: '32px' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: '700', 
            color: theme.primary,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🛍️ ClickPulse
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme.secondary }}>Admin Dashboard</p>
        </div>
        
        <nav style={{ padding: '0 12px' }}>
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'products', icon: '📦', label: 'Products', count: products.length },
            { id: 'orders', icon: '🛒', label: 'Orders', count: orders.length },
            { id: 'analytics', icon: '📈', label: 'Analytics' },
            { id: 'coupons', icon: '🎫', label: 'Discounts' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                padding: '12px 16px',
                margin: '2px 0',
                background: activeTab === item.id ? theme.primary : 'transparent',
                color: activeTab === item.id ? 'white' : theme.text,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                fontWeight: activeTab === item.id ? '600' : '500',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {item.count && (
                <span style={{
                  background: activeTab === item.id ? 'rgba(255,255,255,0.2)' : theme.border,
                  color: activeTab === item.id ? 'white' : theme.secondary,
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
        
        <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px' }}>
          <ShopifyButton 
            variant="secondary" 
            size="small"
            onClick={() => setDarkMode(!darkMode)}
            style={{ width: '100%' }}
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </ShopifyButton>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{ marginLeft: '240px', flex: 1, padding: '32px' }}>
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700', color: theme.text }}>Dashboard Overview</h2>
              <p style={{ margin: 0, color: theme.secondary, fontSize: '14px' }}>Monitor your store performance and key metrics</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              <ShopifyCard style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>Total Revenue</p>
                    <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '700' }}>${analytics.totalRevenue || 0}</h3>
                  </div>
                  <div style={{ fontSize: '32px', opacity: 0.8 }}>💰</div>
                </div>
              </ShopifyCard>
              
              <ShopifyCard style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>Total Orders</p>
                    <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '700' }}>{analytics.totalOrders || 0}</h3>
                  </div>
                  <div style={{ fontSize: '32px', opacity: 0.8 }}>📦</div>
                </div>
              </ShopifyCard>
              
              <ShopifyCard style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>Pending Orders</p>
                    <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '700' }}>{analytics.pendingOrders || 0}</h3>
                  </div>
                  <div style={{ fontSize: '32px', opacity: 0.8 }}>⏳</div>
                </div>
              </ShopifyCard>
              
              <ShopifyCard style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>Low Stock Alert</p>
                    <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '700' }}>{analytics.lowStockProducts || 0}</h3>
                  </div>
                  <div style={{ fontSize: '32px', opacity: 0.8 }}>⚠️</div>
                </div>
              </ShopifyCard>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              <ShopifyCard title="🏆 Top Selling Products">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {analytics.topProducts?.slice(0, 5).map((product, index) => (
                    <div key={product.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px',
                      padding: '12px',
                      background: theme.bg,
                      borderRadius: '8px'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: theme.primary,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        {index + 1}
                      </div>
                      <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 4px 0', fontWeight: '600', fontSize: '14px' }}>{product.name}</p>
                        <p style={{ margin: 0, color: theme.secondary, fontSize: '12px' }}>${product.price}</p>
                      </div>
                      <ShopifyBadge status="success">{product.sales} sold</ShopifyBadge>
                    </div>
                  ))}
                </div>
              </ShopifyCard>
              
              <ShopifyCard title="⚠️ Inventory Alerts">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {analytics.lowStockItems?.slice(0, 6).map(product => (
                    <div key={product.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: `1px solid ${theme.border}`
                    }}>
                      <div>
                        <p style={{ margin: '0 0 2px 0', fontSize: '14px', fontWeight: '500' }}>{product.name}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: theme.secondary }}>${product.price}</p>
                      </div>
                      <ShopifyBadge status="error">{product.stock} left</ShopifyBadge>
                    </div>
                  ))}
                </div>
              </ShopifyCard>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700', color: theme.text }}>Products</h2>
                <p style={{ margin: 0, color: theme.secondary, fontSize: '14px' }}>Manage your product catalog</p>
              </div>
              <ShopifyButton onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? '❌ Cancel' : '➕ Add Product'}
              </ShopifyButton>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <input 
                type="text" 
                placeholder="🔍 Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  padding: '12px 16px', 
                  border: `1px solid ${theme.border}`, 
                  borderRadius: '8px', 
                  background: theme.cardBg, 
                  color: theme.text, 
                  minWidth: '300px',
                  fontSize: '14px'
                }}
              />
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ 
                  padding: '12px 16px', 
                  border: `1px solid ${theme.border}`, 
                  borderRadius: '8px', 
                  background: theme.cardBg, 
                  color: theme.text,
                  fontSize: '14px'
                }}
              >
                <option value="">All Categories</option>
                <option value="electronics">📱 Electronics</option>
                <option value="clothing">👕 Clothing</option>
                <option value="home">🏠 Home</option>
              </select>
            </div>

            {showAddForm && (
              <ShopifyCard title={editingProduct ? '✏️ Edit Product' : '➕ Add New Product'} style={{ marginBottom: '24px' }}>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <input type="text" placeholder="Product Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required style={{ padding: '12px', border: `1px solid ${theme.border}`, borderRadius: '6px', background: theme.bg, color: theme.text }} />
                    <input type="number" placeholder="Price ($)" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required style={{ padding: '12px', border: `1px solid ${theme.border}`, borderRadius: '6px', background: theme.bg, color: theme.text }} />
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required style={{ padding: '12px', border: `1px solid ${theme.border}`, borderRadius: '6px', background: theme.bg, color: theme.text }}>
                      <option value="">Select Category</option>
                      <option value="electronics">Electronics</option>
                      <option value="clothing">Clothing</option>
                      <option value="home">Home</option>
                    </select>
                    <input type="number" placeholder="Stock" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} required style={{ padding: '12px', border: `1px solid ${theme.border}`, borderRadius: '6px', background: theme.bg, color: theme.text }} />
                    <input type="url" placeholder="Image URL" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} style={{ padding: '12px', border: `1px solid ${theme.border}`, borderRadius: '6px', background: theme.bg, color: theme.text, gridColumn: '1 / -1' }} />
                  </div>
                  <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '12px', border: `1px solid ${theme.border}`, borderRadius: '6px', background: theme.bg, color: theme.text, minHeight: '80px', marginBottom: '16px' }} />
                  <ShopifyButton type="submit">
                    {editingProduct ? '✅ Update Product' : '➕ Add Product'}
                  </ShopifyButton>
                </form>
              </ShopifyCard>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {filteredProducts.map(product => (
                <ShopifyCard key={product.id}>
                  <img src={product.image} alt={product.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }} />
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>{product.name}</h4>
                  <p style={{ margin: '0 0 12px 0', color: theme.secondary, fontSize: '14px' }}>{product.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '20px', fontWeight: '700', color: theme.primary }}>${product.price}</span>
                    <ShopifyBadge status={product.stock < 10 ? 'error' : 'success'}>
                      {product.stock} in stock
                    </ShopifyBadge>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <ShopifyButton variant="secondary" size="small" onClick={() => handleEdit(product)} style={{ flex: 1 }}>
                      ✏️ Edit
                    </ShopifyButton>
                    <ShopifyButton variant="danger" size="small" onClick={() => handleDelete(product.id)} style={{ flex: 1 }}>
                      🗑️ Delete
                    </ShopifyButton>
                  </div>
                </ShopifyCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700', color: theme.text }}>Orders</h2>
              <p style={{ margin: 0, color: theme.secondary, fontSize: '14px' }}>Manage customer orders and fulfillment</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map(order => (
                <ShopifyCard key={order.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>Order #{order.id}</h4>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: theme.secondary }}>{order.customerName} • {order.phone}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: theme.secondary }}>{order.date} {order.time}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <ShopifyBadge status={order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'error' : 'warning'}>
                        {order.status}
                      </ShopifyBadge>
                      <p style={{ margin: '8px 0 0 0', fontSize: '18px', fontWeight: '700', color: theme.primary }}>${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>Items:</h5>
                    {order.items.map((item, index) => {
                      const product = products.find(p => p.id === item.productId);
                      return (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px' }}>
                          <span>{product?.name || 'Unknown Product'} × {item.quantity}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <select 
                      value={order.status} 
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      style={{ padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: '6px', background: theme.cardBg, color: theme.text }}
                    >
                      <option value="pending">⏳ Pending</option>
                      <option value="processing">🔄 Processing</option>
                      <option value="shipped">🚚 Shipped</option>
                      <option value="completed">✅ Completed</option>
                      <option value="cancelled">❌ Cancelled</option>
                    </select>
                    <ShopifyButton variant="danger" size="small" onClick={() => deleteOrder(order.id)}>
                      🗑️ Delete
                    </ShopifyButton>
                  </div>
                </ShopifyCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700', color: theme.text }}>Analytics</h2>
              <p style={{ margin: 0, color: theme.secondary, fontSize: '14px' }}>Detailed insights and reports</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <ShopifyCard title="📊 Sales Overview">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Revenue:</span>
                    <span style={{ fontWeight: '600', color: theme.primary }}>${analytics.totalRevenue || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Average Order:</span>
                    <span style={{ fontWeight: '600' }}>${analytics.totalOrders ? Math.round(analytics.totalRevenue / analytics.totalOrders) : 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Completed Orders:</span>
                    <span style={{ fontWeight: '600' }}>{orders.filter(o => o.status === 'completed').length}</span>
                  </div>
                </div>
              </ShopifyCard>
              
              <ShopifyCard title="📦 Inventory Status">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Products:</span>
                    <span style={{ fontWeight: '600' }}>{products.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Low Stock Items:</span>
                    <span style={{ fontWeight: '600', color: '#d72c0d' }}>{analytics.lowStockProducts || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Out of Stock:</span>
                    <span style={{ fontWeight: '600', color: '#d72c0d' }}>{products.filter(p => p.stock === 0).length}</span>
                  </div>
                </div>
              </ShopifyCard>
            </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700', color: theme.text }}>Discount Coupons</h2>
              <p style={{ margin: 0, color: theme.secondary, fontSize: '14px' }}>Manage promotional codes and discounts</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {coupons.map(coupon => (
                <ShopifyCard key={coupon.code}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>{coupon.code}</h4>
                      <p style={{ margin: 0, color: theme.secondary, fontSize: '14px' }}>
                        {coupon.type === 'percentage' ? `${coupon.discount}% off` : `$${coupon.discount} off`}
                        {coupon.category && ` on ${coupon.category}`}
                      </p>
                    </div>
                    <ShopifyBadge status={coupon.active ? 'success' : 'error'}>
                      {coupon.active ? '✅ Active' : '❌ Inactive'}
                    </ShopifyBadge>
                  </div>
                </ShopifyCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;