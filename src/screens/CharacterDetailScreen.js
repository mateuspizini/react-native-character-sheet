import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert, TextInput, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { loadCharacters } from '../store/storage';

function rollDie(sides) { return Math.floor(Math.random() * sides) + 1; }
function rollDice(count, sides, modifier = 0) {
  const rolls = Array.from({ length: count }, () => rollDie(sides));
  const sum = rolls.reduce((a, b) => a + b, 0) + modifier;
  return { rolls, modifier, total: sum };
}
function DiceRollerInline() {
  const [count, setCount] = useState('1');
  const [sides, setSides] = useState('20');
  const [modifier, setModifier] = useState('0');
  const [result, setResult] = useState(null);
  const handleRoll = () => {
    const c = Math.max(1, parseInt(count || '1', 10));
    const s = Math.max(2, parseInt(sides || '20', 10));
    const m = parseInt(modifier || '0', 10);
    setResult(rollDice(c, s, m));
  };
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Rolagem de Dados</Text>
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Qtd</Text>
          <TextInput style={styles.input} value={count} onChangeText={setCount} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Lados</Text>
          <TextInput style={styles.input} value={sides} onChangeText={setSides} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Mod</Text>
          <TextInput style={styles.input} value={modifier} onChangeText={setModifier} keyboardType="numeric" />
        </View>
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

export default function CharacterDetailScreen({ route, navigation }) {
  const { id, initial } = route.params || {};
  // usa imediatamente o initial
  const [character, setCharacter] = useState(initial ? withDefaults(initial) : null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await loadCharacters();
        const found = Array.isArray(list) ? list.find(c => c.id === id) : null;
        if (mounted && found) setCharacter(withDefaults(found));
      } catch {}
    })();
    return () => { mounted = false; };
  }, [id]);

  if (!character) return <View style={{ flex: 1 }} />;

  const copyJSON = async () => {
    try {
      const json = JSON.stringify(character, null, 2);
      await Clipboard.setStringAsync(json);
      if (Platform.OS === 'web') window.alert('JSON copiado!');
      else Alert.alert('Copiado!', 'JSON da ficha copiado.');
    } catch {
      if (Platform.OS === 'web') window.alert('Erro ao copiar.');
      else Alert.alert('Erro', 'Não foi possível copiar.');
    }
  };

  const A = character.attributes || {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.headerCard}>
        <Text style={styles.name}>{character.name || 'Sem Nome'}</Text>
        <Text style={styles.meta}>Nv. {character.level ?? 1} • {character.className || 'Classe'}</Text>
        <Text style={styles.metaSmall}>HP {(character.hp?.current ?? 10)}/{(character.hp?.max ?? 10)}</Text>
        <View style={{ marginTop: 8 }}>
          <Button title="Editar" onPress={() => navigation.navigate('EditCharacter', { id, initial: character })} />
          <View style={{ height: 8 }} />
          <Button title="Exportar JSON (copiar)" onPress={copyJSON} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Atributos</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {['STR','DEX','CON','INT','WIS','CHA'].map((k) => (
            <View key={k} style={styles.attrPill}>
              <Text style={styles.attrKey}>{k}</Text>
              <Text style={styles.attrVal}>{A[k] ?? '-'}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Notas</Text>
        <Text style={{ color: '#333' }}>{character.notes || 'Sem notas.'}</Text>
      </View>

      <DiceRollerInline />
    </ScrollView>
  );
}

function withDefaults(c) {
  const clone = JSON.parse(JSON.stringify(c));
  clone.attributes ??= { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 };
  clone.hp ??= { current: 10, max: 10 };
  clone.level ??= 1;
  clone.name ??= '';
  clone.className ??= '';
  clone.notes ??= '';
  return clone;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f6f8' },
  headerCard: {
    padding: 16, backgroundColor: '#fff', borderRadius: 12,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }
  },
  name: { fontSize: 22, fontWeight: '800' },
  meta: { marginTop: 4, color: '#333' },
  metaSmall: { marginTop: 2, color: '#666', fontSize: 12 },
  card: {
    padding: 16, backgroundColor: '#fff', borderRadius: 12,
    marginTop: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  attrPill: {
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20,
    borderWidth: 1, borderColor: '#eee', backgroundColor: '#fafafa',
    flexDirection: 'row', alignItems: 'center', marginRight: 8, marginBottom: 8
  },
  attrKey: { fontWeight: '700', marginRight: 6 },
  attrVal: { fontVariant: ['tabular-nums'] },
  row: { flexDirection: 'row', marginBottom: 8 },
  label: { fontSize: 12, color: '#444', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 10, backgroundColor: '#fff',
  },
});
