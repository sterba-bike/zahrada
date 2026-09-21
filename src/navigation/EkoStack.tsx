import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EkoStackParamList } from './types';
import { colors } from '../components/ui';

import EkoScreen from '../screens/EkoScreen';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';

const Stack = createNativeStackNavigator<EkoStackParamList>();

// Vlastní stack uvnitř záložky Eko - stejný důvod jako u Zahrady: spodní
// lišta zůstane vidět i při čtení článku.
export default function EkoStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text }}
    >
      <Stack.Screen name="EkoHome" component={EkoScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} options={{ title: 'Článek' }} />
    </Stack.Navigator>
  );
}
