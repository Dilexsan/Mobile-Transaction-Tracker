import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import TransactionItem from './TransactionItem';

const PersonCard = ({ person, onTransactionPress, onDeletePress, onToggleHistory, isHistoryVisible, transactions }) => {
  const balance = person.income - person.due;
  const balanceStyle = balance > 0 ? styles.balancePositive : balance < 0 ? styles.balanceNegative : styles.balanceNeutral;
  const balanceText = balance > 0 ? `You get: $${balance.toFixed(2)}` : balance < 0 ? `You owe: $${Math.abs(balance).toFixed(2)}` : 'Settled up';

  return (
    <View style={styles.card}>
      <View style={styles.personHeader}>
        <Text style={styles.personName}>{person.name}</Text>
        <TouchableOpacity onPress={() => onDeletePress(person.id, person.name)}>
          <Text style={styles.deleteBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.balanceText, balanceStyle]}>{balanceText}</Text>

      <View style={styles.totalsGroup}>
        <View style={styles.totalItem}>
          <Text style={styles.totalItemTitle}>Total Income</Text>
          <Text style={styles.totalIncomeAmount}>${person.income.toFixed(2)}</Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={styles.totalItemTitle}>Total Due</Text>
          <Text style={styles.totalDueAmount}>${person.due.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.btnGroup}>
        <TouchableOpacity style={[styles.btn, styles.btnIncome]} onPress={() => onTransactionPress(person.id, 'income')}>
          <Text style={styles.btnIncomeText}>+ Income</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnDue]} onPress={() => onTransactionPress(person.id, 'due')}>
          <Text style={styles.btnDueText}>+ Due</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.historyToggle} onPress={() => onToggleHistory(person.id)}>
        <Text style={styles.historyToggleText}>{isHistoryVisible ? 'Hide History' : 'Show History'}</Text>
      </TouchableOpacity>

      {isHistoryVisible && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Transaction History</Text>
          {transactions.length > 0 ? (
            transactions.map(item => <TransactionItem key={item.id} item={item} />)
          ) : <Text style={styles.emptyState}>No transactions yet.</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
 card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 3 },
    }),
  },
  personHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  personName: { fontSize: 22, fontWeight: 'bold', color: '#2d3748' },
  deleteBtn: { fontSize: 24, color: '#a0aec0', padding: 4 },
  balanceText: { fontSize: 18, fontWeight: '600', marginTop: 8, marginBottom: 16 },
  balancePositive: { color: '#38a169' },
  balanceNegative: { color: '#e53e3e' },
  balanceNeutral: { color: '#4a5568' },
  totalsGroup: { marginBottom: 16, gap: 12 },
  totalItem: {
    backgroundColor: '#f7fafc',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalItemTitle: { fontWeight: '500', color: '#4a5568'},
  totalIncomeAmount: { color: '#38a169', fontWeight: 'bold', fontSize: 16 },
  totalDueAmount: { color: '#e53e3e', fontWeight: 'bold', fontSize: 16 },
  btnGroup: { flexDirection: 'row', gap: 16 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  btnIncome: { backgroundColor: '#c6f6d5' },
  btnIncomeText: { color: '#2f855a', fontWeight: 'bold' },
  btnDue: { backgroundColor: '#fed7d7' },
  btnDueText: { color: '#c53030', fontWeight: 'bold' },
  historyToggle: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#edf2f7',
    paddingVertical: 10,
    marginTop: 16,
    borderRadius: 8,
  },
  historyToggleText: { color: '#4a5568', fontWeight: '600' },
  historyContainer: { borderTopWidth: 1, borderColor: '#e2e8f0', paddingTop: 12, marginTop: 12 },
  historyTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  emptyState: { textAlign: 'center', color: '#718096', paddingVertical: 20 },
});

export default PersonCard;
