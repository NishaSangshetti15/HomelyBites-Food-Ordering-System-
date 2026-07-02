import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { config } from '../services/config'

function CartItem({ item, onQuantityChange }) {
  console.log(`item => `, item)
  return item ? (
    <View style={styles.container}>
      <Image
        style={styles.thumbnail}
        source={{
          uri: `${config.url}/foodimage/${item['image']}`,
        }}
      />
      <View style={styles.innerContainer}>
        <View>
          <Text style={styles.title}>{item['name']}</Text>
          <Text style={styles.price}>
            ${item['price']} x {item['quantity']} = $
            {item['price'] * item['quantity']}
          </Text>
        </View>

        <View style={styles.quantityButtonsContainer}>
          <TouchableOpacity
            onPress={() => {
              onQuantityChange(item, item['quantity'] + 1)
            }}
            style={styles.quantityButton}
          >
            <Text style={styles.quantityButtonTitle}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              onQuantityChange(item, item['quantity'] - 1)
            }}
            style={styles.quantityButton}
          >
            <Text style={styles.quantityButtonTitle}>-</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ) : (
    <Text>No Item Details</Text>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    margin: 10,
    backgroundColor: '#f8debdff',
    borderRadius: 10,
    elevation: 5,
    flexDirection: 'row',
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 10,
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  price: {
    fontWeight: 500,
    fontSize: 16,
  },

  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  quantityButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  quantityButton: {
    width: 30,
    height: 30,
    backgroundColor: '#100301',
    marginHorizontal: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityButtonTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
})

export default CartItem
