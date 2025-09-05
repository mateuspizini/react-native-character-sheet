import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import CharacterListScreen from './src/screens/CharacterListScreen';
import EditCharacterScreen from './src/screens/EditCharacterScreen';
import CharacterDetailScreen from './src/screens/CharacterDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="CharacterList">
        <Stack.Screen
          name="CharacterList"
          component={CharacterListScreen}
          options={{ title: 'Minhas Fichas' }}
        />
        <Stack.Screen
          name="EditCharacter"
          component={EditCharacterScreen}
          options={{ title: 'Editar Ficha' }}
        />
        <Stack.Screen
          name="CharacterDetail"
          component={CharacterDetailScreen}
          options={{ title: 'Detalhes da Ficha' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
