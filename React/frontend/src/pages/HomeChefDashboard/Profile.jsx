import React, { useState, useEffect } from 'react'
import './Profile.css'
import { homeChefService } from '../../services/homeChefService'

const Profile = () => {
  const [chefInfo, setChefInfo] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    businessName: '',
    phoneNumber: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const response = await homeChefService.getProfile()
      if (response.data) {
        setChefInfo(response.data)
        setFormData({
          businessName: response.data.business_name,
          phoneNumber: response.data.phone_number,
        })
        setError('')
      } else {
        setError(response.error || 'Failed to fetch profile')
      }
    } catch (err) {
      setError('Error fetching profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    try {
      const response = await homeChefService.updateProfile(
        formData.businessName,
        formData.phoneNumber
      )
      if (response.data) {
        setSuccess('Profile updated successfully!')
        setIsEditing(false)
        await fetchProfile()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(response.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('Error updating profile')
    }
  }

  if (loading) {
    return <div className='profile-dashboard'><p>Loading profile...</p></div>
  }

  const currentChef = homeChefService.getCurrentChef()

  return (
    <div className='profile-dashboard'>
      <h2>My Profile</h2>

      {error && <div className='error-message'>{error}</div>}
      {success && <div className='success-message'>{success}</div>}

      <div className='profile-card'>
        <div className='profile-header'>
          <div className='profile-avatar'>
            <span>👨‍🍳</span>
          </div>
          <div className='profile-title-section'>
            <h3>{chefInfo?.business_name || 'Chef Business'}</h3>
            <p className='email'>{chefInfo?.email || 'email@example.com'}</p>
          </div>
        </div>

        {isEditing ? (
          <div className='edit-form'>
            <div className='form-group'>
              <label>Business Name</label>
              <input
                type='text'
                name='businessName'
                value={formData.businessName}
                onChange={handleChange}
              />
            </div>
            <div className='form-group'>
              <label>Phone Number</label>
              <input
                type='tel'
                name='phoneNumber'
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
            <div className='edit-buttons'>
              <button onClick={handleSaveProfile} className='btn-save'>Save Changes</button>
              <button onClick={() => setIsEditing(false)} className='btn-cancel'>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className='profile-details'>
              <div className='detail-row'>
                <span className='detail-label'>📞 Phone Number</span>
                <span className='detail-value'>{chefInfo?.phone_number || 'Not provided'}</span>
              </div>

              <div className='detail-row'>
                <span className='detail-label'>⭐ Average Rating</span>
                <span className='detail-value'>{chefInfo?.average_rating || '0.00'} / 5.0</span>
              </div>

              <div className='detail-row'>
                <span className='detail-label'>✓ Account Status</span>
                <span className='detail-value'>
                  <span className={`status-badge ${chefInfo?.is_active ? 'active' : 'inactive'}`}>
                    {chefInfo?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </span>
              </div>

              <div className='detail-row'>
                <span className='detail-label'>📅 Member Since</span>
                <span className='detail-value'>{new Date(chefInfo?.created_at).getFullYear()}</span>
              </div>
            </div>

            <div className='profile-actions'>
              <button onClick={() => setIsEditing(true)} className='btn-edit'>Edit Profile</button>
            </div>
          </>
        )}
      </div>

      <div className='business-info'>
        <h3>Business Information</h3>
        <div className='info-grid'>
          <div className='info-item'>
            <span className='info-icon'>🏪</span>
            <div className='info-content'>
              <p className='info-title'>Business Name</p>
              <p className='info-text'>{chefInfo?.business_name || 'Not provided'}</p>
            </div>
          </div>
          <div className='info-item'>
            <span className='info-icon'>📧</span>
            <div className='info-content'>
              <p className='info-title'>Email Address</p>
              <p className='info-text'>{chefInfo?.email || 'Not provided'}</p>
            </div>
          </div>
          <div className='info-item'>
            <span className='info-icon'>📞</span>
            <div className='info-content'>
              <p className='info-title'>Contact Number</p>
              <p className='info-text'>{chefInfo?.phone_number || 'Not provided'}</p>
            </div>
          </div>
          <div className='info-item'>
            <span className='info-icon'>⭐</span>
            <div className='info-content'>
              <p className='info-title'>Rating</p>
              <p className='info-text'>{chefInfo?.average_rating || '0.00'} / 5.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
