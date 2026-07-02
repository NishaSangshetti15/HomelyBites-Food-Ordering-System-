import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import { config } from '../services/config'
import { useDispatch } from 'react-redux'
import { addToCart } from '../slices/cartSlice'

function FoodGridItem({ item }) {
  // get the dispatcher
  const dispatch = useDispatch()

  const onAddToCart = () => {
    dispatch(addToCart(item))
  }

  return (
    <View style={styles.container}>
      <Image
        style={styles.thumbnail}
        source={{
          uri: item['image_url'] || `${config.url}/foodimage/${item['image']}`,
        }}
      />
      <Text style={styles.title}>{item['food_name'] || item['name']}</Text>
      <Text style={styles.price}>${item['price']}</Text>

      <TouchableOpacity
        style={styles.buttonCart}
        onPress={onAddToCart}
      >
        <Text style={styles.cartTitle}>Cart</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    backgroundColor: '#f8debdff',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  title: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 19,
  },
  price: {
    fontSize: 15,
  },
  buttonCart: {
    backgroundColor: '#100301',
    color: 'white',
    padding: 8,
    fontWeight: 'bold',
    borderRadius: 10,
    marginTop: 10,
    width: 100,
  },
  cartTitle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
})

export default FoodGridItem
