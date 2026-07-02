import { StyleSheet, View } from 'react-native'
import Header from '../components/Header'
import EditText from '../components/EditText'
import Button from '../components/Button'
import { useState } from 'react'
import { changePassword } from '../services/user'

function UpdatePassword({ navigation }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const onChangePassword = async () => {
    if (password.length == 0) {
      alert('please enter password')
    } else if (confirmPassword.length == 0) {
      alert('please confirm password')
    } else if (password != confirmPassword) {
      alert('password does not match')
    } else {
      const result = await changePassword(password)
      if (result['status'] == 'success') {
        alert('successfully updated password')
        navigation.goBack()
      } else {
        alert(result['error'])
      }
    }
  }
  return (
    <View style={styles.container}>
      <Header title='Change Password' />
      <View style={styles.innerContainer}>
        <EditText
          value={password}
          onChangeText={setPassword}
          label='New Password'
          isPassword={true}
        />
        <EditText
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          marginTop={10}
          label='Confirm Password'
          isPassword={true}
        />
        <Button
          onPress={onChangePassword}
          marginTop={20}
          title='Change Password'
        />
        <Button
          marginTop={20}
          title='Cancel'
          onPress={() => {
            navigation.goBack()
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    padding: 16,
    marginTop: 20,
  },
})

export default UpdatePassword
