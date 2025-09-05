import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, Button, Alert, Platform,
} from 'react-native';
import { loadCharacters, saveCharacters } from '../store/storage';

export default function EditCharacterScreen({ route, navigation }) {
  const { id, initial } = route.params || {};
  const [form, setForm] = useState(
    initial ? JSON.parse(JSON.stringify(withDefaults(initial))) : null
  );
  const [loadedFromStore, setLoadedFromStore] = useState(false);

  // sincroniza com o storage sem travar a UI
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await loadCharacters();
        const found = Array.isArray(list) ? list.find((c) => c.id === id) : null;
        if (mounted && found) setForm(JSON.parse(JSON.stringify(withDefaults(found))));
      } catch (e) {
        // mantém o initial se der erro
      } finally {
        if (mounted) setLoadedFromStore(true);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (!form) {
    return (
      <View style={[styles.container, { justifyContent:'center', alignItems:'center' }]}>
        <Text style={{ color:'#333', marginBottom: 12 }}>Não foi possível carregar a ficha.</Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const setField = (path, value) => {
    setForm(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let node = updated;
      for (let i = 0; i < keys.length - 1; i++) { node[keys[i]] ??= {}; node = node[keys[i]]; }
      node[keys[keys.length - 1]] = value;
      updated.updatedAt = Date.now();
      return updated;
    });
  };

  const numField = (path, fallback = 0) => (t) => {
    if (t === '') return setField(path, '');
    const n = parseInt(t, 10);
    setField(path, Number.isNaN(n) ? '' : n);
  };

  const toast = (msg) => {
    if (Platform.OS === 'web') { window.alert(msg); return; }
    Alert.alert(msg);
  };

  const save = async () => {
    try {
      const list = await loadCharacters();
      const arr = Array.isArray(list) ? list : [];
      const idx = arr.findIndex((c) => c.id === id);
      if (idx === -1) { toast('Ficha não encontrada para salvar.'); return; }

      const normalized = normalizeNumbers(form);
      arr[idx] = normalized;
      await saveCharacters(arr);
      toast('Ficha salva!');
      navigation.goBack();
    } catch (e) {
      toast('Não foi possível salvar a ficha.');
    }
  };

  const remove = async () => {
    const doRemove = async () => {
      try {
        const list = await loadCharacters();
        const arr = Array.isArray(list) ? list : [];
        const filtered = arr.filter((c) => c.id !== id);
        await saveCharacters(filtered);
        if (Platform.OS === 'web') window.alert('Ficha excluída.');
        else Alert.alert('Excluída');
        navigation.popToTop();
      } catch {
        toast('Não foi possível excluir.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Excluir esta ficha? Essa ação não pode ser desfeita.')) await doRemove();
      return;
    }
    Alert.alert('Excluir ficha?', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: doRemove },
    ]);
  };

  const A = form.attributes;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
      {!loadedFromStore && <Text style={{ color:'#999', marginBottom:8 }}>Sincronizando com o storage…</Text>}

      <Text style={styles.sectionTitle}>Geral</Text>
      <Field label="Nome"   value={form.name ?? ''}      onChangeText={(t) => setField('name', t)} />
      <Field label="Classe" value={form.className ?? ''} onChangeText={(t) => setField('className', t)} />
      <Field label="Nível"  keyboardType="numeric"
        value={form.level === '' || form.level == null ? '' : String(form.level)}
        onChangeText={numField('level', 1)} />

      <Text style={styles.sectionTitle}>Atributos</Text>
      <View style={styles.attrWrap}>
        {['STR','DEX','CON','INT','WIS','CHA'].map((k) => (
          <View key={k} style={styles.attrCell}>
            <Text style={styles.label}>{k}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={A[k] === '' || A[k] == null ? '' : String(A[k])}
              onChangeText={numField(`attributes.${k}`, 10)}
            />
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>HP</Text>
      <View style={styles.row}>
        <Field style={{ flex:1, marginRight:8 }} label="Atual"  keyboardType="numeric"
          value={form.hp?.current === '' || form.hp?.current == null ? '' : String(form.hp.current)}
          onChangeText={numField('hp.current', 0)} />
        <Field style={{ flex:1 }} label="Máximo" keyboardType="numeric"
          value={form.hp?.max === '' || form.hp?.max == null ? '' : String(form.hp.max)}
          onChangeText={numField('hp.max', 0)} />
      </View>

      <Text style={styles.sectionTitle}>Notas</Text>
      <TextInput
        style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
        multiline numberOfLines={6}
        placeholder="História, traços, magias..."
        value={form.notes ?? ''}
        onChangeText={(t) => setField('notes', t)}
      />

      <View style={{ marginTop: 16 }}>
        <Button title="Salvar" onPress={save} />
        <View style={{ height: 10 }} />
        <Button title="Excluir ficha" color="#b00020" onPress={remove} />
      </View>
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

function normalizeNumbers(f) {
  const numOr = (v, fallback) => (v === '' || Number.isNaN(Number(v)) ? fallback : Number(v));
  const out = JSON.parse(JSON.stringify(f));
  out.level = numOr(out.level, 1);
  out.hp.current = numOr(out.hp.current, 0);
  out.hp.max = numOr(out.hp.max, 0);
  for (const k of ['STR','DEX','CON','INT','WIS','CHA']) {
    out.attributes[k] = numOr(out.attributes[k], 10);
  }
  return out;
}

function Field({ label, style, ...props }) {
  return (
    <View style={[{ marginBottom: 12 }, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} autoCapitalize="none" {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f6f8' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 8, marginBottom: 8 },
  label: { fontSize: 12, color: '#444', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 12, android: 10, default: 10 }),
    borderRadius: 10, backgroundColor: '#fff',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  attrWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  attrCell: { width: '48%', marginBottom: 10 },
});
