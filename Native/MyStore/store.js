const { configureStore } = require('@reduxjs/toolkit')
import cartReducer from './src/slices/cartSlice'

// create a redux store
export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
})
