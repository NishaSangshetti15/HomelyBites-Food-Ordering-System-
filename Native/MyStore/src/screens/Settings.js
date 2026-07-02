import {
  FlatList,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../components/Header'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
const arrowImage = require('../../assets/chevron.png')

function Settings({ navigation }) {
  const { setUser } = useContext(AuthContext)

  const menus = [
    { id: 1, title: 'Profile', icon: '👤', description: 'View and edit your profile' },
    { id: 2, title: 'Update Password', icon: '🔐', description: 'Change your password' },
    { id: 3, title: 'Notifications', icon: '🔔', description: 'Manage notifications' },
    { id: 4, title: 'Payment Methods', icon: '💳', description: 'Add or remove payment methods' },
    { id: 5, title: 'Preferences', icon: '⚙️', description: 'App preferences and settings' },
    { id: 6, title: 'About Us', icon: 'ℹ️', description: 'Learn more about the app' },
    { id: 7, title: 'Help & Support', icon: '❓', description: 'Get help or contact support' },
    { id: 100, title: 'Logout', icon: '🚪', description: 'Sign out of your account' },
  ]

  const renderItem = (item) => {
    const onSelectItem = async () => {
      if (item['id'] == 100) {
        // logout
        await AsyncStorage.clear()
        setUser(null)
        // navigation.navigate('Signin')
      } else if (item['id'] == 1) {
        // profile screen
        navigation.push('Profile')
      } else if (item['id'] == 2) {
        // update password screen
        navigation.push('UpdatePassword')
      } else if (item['id'] == 3) {
        // notifications screen
        alert('Notifications feature coming soon')
      } else if (item['id'] == 4) {
        // payment methods
        alert('Payment methods feature coming soon')
      } else if (item['id'] == 5) {
        // preferences
        alert('Preferences feature coming soon')
      } else if (item['id'] == 6) {
        // about us
        alert('Homelify - Your favorite home chef delivery app v1.0.0')
      } else if (item['id'] == 7) {
        // help & support
        alert('Contact us at support@homelify.com or call +1-800-HOMELIFY')
      }
    }

    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          item['id'] === 100 && styles.logoutContainer,
        ]}
        onPress={onSelectItem}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.itemIcon}>{item['icon']}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>{item['title']}</Text>
            <Text style={styles.itemDescription}>{item['description']}</Text>
          </View>
        </View>
        {item['id'] != 100 && (
          <Image
            source={arrowImage}
            style={styles.iconArrow}
          />
        )}
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title='Settings' />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <FlatList
          scrollEnabled={false}
          style={styles.list}
          data={menus}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => renderItem(item)}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  list: {
    marginTop: 16,
    marginBottom: 20,
  },

  itemContainer: {
    padding: 16,
    marginHorizontal: 0,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 0,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutContainer: {
    backgroundColor: '#ffe6e6',
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#ffcccc',
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#fff5e6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemIcon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  itemDescription: {
    fontWeight: '400',
    fontSize: 13,
    color: '#999999',
  },
  iconArrow: {
    width: 15,
    height: 15,
    marginLeft: 12,
    tintColor: '#cccccc',
  },
})

export default Settings
