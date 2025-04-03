import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

// FCM
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import {Alert, Platform, PermissionsAndroid} from 'react-native';

// FCM 토큰 저장 함수
import {setFCMToken} from './api/storage';

// Firebase
import { initializeApp, getApps } from '@react-native-firebase/app';

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
    <RoutineModalStack.Navigator screenOptions={{ headerShown: false }}>
      <RoutineModalStack.Screen name="SetMedicineName" component={SetMedicineNameScreen} />
      <RoutineModalStack.Screen name="SetMedicineDay" component={SetMedicineDayScreen} />
      <RoutineModalStack.Screen name="SetMedicineTime" component={SetMedicineTimeScreen} />
      <RoutineModalStack.Screen name="SetMedicineDose" component={SetMedicineDoseScreen} />
      <RoutineModalStack.Screen name="SetMedicineTotal" component={SetMedicineTotalScreen} />
    </RoutineModalStack.Navigator>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  const initializeFCM = async () => {
    try {
      console.log('🔔 FCM 초기화 시작');
  
      // iOS의 경우 반드시 순서대로 진행
      if (Platform.OS === 'ios') {
        // 1. 원격 메시지 등록
        await messaging().registerDeviceForRemoteMessages();
        console.log('✅ 원격 메시지 등록 완료');
        
        // 2. 권한 요청 (옵션 변경)
        const authStatus = await messaging().requestPermission({
          provisional: true, // 임시 알림 허용 (중요)
          sound: true,
          badge: true,
          alert: true,
        });
        
        console.log('📋 알림 권한 상태:', authStatus);
        
        // 3. 권한 상태 확인
        if (authStatus !== messaging.AuthorizationStatus.AUTHORIZED && 
            authStatus !== messaging.AuthorizationStatus.PROVISIONAL) {
          console.log('⚠️ 사용자가 알림 권한을 거부했습니다');
          Alert.alert('알림 권한이 꺼져 있습니다', '설정에서 푸시 알림을 허용해주세요.');
          return;
        }
      } else if (Platform.OS === 'android' && Platform.Version >= 33) {
        // Android 13+ 권한 요청 (그대로 유지)
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        
        console.log('📱 Android 권한 요청 결과:', granted);
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('알림 권한이 꺼져 있습니다', '설정에서 푸시 알림을 허용해주세요.');
        }
      }
      
      // 4. 마지막으로 토큰 요청 (권한 확인 후)
      const token = await messaging().getToken();
      console.log('📱 발급받은 FCM Token:', token);
      
      if (token) {
        await setFCMToken(token);
        console.log('✅ FCM 토큰 저장 완료');
      } else {
        console.warn('⚠️ FCM 토큰이 비어 있음');
      }
      
      // 5. 메시지 수신 확인 (그대로 유지)
      messaging().onMessage(async remoteMessage => {
        Alert.alert('📬 새 알림', remoteMessage.notification?.title || '알림이 도착했습니다.');
      });
      
      // 6. 추가 리스너 (디버깅용)
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('🔔 백그라운드에서 알림이 열림:', remoteMessage);
      });
  
      messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage) {
          console.log('🔔 앱 종료 상태에서 알림이 열림:', remoteMessage);
        }
      });
      
    } catch (error) {
      console.error('🔴 FCM 초기화 오류:', error);
    }
  };

  const firebaseConfig = {
    apiKey: "AIzaSyD_PMFvwPN4fdyAucCbEb2rHA0SXsaLrpM",
    authDomain: "medeasy-64a51.firebaseapp.com",
    databaseURL: "https://medeasy-64a51-default-rtdb.firebaseio.com", // 의미 없음. 실제 사용하지 않음
    projectId: "medeasy-64a51",
    storageBucket: "medeasy-64a51.appspot.com", // 의미 없음. 실제 사용하지 않음
    messagingSenderId: "570714556248",
    appId: "1:570714556248:ios:9a5012774f8f3a207d872d"
  };

  useEffect(() => {
    const initializeAppAndFCM = async () => {
      try {
        // Firebase 초기화 확인
        if (getApps().length === 0) {
          await initializeApp(firebaseConfig);
          console.log('✅ Firebase 초기화 완료');
        }
        
        // 초기화 후 바로 FCM 설정 (setTimeout 제거)
        await initializeFCM();
        
        // 디버깅 정보 로깅 추가
        console.log('📱 Firebase 앱 목록:', getApps().map(app => app.name));
      } catch (error) {
        console.error('🔴 초기화 오류:', error);
      }
    };
  
    // 즉시 호출
    initializeAppAndFCM();
    
    // 스플래시 화면은 별도 타이머로 관리
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
