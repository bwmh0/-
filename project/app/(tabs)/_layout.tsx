import { Tabs } from 'expo-router';
import { Trophy, Users, Settings, Plus } from 'lucide-react-native';
import { I18nManager } from 'react-native';

// Force RTL layout
I18nManager.forceRTL(true);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1e40af',
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#fbbf24',
        tabBarInactiveTintColor: '#93c5fd',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ size, color }) => (
            <Trophy size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="game"
        options={{
          title: 'اللعبة',
          tabBarIcon: ({ size, color }) => (
            <Users size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'الإدارة',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="questions"
        options={{
          title: 'الأسئلة',
          tabBarIcon: ({ size, color }) => (
            <Plus size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}