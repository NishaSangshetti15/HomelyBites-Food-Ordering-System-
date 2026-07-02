import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native'
import { Ionicons } from '@react-native-vector-icons/ionicons'

function ChefCard({ chef, onPress }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: chef.profileImage || 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
        <View style={styles.ratingBadge}>
          <Ionicons name='star' size={14} color='white' />
          <Text style={styles.ratingText}>{chef.rating}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.chefName} numberOfLines={1}>{chef.name}</Text>
            <Text style={styles.specialty}>{chef.specialty}</Text>
          </View>
          <Ionicons name='chevron-forward' size={24} color='#ddd' />
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {chef.description}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <View style={styles.statIconContainer}>
              <Ionicons name='checkmark-circle' size={16} color='#f1b25d' />
            </View>
            <View>
              <Text style={styles.statNumber}>{chef.totalOrders}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <View style={styles.statIconContainer}>
              <Ionicons name='location' size={16} color='#f1b25d' />
            </View>
            <View>
              <Text style={styles.statNumber}>{chef.distance}km</Text>
              <Text style={styles.statLabel}>Away</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  imageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 110,
    height: 110,
    backgroundColor: '#f0f0f0',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#f1b25d',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    elevation: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  titleContainer: {
    flex: 1,
  },
  chefName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#100301',
    marginBottom: 2,
  },
  specialty: {
    fontSize: 12,
    color: '#f1b25d',
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginVertical: 6,
    lineHeight: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff5e6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#100301',
  },
  statLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#e8e8e8',
  },
})

export default ChefCard
