import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import Header from '../../components/Header'
import EditText from '../../components/EditText'
import { useContext, useState } from 'react'
import Button from '../../components/Button'
import { signupUser } from '../../services/user'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthContext } from '../../context/AuthContext'

function Signup({ navigation }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // get the setUser from AuthContext
  const { setUser } = useContext(AuthContext)

  const onSignup = async () => {
    if (name.length == 0) {
      alert('please enter your name')
    } else if (phone.length == 0) {
      alert('please enter your phone')
    } else if (email.length == 0) {
      alert('please enter your email')
    } else if (password.length == 0) {
      alert('please enter your password')
    } else if (confirmPassword.length == 0) {
      alert('please enter your confirmPassword')
    } else if (password != confirmPassword) {
      alert('password does not match')
    } else {
      // Split name into first_name and last_name
      const nameParts = name.trim().split(' ')
      const first_name = nameParts[0]
      const last_name = nameParts.slice(1).join(' ') || ''

      const result = await signupUser(first_name, last_name, email, password, phone)
      if (result['status'] == 'success') {
        alert('Successfully registered a new user')
        // get the data from result
        const { token } = result['data']

        // persist the info to async storage
        await AsyncStorage.setItem('username', name)
        await AsyncStorage.setItem('token', token)
        await AsyncStorage.setItem('email', email)

        // set the user in AuthContext to navigate to home screen
        setUser({ name, token })
      } else {
        alert(result['error'])
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.signinContainer}>
          <Text style={styles.signin}>Signup</Text>
        </View>

        <EditText
          value={name}
          label='Name'
          placeholder='enter your name here'
          onChangeText={setName}
        />
        <EditText
          value={phone}
          marginTop={10}
          label='Phone Number'
          placeholder='enter your phone number here'
          onChangeText={setPhone}
        />
        <EditText
          value={email}
          marginTop={10}
          label='Email'
          placeholder='enter your email here'
          onChangeText={setEmail}
        />
        <EditText
          value={password}
          isPassword={true}
          marginTop={10}
          label='Password'
          placeholder='enter your password here'
          onChangeText={setPassword}
        />
        <EditText
          value={confirmPassword}
          isPassword={true}
          marginTop={10}
          label='Confirm Password'
          placeholder='confirm your password here'
          onChangeText={setConfirmPassword}
        />

        <View style={styles.signinHereContainer}>
          <Text>Already have an account yet? </Text>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack()
            }}
          >
            <Text style={styles.signinHere}>Signin here</Text>
          </TouchableOpacity>
        </View>

        <Button
          title='Signup'
          marginTop={20}
          onPress={onSignup}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecc769',
    justifyContent: 'center',
  },
  innerContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  signinContainer: {
    marginTop: -40,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signin: {
    textAlign: 'center',
    backgroundColor: '#f1b25d',
    width: 150,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    padding: 15,
    borderRadius: 8,
    elevation: 5,
  },
  text: {
    marginTop: 20,
    fontSize: 17,
  },
  signinHere: {
    fontWeight: 'bold',
  },
  signinHereContainer: {
    marginTop: 10,
    flexDirection: 'row',
  },
})

export default Signup
