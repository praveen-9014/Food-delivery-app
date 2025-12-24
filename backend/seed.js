const { Restaurant, MenuItem } = require('./models');

async function seedData() {
  try {
    const count = await Restaurant.countDocuments();
    if (count > 0) {
      console.log('[Seed] Restaurants already exist, skipping seeding.');
      return;
    }

    console.log('[Seed] Seeding initial restaurants and menu items...');

  const restaurantsData = [
    { restaurantId: 1, name: 'Pizza Palace', cuisine: 'Italian', rating: 4.5, deliveryTime: '25-30 min', image: '🍕' },
    { restaurantId: 2, name: 'Burger King', cuisine: 'American', rating: 4.2, deliveryTime: '20-25 min', image: '🍔' },
    { restaurantId: 3, name: 'Sushi House', cuisine: 'Japanese', rating: 4.7, deliveryTime: '30-35 min', image: '🍣' },
    { restaurantId: 4, name: 'Taco Fiesta', cuisine: 'Mexican', rating: 4.4, deliveryTime: '20-25 min', image: '🌮' },
    { restaurantId: 5, name: 'Curry Express', cuisine: 'Indian', rating: 4.6, deliveryTime: '30-35 min', image: '🍛' },
    { restaurantId: 6, name: 'Noodle Bar', cuisine: 'Chinese', rating: 4.3, deliveryTime: '25-30 min', image: '🍜' },
  ];

  const menusData = [
    // Restaurant 1
    { restaurantId: 1, itemId: 1, name: 'Margherita Pizza', price: 299, description: 'Classic tomato and mozzarella', image: '🍕' },
    { restaurantId: 1, itemId: 2, name: 'Pepperoni Pizza', price: 399, description: 'Pepperoni and cheese', image: '🍕' },
    { restaurantId: 1, itemId: 3, name: 'Garlic Bread', price: 149, description: 'Fresh baked garlic bread', image: '🥖' },
    { restaurantId: 1, itemId: 4, name: 'Caesar Salad', price: 199, description: 'Fresh romaine with caesar dressing', image: '🥗' },
    // Restaurant 2
    { restaurantId: 2, itemId: 5, name: 'Classic Burger', price: 249, description: 'Beef patty with lettuce and tomato', image: '🍔' },
    { restaurantId: 2, itemId: 6, name: 'Cheese Burger', price: 299, description: 'Burger with melted cheese', image: '🍔' },
    { restaurantId: 2, itemId: 7, name: 'French Fries', price: 99, description: 'Crispy golden fries', image: '🍟' },
    { restaurantId: 2, itemId: 8, name: 'Onion Rings', price: 129, description: 'Crispy battered onion rings', image: '🧅' },
    // Restaurant 3
    { restaurantId: 3, itemId: 9, name: 'Salmon Sushi', price: 599, description: 'Fresh salmon rolls', image: '🍣' },
    { restaurantId: 3, itemId: 10, name: 'Tuna Sushi', price: 549, description: 'Premium tuna rolls', image: '🍣' },
    { restaurantId: 3, itemId: 11, name: 'Miso Soup', price: 149, description: 'Traditional Japanese soup', image: '🍲' },
    { restaurantId: 3, itemId: 12, name: 'Tempura', price: 349, description: 'Lightly battered vegetables', image: '🍤' },
    // Restaurant 4
    { restaurantId: 4, itemId: 13, name: 'Beef Tacos', price: 279, description: 'Seasoned beef with fresh toppings', image: '🌮' },
    { restaurantId: 4, itemId: 14, name: 'Chicken Quesadilla', price: 319, description: 'Grilled chicken and cheese', image: '🫓' },
    { restaurantId: 4, itemId: 15, name: 'Guacamole', price: 179, description: 'Fresh avocado dip', image: '🥑' },
    { restaurantId: 4, itemId: 16, name: 'Nachos', price: 229, description: 'Loaded nachos with cheese', image: '🌮' },
    // Restaurant 5
    { restaurantId: 5, itemId: 17, name: 'Butter Chicken', price: 399, description: 'Creamy tomato curry', image: '🍛' },
    { restaurantId: 5, itemId: 18, name: 'Chicken Biryani', price: 349, description: 'Fragrant spiced rice', image: '🍛' },
    { restaurantId: 5, itemId: 19, name: 'Naan Bread', price: 49, description: 'Fresh baked flatbread', image: '🫓' },
    { restaurantId: 5, itemId: 20, name: 'Samosas', price: 99, description: 'Spiced potato pastries', image: '🥟' },
    // Restaurant 6
    { restaurantId: 6, itemId: 21, name: 'Chicken Lo Mein', price: 329, description: 'Stir-fried noodles', image: '🍜' },
    { restaurantId: 6, itemId: 22, name: 'Sweet & Sour Chicken', price: 379, description: 'Crispy chicken in tangy sauce', image: '🍗' },
    { restaurantId: 6, itemId: 23, name: 'Spring Rolls', price: 149, description: 'Crispy vegetable rolls', image: '🥟' },
    { restaurantId: 6, itemId: 24, name: 'Fried Rice', price: 249, description: 'Wok-fried rice with vegetables', image: '🍚' },
  ];

  await Restaurant.insertMany(restaurantsData);
  await MenuItem.insertMany(menusData);

  console.log('[Seed] Seeding completed.');
} catch (error) {
  console.error('[Seed] Error seeding data:', error.message);
  console.log('[Seed] Continuing without seeding...');
}
}

module.exports = seedData;


