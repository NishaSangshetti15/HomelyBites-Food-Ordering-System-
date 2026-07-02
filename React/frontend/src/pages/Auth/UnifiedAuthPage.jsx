import React, { useContext, useState } from 'react'
import './UnifiedAuthPage.css'
import { useNavigate } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'

const UnifiedAuthPage = () => {
  const navigate = useNavigate()
  const { url, setToken, setUserRole, setIsAuthenticated } = useContext(StoreContext)

  const [currState, setCurrState] = useState('Login')
  const [selectedRole, setSelectedRole] = useState('Customer')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [data, setData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    business_name: ''
  })

  const onChangeHandler = (event) => {
    const name = event.target.name
    const value = event.target.value
    setData(data => ({ ...data, [name]: value }))
    setError('')
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/
    return phoneRegex.test(phone)
  }

  const validatePassword = (password) => {
    return password.length >= 6
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validation
      if (selectedRole !== 'Delivery Person' && selectedRole !== 'Admin') {
        if (!validateEmail(data.email)) {
          setError('Please enter a valid email')
          setIsLoading(false)
          return
        }
      }

      if (currState === 'Sign up') {
        if (selectedRole === 'Customer' && !data.first_name) {
          setError('First name is required')
          setIsLoading(false)
          return
        }
        if (selectedRole === 'Home Chef' && !data.business_name) {
          setError('Business name is required')
          setIsLoading(false)
          return
        }
        if ((selectedRole === 'Customer' || selectedRole === 'Home Chef' || selectedRole === 'Delivery Person') && !validatePhone(data.phone_number)) {
          setError('Please enter a valid 10-digit phone number')
          setIsLoading(false)
          return
        }
        if (!validatePassword(data.password)) {
          setError('Password must be at least 6 characters')
          setIsLoading(false)
          return
        }
      } else if (currState === 'Login') {
        if (selectedRole === 'Delivery Person') {
          if (!validatePhone(data.phone_number)) {
            setError('Please enter a valid 10-digit phone number')
            setIsLoading(false)
            return
          }
        }
        if (!validatePassword(data.password)) {
          setError('Please enter a valid password')
          setIsLoading(false)
          return
        }
      }

      let endpoint = ''
      let payload = {}

      // Handle based on role
      if (selectedRole === 'Customer') {
        if (currState === 'Login') {
          endpoint = `${url}/customer/signin`
          payload = {
            email: data.email,
            password: data.password
          }
        } else {
          endpoint = `${url}/customer/signup`
          payload = {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            password: data.password,
            phone_number: data.phone_number
          }
        }
      } else if (selectedRole === 'Home Chef') {
        if (currState === 'Login') {
          endpoint = `${url}/homechef/signin`
          payload = {
            email: data.email,
            password: data.password
          }
        } else {
          endpoint = `${url}/homechef/signup`
          payload = {
            business_name: data.business_name,
            email: data.email,
            password: data.password,
            phone_number: data.phone_number
          }
        }
      } else if (selectedRole === 'Delivery Person') {
        if (currState === 'Login') {
          endpoint = `${url}/delivery-personnel/signin`
          payload = {
            phone_number: data.phone_number,
            password: data.password
          }
        } else {
          endpoint = `${url}/delivery-personnel/signup`
          payload = {
            first_name: data.first_name,
            last_name: data.last_name,
            phone_number: data.phone_number,
            password: data.password
          }
        }
      } else if (selectedRole === 'Admin') {
        if (currState === 'Sign up') {
          setError('Admin accounts cannot be created here. Contact system administrator.')
          setIsLoading(false)
          return
        }
        endpoint = `${url}/admin/login`
        payload = {
          email: data.email,
          password: data.password
        }
      }

      const response = await axios.post(endpoint, payload)
      console.log('API Response:', response.data)
      console.log('Selected Role:', selectedRole)

      if (response.data.status === 'success' && response.data.data && response.data.data.token) {
        const token = response.data.data.token
        const userData = response.data.data
        
        setToken(token)
        setUserRole(selectedRole)
        setIsAuthenticated(true)
        localStorage.setItem('token', token)
        localStorage.setItem('userRole', selectedRole)
        
        // Store user info in context/localStorage
        const userInfo = {
          email: userData.email,
          role: userData.role,
          name: userData.name
        }
        
        // Add extra fields if available
        if (userData.customer_id) userInfo.customer_id = userData.customer_id
        if (userData.admin_id) userInfo.admin_id = userData.admin_id
        if (userData.first_name) userInfo.first_name = userData.first_name
        if (userData.last_name) userInfo.last_name = userData.last_name
        if (userData.phone_number) userInfo.phone_number = userData.phone_number
        if (userData.driver_id) {
          localStorage.setItem('driverId', userData.driver_id)
        }
        
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
        
        console.log('Login successful for:', selectedRole)

        // Route based on role
        if (selectedRole === 'Customer') {
          navigate('/')
        } else if (selectedRole === 'Home Chef') {
          navigate('/homechef/dashboard')
        } else if (selectedRole === 'Delivery Person') {
          navigate('/delivery/dashboard')
        } else if (selectedRole === 'Admin') {
          console.log('Navigating to admin dashboard')
          navigate('/admin/dashboard')
        }
      } else {
        const errorMsg = response.data.message || response.data.error || 'Authentication failed'
        console.error('Login failed:', errorMsg)
        setError(errorMsg)
      }
    } catch (error) {
      console.error('Auth Error Details:', error)
      
      let errorMsg = 'Authentication failed. Please try again.'
      
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error
      } else if (error.message) {
        errorMsg = error.message
      }
      
      console.error('Final error message:', errorMsg)
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='unified-auth-page'>
      <div className='auth-container'>
        <div className='auth-header'>
          <h1>🏠 HomelyBites</h1>
          <p>Your trusted food delivery platform</p>
        </div>

        <form onSubmit={onSubmit} className='auth-form'>
          <div className='auth-title'>
            <h2>{currState}</h2>
          </div>

          {/* Role Selection */}
          <div className='form-group'>
            <label htmlFor='role'>Select Your Role</label>
            <select
              id='role'
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value)
                setError('')
              }}
              className='role-select'
            >
              <option value='Customer'>👥 Customer</option>
              <option value='Home Chef'>👨‍🍳 Home Chef</option>
              <option value='Delivery Person'>🛵 Delivery Person</option>
              <option value='Admin'>🔐 Admin</option>
            </select>
          </div>

          {/* Error Message */}
          {error && <div className='error-message'>{error}</div>}

          {/* Customer Fields */}
          {selectedRole === 'Customer' && (
            <>
              {currState !== 'Login' && (
                <>
                  <div className='form-group'>
                    <input
                      name='first_name'
                      value={data.first_name}
                      onChange={onChangeHandler}
                      type='text'
                      placeholder='First Name'
                      required
                    />
                  </div>
                  <div className='form-group'>
                    <input
                      name='last_name'
                      value={data.last_name}
                      onChange={onChangeHandler}
                      type='text'
                      placeholder='Last Name'
                      required
                    />
                  </div>
                  <div className='form-group'>
                    <input
                      name='phone_number'
                      value={data.phone_number}
                      onChange={onChangeHandler}
                      type='tel'
                      placeholder='Phone Number (10 digits)'
                      required
                    />
                  </div>
                </>
              )}
            </>
          )}

          {/* Home Chef Fields */}
          {selectedRole === 'Home Chef' && (
            <>
              {currState !== 'Login' && (
                <div className='form-group'>
                  <input
                    name='business_name'
                    value={data.business_name}
                    onChange={onChangeHandler}
                    type='text'
                    placeholder='Business Name'
                    required
                  />
                </div>
              )}
              {currState !== 'Login' && (
                <div className='form-group'>
                  <input
                    name='phone_number'
                    value={data.phone_number}
                    onChange={onChangeHandler}
                    type='tel'
                    placeholder='Phone Number (10 digits)'
                    required
                  />
                </div>
              )}
            </>
          )}

          {/* Delivery Person Fields */}
          {selectedRole === 'Delivery Person' && (
            <>
              <div className='form-group'>
                <input
                  name='phone_number'
                  value={data.phone_number}
                  onChange={onChangeHandler}
                  type='tel'
                  placeholder='Phone Number (10 digits)'
                  required
                />
              </div>
              <div className='form-group'>
                <input
                  name='password'
                  value={data.password}
                  onChange={onChangeHandler}
                  type='password'
                  placeholder='Password'
                  required
                />
              </div>
              {currState === 'Sign up' && (
                <>
                  <div className='form-group'>
                    <input
                      name='first_name'
                      value={data.first_name}
                      onChange={onChangeHandler}
                      type='text'
                      placeholder='First Name'
                      required
                    />
                  </div>
                  <div className='form-group'>
                    <input
                      name='last_name'
                      value={data.last_name}
                      onChange={onChangeHandler}
                      type='text'
                      placeholder='Last Name'
                      required
                    />
                  </div>
                </>
              )}
            </>
          )}

          {/* Common Fields */}
          {selectedRole !== 'Delivery Person' && (
            <>
              <div className='form-group'>
                <input
                  name='email'
                  value={data.email}
                  onChange={onChangeHandler}
                  type='email'
                  placeholder='Email Address'
                  required
                />
              </div>

              <div className='form-group'>
                <input
                  name='password'
                  value={data.password}
                  onChange={onChangeHandler}
                  type='password'
                  placeholder='Password'
                  required
                />
              </div>
            </>
          )}

          {/* Terms and Conditions */}
          {currState === 'Sign up' && (
            <div className='terms-checkbox'>
              <input type='checkbox' required />
              <p>I agree to the Terms of Use & Privacy Policy</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type='submit'
            disabled={isLoading}
            className='auth-button'
          >
            {isLoading
              ? 'Loading...'
              : currState === 'Sign up'
              ? 'Create Account'
              : 'Login'}
          </button>

          {/* Toggle Between Login and Sign Up */}
          <div className='auth-toggle'>
            {currState === 'Login' ? (
              <p>
                Don't have an account?{' '}
                <span onClick={() => setCurrState('Sign up')}>
                  Sign up here
                </span>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <span onClick={() => setCurrState('Login')}>Login here</span>
              </p>
            )}
          </div>

          {/* Info for Home Chef Signup */}
          {selectedRole === 'Home Chef' && currState === 'Sign up' && (
            <div className='info-box'>
              <p>
                ⏳ <strong>Note:</strong> Your account will be approved by our
                admin team within 24 hours.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default UnifiedAuthPage
