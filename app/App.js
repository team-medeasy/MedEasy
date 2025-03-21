import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import Splash from './screens/Splash';
import SignUpStartScreen from './screens/SignUp/SignUpStart';
import SignUpNameScreen from './screens/SignUp/SignUpName';
import SignUpEmailScreen from './screens/SignUp/SignUpEmail';
import SignUpPasswordScreen from './screens/SignUp/SignUpPassword';
import SignUpDOBGenderScreen from './screens/SignUp/SignUpDOBGender';
import SignInScreen from './screens/SignUp/SignIn';
import NavigationBar from './components/NavigationBar';
import SearchMedicineScreen from './screens/Search/SearchMedicine';
import SearchMedicineResultsScreen from './screens/Search/SearchMedicineResults';
import MedicineDetailScreen from './screens/Search/MedicineDetail';
import MedicineImageDetailScreen from './screens/Search/MedicineImageDetail';
import SettingStack from './screens/Settings/SettingStack';
import NotificationScreen from './screens/Notification';
import AddMedicineRoutineScreen from './screens/Routine/AddMedicineRoutine';
import AddHospitalVisitScreen from './screens/Routine/AddHospitalVisit';
//import SetMedicineRoutineScreen from './screens/Routine/SetMedicineRoutine';
import SetMedicineNameScreen from './screens/Routine/SetMedicineName';
import SetMedicineDayScreen from './screens/Routine/SetMedicineDay';
import SetMedicineTimeScreen from './screens/Routine/SetMedicineTime';
import SetMedicineDoseScreen from './screens/Routine/SetMedicineDose';
import SetMedicineTotalScreen from './screens/Routine/SetMedicineTotal';
import SetRoutineTimeScreen from './screens/Routine/SetRoutineTime';
import {SignUpProvider} from './api/context/SignUpContext';
import {FontSizeProvider} from './../assets/fonts/FontSizeContext';

const RootStack = createStackNavigator();
const AuthStack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{headerShown: false}}>
      <AuthStack.Screen name="SignUpStart" component={SignUpStartScreen} />
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
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
    <SignUpProvider>
      <FontSizeProvider>
        <NavigationContainer>
          {isLoading ? (
            <Splash />
          ) : (
            <RootStack.Navigator screenOptions={{headerShown: false}}>
              {/* 👥 회원가입 네비게이터 */}
              <RootStack.Screen name="Auth" component={AuthNavigator} />
              {/* 🔎 메인 네비게이션 */}
              <RootStack.Screen
                name="NavigationBar"
                component={NavigationBar}
              />

              {/* ⚙️ 설정 네비게이션 */}
              <RootStack.Screen name="SettingStack" component={SettingStack} />

              {/* 🖥️ 네비게이션바 없는 화면들 */}
              <RootStack.Screen
                name="SearchMedicine"
                component={SearchMedicineScreen}
              />
              <RootStack.Screen
                name="SearchMedicineResults"
                component={SearchMedicineResultsScreen}
              />
              <RootStack.Screen
                name="MedicineDetail"
                component={MedicineDetailScreen}
              />
              <RootStack.Screen
                name="MedicineImageDetail"
                component={MedicineImageDetailScreen}
              />
              <RootStack.Screen
                name="Notification"
                component={NotificationScreen}
              />
              <RootStack.Screen
                name="AddMedicineRoutine"
                component={AddMedicineRoutineScreen}
                options={{presentation: 'modal'}}
              />
              <RootStack.Screen
                name="AddHospitalVisit"
                component={AddHospitalVisitScreen}
                options={{presentation: 'modal'}}
              />
              {/* <RootStack.Screen
                name="SetMedicineRoutine"
                component={SetMedicineRoutineScreen}
                options={{presentation: 'modal'}}
              /> */}
              <RootStack.Screen
                name="SetMedicineName"
                component={SetMedicineNameScreen}
                options={{presentation: 'modal'}}
              />
              <RootStack.Screen
                name="SetMedicineDay"
                component={SetMedicineDayScreen}
                options={{presentation: 'modal'}}
              />
              <RootStack.Screen
                name="SetMedicineTime"
                component={SetMedicineTimeScreen}
                options={{presentation: 'modal'}}
              />
              <RootStack.Screen
                name="SetMedicineDose"
                component={SetMedicineDoseScreen}
                options={{presentation: 'modal'}}
              />
              <RootStack.Screen
                name="SetMedicineTotal"
                component={SetMedicineTotalScreen}
                options={{presentation: 'modal'}}
              />
              <RootStack.Screen
                name="SetRoutineTime"
                component={SetRoutineTimeScreen}
                options={{presentation: 'modal'}}
              />
            </RootStack.Navigator>
          )}
        </NavigationContainer>
      </FontSizeProvider>
    </SignUpProvider>
  );
};

export default App;
