const BASE_URL = 'http://localhost:4000';

// Get token from localStorage
const getToken = () => localStorage.getItem('homeChefToken');

// Set headers with authorization
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
});

// HomeChef Authentication
export const homeChefService = {
  // Sign up
  signup: async (businessName, email, password, phoneNumber) => {
    try {
      const response = await fetch(`${BASE_URL}/homechef/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: businessName,
          email,
          password,
          phone_number: phoneNumber,
        }),
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  },

  // Sign in
  signin: async (email, password) => {
    try {
      const response = await fetch(`${BASE_URL}/homechef/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.data?.token) {
        localStorage.setItem('homeChefToken', data.data.token);
        localStorage.setItem('homeChefInfo', JSON.stringify(data.data));
      }
      return data;
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  },

  // Sign out
  signout: () => {
    localStorage.removeItem('homeChefToken');
    localStorage.removeItem('homeChefInfo');
  },

  // Get current chef info
  getCurrentChef: () => {
    const chefInfo = localStorage.getItem('homeChefInfo');
    return chefInfo ? JSON.parse(chefInfo) : null;
  },

  // Menu operations
  addMenuItem: async (formData) => {
    try {
      const response = await fetch(`${BASE_URL}/homechef/menu`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        body: formData,
      });
      const text = await response.text()

try {
  return JSON.parse(text)
} catch {
  return { status: 'error', error: text }
}
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  },

  // Get all menu items for chef
  getMenuItems: async () => {
    try {
      const response = await fetch(`${BASE_URL}/homechef/menu`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  },

  // Update menu item with image support
  updateMenuItem: async (itemId, formData) => {
    try {
      const response = await fetch(`${BASE_URL}/homechef/menu/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        body: formData,
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  },

  // Delete menu item
  deleteMenuItem: async (itemId) => {
    try {
      const response = await fetch(`${BASE_URL}/homechef/menu/${itemId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  },

  // Service areas
  addServiceArea: async (pincode, deliveryFee) => {
    try {
      const response = await fetch(`${BASE_URL}/homechef/service-area`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          pincode,
          delivery_fee: deliveryFee,
        }),
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  },

  // Get service areas
  getServiceAreas: async () => {
    try {
      const response = await fetch(`${BASE_URL}/homechef/service-areas`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  },

  // Delete service area
  deleteServiceArea: async (areaId) => {
    try {
      const response = await fetch(`${BASE_URL}/homechef/service-areas/${areaId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  },

  // Orders
  getOrders: async () => {
    try {
      const response = await fetch(`${BASE_URL}/homechef/orders`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  },

  // Get order details
  getOrderDetails: async (orderId) => {
    try {
      const response = await fetch(`${BASE_URL}/homechef/orders/${orderId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await fetch(`${BASE_URL}/homechef/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ order_status: status }),
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  },

  // Earnings
  getEarnings: async () => {
    try {
      const response = await fetch(`${BASE_URL}/homechef/earnings`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  },

  // Profile
  getProfile: async () => {
    try {
      const response = await fetch(`${BASE_URL}/homechef/profile`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  },

  // Update profile
  updateProfile: async (businessName, phoneNumber) => {
    try {
      const response = await fetch(`${BASE_URL}/homechef/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          business_name: businessName,
          phone_number: phoneNumber,
        }),
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  },
};
