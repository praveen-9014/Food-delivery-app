import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // App state
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serviceInfo, setServiceInfo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [viewOrderId, setViewOrderId] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    if (token) {
      fetchUserInfo();
    }
    fetchRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user && token) {
      fetchOrderHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRestaurants();
    }, 300);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    if (viewOrderId) {
      const interval = setInterval(() => {
        fetchOrderStatus(viewOrderId);
      }, 5000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewOrderId]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
      const url = `${API_BASE_URL}/api/restaurants${query}`;
      console.log('Fetching restaurants from:', url);
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Received data:', data);
      
      if (data && data.restaurants) {
        const normalized = data.restaurants.map((r, idx) => {
          const id = r.restaurantId ?? r.id ?? r._id ?? idx + 1;
          return { ...r, restaurantId: id, id };
        });
        setRestaurants(normalized);
        setServiceInfo(data.service);
      } else {
        console.error('Invalid response format:', data);
        setRestaurants([]);
      }
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
      setRestaurants([]);
      alert('Failed to load restaurants.');
    } finally {
      setLoading(false);
    }
  };

  const getRestaurantId = (restaurant) =>
    restaurant?.restaurantId ?? restaurant?.id ?? restaurant?._id;

  const fetchMenu = async (restaurantId) => {
    const idNum = Number(restaurantId);
    if (!Number.isFinite(idNum)) {
      alert('Restaurant id is missing or invalid. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/restaurants/${idNum}/menu`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to load menu (status ${res.status})`);
      }
      const data = await res.json();
      const normalizedMenu = (data.menu || []).map((m, idx) => {
        const mid = m.itemId ?? m.id ?? idx + 1;
        return { ...m, itemId: mid, id: mid };
      });
      setMenu(normalizedMenu);
      setSelectedRestaurant(idNum);
      setServiceInfo(data.service);
    } catch (error) {
      console.error('Failed to fetch menu:', error);
      alert(error.message || 'Failed to load menu. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setOrderHistory([]);
    setCart([]);
    setOrder(null);
    setSelectedRestaurant(null);
    setMenu([]);
    alert('Logged out successfully');
  };

  const fetchUserInfo = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      logout();
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName,
          mobile: signupMobile,
          email: signupEmail,
          password: signupPassword,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setShowSignup(false);
      setSignupName('');
      setSignupMobile('');
      setSignupEmail('');
      setSignupPassword('');
      alert('Signup successful! Welcome!');
    } catch (error) {
      console.error('Signup error:', error);
      alert(error.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setShowLogin(false);
      setLoginEmail('');
      setLoginPassword('');
      alert('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setOrderHistory(data.orders || []);
      } else if (res.status === 401) {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch order history:', error);
    }
  };

  const fetchOrderStatus = async (orderId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTrackingOrder(data.order);
      } else if (res.status === 401) {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch order status:', error);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.itemId === item.itemId);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.itemId === item.itemId
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (index, change) => {
    const newCart = [...cart];
    newCart[index].quantity += change;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    setCart(newCart);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0).toFixed(2);
  };

  const placeOrder = async () => {
    if (!user || !token) {
      alert('Please login to place an order');
      setShowLogin(true);
      return;
    }
    if (cart.length === 0) {
      alert('Your cart is empty. Please add items before placing an order.');
      return;
    }
    if (!deliveryAddress.trim()) {
      alert('Please enter a delivery address');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          restaurantId: selectedRestaurant,
          items: cart,
          total: getTotal(),
          deliveryAddress: deliveryAddress,
        })
      });

      if (!res.ok) {
        if (res.status === 401) {
          logout();
          throw new Error('Session expired. Please login again.');
        }
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      setOrder(data);
      setServiceInfo(data.service);
      setCart([]);
      setDeliveryAddress('');
      fetchOrderHistory();
    } catch (error) {
      console.error('Failed to place order:', error);
      alert(`Failed to place order: ${error.message || 'Please try again later.'}`);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setSelectedRestaurant(null);
    setMenu([]);
    setCart([]);
    setOrder(null);
    setViewOrderId(null);
    setTrackingOrder(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'on_the_way': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Order Confirmed';
      case 'preparing': return 'Preparing';
      case 'on_the_way': return 'On the Way';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            🍽️ Food Delivery App
          </h1>
          <div className="flex gap-2">
            {user ? (
              <>
                <span className="px-4 py-2 text-gray-700">
                  Welcome, {user.name}!
                </span>
                <button
                  onClick={() => {
                    setShowOrderHistory(!showOrderHistory);
                    setViewOrderId(null);
                    setTrackingOrder(null);
                    setSearchQuery('');
                    if (!showOrderHistory) {
                      fetchRestaurants();
                    }
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  {showOrderHistory ? 'Back to Restaurants' : 'Order History'}
                </button>
                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setShowLogin(true);
                    setShowSignup(false);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowSignup(true);
                    setShowLogin(false);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>

        {/* Login Modal */}
        {showLogin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Login</h2>
                <button
                  onClick={() => setShowLogin(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLogin(false);
                      setShowSignup(true);
                    }}
                    className="px-4 py-2 text-blue-600 hover:text-blue-800"
                  >
                    Sign Up Instead
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Signup Modal */}
        {showSignup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Sign Up</h2>
                <button
                  onClick={() => setShowSignup(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSignup}>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Name</label>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={signupMobile}
                    onChange={(e) => setSignupMobile(e.target.value)}
                    placeholder="Enter your mobile number"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Password</label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Enter your password (min 6 characters)"
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-400"
                  >
                    {loading ? 'Signing up...' : 'Sign Up'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSignup(false);
                      setShowLogin(true);
                    }}
                    className="px-4 py-2 text-blue-600 hover:text-blue-800"
                  >
                    Login Instead
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {serviceInfo && (
          <div className="mb-4 text-center text-sm text-gray-600">
            Service: {serviceInfo}
          </div>
        )}

        {/* Restaurant List View */}
        {!selectedRestaurant && !order && !showOrderHistory && (
          <div>
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search restaurants by name or cuisine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {loading ? (
              <p className="text-gray-500">Loading restaurants...</p>
            ) : restaurants.length === 0 ? (
              <p className="text-gray-500">No restaurants found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurants.map((restaurant, idx) => {
                  const rid = getRestaurantId(restaurant);
                  return (
                    <div
                      key={rid ?? idx}
                      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => fetchMenu(rid)}
                    >
                    <div className="text-4xl mb-2">{restaurant.image}</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">{restaurant.name}</h2>
                    <p className="text-gray-600 mb-2">{restaurant.cuisine}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-yellow-500">⭐ {restaurant.rating}</p>
                      <p className="text-gray-500 text-sm">⏱️ {restaurant.deliveryTime}</p>
                    </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Menu and Cart View */}
        {selectedRestaurant && !order && !showOrderHistory && (
          <div>
            <button
              onClick={goBack}
              className="mb-4 text-blue-600 hover:text-blue-800 font-semibold"
            >
              ← Back to Restaurants
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Menu</h2>
                {loading ? (
                  <p>Loading menu...</p>
                ) : (
                  <div className="space-y-4">
                    {menu.map((item) => (
                      <div key={item.itemId} className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                        <div className="text-3xl">{item.image || '🍽️'}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{item.name}</h3>
                          <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                          <span className="text-green-600 font-bold">₹{item.price}</span>
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Cart</h2>
                {cart.length === 0 ? (
                  <p className="text-gray-500">Cart is empty</p>
                ) : (
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="space-y-3 mb-4">
                      {cart.map((item, index) => (
                        <div key={index} className="border-b pb-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="font-semibold">{item.name}</p>
                              <p className="text-gray-600 text-sm">₹{item.price} each</p>
                            </div>
                            <button
                              onClick={() => removeFromCart(index)}
                              className="text-red-600 hover:text-red-800 ml-2"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(index, -1)}
                              className="bg-gray-200 px-2 py-1 rounded"
                            >
                              -
                            </button>
                            <span className="font-semibold">{item.quantity || 1}</span>
                            <button
                              onClick={() => updateQuantity(index, 1)}
                              className="bg-gray-200 px-2 py-1 rounded"
                            >
                              +
                            </button>
                            <span className="ml-auto font-bold">₹{((item.price * (item.quantity || 1)).toFixed(2))}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4 space-y-4">
                      {!user && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                          <p className="text-yellow-800 text-sm mb-2">Please login to place an order</p>
                          <button
                            onClick={() => setShowLogin(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                          >
                            Login
                          </button>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-semibold mb-1">Delivery Address *</label>
                        <textarea
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Enter delivery address"
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xl font-bold">Total:</span>
                        <span className="text-xl font-bold text-green-600">₹{getTotal()}</span>
                      </div>
                      <button
                        onClick={placeOrder}
                        disabled={loading || !deliveryAddress.trim()}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        {loading ? 'Placing Order...' : 'Place Order'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;