const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('../../db');
const { User } = require('../../models');
const { authMiddleware, JWT_SECRET } = require('../../middleware/auth');
const seedData = require('../../seed');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;

    if (!name || !mobile || !email || !password) {
      return res.status(400).json({ error: 'All fields are required (name, mobile, email, password)' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      mobile,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    console.log('[User-Replica] User signed up:', user.email);

    res.status(201).json({
      service: 'User-Replica',
      message: 'Signup successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    console.error('[User-Replica] Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    console.log('[User-Replica] User logged in:', user.email);

    res.json({
      service: 'User-Replica',
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    console.error('[User-Replica] Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user (protected)
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      service: 'User-Replica',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        mobile: req.user.mobile,
      },
    });
  } catch (error) {
    console.error('[User-Replica] Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

async function start() {
  await connectDB();
  await seedData();
  app.listen(PORT, () => {
    console.log(`User Service Replica running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('[User-Replica] Failed to start service:', err);
  process.exit(1);
});