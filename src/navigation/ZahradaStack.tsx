import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ZahradaStackParamList } from './types';
import { colors } from '../components/ui';

import GardenDetailScreen from '../screens/GardenDetailScreen';
import BedDetailScreen from '../screens/BedDetailScreen';
import TreeDetailScreen from '../screens/TreeDetailScreen';
import AddBedScreen from '../screens/AddBedScreen';
import AddTreeScreen from '../screens/AddTreeScreen';
import AddPlantScreen from '../screens/AddPlantScreen';
import EditPlantScreen from '../screens/EditPlantScreen';
import JournalScreen from '../screens/JournalScreen';

const Stack = createNativeStackNavigator<ZahradaStackParamList>();

// Vlastní stack uvnitř záložky Zahrada - díky tomu zůstává spodní lišta
// (Domů, Zahrada, Kalendář, Eko, Profil) vidět i v detailu záhonu/stromu
// a jde kdykoli přeskočit rovnou jinam, ne jen krokovat zpátky šipkou.
export default function ZahradaStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text }}
    >
      <Stack.Screen name="GardenDetail" component={GardenDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BedDetail" component={BedDetailScreen} options={{ title: 'Detail záhonu' }} />
      <Stack.Screen name="TreeDetail" component={TreeDetailScreen} options={{ title: 'Detail stromu/keře' }} />
      <Stack.Screen name="AddBed" component={AddBedScreen} options={{ title: 'Nový záhon' }} />
      <Stack.Screen name="AddTree" component={AddTreeScreen} options={{ title: 'Nový strom/keř' }} />
      <Stack.Screen name="AddPlant" component={AddPlantScreen} options={{ title: 'Přidat rostlinu' }} />
      <Stack.Screen name="EditPlant" component={EditPlantScreen} options={{ title: 'Upravit rostlinu' }} />
      <Stack.Screen name="Journal" component={JournalScreen} options={{ title: 'Deník' }} />
    </Stack.Navigator>
  );
}
