import {
  StyleSheet,
  View,
  TextInput,
} from 'react-native'
import { Ionicons } from '@react-native-vector-icons/ionicons'

function SearchBar({ onChangeText, value, placeholder = 'Search...' }) {
  return (
    <View style={styles.container}>
      <Ionicons
        name='search-outline'
        size={20}
        color='#999'
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        onChangeText={onChangeText}
        value={value}
        placeholderTextColor='#bbb'
      />
      {value ? (
        <Ionicons
          name='close-circle'
          size={20}
          color='#999'
          style={styles.clearIcon}
          onPress={() => onChangeText('')}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    height: 48,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  clearIcon: {
    marginLeft: 8,
  },
})

export default SearchBar
