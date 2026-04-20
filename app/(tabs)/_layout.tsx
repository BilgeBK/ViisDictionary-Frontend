import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Translate',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="translate" color={color} />,
        }}
      />
      <Tabs.Screen
        name="word"
        options={{
          title: 'Word',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="text.quote" color={color} />,
        }}
      />
        <Tabs.Screen
            name="language"
            options={{
                title: 'Language',
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="character.bubble" color={color} />,
            }}
        />
    </Tabs>
  );
}
