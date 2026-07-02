import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StyleSheet, View } from 'react-native'
import Orders from './Orders'
import Settings from './Settings'
import { Ionicons } from '@expo/vector-icons'
import Cart from './Cart'
import Chefs from './Chefs'
import { useSelector } from 'react-redux'

function Home() {
  // create Tab Navigator
  const Tab = createBottomTabNavigator()

  // get the cart items
  const items = useSelector((state) => state.cart.items)

  return (
    <View style={styles.container}>
      <Tab.Navigator>
        <Tab.Screen
          name='Chefs'
          component={Chefs}
          options={{
            tabBarIcon: () => {
              return (
                <Ionicons
                  name='person-circle-outline'
                  size={20}
                />
              )
            },
          }}
        />
        <Tab.Screen
          name='Cart'
          component={Cart}
          options={{
            tabBarBadge: items.length > 0 ? items.length : undefined,
            tabBarIcon: () => {
              return (
                <Ionicons
                  name='cart-outline'
                  size={20}
                />
              )
            },
          }}
        />
        <Tab.Screen
          name='Orders'
          component={Orders}
          options={{
            tabBarIcon: () => {
              return (
                <Ionicons
                  name='reorder-four-outline'
                  size={20}
                />
              )
            },
          }}
        />
        <Tab.Screen
          name='Settings'
          component={Settings}
          options={{
            tabBarIcon: () => {
              return (
                <Ionicons
                  name='cog-outline'
                  size={20}
                />
              )
            },
          }}
        />
      </Tab.Navigator>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default Home
