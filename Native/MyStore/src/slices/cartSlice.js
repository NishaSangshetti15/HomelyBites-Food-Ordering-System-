import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
  },
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload

      // find if the item already exists
      const index = state.items.findIndex(
        (tempItem) => tempItem['fid'] == item['fid']
      )
      if (index == -1) {
        // the item does not exist
        state.items.push({ ...item, quantity: 1 })
      }

      console.log(`state items: `, state.items)
    },
    removeFromCart: (state, action) => {
      const item = action.payload

      // find if the item already exists
      const index = state.items.findIndex(
        (tempItem) => tempItem['fid'] == item['fid']
      )

      if (index != -1) {
        // item is present
        state.items.splice(index, 1)
      }
    },
    updateQuantity: (state, action) => {
      const { item, quantity } = action.payload

      // find if the item already exists
      const index = state.items.findIndex(
        (tempItem) => tempItem['fid'] == item['fid']
      )

      if (index != -1) {
        // item exists
        state.items[index].quantity = quantity
      }
    },
    clear: (state) => {
      state.items = []
    },
  },
})

// export all the actions
export const { addToCart, removeFromCart, updateQuantity, clear } =
  cartSlice.actions

// export the default reducer
export default cartSlice.reducer
