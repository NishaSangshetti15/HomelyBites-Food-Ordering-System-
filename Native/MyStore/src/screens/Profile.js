import { StyleSheet, View, ScrollView, ActivityIndicator, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../components/Header'
import EditText from '../components/EditText'
import Button from '../components/Button'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { getProfile, updateProfile } from '../services/user'

function Profile({ navigation }) {
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  // get the username from async storage and update on the header
  const getUsername = async () => {
    const name = await AsyncStorage.getItem('username')
    setUsername(name || '')
  }

  const loadProfile = async () => {
    try {
      setLoading(true)
      const result = await getProfile()
      console.log('Profile result:', result)
      if (result && result.status === 'success') {
        const data = result.data
        setInfo(data)
        setName(data.name || data.first_name + ' ' + data.last_name || '')
        setEmail(data.email || '')
        setPhone(data.phone_number || data.mobile || '')
      } else {
        alert(result?.error || 'Failed to load profile')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      alert('Error loading profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getUsername()
    loadProfile()
  }, [])

  const onUpdateProfile = async () => {
    if (name.length == 0) {
      alert('please enter name')
    } else if (phone.length == 0) {
      alert('please enter phone')
    } else {
      console.log('calling onUpdateProfile')

      const result = await updateProfile(phone, name)
      console.log(result)
      if (result['status'] == 'success') {
        alert('successfully updated')
        navigation.goBack()
      } else {
        alert(result['error'])
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title={`Hello, ${username}`} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#f1b25d' />
        </View>
      ) : info ? (
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.innerContainer}
          showsVerticalScrollIndicator={false}
        >
          <EditText
            onChangeText={setName}
            value={name}
            label='Name'
            placeholder='enter your name here'
          />
          <EditText
            value={email}
            marginTop={10}
            label='Email'
            isReadonly={true}
            placeholder='enter your email here'
          />
          <EditText
            onChangeText={setPhone}
            value={phone}
            marginTop={10}
            label='Phone Number'
            placeholder='enter your phone here'
          />

          <Button
            onPress={onUpdateProfile}
            marginTop={20}
            title='Update'
          />

          <Button
            marginTop={20}
            title='Cancel'
            onPress={() => {
              navigation.goBack()
            }}
          />
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Unable to load profile</Text>
        </View>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
})

export default Profile
