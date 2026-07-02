import React, { useState, useEffect } from 'react'
import './Earnings.css'
import { homeChefService } from '../../services/homeChefService'

const Earnings = () => {
  const [earnings, setEarnings] = useState({
    total_earnings: 0,
    today_earnings: 0,
    week_earnings: 0,
    month_earnings: 0,
    today_orders: 0,
    week_orders: 0,
    month_orders: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    setLoading(true)
    try {
      const response = await homeChefService.getEarnings()
      if (response.data) {
        setEarnings({
          total_earnings: response.data.total_earnings || 0,
          today_earnings: response.data.today_earnings || 0,
          week_earnings: response.data.week_earnings || 0,
          month_earnings: response.data.month_earnings || 0,
          today_orders: response.data.today_orders || 0,
          week_orders: response.data.week_orders || 0,
          month_orders: response.data.month_orders || 0,
        })
        setError('')
      } else {
        setError(response.error || 'Failed to fetch earnings')
      }
    } catch (err) {
      setError('Error fetching earnings')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className='earnings-dashboard'><p>Loading earnings data...</p></div>
  }

  return (
    <div className='earnings-dashboard'>
      <h2>Earnings</h2>

      {error && <div className='error-message'>{error}</div>}

      <div className='earnings-summary'>
        <div className='earning-card'>
          <div className='card-icon'>💰</div>
          <div className='card-content'>
            <p className='label'>Today's Earnings</p>
            <p className='amount'>₹{earnings.today_earnings}</p>
            <p className='subtext'>{earnings.today_orders} orders</p>
          </div>
        </div>

        <div className='earning-card'>
          <div className='card-icon'>📊</div>
          <div className='card-content'>
            <p className='label'>This Week</p>
            <p className='amount'>₹{earnings.week_earnings}</p>
            <p className='subtext'>{earnings.week_orders} orders</p>
          </div>
        </div>

        <div className='earning-card'>
          <div className='card-icon'>📈</div>
          <div className='card-content'>
            <p className='label'>This Month</p>
            <p className='amount'>₹{earnings.month_earnings}</p>
            <p className='subtext'>{earnings.month_orders} orders</p>
          </div>
        </div>

        <div className='earning-card'>
          <div className='card-icon'>🏆</div>
          <div className='card-content'>
            <p className='label'>Total Earnings</p>
            <p className='amount'>₹{earnings.total_earnings}</p>
            <p className='subtext'>All time</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Earnings
