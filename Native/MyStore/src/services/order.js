import axios from 'axios'
import { config } from './config'
import AsyncStorage from '@react-native-async-storage/async-storage'

export async function placeOrder(totalAmount, cartItems) {
  try {
    // Map cart items to the format expected by backend
    // Backend expects: { fid: item_id, quantity: number }
    const body = {
      total_amount: totalAmount,
      foodItems: cartItems.map((item) => {
        // Use the item's fid property directly (should be item_id from MenuItems table)
        return { 
          fid: item.fid || item.id || item.item_id, 
          quantity: item.quantity 
        }
      }),
    }
    const url = `${config.url}/order/`
    const token = await AsyncStorage.getItem('token')
    console.log('Placing order:', { url, body, token })
    const response = await axios.post(url, body, {
      headers: {
        token,
      },
    })
    console.log('Order response:', response.data)
    return response.data
  } catch (ex) {
    console.error('Order error:', ex.message)
    if (ex.response) {
      console.error('Response data:', ex.response.data)
      // Check if the response contains an error object
      if (ex.response.data && ex.response.data.error) {
        const backendError = ex.response.data.error
        const errorMessage = typeof backendError === 'object' 
          ? (backendError.message || backendError.sqlMessage || JSON.stringify(backendError))
          : backendError
        return { 
          status: 'error', 
          error: errorMessage
        }
      }
      return ex.response.data || { 
        status: 'error', 
        error: `Server error: ${ex.response.status}`
      }
    }
    if (ex.request) {
      console.error('No response received:', ex.request)
      return { 
        status: 'error', 
        error: 'No response from server. Check if backend is running on ' + config.url
      }
    }
    return { 
      status: 'error', 
      error: ex.message || 'Failed to place order'
    }
  }
}

export async function getOrders() {
  try {
    const url = `${config.url}/order/`
    const token = await AsyncStorage.getItem('token')
    console.log('Fetching orders from:', url, 'with token:', token)
    const response = await axios.get(url, {
      headers: {
        token,
      },
    })
    console.log('Full Orders response:', response.data)
    
    // Check the response structure
    if (response.data && response.data.status === 'success') {
      const orders = response.data.data || []
      console.log('Orders data received:', orders)
      
      const formattedOrders = orders.map(order => ({
        order_id: order.order_id,
        oid: order.order_id, // Alias for compatibility
        total_amount: order.total_amount,
        order_date: order.order_date,
        odate: order.order_date, // Alias for compatibility
        status: order.status,
        items: order.items || [],
      }))
      
      console.log('Formatted orders:', formattedOrders)
      
      return {
        status: 'success',
        data: formattedOrders
      }
    }
    
    console.error('Unexpected response format:', response.data)
    return response.data || { 
      status: 'error', 
      error: 'Unexpected response format'
    }
  } catch (ex) {
    console.error('Get orders error:', ex.message)
    if (ex.response) {
      console.error('Response data:', ex.response.data)
      return ex.response.data || { 
        status: 'error', 
        error: `Server error: ${ex.response.status}`
      }
    }
    if (ex.request) {
      console.error('No response received:', ex.request)
      return { 
        status: 'error', 
        error: 'No response from server. Check if backend is running on ' + config.url
      }
    }
    return { 
      status: 'error', 
      error: ex.message || 'Failed to fetch orders'
    }
  }
}
