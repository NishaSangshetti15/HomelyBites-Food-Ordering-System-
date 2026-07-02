import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'

import Signin from './src/screens/auth/Signin'
import Signup from './src/screens/auth/Signup'
import Orders from './src/screens/Orders'
import Cart from './src/screens/Cart'
import Settings from './src/screens/Settings'
import Profile from './src/screens/Profile'
import AddAddress from './src/screens/AddAddress'
import UpdatePassword from './src/screens/UpdatePassword'
import Chefs from './src/screens/Chefs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'
import Home from './src/screens/Home'
import { Provider } from 'react-redux'
import { store } from './store'
import { useState } from 'react'
import { AuthContext } from './src/context/AuthContext'

export default function App() {
  const [user, setUser] = useState(null)

  // create the stack navigator
  const Stack = createNativeStackNavigator()

  return (
    <Provider store={store}>
      <AuthContext.Provider value={{ user, setUser }}>
        <View style={styles.container}>
          <NavigationContainer>
            {!user ? (
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Group>
                  <Stack.Screen
                    name='Signin'
                    component={Signin}
                  />
                  <Stack.Screen
                    name='Signup'
                    component={Signup}
                  />
                </Stack.Group>
              </Stack.Navigator>
            ) : (
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Group>
                  <Stack.Screen
                    name='Home'
                    component={Home}
                  />
                  <Stack.Screen
                    name='Chefs'
                    component={Chefs}
                  />
                  <Stack.Screen
                    name='Cart'
                    component={Cart}
                  />
                  <Stack.Screen
                    name='Orders'
                    component={Orders}
                  />
                  <Stack.Screen
                    name='Settings'
                    component={Settings}
                  />
                  <Stack.Screen
                    name='Profile'
                    component={Profile}
                  />
                  <Stack.Screen
                    name='AddAddress'
                    component={AddAddress}
                  />
                  <Stack.Screen
                    name='UpdatePassword'
                    component={UpdatePassword}
                  />
                </Stack.Group>
              </Stack.Navigator>
            )}
          </NavigationContainer>
        </View>
      </AuthContext.Provider>
    </Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
})
