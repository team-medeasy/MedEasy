// FCM
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';

import {Alert, Platform, PermissionsAndroid, Linking} from 'react-native';

import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

// Custom Hooks
import useFCMTokenRefresh from './hooks/useFCMTokenRefresh';

// FCM 토큰 저장 함수
import {setFCMToken} from './api/storage';

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
import SetMedicineRoutineScreen from './screens/Routine/SetMedicineRoutine';
import SetMedicineNameScreen from './screens/Routine/SetMedicineName';
import SetMedicineDayScreen from './screens/Routine/SetMedicineDay';
import SetMedicineTimeScreen from './screens/Routine/SetMedicineTime';
import SetMedicineDoseScreen from './screens/Routine/SetMedicineDose';
import SetMedicineTotalScreen from './screens/Routine/SetMedicineTotal';
import SetRoutineTimeScreen from './screens/Routine/SetRoutineTime';
import {SignUpProvider} from './api/context/SignUpContext';
import {FontSizeProvider} from './../assets/fonts/FontSizeContext';

import MedicineListScreen from './screens/Settings/MedicineList';

const RootStack = createStackNavigator();
const AuthStack = createStackNavigator();
const RoutineModalStack = createStackNavigator();

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

const RoutineModalNavigator = () => {
  return (
    <RoutineModalStack.Navigator screenOptions={{headerShown: false}}>
      <RoutineModalStack.Screen
        name="SetMedicineName"
        component={SetMedicineNameScreen}
      />
      <RoutineModalStack.Screen
        name="SetMedicineDay"
        component={SetMedicineDayScreen}
      />
      <RoutineModalStack.Screen
        name="SetMedicineTime"
        component={SetMedicineTimeScreen}
      />
      <RoutineModalStack.Screen
        name="SetMedicineDose"
        component={SetMedicineDoseScreen}
      />
      <RoutineModalStack.Screen
        name="SetMedicineTotal"
        component={SetMedicineTotalScreen}
      />
    </RoutineModalStack.Navigator>
  );
};

let fcmListenersRegistered = false;

const registerFCMListeners = () => {
  if (fcmListenersRegistered) return;
  fcmListenersRegistered = true;

  messaging().onMessage(async remoteMessage => {
    Alert.alert('📬 새 알림', remoteMessage.notification?.title || '알림이 도착했습니다.');
  });

  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('🔔 백그라운드에서 알림 열림:', remoteMessage);
  });

  messaging().getInitialNotification().then(remoteMessage => {
    if (remoteMessage) {
      console.log('🔔 종료 상태에서 알림 열림:', remoteMessage);
    }
  });
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  // FCM 토큰 갱신 훅
  useFCMTokenRefresh();

  const initializeFCM = async () => {
    try {
      console.log('🔔 FCM 초기화 시작');
  
      let permissionGranted = false;
  
      // 1. 권한 확인 및 요청
      if (Platform.OS === 'ios') {
        const currentStatus = await messaging().hasPermission();
        console.log('📋 iOS 현재 알림 권한 상태:', currentStatus);
  
        if (currentStatus === messaging.AuthorizationStatus.NOT_DETERMINED) {
          const authStatus = await messaging().requestPermission({
            alert: true,
            badge: true,
            sound: true,
          });
          console.log('📋 iOS 권한 요청 결과:', authStatus);
  
          if (authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
            permissionGranted = true;
          } else {
            showPermissionAlert();
            return;
          }
        } else if (currentStatus === messaging.AuthorizationStatus.AUTHORIZED || currentStatus === messaging.AuthorizationStatus.PROVISIONAL) {
          permissionGranted = true;
        } else {
          showPermissionAlert();
          return;
        }
  
      } else if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        console.log('📋 Android 권한 요청 결과:', granted);
  
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          permissionGranted = true;
        } else {
          showPermissionAlert();
          return;
        }
      } else {
        // Android 12 이하는 권한 요청 없음
        permissionGranted = true;
      }
  
      // 2. 권한이 허용된 경우에만 토큰 요청
      if (permissionGranted) {
        const token = await messaging().getToken();
        console.log('📱 발급받은 FCM 토큰:', token);
  
        if (token) {
          await setFCMToken(token);
          console.log('✅ FCM 토큰 저장 완료');
        } else {
          console.warn('⚠️ FCM 토큰이 비어 있음');
        }
  
        // 3. 수신 리스너 등록
        registerFCMListeners();
      }
    } catch (error) {
      console.error('🔴 FCM 초기화 오류:', error);
    }
  };

  const showPermissionAlert = () => {
    Alert.alert(
      '알림 권한이 꺼져 있습니다',
      '약 복용 알림을 받으시려면 설정에서 푸시 알림을 허용해주세요.',
      [
        { text: '나중에', style: 'cancel' },
        { text: '설정으로 이동', onPress: () => Linking.openSettings() },
      ]
    );
  };
  
  useEffect(() => {
    const startApp = async () => {
      try {
        await initializeFCM();
      } catch (error) {
        console.error('🔴 앱 시작 오류:', error);
      }
    };

    startApp();

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
              <RootStack.Screen
                name="SetMedicineRoutine"
                component={SetMedicineRoutineScreen}
                options={{presentation: 'modal'}}
              />
              <RootStack.Screen
                name="RoutineModal"
                component={RoutineModalNavigator}
                options={{presentation: 'modal'}}
              />
              <RootStack.Screen
                name="SetRoutineTime"
                component={SetRoutineTimeScreen}
                options={{presentation: 'modal'}}
              />
              <RootStack.Screen
                name="MedicineList"
                component={MedicineListScreen}
              />
            </RootStack.Navigator>
          )}
        </NavigationContainer>
      </FontSizeProvider>
    </SignUpProvider>
  );
};

export default App;
