import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Profile from './Profile';
import Notification from './Notification';
import FontSize from './FontSize';
import Favorites from './Favorites';
import Announcements from './Announcements';
import FAQ from './FAQ';

const Stack = createStackNavigator();

const SettingStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Notification" component={Notification} />
      <Stack.Screen name="FontSize" component={FontSize} />
      <Stack.Screen name="Favorites" component={Favorites} />
      <Stack.Screen name="Announcements" component={Announcements} />
      <Stack.Screen name="FAQ" component={FAQ} />
    </Stack.Navigator>
  );
};

export default SettingStack;
