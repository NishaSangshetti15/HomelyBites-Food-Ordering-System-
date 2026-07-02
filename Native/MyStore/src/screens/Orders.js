import { FlatList, StyleSheet, View, Text, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import OrderItem from '../components/OrderItem'
import { getOrders } from '../services/order'

function Orders() {
  const [items, setItems] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadOrders = async () => {
    try {
      const result = await getOrders()
      if (result && result['status'] == 'success') {
        const orders = result['data'] || []
        console.log('Orders loaded:', orders)
        setItems(orders)
      } else if (result && result['error']) {
        console.error('Error loading orders:', result['error'])
        setItems([])
      } else {
        console.error('Failed to load orders')
        setItems([])
      }
    } catch (error) {
      console.error('Error in loadOrders:', error)
      setItems([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Load orders when screen is focused (comes into view)
  useFocusEffect(
    React.useCallback(() => {
      loadOrders()
    }, [])
  )

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={styles.emptyTitle}>
        {loading ? 'Loading orders...' : 'No Orders Yet'}
      </Text>
      <Text style={styles.emptyDescription}>
        {loading 
          ? 'Getting your orders...' 
          : 'You haven\'t placed any orders yet. Start exploring!'}
      </Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSubtitle}>
          {items.length > 0 ? `${items.length} order${items.length !== 1 ? 's' : ''}` : ''}
        </Text>
      </View>

      {items.length == 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true)
                loadOrders()
              }}
              colors={['#27AE60']}
              tintColor="#27AE60"
            />
          }
          data={items}
          keyExtractor={(item) => item.order_id?.toString() || Math.random().toString()}
          renderItem={({ item }) => <OrderItem item={item} />}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#999999',
    fontWeight: '500',
  },
  listContent: {
    padding: 0,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
})

export default Orders
