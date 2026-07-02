import React, { useState } from 'react'
import './AddMenuItem.css'
import { homeChefService } from '../../services/homeChefService'

const AddMenuItem = () => {
  const [formData, setFormData] = useState({
    name: '',
    basePrice: '',
    description: '',
    image: null,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be under 5MB')
      return
    }

    setFormData(prev => ({ ...prev, image: file }))
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('base_price', formData.basePrice)
      data.append('description', formData.description)
      if (formData.image) {
        data.append('image', formData.image)
      }

      const response = await homeChefService.addMenuItem(data)

      if (response.data) {
        setSuccess('Menu item added successfully!')
        setFormData({ name: '', basePrice: '', description: '', image: null })
        setImagePreview(null)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(response.error || 'Failed to add menu item')
      }
    } catch (err) {
      setError('Error adding menu item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='add-menu-item'>
      <h2>Add New Menu Item</h2>

      {error && <div className='error-message'>{error}</div>}
      {success && <div className='success-message'>{success}</div>}

      <form onSubmit={handleSubmit} className='add-form'>
        <div className='form-group'>
          <label htmlFor='name'>Item Name *</label>
          <input
            type='text'
            id='name'
            name='name'
            value={formData.name}
            onChange={handleChange}
            placeholder='e.g., Paneer Tikka Masala'
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor='basePrice'>Price (₹) *</label>
          <input
            type='number'
            id='basePrice'
            name='basePrice'
            value={formData.basePrice}
            onChange={handleChange}
            placeholder='e.g., 299'
            step='0.01'
            min='0'
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor='description'>Description</label>
          <textarea
            id='description'
            name='description'
            value={formData.description}
            onChange={handleChange}
            placeholder='Describe your dish ingredients, preparation style, etc.'
            rows='5'
          ></textarea>
        </div>

        <div className='form-group'>
          <label htmlFor='image'>Upload Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          {imagePreview && (
            <div className='image-preview'>
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>

        <button type='submit' className='submit-btn' disabled={loading}>
          {loading ? 'Adding...' : 'Add Item'}
        </button>
      </form>
    </div>
  )
}

export default AddMenuItem
