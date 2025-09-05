// src/store/storage.js
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@character_sheet_list_v1';

// Carrega lista de fichas
export async function loadCharacters() {
  try {
    if (Platform.OS === 'web') {
      const raw = window.localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } else {
      const raw = await AsyncStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    }
  } catch (e) {
    console.error('[storage] load error:', e);
    return [];
  }
}

// Salva lista de fichas (lança erro se falhar)
export async function saveCharacters(list) {
  try {
    const safe = Array.isArray(list) ? list : [];
    const raw = JSON.stringify(safe);

    if (Platform.OS === 'web') {
      // localStorage é síncrono; se falhar (quota / privacidade) vai lançar aqui
      window.localStorage.setItem(KEY, raw);
    } else {
      await AsyncStorage.setItem(KEY, raw);
    }
  } catch (e) {
    console.error('[storage] save error:', e);
    // re-lança para o catch da tela capturar e mostrar o alerta
    throw e;
  }
}

// (opcional) apaga tudo
export async function clearAll() {
  try {
    if (Platform.OS === 'web') window.localStorage.removeItem(KEY);
    else await AsyncStorage.removeItem(KEY);
  } catch (e) {
    console.error('[storage] clear error:', e);
  }
}

