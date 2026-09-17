import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { colors } from '../components/ui';
import HomeScreen from '../screens/HomeScreen';
import GardenDetailScreen from '../screens/GardenDetailScreen';
import CalendarScreen from '../screens/CalendarScreen';
import EkoScreen from '../screens/EkoScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, string> = {
  'Domů': '🏠',
  'Zahrada': '🌱',
  'Kalendář': '📅',
  'Eko': '🍃',
  'Profil': '👤',
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>{ICONS[route.name as keyof MainTabParamList]}</Text>,
      })}
    >
      <Tab.Screen name="Domů" component={HomeScreen} />
      <Tab.Screen name="Zahrada" component={GardenDetailScreen} />
      <Tab.Screen name="Kalendář" component={CalendarScreen} />
      <Tab.Screen name="Eko" component={EkoScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
