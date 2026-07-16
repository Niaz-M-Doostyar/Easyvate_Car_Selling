import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import PublicCarsScreen from '../screens/PublicCarsScreen';
import PublicAboutScreen from '../screens/PublicAboutScreen';
import PublicContactScreen from '../screens/PublicContactScreen';
import { useAppTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const Tab = createBottomTabNavigator();

export default function PublicTabNavigator() {
  const { paperTheme, isDark } = useAppTheme();
  const c = paperTheme.colors;
  const { t, fontFamily, isRTL } = useLanguage();
  const screens = [
    { name: 'Home', component: HomeScreen },
    { name: 'Cars', component: PublicCarsScreen },
    { name: 'About', component: PublicAboutScreen },
    { name: 'Contact', component: PublicContactScreen },
  ];
  const orderedScreens = isRTL ? [...screens].reverse() : screens;

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#c8963e',
        tabBarInactiveTintColor: isDark ? '#888' : '#aaa',
        tabBarStyle: {
          backgroundColor: isDark ? c.surface : '#fff',
          borderTopColor: isDark ? c.border : '#eee',
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr' },
        tabBarLabel: t(route.name),
        tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Cars: focused ? 'car' : 'car-outline',
            About: focused ? 'information' : 'information-outline',
            Contact: focused ? 'phone' : 'phone-outline',
          };
          return <MaterialCommunityIcons name={icons[route.name] || 'circle'} size={size} color={color} />;
        },
      })}
    >
      {orderedScreens.map(screen => <Tab.Screen key={screen.name} name={screen.name} component={screen.component} />)}
    </Tab.Navigator>
  );
}
