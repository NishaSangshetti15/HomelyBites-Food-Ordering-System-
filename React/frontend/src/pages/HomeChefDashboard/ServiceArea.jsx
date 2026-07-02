import React, { useState } from 'react'
import './ServiceArea.css'
import { homeChefService } from '../../services/homeChefService'

const ServiceArea = () => {
  const [formData, setFormData] = useState({
    pincode: '',
    deliveryFee: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [serviceAreas, setServiceAreas] = useState([])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await homeChefService.addServiceArea(
        formData.pincode,
        parseFloat(formData.deliveryFee)
      )

      if (response.data) {
        setSuccess('Service area added successfully!')
        setFormData({ pincode: '', deliveryFee: '' })
        setServiceAreas(prev => [...prev, { pincode: formData.pincode, delivery_fee: formData.deliveryFee }])
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(response.error || 'Failed to add service area')
      }
    } catch (err) {
      setError('Error adding service area')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='service-area'>
      <h2>Service Areas</h2>

      {error && <div className='error-message'>{error}</div>}
      {success && <div className='success-message'>{success}</div>}

      <form onSubmit={handleSubmit} className='service-form'>
        <h3>Add New Service Area</h3>

        <div className='form-group'>
          <label htmlFor='pincode'>Pincode *</label>
          <input
            type='text'
            id='pincode'
            name='pincode'
            value={formData.pincode}
            onChange={handleChange}
            placeholder='e.g., 400001'
            pattern='[0-9]{6}'
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor='deliveryFee'>Delivery Fee (₹) *</label>
          <input
            type='number'
            id='deliveryFee'
            name='deliveryFee'
            value={formData.deliveryFee}
            onChange={handleChange}
            placeholder='e.g., 50'
            step='0.01'
            min='0'
            required
          />
        </div>

        <button type='submit' className='submit-btn' disabled={loading}>
          {loading ? 'Adding...' : 'Add Service Area'}
        </button>
      </form>

      {serviceAreas.length > 0 && (
        <div className='areas-list'>
          <h3>Your Service Areas</h3>
          <div className='areas-grid'>
            {serviceAreas.map((area, index) => (
              <div key={index} className='area-card'>
                <div className='area-info'>
                  <span className='area-label'>📍 Pincode:</span>
                  <p>{area.pincode}</p>
                </div>
                <div className='area-info'>
                  <span className='area-label'>💰 Delivery Fee:</span>
                  <p>₹{area.delivery_fee}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceArea
