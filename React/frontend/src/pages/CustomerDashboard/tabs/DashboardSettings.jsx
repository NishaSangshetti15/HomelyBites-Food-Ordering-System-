import React, { useState, useEffect, useContext } from 'react'
import { StoreContext } from '../../../context/StoreContext'
import '../styles/DashboardSettings.css'

const DashboardSettings = () => {
  const { token } = useContext(StoreContext)
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [favorites, setFavorites] = useState([])
  const [editingProfile, setEditingProfile] = useState(false)
  const [addingAddress, setAddingAddress] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: ''
  })

  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    pincode: '',
    house_no: '',
    label: '',
    latitude: '',
    longitude: ''
  })

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  useEffect(() => {
    if (token) {
      fetchSettings()
      fetchPreferences()
    }
  }, [token])

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:4000/customer/dashboard/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.status === 'success' && data.data) {
        setProfile(data.data.customer)
        setAddresses(data.data.addresses)
        setFormData({
          first_name: data.data.customer.first_name,
          last_name: data.data.customer.last_name,
          phone_number: data.data.customer.phone_number
        })
      } else {
        setError(data.error || 'Failed to load settings')
      }
    } catch (err) {
      setError('Error fetching settings: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchPreferences = async () => {
    try {
      const response = await fetch('http://localhost:4000/customer/dashboard/settings/preferences', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.status === 'success' && data.data) {
        setFavorites(data.data.favoriteChefs || [])
      }
    } catch (err) {
      console.error('Error fetching preferences:', err)
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAddressChange = (e) => {
    const { name, value } = e.target
    setAddressForm({ ...addressForm, [name]: value })
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm({ ...passwordForm, [name]: value })
  }

  const saveProfile = async () => {
    try {
      const response = await fetch('http://localhost:4000/customer/dashboard/settings/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.status === 'success') {
        setSuccess('Profile updated successfully')
        setEditingProfile(false)
        fetchSettings()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('Error updating profile: ' + err.message)
    }
  }

  const addAddress = async () => {
    if (!addressForm.street || !addressForm.city || !addressForm.pincode) {
      setError('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch('http://localhost:4000/customer/dashboard/settings/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressForm)
      })

      const data = await response.json()
      if (data.status === 'success') {
        setSuccess('Address added successfully')
        setAddressForm({
          street: '',
          city: '',
          pincode: '',
          house_no: '',
          label: '',
          latitude: '',
          longitude: ''
        })
        setAddingAddress(false)
        fetchSettings()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to add address')
      }
    } catch (err) {
      setError('Error adding address: ' + err.message)
    }
  }

  const updateAddress = async (addressId) => {
    try {
      const response = await fetch(
        `http://localhost:4000/customer/dashboard/settings/address/${addressId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(addressForm)
        }
      )

      const data = await response.json()
      if (data.status === 'success') {
        setSuccess('Address updated successfully')
        setEditingAddressId(null)
        setAddressForm({
          street: '',
          city: '',
          pincode: '',
          house_no: '',
          label: '',
          latitude: '',
          longitude: ''
        })
        fetchSettings()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to update address')
      }
    } catch (err) {
      setError('Error updating address: ' + err.message)
    }
  }

  const deleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return

    try {
      const response = await fetch(
        `http://localhost:4000/customer/dashboard/settings/address/${addressId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      )

      const data = await response.json()
      if (data.status === 'success') {
        setSuccess('Address deleted successfully')
        fetchSettings()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to delete address')
      }
    } catch (err) {
      setError('Error deleting address: ' + err.message)
    }
  }

  const changePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('Passwords do not match')
      return
    }

    if (passwordForm.new_password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    try {
      const response = await fetch('http://localhost:4000/customer/dashboard/settings/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password
        })
      })

      const data = await response.json()
      if (data.status === 'success') {
        setSuccess('Password changed successfully')
        setPasswordForm({
          current_password: '',
          new_password: '',
          confirm_password: ''
        })
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to change password')
      }
    } catch (err) {
      setError('Error changing password: ' + err.message)
    }
  }

  if (loading) {
    return <div className="loading">Loading settings...</div>
  }

  return (
    <div className="dashboard-settings">
      {/* Sub-tabs */}
      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`settings-tab ${activeTab === 'addresses' ? 'active' : ''}`}
          onClick={() => setActiveTab('addresses')}
        >
          Addresses
        </button>
        <button
          className={`settings-tab ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          Favorites
        </button>
        <button
          className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && profile && (
        <div className="settings-content">
          <h2>Profile Settings</h2>
          {editingProfile ? (
            <div className="form-container">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleProfileChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleProfileChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleProfileChange}
                  className="form-input"
                />
              </div>
              <div className="button-group">
                <button className="save-btn" onClick={saveProfile}>
                  Save Changes
                </button>
                <button className="cancel-btn" onClick={() => setEditingProfile(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-display">
              <div className="profile-field">
                <label>Name:</label>
                <p>{profile.first_name} {profile.last_name}</p>
              </div>
              <div className="profile-field">
                <label>Email:</label>
                <p>{profile.email}</p>
              </div>
              <div className="profile-field">
                <label>Phone:</label>
                <p>{profile.phone_number}</p>
              </div>
              <button className="edit-btn" onClick={() => setEditingProfile(true)}>
                Edit Profile
              </button>
            </div>
          )}
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div className="settings-content">
          <h2>My Addresses</h2>
          {addingAddress ? (
            <div className="form-container">
              <div className="form-group">
                <label>Label (e.g., Home, Office)</label>
                <input
                  type="text"
                  name="label"
                  value={addressForm.label}
                  onChange={handleAddressChange}
                  placeholder="e.g., Home"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>House Number</label>
                <input
                  type="text"
                  name="house_no"
                  value={addressForm.house_no}
                  onChange={handleAddressChange}
                  placeholder="e.g., 123"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Street *</label>
                <input
                  type="text"
                  name="street"
                  value={addressForm.street}
                  onChange={handleAddressChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={addressForm.city}
                  onChange={handleAddressChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={addressForm.pincode}
                  onChange={handleAddressChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="button-group">
                <button className="save-btn" onClick={addAddress}>
                  Add Address
                </button>
                <button className="cancel-btn" onClick={() => setAddingAddress(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <button className="add-address-btn" onClick={() => setAddingAddress(true)}>
                + Add New Address
              </button>
              <div className="addresses-list">
                {addresses.map((addr) => (
                  <div key={addr.address_id} className="address-card">
                    <h4>{addr.label}</h4>
                    <p>{addr.house_no}, {addr.street}</p>
                    <p>{addr.city} - {addr.pincode}</p>
                    <div className="address-actions">
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setAddressForm(addr)
                          setEditingAddressId(addr.address_id)
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteAddress(addr.address_id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <div className="settings-content">
          <h2>Favorite Chefs</h2>
          {favorites.length === 0 ? (
            <p className="empty-state">No favorite chefs yet. Order from chefs to add them to favorites!</p>
          ) : (
            <div className="favorites-grid">
              {favorites.map((chef) => (
                <div key={chef.chef_id} className="favorite-card">
                  <h4>{chef.business_name}</h4>
                  <p>Rating: {chef.average_rating} ⭐</p>
                  <p>Orders: {chef.order_count}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="settings-content">
          <h2>Change Password</h2>
          <div className="form-container">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="current_password"
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="new_password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                value={passwordForm.confirm_password}
                onChange={handlePasswordChange}
                className="form-input"
              />
            </div>
            <button className="save-btn" onClick={changePassword}>
              Change Password
            </button>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  )
}

export default DashboardSettings
