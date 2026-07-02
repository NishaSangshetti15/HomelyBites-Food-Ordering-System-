import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
} from 'react-native'
import { useEffect, useState } from 'react'
import CartItem from '../components/CartItem'
import { useDispatch, useSelector } from 'react-redux'
import { clear, removeFromCart, updateQuantity } from '../slices/cartSlice'
import { placeOrder } from '../services/order'

function Cart() {
  const items = useSelector((state) => state.cart.items)
  const [subtotal, setSubtotal] = useState(0)
  const [tax, setTax] = useState(0)
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  // get dispatcher
  const dispatch = useDispatch()

  const TAX_RATE = 0.05 // 5% tax
  const DELIVERY_FEE = 10 // ₹10 delivery fee

  const onQuantityChange = (item, newQuantity) => {
    // check if the newQuantity is 0 then remove the item from collection
    if (newQuantity == 0) {
      dispatch(removeFromCart(item))
    } else {
      dispatch(updateQuantity({ item, quantity: newQuantity }))
    }
  }

  const onCheckout = async () => {
    if (!items || items.length === 0) {
      alert('Your cart is empty')
      return
    }
    
    setIsProcessing(true)
    const result = await placeOrder(totalPrice, items)
    setIsProcessing(false)
    
    if (result && result['status'] == 'success') {
      alert('Order placed successfully!\nOrder ID: ' + result.data?.order_id)
      dispatch(clear())
    } else if (result && result['error']) {
      // Handle error - it might be an object or a string
      let errorMessage = result['error']
      if (typeof errorMessage === 'object') {
        // If error is an object, extract the message
        errorMessage = errorMessage.message || errorMessage.sqlMessage || JSON.stringify(errorMessage)
      }
      alert(`Order Error:\n${errorMessage}`)
    } else {
      alert('Failed to place order. Please try again.')
    }
  }

  useEffect(() => {
    // Calculate subtotal
    let calculatedSubtotal = 0
    for (const item of items) {
      calculatedSubtotal += item['price'] * item['quantity']
    }
    setSubtotal(calculatedSubtotal)

    // Calculate tax
    const calculatedTax = Math.round(calculatedSubtotal * TAX_RATE)
    setTax(calculatedTax)

    // Set delivery fee
    const fee = calculatedSubtotal > 0 ? DELIVERY_FEE : 0
    setDeliveryFee(fee)

    // Calculate total
    const total = calculatedSubtotal + calculatedTax + fee
    setTotalPrice(total)
  }, [items])

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image 
          source={require('../../assets/logo.jpg')} 
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>My Cart</Text>
      </View>
      <View style={styles.innerContainer}>
        {items.length == 0 ? (
          <Text style={styles.emptyMessage}>No Items in the cart</Text>
        ) : (
          <ScrollView style={styles.itemsContainer}>
            <FlatList
              scrollEnabled={false}
              data={items}
              keyExtractor={(item) => item.fid}
              renderItem={({ item }) => {
                return (
                  <CartItem
                    onQuantityChange={onQuantityChange}
                    item={item}
                  />
                )
              }}
            />
          </ScrollView>
        )}

        {/* Bill Summary */}
        {items.length > 0 && (
          <View style={styles.billContainer}>
            <Text style={styles.billTitle}>Order Summary</Text>
            
            {/* Subtotal */}
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Subtotal</Text>
              <Text style={styles.billValue}>₹{subtotal.toFixed(2)}</Text>
            </View>

            {/* Tax */}
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Tax (18% GST)</Text>
              <Text style={styles.billValue}>₹{tax.toFixed(2)}</Text>
            </View>

            {/* Delivery Fee */}
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery Fee</Text>
              <Text style={styles.billValue}>₹{deliveryFee.toFixed(2)}</Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Total */}
            <View style={styles.billRowTotal}>
              <Text style={styles.billLabelTotal}>Total Amount</Text>
              <Text style={styles.billValueTotal}>₹{totalPrice.toFixed(2)}</Text>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
              style={[
                styles.checkoutButton,
                isProcessing && styles.checkoutButtonDisabled,
              ]}
              onPress={onCheckout}
              disabled={isProcessing}
            >
              <Text style={styles.checkoutButtonTitle}>
                {isProcessing ? 'Processing...' : 'Checkout'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FAFAFA',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  logo: {
    width: 45,
    height: 45,
    borderRadius: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemsContainer: {
    flex: 1,
    paddingBottom: 10,
  },
  billContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 4,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  billTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'left',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  billRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  billLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  billValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  billLabelTotal: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '700',
  },
  billValueTotal: {
    fontSize: 20,
    color: '#2E7D32',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  checkoutButton: {
    padding: 15,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    elevation: 2,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  checkoutButtonTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyMessage: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    margin: 20,
  },
})

export default Cart
