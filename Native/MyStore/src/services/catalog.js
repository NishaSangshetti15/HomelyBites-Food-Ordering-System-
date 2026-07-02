import axios from 'axios'
import { config } from './config'

export async function getCatalog() {
  try {
    const url = `${config.url}/food/`
    const response = await axios.get(url)
    return response.data
  } catch (ex) {
    return null
  }
}

export async function searchByBusinessName(businessName) {
  try {
    const url = `${config.url}/homechef/menu/business/${businessName}`
    const response = await axios.get(url)
    return response.data
  } catch (ex) {
    return {
      status: 'error',
      error: 'Failed to fetch business menu',
    }
  }
}
