import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'

const ProtectedRoute = ({ element, requiredRole }) => {
  const { isAuthenticated, userRole } = useContext(StoreContext)

  // If not authenticated, redirect to auth page
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  // If a specific role is required and user doesn't have it, redirect to auth
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/auth" replace />
  }

  return element
}

export default ProtectedRoute
