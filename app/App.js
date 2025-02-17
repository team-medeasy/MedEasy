import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Splash from './screens/Splash';
import SignUpStartScreen from './screens/SignUp/SignUpStart';
import SignUpNameScreen from './screens/SignUp/SignUpName';
import SignUpEmailScreen from './screens/SignUp/SignUpEmail';
import SignUpPasswordScreen from './screens/SignUp/SignUpPassword';
import SignUpDOBGenderScreen from './screens/SignUp/SignUpDOBGender';
import NavigationBar from './components/NavigationBar';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={Splash}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="NavigationBar"
          component={NavigationBar}
          options={{headerShown: false}}
        />
        {/* 회원가입 관련 화면 */}
        <Stack.Screen
          name="SignUpStart"
          component={SignUpStartScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SignUpName"
          component={SignUpNameScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SignUpEmail"
          component={SignUpEmailScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SignUpPassword"
          component={SignUpPasswordScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SignUpDOBGender"
          component={SignUpDOBGenderScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
