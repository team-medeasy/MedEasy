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
import SearchMedicineScreen from './screens/Search/SearchMedicine';
import SearchMedicineResultsScreen from './screens/Search/SearchMedicineResults';
import {FontSizeProvider} from './../assets/fonts/FontSizeContext';

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
    <FontSizeProvider>
      <NavigationContainer>
        {isLoading ? (
          <Splash />
        ) : (
          <RootStack.Navigator screenOptions={{headerShown: false}}>
            {/* 👥 회원가입 네비게이터 */}
            <RootStack.Screen name="Auth" component={AuthNavigator} />
            {/* 🔎 메인 네비게이션 */}
            <RootStack.Screen name="NavigationBar" component={NavigationBar} />

            {/* 🖥️ 네비게이션바 없는 화면들 */}
            <RootStack.Screen
              name="SearchMedicine"
              component={SearchMedicineScreen}
            />
            <RootStack.Screen
              name="SearchMedicineResults"
              component={SearchMedicineResultsScreen}
            />
          </RootStack.Navigator>
        )}
      </NavigationContainer>
    </FontSizeProvider>
  );
};

export default App;
