import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { rollDice } from '../utils/dice';

export default function DiceRoller() {
  const [count, setCount] = useState('1');
  const [sides, setSides] = useState('20');
  const [modifier, setModifier] = useState('0');
  const [result, setResult] = useState(null);

  const handleRoll = () => {
    const c = Math.max(1, parseInt(count || '1', 10));
    const s = Math.max(2, parseInt(sides || '20', 10));
    const m = parseInt(modifier || '0', 10);
    const r = rollDice(c, s, m);
    setResult(r);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Rolagem de Dados</Text>
      <View style={styles.row}>
        <Input label="Qtd" value={count} onChangeText={setCount} keyboardType="numeric" />
        <Input label="Lados" value={sides} onChangeText={setSides} keyboardType="numeric" />
        <Input label="Mod" value={modifier} onChangeText={setModifier} keyboardType="numeric" />
      </View>
      <Button title="Rolar" onPress={handleRoll} />
      {result && (
        <View style={{ marginTop: 8 }}>
          <Text>Rolagens: {result.rolls.join(', ')}</Text>
          <Text>Total: {result.total}</Text>
        </View>
      )}
    </View>
  );
}

function Input({ label, ...props }) {
  return (
    <View style={{ flex: 1, marginRight: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    marginTop: 12,
  },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  label: { fontSize: 12, color: '#444' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
});
