import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import Splash from './screens/Splash';
import SignUpStartScreen from './screens/SignUp/SignUpStart';
import SignUpNameScreen from './screens/SignUp/SignUpName';
import SignUpEmailScreen from './screens/SignUp/SignUpEmail';
import SignUpPasswordScreen from './screens/SignUp/SignUpPassword';
import SignUpDOBGenderScreen from './screens/SignUp/SignUpDOBGender';
import NavigationBar from './components/NavigationBar';

const RootStack = createStackNavigator();
const AuthStack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{headerShown: false}}>
      <AuthStack.Screen name="SignUpStart" component={SignUpStartScreen} />
      <AuthStack.Screen name="SignUpName" component={SignUpNameScreen} />
      <AuthStack.Screen name="SignUpEmail" component={SignUpEmailScreen} />
      <AuthStack.Screen
        name="SignUpPassword"
        component={SignUpPasswordScreen}
      />
      <AuthStack.Screen
        name="SignUpDOBGender"
        component={SignUpDOBGenderScreen}
      />
    </AuthStack.Navigator>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 2초 후에 Splash 화면을 종료하고 메인 화면으로 이동
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <NavigationContainer>
      {isLoading ? (
        <Splash />
      ) : (
        <RootStack.Navigator screenOptions={{headerShown: false}}>
          {/* ✅ 회원가입 네비게이터 */}
          <RootStack.Screen name="Auth" component={AuthNavigator} />
          {/* ✅ 메인 네비게이션 */}
          <RootStack.Screen name="NavigationBar" component={NavigationBar} />
        </RootStack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default App;
