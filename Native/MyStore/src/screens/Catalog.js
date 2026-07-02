import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  FlatList,
  Image,
} from 'react-native'
import { useEffect, useState } from 'react'
import FoodListItem from '../components/FoodListItem'
import FoodGridItem from '../components/FoodGridItem'
import SearchBar from '../components/SearchBar'
import { getCatalog, searchByBusinessName } from '../services/catalog'

function Catalog() {
  const [listingType, setListingType] = useState('list')
  const [items, setItems] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const loadFoodItems = async () => {
    const result = await getCatalog()
    console.log(result)
    if (result['status'] == 'success') {
      setItems(result['data'])
    } else {
      alert(result['error'])
    }
  }

  const handleSearch = async (text) => {
    setSearchQuery(text)
    
    if (text.trim() === '') {
      setIsSearching(false)
      loadFoodItems()
      return
    }

    setIsSearching(true)
    const result = await searchByBusinessName(text)
    
    if (result && result.status === 'success') {
      // Transform the data to match the expected format
      const transformedData = result.data.map((item) => ({
        ...item,
        fid: item.item_id,
        price: item.base_price,
      }))
      setItems(transformedData)
    } else {
      alert('No items found for this business')
      setItems([])
    }
  }

  useEffect(() => {
    loadFoodItems()
  }, [])

  return (
    <View>
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder='Search by business name...'
      />

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          onPress={() => setListingType('list')}
          style={[
            styles.optionButton,
            {
              borderTopLeftRadius: 10,
              borderBottomLeftRadius: 10,
              backgroundColor: listingType == 'list' ? '#f1b25d' : '#e6e6e6',
            },
          ]}
        >
          <Text style={styles.optionButtonText}>List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setListingType('grid')}
          style={[
            styles.optionButton,
            {
              borderTopRightRadius: 10,
              borderBottomRightRadius: 10,
              backgroundColor: listingType == 'grid' ? '#f1b25d' : '#e6e6e6',
            },
          ]}
        >
          <Text style={styles.optionButtonText}>Grid</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        numColumns={listingType == 'list' ? 1 : 2}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true)
          setSearchQuery('')
          setIsSearching(false)
          loadFoodItems()
          setRefreshing(false)
        }}
        data={items}
        key={listingType == 'list' ? 1 : 2}
        keyExtractor={(item) => item.fid || item.item_id}
        renderItem={({ item }) =>
          listingType == 'list' ? (
            <FoodListItem item={item} />
          ) : (
            <FoodGridItem item={item} />
          )
        }
        ListEmptyComponent={
          items.length === 0 && isSearching ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No items found</Text>
            </View>
          ) : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  optionButton: {
    width: 100,
  },
  optionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
})

export default Catalog
