const BASE_URL = 'http://localhost:4000';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Set headers with authorization
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
});

export const customerService = {
  // Authentication
  signup: async (firstName, lastName, email, password, phoneNumber) => {
    try {
      const response = await fetch(`${BASE_URL}/customer/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          phone_number: phoneNumber,
        }),
      });
      const data = await response.json();
      if (data.data?.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('customerInfo', JSON.stringify(data.data));
      }
      return data;
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  },

  signin: async (email, password) => {
    try {
      const response = await fetch(`${BASE_URL}/customer/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.data?.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('customerInfo', JSON.stringify(data.data));
      }
      return data;
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  },

  signout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('customerInfo');
  },

  // Get all active home chefs
  getAllChefs: async () => {
    try {
      const response = await fetch(`${BASE_URL}/customer/chefs/all`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  // Get home chef profile
  getChefProfile: async (chefId) => {
    try {
      const response = await fetch(`${BASE_URL}/customer/chef/${chefId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  // Get home chef menu items
  getChefMenu: async (chefId) => {
    try {
      const response = await fetch(`${BASE_URL}/homechef/${chefId}/menu`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  // Search home chefs by business name
  searchChefs: async (businessName) => {
    try {
      const response = await fetch(`${BASE_URL}/homechef/search/${businessName}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  // Profile operations
  getProfile: async () => {
    try {
      const response = await fetch(`${BASE_URL}/customer/profile`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  updateProfile: async (firstName, lastName, phoneNumber) => {
    try {
      const response = await fetch(`${BASE_URL}/customer/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
        }),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  // Dashboard operations
  getDashboardHome: async () => {
    try {
      const response = await fetch(`${BASE_URL}/customer/dashboard/home`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  getDashboardCart: async () => {
    try {
      const response = await fetch(`${BASE_URL}/customer/dashboard/cart`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  placeOrder: async (chefId, deliveryAddressId, cartItems, grandTotal) => {
    try {
      const response = await fetch(`${BASE_URL}/customer/dashboard/place-order`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          chef_id: chefId,
          delivery_address_id: deliveryAddressId,
          cartItems,
          grand_total: grandTotal,
        }),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  getOrders: async (status = 'all') => {
    try {
      const url = status === 'all' 
        ? `${BASE_URL}/customer/dashboard/orders` 
        : `${BASE_URL}/customer/dashboard/orders?status=${status}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  getOrderStats: async () => {
    try {
      const response = await fetch(`${BASE_URL}/customer/dashboard/orders/stats/summary`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  getOrderDetails: async (orderId) => {
    try {
      const response = await fetch(`${BASE_URL}/customer/dashboard/orders/${orderId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  cancelOrder: async (orderId) => {
    try {
      const response = await fetch(`${BASE_URL}/customer/dashboard/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  // Settings operations
  getDashboardSettings: async () => {
    try {
      const response = await fetch(`${BASE_URL}/customer/dashboard/settings`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  updateProfileSettings: async (firstName, lastName, phoneNumber) => {
    try {
      const response = await fetch(`${BASE_URL}/customer/dashboard/settings/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
        }),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  addAddress: async (street, city, pincode, houseNo, label, latitude, longitude) => {
    try {
      const response = await fetch(`${BASE_URL}/customer/dashboard/settings/address`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          street,
          city,
          pincode,
          house_no: houseNo,
          label,
          latitude,
          longitude,
        }),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  updateAddress: async (addressId, street, city, pincode, houseNo, label, latitude, longitude) => {
    try {
      const response = await fetch(`${BASE_URL}/customer/dashboard/settings/address/${addressId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          street,
          city,
          pincode,
          house_no: houseNo,
          label,
          latitude,
          longitude,
        }),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  deleteAddress: async (addressId) => {
    try {
      const response = await fetch(`${BASE_URL}/customer/dashboard/settings/address/${addressId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await fetch(`${BASE_URL}/customer/dashboard/settings/change-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  getPreferences: async () => {
    try {
      const response = await fetch(`${BASE_URL}/customer/dashboard/settings/preferences`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  // Feedback operations
  getFeedbacks: async () => {
    try {
      const response = await fetch(`${BASE_URL}/customer/feedbacks`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  submitFeedback: async (orderId, rating, comment) => {
    try {
      const response = await fetch(`${BASE_URL}/feedback`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          order_id: orderId,
          rating: parseInt(rating),
          comment: comment || ''
        }),
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  },

  checkOrderFeedback: async (orderId) => {
    try {
      const response = await fetch(`${BASE_URL}/feedback/order/${orderId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  getChefFeedbacks: async (chefId, limit = 10, offset = 0) => {
    try {
      const response = await fetch(`${BASE_URL}/feedback/chef/${chefId}?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  getSubmittedFeedbacks: async (limit = 10, offset = 0) => {
    try {
      const response = await fetch(`${BASE_URL}/feedback/customer/submitted?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  },
};
