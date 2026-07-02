import React, { useState } from 'react'
import './HomeChefLogin.css'
import { useNavigate } from 'react-router-dom'
import { homeChefService } from '../../services/homeChefService'

const HomeChefLogin = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
    phoneNumber: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

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
      let response

      if (isLogin) {
        response = await homeChefService.signin(formData.email, formData.password)
      } else {
        response = await homeChefService.signup(
          formData.businessName,
          formData.email,
          formData.password,
          formData.phoneNumber
        )
      }

      if (response.error || response.message) {
        setError(response.error || response.message)
      } else if (isLogin && response.data?.token) {
        navigate('/homechef/dashboard/menu')
      } else if (!isLogin) {
        setError('Sign up successful! Please wait for admin approval to login.')
        setFormData({ email: '', password: '', businessName: '', phoneNumber: '' })
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='homechef-login-container'>
      <div className='login-card'>
        <h2 className='login-title'>
          {isLogin ? 'HomeChef Login' : 'HomeChef Registration'}
        </h2>

        {error && <div className='error-message'>{error}</div>}

        <form onSubmit={handleSubmit} className='login-form'>
          {!isLogin && (
            <>
              <div className='form-group'>
                <label htmlFor='businessName'>Business Name</label>
                <input
                  type='text'
                  id='businessName'
                  name='businessName'
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder='Your business name'
                  required
                />
              </div>

              <div className='form-group'>
                <label htmlFor='phoneNumber'>Phone Number</label>
                <input
                  type='tel'
                  id='phoneNumber'
                  name='phoneNumber'
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder='10-digit phone number'
                  pattern='[0-9]{10}'
                  required
                />
              </div>
            </>
          )}

          <div className='form-group'>
            <label htmlFor='email'>Email</label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='your@email.com'
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='password'>Password</label>
            <input
              type='password'
              id='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              placeholder='Enter your password'
              required
            />
          </div>

          <button type='submit' className='submit-btn' disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className='toggle-auth'>
          <p>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type='button'
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setFormData({ email: '', password: '', businessName: '', phoneNumber: '' })
              }}
              className='toggle-btn'
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default HomeChefLogin
