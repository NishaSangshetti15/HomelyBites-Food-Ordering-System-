import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

function EditText({
  marginTop,
  label,
  placeholder,
  onChangeText,
  value,
  isReadonly = false,
  isPassword = false,
  multiline = false,
  numberOfLines = 1,
}) {
  return (
    <KeyboardAvoidingView
      style={[styles.container, { marginTop: marginTop ? marginTop : 0 }]}
    >
      <Text style={styles.text}>{label}</Text>
      <TextInput
        secureTextEntry={isPassword}
        style={[
          styles.input,
          multiline && { minHeight: numberOfLines * 40, textAlignVertical: 'top', paddingVertical: 10 },
        ]}
        placeholder={placeholder}
        onChangeText={onChangeText}
        value={value || ''}
        readOnly={isReadonly}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {},
  text: {
    fontWeight: '700',
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderRadius: 8,
    borderColor: '#e0e0e0',
    borderStyle: 'solid',
    borderWidth: 1.5,
    marginTop: 5,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
})

export default EditText
