import React, { useState, useEffect } from 'react'
import './MenuItems.css'
import { homeChefService } from '../../services/homeChefService'

const MenuItems = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [editImage, setEditImage] = useState(null)
  const [editImagePreview, setEditImagePreview] = useState(null)

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    setLoading(true)
    try {
      const response = await homeChefService.getMenuItems()
      if (response.data) {
        setItems(Array.isArray(response.data) ? response.data : [])
      } else {
        setError(response.error || 'Failed to fetch items')
      }
    } catch (err) {
      setError('Error fetching menu items')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.item_id)
    setEditData({
      name: item.name,
      base_price: item.base_price,
      is_available: item.is_available
    })
    setEditImage(null)
    setEditImagePreview(null)
  }

  const handleEditImageChange = (e) => {
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

    setEditImage(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setEditImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveEdit = async () => {
    try {
      const formData = new FormData()
      formData.append('name', editData.name)
      formData.append('base_price', editData.base_price)
      formData.append('is_available', editData.is_available)

      if (editImage) {
        formData.append('image', editImage)
      }

      const response = await homeChefService.updateMenuItem(
        editingId,
        formData
      )
      if (response.data) {
        setEditingId(null)
        setEditImage(null)
        setEditImagePreview(null)
        await fetchMenuItems()
        setError('')
      } else {
        setError(response.error || 'Failed to update item')
      }
    } catch (err) {
      setError('Error updating item')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({})
    setEditImage(null)
    setEditImagePreview(null)
  }

  if (loading) {
    return <div className='menu-items'><p>Loading menu items...</p></div>
  }

  return (
    <div className='menu-items'>
      <h2>Your Menu Items</h2>
      {error && <div className='error-message'>{error}</div>}

      {items.length === 0 ? (
        <div className='empty-state'>
          <p>No menu items yet. Add your first item to get started!</p>
        </div>
      ) : (
        <div className='items-table'>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Item Name</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.item_id}>
                  {editingId === item.item_id ? (
                    <>
                      <td>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageChange}
                        />
                        {editImagePreview ? (
                          <img src={editImagePreview} alt="Preview" width="60" height="60" style={{ objectFit: 'cover', borderRadius: '6px', marginTop: '5px' }} />
                        ) : item.image_url ? (
                          <img src={`http://localhost:4000${item.image_url}`} alt={item.name} width="60" height="60" style={{ objectFit: 'cover', borderRadius: '6px' }} />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <input
                          type='text'
                          value={editData.name}
                          onChange={(e) => setEditData({...editData, name: e.target.value})}
                          className='edit-input'
                        />
                      </td>
                      <td>
                        <input
                          type='number'
                          value={editData.base_price}
                          onChange={(e) => setEditData({...editData, base_price: parseFloat(e.target.value)})}
                          className='edit-input'
                        />
                      </td>
                      <td>
                        <select
                          value={editData.is_available}
                          onChange={(e) => setEditData({...editData, is_available: e.target.value === 'true'})}
                          className='edit-select'
                        >
                          <option value='true'>Available</option>
                          <option value='false'>Unavailable</option>
                        </select>
                      </td>
                      <td>
                        <button onClick={handleSaveEdit} className='btn-save'>Save</button>
                        <button onClick={handleCancel} className='btn-cancel'>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        {item.image_url ? (
                          <img
                            src={`http://localhost:4000${item.image_url}`}
                            alt={item.name}
                            width="60"
                            height="60"
                            style={{
                              objectFit: 'cover',
                              borderRadius: '6px'
                            }}
                          />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{item.name}</td>
                      <td>₹{item.base_price}</td>
                      <td>
                        <span className={`status ${item.is_available ? 'available' : 'unavailable'}`}>
                          {item.is_available ? '✓ Available' : '✗ Unavailable'}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleEdit(item)} className='btn-edit'>Edit</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default MenuItems
