const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  restaurantId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  cuisine: { type: String, required: true },
  rating: { type: Number, required: true },
  deliveryTime: { type: String, required: true },
  image: { type: String, required: true },
});

const MenuItemSchema = new mongoose.Schema({
  restaurantId: { type: Number, required: true },
  itemId: { type: Number, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
});

const OrderItemSchema = new mongoose.Schema(
  {
    itemId: Number,
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: Number, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: Number, required: true },
    restaurantName: { type: String, required: true },
    items: { type: [OrderItemSchema], required: true },
    total: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    customerName: { type: String, required: true },
    status: { type: String, default: 'confirmed' },
    estimatedDelivery: { type: Date, required: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
}, { timestamps: true });

UserSchema.index({ email: 1 });

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);
const MenuItem = mongoose.model('MenuItem', MenuItemSchema);
const Order = mongoose.model('Order', OrderSchema);
const User = mongoose.model('User', UserSchema);

module.exports = {
  Restaurant,
  MenuItem,
  Order,
  User,
};


