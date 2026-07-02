import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import Header from '../../components/Header'
import EditText from '../../components/EditText'
import { useContext, useState } from 'react'
import Button from '../../components/Button'
import { loginUser } from '../../services/user'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthContext } from '../../context/AuthContext'

function Signin({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // get the setUser from AuthContext
  const { setUser } = useContext(AuthContext)

  const onSignin = async () => {
    if (email.length == 0) {
      alert('please enter email')
    } else if (password.length == 0) {
      alert('please enter password')
    } else {
      const result = await loginUser(email, password)
      if (result['status'] == 'success') {
        // get the data from result
        const { name, token, first_name, last_name, phone_number } = result['data']

        // persist the info to async storage
        await AsyncStorage.setItem('username', name || `${first_name} ${last_name}`)
        await AsyncStorage.setItem('token', token)
        await AsyncStorage.setItem('email', email)

        // set the user in AuthContext - navigation will happen automatically due to conditional rendering in App.js
        setUser({ name: name || `${first_name} ${last_name}`, token })
      } else {
        alert(result['error'])
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.signinContainer}>
          <Text style={styles.signin}>Signin</Text>
        </View>

        <EditText
          value={email}
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

        <View style={styles.signupHereContainer}>
          <Text>Don't have an account yet? </Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Signup')
            }}
          >
            <Text style={styles.signupHere}>Signup here</Text>
          </TouchableOpacity>
        </View>

        <Button
          onPress={onSignin}
          title='Signin'
          marginTop={20}
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
  signupHere: {
    fontWeight: 'bold',
  },
  signupHereContainer: {
    marginTop: 10,
    flexDirection: 'row',
  },
})

export default Signin
