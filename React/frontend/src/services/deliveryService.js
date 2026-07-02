import axios from 'axios'

const url = 'http://localhost:4000'

const getHeaders = () => {
  return {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
}

// Authentication endpoints
export const deliverySignUp = async (data) => {
  try {
    const response = await axios.post(`${url}/delivery-personnel/signup`, data)
    return response.data
  } catch (error) {
    return {
      status: 'error',
      message: error.response?.data?.message || 'Signup failed'
    }
  }
}

export const deliverySignIn = async (phone_number, password) => {
  try {
    const response = await axios.post(`${url}/delivery-personnel/signin`, {
      phone_number,
      password
    })
    return response.data
  } catch (error) {
    return {
      status: 'error',
      message: error.response?.data?.message || 'Login failed'
    }
  }
}

// Profile endpoints
export const getDeliveryPersonProfile = async (driverId) => {
  try {
    const response = await axios.get(`${url}/delivery-personnel/${driverId}`, {
      headers: getHeaders()
    })
    return response.data
  } catch (error) {
    return {
      status: 'error',
      message: 'Failed to fetch profile'
    }
  }
}

export const updateDeliveryPersonStatus = async (driverId, status) => {
  try {
    const response = await axios.put(
      `${url}/delivery-personnel/${driverId}/status`,
      { status },
      { headers: getHeaders() }
    )
    return response.data
  } catch (error) {
    return {
      status: 'error',
      message: 'Failed to update status'
    }
  }
}

// Order endpoints
export const getAssignedOrders = async (driverId) => {
  try {
    const response = await axios.get(`${url}/delivery-personnel/${driverId}/orders`, {
      headers: getHeaders()
    })
    return response.data
  } catch (error) {
    return {
      status: 'error',
      message: 'Failed to fetch orders',
      data: []
    }
  }
}

export const getAvailableOrders = async (driverId) => {
  try {
    const response = await axios.get(`${url}/delivery-personnel/${driverId}/available-orders`, {
      headers: getHeaders()
    })
    return response.data
  } catch (error) {
    return {
      status: 'error',
      message: 'Failed to fetch available orders',
      data: []
    }
  }
}

export const acceptOrder = async (driverId, orderId) => {
  try {
    const response = await axios.put(
      `${url}/delivery-personnel/${driverId}/accept-order`,
      { order_id: orderId },
      { headers: getHeaders() }
    )
    return response.data
  } catch (error) {
    return {
      status: 'error',
      message: error.response?.data?.message || 'Failed to accept order'
    }
  }
}

export const updateOrderStatus = async (driverId, orderId, status) => {
  try {
    const response = await axios.put(
      `${url}/delivery-personnel/${driverId}/update-order-status`,
      { order_id: orderId, status },
      { headers: getHeaders() }
    )
    return response.data
  } catch (error) {
    return {
      status: 'error',
      message: 'Failed to update order status'
    }
  }
}

// Statistics endpoints
export const getDeliveryStatistics = async (driverId) => {
  try {
    const response = await axios.get(`${url}/delivery-personnel/${driverId}/statistics`, {
      headers: getHeaders()
    })
    return response.data
  } catch (error) {
    return {
      status: 'error',
      message: 'Failed to fetch statistics',
      data: {
        total_deliveries: 0,
        completed_deliveries: 0,
        pending_deliveries: 0,
        total_amount: 0,
        average_rating: 0
      }
    }
  }
}

// Get all delivery personnel (for admin view)
export const getAllDeliveryPersonnel = async () => {
  try {
    const response = await axios.get(`${url}/delivery-personnel`, {
      headers: getHeaders()
    })
    return response.data
  } catch (error) {
    return {
      status: 'error',
      message: 'Failed to fetch delivery personnel',
      data: []
    }
  }
}
