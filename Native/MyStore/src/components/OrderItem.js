import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import React, { useState } from 'react'

function OrderItem({ item }) {
  const [expanded, setExpanded] = useState(false)

  const getStatusColor = (status) => {
    const statusMap = {
      'Placed': '#FFA500',
      'Pending': '#FF9800',
      'Processing': '#2196F3',
      'Shipped': '#03A9F4',
      'Delivered': '#2E7D32',
      'Cancelled': '#D32F2F',
    }
    return statusMap[status] || '#999999'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const convertToNumber = (value) => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') return parseFloat(value) || 0
    return 0
  }

  const items = item['items'] || []

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setExpanded(!expanded)}
        style={styles.headerTouchable}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.orderIdContainer}>
              <Text style={styles.orderIdLabel}>Order ID</Text>
              <Text style={styles.orderId}>#{item['order_id']}</Text>
            </View>
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Order Date</Text>
              <Text style={styles.date}>{formatDate(item['order_date'] || item['odate'])}</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item['status']) }]}>
              <Text style={styles.statusText}>{item['status']}</Text>
            </View>
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Total</Text>
              <Text style={styles.amount}>${convertToNumber(item['total_amount']).toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.detailedContent}>
          <View style={styles.divider} />
          
          {items && items.length > 0 ? (
            <>
              <Text style={styles.itemsTitle}>Order Items</Text>
              {items.map((foodItem, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{foodItem['food_name'] || 'Unknown Item'}</Text>
                    <Text style={styles.itemQuantity}>Qty: {foodItem['quantity']}</Text>
                  </View>
                  <Text style={styles.itemPrice}>${convertToNumber(foodItem['price']).toFixed(2)}</Text>
                </View>
              ))}
            </>
          ) : (
            <Text style={styles.noItemsText}>No items in this order</Text>
          )}

          <View style={styles.divider} />

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${convertToNumber(item['total_amount']).toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Status</Text>
              <Text style={[styles.summaryValue, { color: getStatusColor(item['status']) }]}>
                {item['status']}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    margin: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  headerTouchable: {
    width: '100%',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  orderIdContainer: {
    marginBottom: 8,
  },
  orderIdLabel: {
    fontSize: 10,
    color: '#999999',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  dateContainer: {
    marginBottom: 6,
  },
  dateLabel: {
    fontSize: 10,
    color: '#999999',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  date: {
    fontSize: 12,
    color: '#555555',
    fontWeight: '500',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 10,
    color: '#999999',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
  },
  detailedContent: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
    marginLeft: 12,
  },
  noItemsText: {
    fontSize: 13,
    color: '#999999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  summaryContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    padding: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
})

export default OrderItem
