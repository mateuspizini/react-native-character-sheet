import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Alert, Platform } from 'react-native';
import { loadCharacters, saveCharacters } from '../store/storage';
import { useFocusEffect } from '@react-navigation/native';

function genId() {
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function CharacterListScreen({ navigation }) {
  const [characters, setCharacters] = useState([]);

  const refresh = async () => {
    const data = await loadCharacters();
    setCharacters(Array.isArray(data) ? data : []);
  };

  useFocusEffect(useCallback(() => { refresh(); }, []));

  const defaultCharacter = (id) => ({
    id,
    name: '',
    className: '',
    level: 1,
    attributes: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
    hp: { current: 10, max: 10 },
    notes: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const createNew = async () => {
    const id = genId();
    const draft = defaultCharacter(id);
    const updated = [draft, ...characters];
    setCharacters(updated);
    await saveCharacters(updated);
    // >> ENVIA também o objeto 'draft' pra tela
    navigation.navigate('EditCharacter', { id, initial: draft });
  };

  const removeAll = async () => {
    if (Platform.OS === 'web') {
      if (!window.confirm('Isso apagará todas as fichas. Confirmar?')) return;
      setCharacters([]); await saveCharacters([]); return;
    }
    Alert.alert('Limpar tudo?', 'Isso apagará todas as fichas.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: async () => { setCharacters([]); await saveCharacters([]); } }
    ]);
  };

  const removeOne = async (id) => {
    const doRemove = async () => {
      const updated = characters.filter(c => c.id !== id);
      setCharacters(updated);
      await saveCharacters(updated);
    };
    if (Platform.OS === 'web') { if (window.confirm('Excluir esta ficha?')) await doRemove(); return; }
    Alert.alert('Excluir ficha?', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: doRemove },
    ]);
  };

  const goDetail = (item) => navigation.navigate('CharacterDetail', { id: item.id, initial: item });
  const goEdit   = (item) => navigation.navigate('EditCharacter',    { id: item.id, initial: item });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Minhas Fichas</Text>
        <Button title="Nova Ficha" onPress={createNew} />
      </View>

      <FlatList
        data={characters}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity onPress={() => goDetail(item)} activeOpacity={0.8}>
              <Text style={styles.name}>{item.name || 'Sem Nome'}</Text>
              <Text style={styles.meta}>Nv. {item.level ?? 1} • {item.className || 'Classe'}</Text>
              <Text style={styles.metaSmall}>HP {(item.hp?.current ?? 10)}/{(item.hp?.max ?? 10)}</Text>
            </TouchableOpacity>

            <View style={styles.actions}>
              <Button title="Abrir"  onPress={() => goDetail(item)} />
              <Button title="Editar" onPress={() => goEdit(item)} />
              <Button title="Apagar" color="#b00020" onPress={() => removeOne(item.id)} />
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<Text style={{ color: '#666' }}>Nenhuma ficha ainda. Toque em "Nova Ficha".</Text>}
        contentContainerStyle={{ paddingVertical: 12 }}
      />

      {characters.length > 0 && (
        <View style={{ marginTop: 8 }}>
          <Button title="Apagar todas" color="#b00020" onPress={removeAll} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f6f8' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  card: {
    backgroundColor: '#fff', padding: 14, borderRadius: 12, elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  name: { fontSize: 18, fontWeight: '600' },
  meta: { marginTop: 4, color: '#333' },
  metaSmall: { marginTop: 2, color: '#666', fontSize: 12 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 8 },
});
