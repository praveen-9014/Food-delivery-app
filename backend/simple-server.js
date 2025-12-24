const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 3001;

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// In-memory storage
const users = [];
const orders = [];

// Sample data
const sampleRestaurants = [
  { restaurantId: 1, id: 1, name: 'Pizza Palace', cuisine: 'Italian', rating: 4.5, deliveryTime: '25-30 min', image: '🍕' },
  { restaurantId: 2, id: 2, name: 'Burger King', cuisine: 'American', rating: 4.2, deliveryTime: '20-25 min', image: '🍔' },
  { restaurantId: 3, id: 3, name: 'Sushi House', cuisine: 'Japanese', rating: 4.7, deliveryTime: '30-35 min', image: '🍣' },
  { restaurantId: 4, id: 4, name: 'Taco Fiesta', cuisine: 'Mexican', rating: 4.4, deliveryTime: '20-25 min', image: '🌮' },
  { restaurantId: 5, id: 5, name: 'Curry Express', cuisine: 'Indian', rating: 4.6, deliveryTime: '30-35 min', image: '🍛' },
  { restaurantId: 6, id: 6, name: 'Noodle Bar', cuisine: 'Chinese', rating: 4.3, deliveryTime: '25-30 min', image: '🍜' }
];

const sampleMenus = {
  1: [
    { itemId: 1, id: 1, name: 'Margherita Pizza', price: 299, description: 'Classic tomato and mozzarella', image: '🍕' },
    { itemId: 2, id: 2, name: 'Pepperoni Pizza', price: 399, description: 'Pepperoni and cheese', image: '🍕' },
    { itemId: 3, id: 3, name: 'Garlic Bread', price: 149, description: 'Fresh baked garlic bread', image: '🥖' }
  ],
  2: [
    { itemId: 5, id: 5, name: 'Classic Burger', price: 249, description: 'Beef patty with lettuce and tomato', image: '🍔' },
    { itemId: 6, id: 6, name: 'Cheese Burger', price: 299, description: 'Burger with melted cheese', image: '🍔' },
    { itemId: 7, id: 7, name: 'French Fries', price: 99, description: 'Crispy golden fries', image: '🍟' }
  ],
  3: [
    { itemId: 8, id: 8, name: 'California Roll', price: 399, description: 'Crab, avocado, cucumber', image: '🍣' },
    { itemId: 9, id: 9, name: 'Salmon Sashimi', price: 499, description: 'Fresh salmon slices', image: '🍣' }
  ],
  4: [
    { itemId: 10, id: 10, name: 'Chicken Tacos', price: 199, description: 'Grilled chicken with salsa', image: '🌮' },
    { itemId: 11, id: 11, name: 'Beef Burrito', price: 299, description: 'Beef with beans and rice', image: '🌯' }
  ],
  5: [
    { itemId: 12, id: 12, name: 'Chicken Curry', price: 349, description: 'Spicy chicken curry with rice', image: '🍛' },
    { itemId: 13, id: 13, name: 'Biryani', price: 399, description: 'Aromatic rice with chicken', image: '🍚' }
  ],
  6: [
    { itemId: 14, id: 14, name: 'Ramen', price: 299, description: 'Japanese noodle soup', image: '🍜' },
    { itemId: 15, id: 15, name: 'Fried Rice', price: 249, description: 'Wok-fried rice with vegetables', image: '🍚' }
  ]
};

const JWT_SECRET = 'your-secret-key';

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;
    if (!name || !mobile || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const existingUser = users.find(u => u.email === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: users.length + 1,
      name,
      mobile,
      email: email.toLowerCase(),
      password: hashedPassword
    };
    users.push(user);

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      service: 'Food-Delivery-Backend',
      message: 'Signup successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = users.find(u => u.email === email.toLowerCase());
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      service: 'Food-Delivery-Backend',
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({
    service: 'Food-Delivery-Backend',
    user: { id: req.user.id, name: req.user.name, email: req.user.email, mobile: req.user.mobile }
  });
});

// Restaurant Routes
app.get('/api/restaurants', (req, res) => {
  try {
    const search = req.query.search?.toLowerCase() || '';
    let restaurants = sampleRestaurants;
    
    if (search.trim()) {
      restaurants = sampleRestaurants.filter(r => 
        r.name.toLowerCase().includes(search) || 
        r.cuisine.toLowerCase().includes(search)
      );
    }

    console.log(`✅ Returning ${restaurants.length} restaurants`);
    
    res.json({
      service: 'Food-Delivery-Backend',
      restaurants
    });
  } catch (err) {
    console.error('❌ Restaurants error:', err);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

app.get('/api/restaurants/:id/menu', (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id, 10);
    if (isNaN(restaurantId)) {
      return res.status(400).json({ error: 'Invalid restaurant ID' });
    }

    const menu = sampleMenus[restaurantId] || sampleMenus[1];
    
    console.log(`✅ Returning ${menu.length} menu items for restaurant ${restaurantId}`);
    
    res.json({
      service: 'Food-Delivery-Backend',
      restaurantId,
      menu
    });
  } catch (err) {
    console.error('❌ Menu error:', err);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Order Routes
app.post('/api/orders', authMiddleware, (req, res) => {
  try {
    const { restaurantId, items, total, deliveryAddress } = req.body;

    if (!restaurantId || !items?.length || !total || !deliveryAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const restaurant = sampleRestaurants.find(r => r.restaurantId == restaurantId);
    const orderId = Math.floor(Math.random() * 10000);

    const order = {
      orderId,
      userId: req.userId,
      restaurantId,
      restaurantName: restaurant?.name || 'Unknown',
      items,
      total,
      deliveryAddress,
      customerName: req.user.name,
      status: 'confirmed',
      estimatedDelivery: new Date(Date.now() + 30 * 60000),
      createdAt: new Date()
    };

    orders.push(order);

    console.log(`✅ Order placed: #${orderId} by ${req.user.name}`);

    res.json({
      service: 'Food-Delivery-Backend',
      ...order,
      message: 'Order placed successfully!'
    });
  } catch (error) {
    console.error('❌ Order error:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

app.get('/api/orders', authMiddleware, (req, res) => {
  try {
    const userOrders = orders.filter(o => o.userId == req.userId).slice(-10);
    console.log(`✅ Returning ${userOrders.length} orders for user ${req.user.name}`);
    res.json({ service: 'Food-Delivery-Backend', orders: userOrders });
  } catch (err) {
    console.error('❌ Orders fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Food Delivery Backend',
    users: users.length,
    orders: orders.length
  });
});

app.listen(PORT, () => {
  console.log('🚀 Food Delivery Backend Started!');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`🍕 Ready for frontend on http://localhost:3000`);
});