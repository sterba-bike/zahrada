import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAppData } from '../context/AppDataContext';
import { colors } from '../components/ui';

import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import CreateGardenScreen from '../screens/onboarding/CreateGardenScreen';
import AddFirstBedScreen from '../screens/onboarding/AddFirstBedScreen';
import MainTabs from './MainTabs';
import RecordHarvestScreen from '../screens/RecordHarvestScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import AddJournalEntryScreen from '../screens/AddJournalEntryScreen';
import CompleteTaskScreen from '../screens/CompleteTaskScreen';
import DiagnosePhotoScreen from '../screens/DiagnosePhotoScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { loading, garden } = useAppData();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={garden ? 'Main' : 'Welcome'}
      screenOptions={{ headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateGarden" component={CreateGardenScreen} options={{ title: 'Založit zahradu' }} />
      <Stack.Screen name="AddFirstBed" component={AddFirstBedScreen} options={{ title: 'První záhon' }} />
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="RecordHarvest" component={RecordHarvestScreen} options={{ title: 'Zaznamenat sklizeň' }} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ title: 'Nový úkol' }} />
      <Stack.Screen name="AddJournalEntry" component={AddJournalEntryScreen} options={{ title: 'Nový záznam' }} />
      <Stack.Screen name="CompleteTask" component={CompleteTaskScreen} options={{ title: 'Splnit úkol' }} />
      <Stack.Screen
        name="DiagnosePhoto"
        component={DiagnosePhotoScreen}
        options={{ title: 'Rozpoznat chorobu/škůdce' }}
      />
    </Stack.Navigator>
  );
}
