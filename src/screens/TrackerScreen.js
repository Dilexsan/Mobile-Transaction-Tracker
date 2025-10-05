import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
  Keyboard,
  Platform,
} from 'react-native';
import { auth, db } from '../../firebaseConfig'; // Note the path change
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc, addDoc, query, getDocs, serverTimestamp } from 'firebase/firestore';

import PersonCard from '../components/PersonCard'; // Import component

const __app_id = 'default-app-id';

export default function TrackerScreen() {
  const [userId, setUserId] = useState(null);
  const [people, setPeople] = useState({});
  const [personName, setPersonName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState({ personId: null, type: null, amount: '' });
  const [visibleHistory, setVisibleHistory] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const authSubscriber = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        signInAnonymously(auth).catch(error => console.error("Anonymous sign-in failed:", error));
      }
    });
    return authSubscriber;
  }, []);

  useEffect(() => {
    if (!userId) return;
    const peopleCol = collection(db, `artifacts/${__app_id}/users/${userId}/people`);
    const unsub = onSnapshot(peopleCol, (snapshot) => {
      const peopleData = snapshot.docs.reduce((acc, doc) => ({ ...acc, [doc.id]: doc.data() }), {});
      const sortedPeople = Object.fromEntries(
        Object.entries(peopleData).sort(([, a], [, b]) => a.name.localeCompare(b.name))
      );
      setPeople(sortedPeople);
    });
    return unsub;
  }, [userId]);

  useEffect(() => {
    if (!userId || !visibleHistory) {
      setTransactions([]);
      return;
    }
    const transCol = collection(db, `artifacts/${__app_id}/users/${userId}/people/${visibleHistory}/transactions`);
    const unsub = onSnapshot(query(transCol), (snapshot) => {
      const transData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      transData.sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0));
      setTransactions(transData);
    });
    return unsub;
  }, [userId, visibleHistory]);

  const handleAddPerson = async () => {
    const name = personName.trim();
    if (!name || !userId) return;
    Keyboard.dismiss();
    const personId = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    await setDoc(doc(db, `artifacts/${__app_id}/users/${userId}/people`, personId), { id: personId, name, income: 0, due: 0 });
    setPersonName('');
  };

  const handleDeletePerson = (personId, personName) => {
    Alert.alert(`Delete ${personName}?`, `This will permanently delete ${personName} and all transactions.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const transCol = collection(db, `artifacts/${__app_id}/users/${userId}/people/${personId}/transactions`);
          const transSnapshot = await getDocs(transCol);
          await Promise.all(transSnapshot.docs.map(d => deleteDoc(d.ref)));
          await deleteDoc(doc(db, `artifacts/${__app_id}/users/${userId}/people`, personId));
        }
      }
    ]);
  };
  
  const handleOpenTransactionModal = (personId, type) => {
    setCurrentTransaction({ personId, type, amount: '' });
    setModalVisible(true);
  };

  const handleConfirmTransaction = async () => {
    const amount = parseFloat(currentTransaction.amount);
    if (isNaN(amount) || amount <= 0) return;
    const { personId, type } = currentTransaction;
    const newTotal = (people[personId][type] || 0) + amount;
    
    const personRef = doc(db, `artifacts/${__app_id}/users/${userId}/people`, personId);
    await updateDoc(personRef, { [type]: newTotal });
    
    const transCol = collection(db, `artifacts/${__app_id}/users/${userId}/people/${personId}/transactions`);
    await addDoc(transCol, { amount, type, timestamp: serverTimestamp() });
    
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.mainTitle}>Transaction Tracker</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.addPersonCard}>
          <TextInput
            style={styles.textInput}
            placeholder="Add a new person..."
            value={personName}
            onChangeText={setPersonName}
            onSubmitEditing={handleAddPerson}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddPerson}>
            <Text style={styles.addButtonText}>Add Person</Text>
          </TouchableOpacity>
        </View>

        {Object.values(people).map(person => (
          <PersonCard
            key={person.id}
            person={person}
            onTransactionPress={handleOpenTransactionModal}
            onDeletePress={handleDeletePerson}
            onToggleHistory={(id) => setVisibleHistory(prev => (prev === id ? null : id))}
            isHistoryVisible={visibleHistory === person.id}
            transactions={visibleHistory === person.id ? transactions : []}
          />
        ))}

        {Object.keys(people).length === 0 && (
           <View style={styles.card}>
            <Text style={styles.emptyState}>No people added yet.</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add {currentTransaction.type}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter amount"
              keyboardType="numeric"
              value={currentTransaction.amount}
              onChangeText={(val) => setCurrentTransaction(prev => ({ ...prev, amount: val }))}
              onSubmitEditing={handleConfirmTransaction}
              autoFocus
            />
            <View style={styles.btnGroup}>
              <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, currentTransaction.type === 'income' ? styles.btnIncome : styles.btnDue]} onPress={handleConfirmTransaction}>
                <Text style={currentTransaction.type === 'income' ? styles.btnIncomeText : styles.btnDueText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  mainTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#1a202c' },
  scrollContainer: { padding: 16 },
  addPersonCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 3 },
    }),
  },
  textInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#3182ce',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  emptyState: { textAlign: 'center', color: '#718096', paddingVertical: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: 'white', borderRadius: 12, padding: 24 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 8,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
  },
  btnGroup: { flexDirection: 'row', gap: 16 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  btnIncome: { backgroundColor: '#c6f6d5' },
  btnIncomeText: { color: '#2f855a', fontWeight: 'bold' },
  btnDue: { backgroundColor: '#fed7d7' },
  btnDueText: { color: '#c53030', fontWeight: 'bold' },
  btnSecondary: { backgroundColor: '#e2e8f0' },
  btnSecondaryText: { color: '#2d3748', fontWeight: 'bold' },
});
