import {
  StyleSheet,
  View,
  FlatList,
  Text,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import SearchBar from '../components/SearchBar'
import ChefCard from '../components/ChefCard'
import FoodListItem from '../components/FoodListItem'
import { getAllChefs, getChefMenu } from '../services/user'

function Chefs({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [allChefs, setAllChefs] = useState([])
  const [filteredChefs, setFilteredChefs] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedChef, setSelectedChef] = useState(null)
  const [chefMenus, setChefMenus] = useState([])
  const [menuLoading, setMenuLoading] = useState(false)
  const [showMenuModal, setShowMenuModal] = useState(false)

  useEffect(() => {
    loadChefs()
  }, [])

  const loadChefs = async () => {
    setLoading(true)
    const result = await getAllChefs()
    if (result && result.status === 'success') {
      setAllChefs(result.data)
      setFilteredChefs(result.data)
    } else {
      alert('Failed to load chefs')
    }
    setLoading(false)
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (query.trim() === '') {
      setFilteredChefs(allChefs)
    } else {
      const filtered = allChefs.filter(
        (chef) =>
          chef.business_name?.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredChefs(filtered)
    }
  }

  const handleChefPress = async (chef) => {
    setSelectedChef(chef)
    setMenuLoading(true)
    setShowMenuModal(true)
    
    const result = await getChefMenu(chef.chef_id)
    
    if (result && result.status === 'success') {
      // Transform the data
      const transformedData = result.data.map((item) => ({
        ...item,
        fid: item.item_id,
        price: item.base_price,
      }))
      setChefMenus(transformedData)
    } else {
      alert('Failed to load chef menu')
      setChefMenus([])
    }
    setMenuLoading(false)
  }

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name='people-outline' size={80} color='#ddd' />
        <Text style={styles.emptyText}>No chefs found</Text>
        <Text style={styles.emptySubText}>Try a different search term</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Image 
          source={require('../../assets/logo.jpg')} 
          style={styles.logo}
        />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Discover Chefs</Text>
          <Text style={styles.headerSubtitle}>Browse available home chefs</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder='Search by business name...'
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#f1b25d' />
          <Text style={styles.loadingText}>Loading chefs...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredChefs}
          keyExtractor={(item) => item.chef_id.toString()}
          renderItem={({ item }) => (
            <ChefCard
              chef={{
                id: item.chef_id,
                name: item.business_name,
                specialty: 'Home Chef',
                rating: item.average_rating || 4.5,
                reviews: 0,
                totalOrders: 0,
                distance: 2.5,
                profileImage: 'https://via.placeholder.com/150?text=' + item.business_name,
                description: `Phone: ${item.phone_number}`,
              }}
              onPress={() => handleChefPress(item)}
            />
          )}
          ListEmptyComponent={renderEmptyState()}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Menu Modal */}
      <Modal
        visible={showMenuModal}
        animationType='slide'
        onRequestClose={() => setShowMenuModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowMenuModal(false)}
              style={styles.closeButtonContainer}
            >
              <Ionicons name='chevron-back' size={28} color='#100301' />
            </TouchableOpacity>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>{selectedChef?.business_name}</Text>
              <Text style={styles.modalSubtitle}>Menu Items</Text>
            </View>
            <View style={{ width: 50 }} />
          </View>

          {menuLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size='large' color='#f1b25d' />
              <Text style={styles.loadingText}>Loading menu...</Text>
            </View>
          ) : (
            <FlatList
              data={chefMenus}
              keyExtractor={(item) => item.item_id.toString()}
              renderItem={({ item }) => <FoodListItem item={item} />}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name='restaurant-outline' size={80} color='#ddd' />
                  <Text style={styles.emptyText}>No menu items available</Text>
                </View>
              }
              contentContainerStyle={styles.listContent}
              scrollEnabled={true}
              showsVerticalScrollIndicator={false}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#999999',
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 0,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  listContent: {
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButtonContainer: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  modalTitleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#100301',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    fontWeight: '400',
  },
})

export default Chefs
