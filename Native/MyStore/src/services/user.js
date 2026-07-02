import axios from 'axios'
import { config } from './config'
import AsyncStorage from '@react-native-async-storage/async-storage'

export async function loginUser(email, password) {
  try {
    const body = { email, password }
    const url = config.url + '/customer/signin'
    console.log('Signin URL:', url)
    console.log('Signin body:', body)
    const response = await axios.post(url, body)
    console.log('Signin response:', response.data)
    return response.data
  } catch (ex) {
    console.error('Login error:', ex.message)
    if (ex.response) {
      console.error('Response status:', ex.response.status)
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
      error: ex.message || 'Network error. Please check your connection.'
    }
  }
}

export async function signupUser(first_name, last_name, email, password_hash, phone_number) {
  try {
    const body = { first_name, last_name, email, password_hash, phone_number }
    const url = `${config.url}/customer/signup`
    console.log('Signup URL:', url)
    console.log('Signup body:', body)
    const response = await axios.post(url, body)
    console.log('Signup response:', response.data)
    return response.data
  } catch (ex) {
    console.error('Signup error:', ex.message)
    if (ex.response) {
      console.error('Response status:', ex.response.status)
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
      error: ex.message || 'Network error. Please check your connection.'
    }
  }
}

// Get customer profile
export async function getCustomerProfile() {
  try {
    const url = `${config.url}/customer/profile`
    const token = await AsyncStorage.getItem('token')
    if (!token) {
      return { 
        status: 'error', 
        error: 'Token is Missing'
      }
    }
    const response = await axios.get(url, {
      headers: { token },
    })
    console.log('Profile response:', response.data)
    return response.data
  } catch (ex) {
    console.error('Get profile error:', ex.message)
    if (ex.response) {
      console.error('Response data:', ex.response.data)
      return ex.response.data
    }
    return { 
      status: 'error', 
      error: ex.message || 'Failed to fetch profile'
    }
  }
}

// Update customer profile
export async function updateCustomerProfile(first_name, last_name, phone_number) {
  try {
    const body = { first_name, last_name, phone_number }
    const url = `${config.url}/customer/profile`
    const token = await AsyncStorage.getItem('token')
    if (!token) {
      return { 
        status: 'error', 
        error: 'Token is Missing'
      }
    }
    const response = await axios.put(url, body, {
      headers: { token },
    })
    console.log('Update profile response:', response.data)
    return response.data
  } catch (ex) {
    console.error('Update profile error:', ex.message)
    if (ex.response) {
      return ex.response.data
    }
    return { 
      status: 'error', 
      error: ex.message || 'Failed to update profile'
    }
  }
}

// Add customer address
export async function addCustomerAddress(street, city, pincode, house_no, label, latitude, longitude) {
  try {
    const body = { street, city, pincode, house_no, label, latitude, longitude }
    const url = `${config.url}/customer/address`
    const token = await AsyncStorage.getItem('token')
    if (!token) {
      return { 
        status: 'error', 
        error: 'Token is Missing'
      }
    }
    const response = await axios.post(url, body, {
      headers: { token },
    })
    console.log('Add address response:', response.data)
    return response.data
  } catch (ex) {
    console.error('Add address error:', ex.message)
    if (ex.response) {
      return ex.response.data
    }
    return { 
      status: 'error', 
      error: ex.message || 'Failed to add address'
    }
  }
}

export async function getAllChefs() {
  try {
    const url = `${config.url}/homechef/all`
    const response = await axios.get(url)
    return response.data
  } catch (ex) {
    console.error('Get chefs error:', ex.message)
    return {
      status: 'error',
      error: 'Failed to fetch chefs'
    }
  }
}

export async function getChefMenu(chefId) {
  try {
    const url = `${config.url}/homechef/menu/${chefId}`
    const response = await axios.get(url)
    return response.data
  } catch (ex) {
    console.error('Get chef menu error:', ex.message)
    return {
      status: 'error',
      error: 'Failed to fetch chef menu'
    }
  }
}

// Aliases for backward compatibility
export const getProfile = getCustomerProfile
export const updateProfile = (phone, address, name) => updateCustomerProfile(name?.split(' ')[0], name?.split(' ').slice(1).join(' '), phone)