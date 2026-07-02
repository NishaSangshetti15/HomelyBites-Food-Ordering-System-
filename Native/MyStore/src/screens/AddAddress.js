import { StyleSheet, View, ScrollView, ActivityIndicator, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../components/Header'
import EditText from '../components/EditText'
import Button from '../components/Button'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { addCustomerAddress } from '../services/user'

function AddAddress({ navigation }) {
  const [username, setUsername] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [pincode, setPincode] = useState('')
  const [houseNo, setHouseNo] = useState('')
  const [label, setLabel] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [loading, setLoading] = useState(false)

  // get the username from async storage
  const getUsername = async () => {
    const name = await AsyncStorage.getItem('username')
    setUsername(name || '')
  }

  useEffect(() => {
    getUsername()
  }, [])

  const onAddAddress = async () => {
    if (street.length === 0) {
      alert('Please enter street address')
    } else if (city.length === 0) {
      alert('Please enter city')
    } else if (pincode.length === 0) {
      alert('Please enter pincode')
    } else if (houseNo.length === 0) {
      alert('Please enter house number')
    } else if (label.length === 0) {
      alert('Please enter address label (e.g., Home, Work)')
    } else {
      try {
        setLoading(true)
        const result = await addCustomerAddress(
          street,
          city,
          pincode,
          houseNo,
          label,
          latitude || '0',
          longitude || '0'
        )
        console.log('Add address result:', result)
        
        if (result && result.status === 'success') {
          alert('Address added successfully')
          navigation.goBack()
        } else {
          alert(result?.error || 'Failed to add address')
        }
      } catch (error) {
        console.error('Error adding address:', error)
        alert('Error adding address')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title={`Hello, ${username}`} />

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.innerContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Add New Address</Text>

        <EditText
          onChangeText={setHouseNo}
          value={houseNo}
          label='House Number / Building'
          placeholder='Enter house number or building name'
          marginTop={16}
        />

        <EditText
          onChangeText={setStreet}
          value={street}
          label='Street Address'
          placeholder='Enter street address'
          marginTop={10}
          multiline={true}
          numberOfLines={3}
        />

        <EditText
          onChangeText={setCity}
          value={city}
          label='City'
          placeholder='Enter city name'
          marginTop={10}
        />

        <EditText
          onChangeText={setPincode}
          value={pincode}
          label='Pincode'
          placeholder='Enter pincode'
          marginTop={10}
        />

        <EditText
          onChangeText={setLabel}
          value={label}
          label='Address Label'
          placeholder='e.g., Home, Work, Other'
          marginTop={10}
        />

        <Text style={styles.optionalText}>Optional: Add GPS Coordinates</Text>

        <EditText
          onChangeText={setLatitude}
          value={latitude}
          label='Latitude'
          placeholder='e.g., 19.0760'
          marginTop={10}
        />

        <EditText
          onChangeText={setLongitude}
          value={longitude}
          label='Longitude'
          placeholder='e.g., 72.8777'
          marginTop={10}
        />

        <Button
          onPress={onAddAddress}
          marginTop={24}
          title={loading ? 'Adding...' : 'Add Address'}
          disabled={loading}
        />

        <Button
          marginTop={12}
          title='Cancel'
          onPress={() => {
            navigation.goBack()
          }}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flex: 1,
  },
  innerContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#100301',
    marginBottom: 8,
  },
  optionalText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
})

export default AddAddress
