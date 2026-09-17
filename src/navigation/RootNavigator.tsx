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
import BedDetailScreen from '../screens/BedDetailScreen';
import TreeDetailScreen from '../screens/TreeDetailScreen';
import AddBedScreen from '../screens/AddBedScreen';
import AddTreeScreen from '../screens/AddTreeScreen';
import AddPlantScreen from '../screens/AddPlantScreen';
import RecordHarvestScreen from '../screens/RecordHarvestScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import JournalScreen from '../screens/JournalScreen';
import AddJournalEntryScreen from '../screens/AddJournalEntryScreen';
import CompleteTaskScreen from '../screens/CompleteTaskScreen';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';

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
      <Stack.Screen name="BedDetail" component={BedDetailScreen} options={{ title: 'Detail záhonu' }} />
      <Stack.Screen name="TreeDetail" component={TreeDetailScreen} options={{ title: 'Detail stromu/keře' }} />
      <Stack.Screen name="AddBed" component={AddBedScreen} options={{ title: 'Nový záhon' }} />
      <Stack.Screen name="AddTree" component={AddTreeScreen} options={{ title: 'Nový strom/keř' }} />
      <Stack.Screen name="AddPlant" component={AddPlantScreen} options={{ title: 'Přidat rostlinu' }} />
      <Stack.Screen name="RecordHarvest" component={RecordHarvestScreen} options={{ title: 'Zaznamenat sklizeň' }} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ title: 'Nový úkol' }} />
      <Stack.Screen name="Journal" component={JournalScreen} options={{ title: 'Deník' }} />
      <Stack.Screen name="AddJournalEntry" component={AddJournalEntryScreen} options={{ title: 'Nový záznam' }} />
      <Stack.Screen name="CompleteTask" component={CompleteTaskScreen} options={{ title: 'Splnit úkol' }} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} options={{ title: 'Článek' }} />
    </Stack.Navigator>
  );
}
