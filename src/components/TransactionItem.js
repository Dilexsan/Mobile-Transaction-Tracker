import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TransactionItem = ({ item }) => {
  const formatDate = (timestamp) => timestamp ? new Date(timestamp.seconds * 1000).toLocaleString() : 'pending...';
  const isIncome = item.type === 'income';

  return (
    <View style={[styles.historyItem, isIncome ? styles.historyItemIncome : styles.historyItemDue]}>
      <Text style={isIncome ? styles.historyAmountIncome : styles.historyAmountDue}>
        {isIncome ? '+' : '-'} ${item.amount.toFixed(2)}
      </Text>
      <Text style={styles.historyTimestamp}>{formatDate(item.timestamp)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  historyItemIncome: { backgroundColor: '#ebf8f1' },
  historyItemDue: { backgroundColor: '#fff5f5' },
  historyAmountIncome: { fontWeight: 'bold', color: '#38a169' },
  historyAmountDue: { fontWeight: 'bold', color: '#c53030' },
  historyTimestamp: { fontSize: 13, color: '#718096' },
});

export default TransactionItem;
