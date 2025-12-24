const express = require('express');
const connectDB = require('../../db');
const { Restaurant, MenuItem, Order } = require('../../models');
const { authMiddleware } = require('../../middleware/auth');
const seedData = require('../../seed');

const app = express();
const PORT = process.env.PORT || 5000;

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

// Get all restaurants (with optional search)
app.get('/api/restaurants', async (req, res) => {
  try {
    const search = req.query.search?.toLowerCase() || '';
    console.log(`[Order-Primary] GET /api/restaurants - search: "${search}"`);

    const query = {};
    if (search.trim()) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cuisine: { $regex: search, $options: 'i' } },
      ];
    }

    const restaurants = await Restaurant.find(query).sort({ restaurantId: 1 }).lean();
    const normalizedRestaurants = restaurants.map((r) => ({
      ...r,
      id: r.restaurantId,
    }));
    console.log(`[Order-Primary] Returning ${restaurants.length} restaurants`);

    res.json({
      service: 'Order-Primary',
      restaurants: normalizedRestaurants,
    });
  } catch (err) {
    console.error('[Order-Primary] Error fetching restaurants:', err);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Get menu by restaurant ID
app.get('/api/restaurants/:id/menu', async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id, 10);
    if (Number.isNaN(restaurantId)) {
      return res.status(400).json({ error: 'Restaurant ID must be a number' });
    }
    const menuDocs = await MenuItem.find({ restaurantId }).sort({ itemId: 1 }).lean();
    const menu = menuDocs.map((m) => ({
      ...m,
      id: m.itemId,
    }));

    res.json({
      service: 'Order-Primary',
      restaurantId,
      menu,
    });
  } catch (err) {
    console.error('[Order-Primary] Error fetching menu:', err);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Place order (protected)
app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    console.log('[Order-Primary] POST /api/orders - Request body:', req.body);

    const { restaurantId, items, total, deliveryAddress } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    if (!total) {
      return res.status(400).json({ error: 'Total amount is required' });
    }
    if (!deliveryAddress) {
      return res.status(400).json({ error: 'Delivery address is required' });
    }

    const restaurant = await Restaurant.findOne({ restaurantId }).lean();

    const orderId = Math.floor(Math.random() * 10000);
    const estimatedDelivery = new Date(Date.now() + 30 * 60000);

    const order = await Order.create({
      orderId,
      userId: req.userId,
      restaurantId,
      restaurantName: restaurant?.name || 'Unknown',
      items,
      total,
      deliveryAddress,
      customerName: req.user.name,
      status: 'confirmed',
      estimatedDelivery,
    });

    console.log('[Order-Primary] Order placed successfully:', orderId);

    res.json({
      service: 'Order-Primary',
      ...order.toObject(),
      message: 'Order placed successfully!',
    });
  } catch (error) {
    console.error('[Order-Primary] Error placing order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get order history (protected)
app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      service: 'Order-Primary',
      orders,
    });
  } catch (err) {
    console.error('[Order-Primary] Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID (protected)
app.get('/api/orders/:id', authMiddleware, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    if (Number.isNaN(orderId)) {
      return res.status(400).json({ error: 'Order ID must be a number' });
    }
    const orderDoc = await Order.findOne({ orderId, userId: req.userId }).lean();

    if (!orderDoc) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const now = new Date();
    const createdAt = new Date(orderDoc.createdAt);
    const minutesDiff = (now - createdAt) / 60000;
    let status = orderDoc.status;

    if (minutesDiff > 25 && status === 'confirmed') {
      status = 'preparing';
    }
    if (minutesDiff > 30 && status === 'preparing') {
      status = 'on_the_way';
    }
    if (minutesDiff > 35 && status === 'on_the_way') {
      status = 'delivered';
    }

    res.json({
      service: 'Order-Primary',
      order: { ...orderDoc, status },
    });
  } catch (err) {
    console.error('[Order-Primary] Error fetching order by id:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

async function start() {
  await connectDB();
  await seedData();
  app.listen(PORT, () => {
    console.log(`Order Service Primary running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('[Order-Primary] Failed to start service:', err);
  process.exit(1);
});