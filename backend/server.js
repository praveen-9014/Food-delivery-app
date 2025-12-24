const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Import services
const connectDB = require('./db');
const { Restaurant, MenuItem, Order, User } = require('./models');
const { authMiddleware, JWT_SECRET } = require('./middleware/auth');
const seedData = require('./seed');

const app = express();
const PORT = process.env.PORT || 10000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://food-delivery-app-silk-nine.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));


app.use(express.json());

// Connect to MongoDB and seed data
connectDB().then(() => {
  seedData();
});

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

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, mobile, email: email.toLowerCase(), password: hashedPassword
    });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      service: 'Food-Delivery-Backend',
      message: 'Signup successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      service: 'Food-Delivery-Backend',
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  res.json({
    service: 'Food-Delivery-Backend',
    user: req.user
  });
});

// Restaurant Routes
app.get('/api/restaurants', async (req, res) => {
  try {
    const search = req.query.search?.toLowerCase() || '';
    const query = search.trim() ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { cuisine: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const restaurants = await Restaurant.find(query).sort({ restaurantId: 1 }).lean();
    res.json({
      service: 'Food-Delivery-Backend',
      restaurants: restaurants.map(r => ({ ...r, id: r.restaurantId }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

app.get('/api/restaurants/:id/menu', async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id, 10);
    if (isNaN(restaurantId)) {
      return res.status(400).json({ error: 'Invalid restaurant ID' });
    }

    const menuDocs = await MenuItem.find({ restaurantId }).sort({ itemId: 1 }).lean();
    res.json({
      service: 'Food-Delivery-Backend',
      restaurantId,
      menu: menuDocs.map(m => ({ ...m, id: m.itemId }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Order Routes
app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { restaurantId, items, total, deliveryAddress } = req.body;
    if (!restaurantId || !items?.length || !total || !deliveryAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const restaurant = await Restaurant.findOne({ restaurantId }).lean();
    const orderId = Math.floor(Math.random() * 10000);

    const order = await Order.create({
      orderId, userId: req.userId, restaurantId,
      restaurantName: restaurant?.name || 'Unknown',
      items, total, deliveryAddress,
      customerName: req.user.name,
      status: 'confirmed',
      estimatedDelivery: new Date(Date.now() + 30 * 60000)
    });

    res.json({
      service: 'Food-Delivery-Backend',
      ...order.toObject(),
      message: 'Order placed successfully!'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to place order' });
  }
});

app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(10).lean();
    res.json({ service: 'Food-Delivery-Backend', orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Food Delivery Backend' });
});

app.listen(PORT, () => {
  console.log(`🚀 Food Delivery Backend running on port ${PORT}`);
});