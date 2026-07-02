import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  FlatList,
  Image,
} from 'react-native'
import { config } from '../services/config'
import { useDispatch } from 'react-redux'
import { addToCart } from '../slices/cartSlice'

function FoodListItem({ item }) {
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
      <View style={styles.innerContainer}>
        <Text style={styles.title}>{item['food_name'] || item['name']}</Text>
        <Text>{item['description']}</Text>
      </View>

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
    padding: 10,
    margin: 10,
    backgroundColor: '#f8debdff',
    borderRadius: 10,
    elevation: 5,
    flexDirection: 'row',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  innerContainer: {
    justifyContent: 'column',
    marginHorizontal: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  price: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#100301',
    color: 'white',
    padding: 8,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 10,
    fontWeight: 'bold',
  },

  buttonCart: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#100301',
    padding: 8,
    paddingHorizontal: 15,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  cartTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
})

export default FoodListItem
