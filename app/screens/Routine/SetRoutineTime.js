import React, {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import {View, TouchableOpacity, Alert} from 'react-native';
import {themes} from './../../styles';
import {ModalHeader, Button, DateTimePickerModal} from '../../components';
import FontSizes from '../../../assets/fonts/fontSizes';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';
import {RoutineIcons} from '../../../assets/icons';
import {useNavigation} from '@react-navigation/native';

import { useSignUp } from '../../api/context/SignUpContext';
import { getUser, getUserSchedule } from '../../api/user';
import { updateUserSchedule } from '../../api/user';

const {
  moon: MoonIcon,
  sun: SunIcon,
  cup: CupIcon,
  homeRoutine: HomeRoutineIcon,
} = RoutineIcons;

const TimeSettingItem = ({icon, title, time, onPress, fontSizeMode}) => {
  return (
    <View style={{gap: 15}}>
      <IconTextContainer>
        {icon}
        <TimeSettingText fontSizeMode={fontSizeMode}>{title}</TimeSettingText>
      </IconTextContainer>
      <TimeButton onPress={onPress}>
        <TimeButtonText fontSizeMode={fontSizeMode}>{time}</TimeButtonText>
      </TimeButton>
    </View>
  );
};

const SetRoutineTime = () => {
  const {signUpData} = useSignUp();
  const navigation = useNavigation();
  const {fontSizeMode} = useFontSize();

  const [userName, setUserName] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [currentSettingType, setCurrentSettingType] = useState('');
  
  // 시간 상태 초기값 설정
  const [breakfastTime, setBreakfastTime] = useState('');
  const [lunchTime, setLunchTime] = useState('');
  const [dinnerTime, setDinnerTime] = useState('');
  const [bedTime, setBedTime] = useState('');
  
  // 날짜 객체 저장 (API 요청을 위한 원본 시간 값)
  const [breakfastDate, setBreakfastDate] = useState(null);
  const [lunchDate, setLunchDate] = useState(null);
  const [dinnerDate, setDinnerDate] = useState(null);
  const [bedDate, setBedDate] = useState(null);
  
  // 일정 데이터 저장
  const [scheduleData, setScheduleData] = useState({
    morning: { id: null, name: '아침 식사' },
    lunch: { id: null, name: '점심 식사' },
    dinner: { id: null, name: '저녁 식사' },
    bedtime: { id: null, name: '취침 시간' }
  });

  // API에서 받아온 시간을 파싱하는 함수
  const parseApiTime = (timeString) => {
    if (!timeString) return null;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // API 요청을 위한 시간 포맷 (HH:MM:SS)
  const formatTimeForApi = (date) => {
    if (!date) return null;
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}:00`;
  };

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await getUser();
        const userData = response.data.body;
        setUserName(userData.name || '');
      } catch (error) {
        console.error('유저 이름 가져오기 실패:', error);
      }
    };
  
    fetchUserName();
  }, []);

  // 컴포넌트 마운트 시 사용자 일정 가져오기
  useEffect(() => {
    const fetchUserSchedule = async () => {
      try {
        const getData = await getUserSchedule();
        const responseData = getData.data;
        console.log('사용자 일정 데이터:', responseData);
        
        // API에서 받아온 시간으로 디폴트 시간 설정
        if (responseData && responseData.body && Array.isArray(responseData.body)) {
          // 배열 위치 기반으로 일정 데이터 가져오기 (순서가 일정하다고 가정)
          const schedules = responseData.body;
          
          // 순서 기반 매핑 (아침, 점심, 저녁, 취침)
          const morningSchedule = schedules[0]; // 첫 번째 일정은 아침
          const lunchSchedule = schedules[1];   // 두 번째 일정은 점심
          const dinnerSchedule = schedules[2];  // 세 번째 일정은 저녁
          const bedtimeSchedule = schedules[3]; // 네 번째 일정은 취침
          
          // 일정 데이터 저장 (ID와 이름)
          const newScheduleData = {
            morning: {
              id: morningSchedule?.user_schedule_id || null,
              name: morningSchedule?.name || '아침 식사'
            },
            lunch: {
              id: lunchSchedule?.user_schedule_id || null,
              name: lunchSchedule?.name || '점심 식사'
            },
            dinner: {
              id: dinnerSchedule?.user_schedule_id || null,
              name: dinnerSchedule?.name || '저녁 식사'
            },
            bedtime: {
              id: bedtimeSchedule?.user_schedule_id || null,
              name: bedtimeSchedule?.name || '취침 시간'
            }
          };
          
          setScheduleData(newScheduleData);
          
          console.log('일정 데이터:', newScheduleData);
          
          // 시간 설정
          if (morningSchedule) {
            const parsedDate = parseApiTime(morningSchedule.take_time);
            if (parsedDate) {
              setBreakfastDate(parsedDate);
              setBreakfastTime(formatTime(parsedDate));
            }
          }
          
          if (lunchSchedule) {
            const parsedDate = parseApiTime(lunchSchedule.take_time);
            if (parsedDate) {
              setLunchDate(parsedDate);
              setLunchTime(formatTime(parsedDate));
            }
          }
          
          if (dinnerSchedule) {
            const parsedDate = parseApiTime(dinnerSchedule.take_time);
            if (parsedDate) {
              setDinnerDate(parsedDate);
              setDinnerTime(formatTime(parsedDate));
            }
          }
          
          if (bedtimeSchedule) {
            const parsedDate = parseApiTime(bedtimeSchedule.take_time);
            if (parsedDate) {
              setBedDate(parsedDate);
              setBedTime(formatTime(parsedDate));
            }
          }
        }
      } catch (error) {
        console.error('사용자 일정 가져오기 실패:', error);
        // API 호출 실패 시 디폴트 시간 설정
        setDefaultTimes();
      }
    };

    fetchUserSchedule();
  }, []);

  // 시간 설정 후 서버로 보내는 함수
  const sendDataToServer = async () => {
    try {
      const updatePromises = [];
      
      // 아침 식사 업데이트
      if (scheduleData.morning.id && breakfastDate) {
        const breakfastData = {
          user_schedule_id: scheduleData.morning.id,
          schedule_name: scheduleData.morning.name,
          take_time: formatTimeForApi(breakfastDate)
        };
        updatePromises.push(updateUserSchedule(breakfastData));
      }
      
      // 점심 식사 업데이트
      if (scheduleData.lunch.id && lunchDate) {
        const lunchData = {
          user_schedule_id: scheduleData.lunch.id,
          schedule_name: scheduleData.lunch.name,
          take_time: formatTimeForApi(lunchDate)
        };
        updatePromises.push(updateUserSchedule(lunchData));
      }
      
      // 저녁 식사 업데이트
      if (scheduleData.dinner.id && dinnerDate) {
        const dinnerData = {
          user_schedule_id: scheduleData.dinner.id,
          schedule_name: scheduleData.dinner.name,
          take_time: formatTimeForApi(dinnerDate)
        };
        updatePromises.push(updateUserSchedule(dinnerData));
      }
      
      // 취침 시간 업데이트
      if (scheduleData.bedtime.id && bedDate) {
        const bedtimeData = {
          user_schedule_id: scheduleData.bedtime.id,
          schedule_name: scheduleData.bedtime.name,
          take_time: formatTimeForApi(bedDate)
        };
        updatePromises.push(updateUserSchedule(bedtimeData));
      }
      
      // Promise.all을 사용하여 모든 업데이트 요청을 병렬로 처리
      if (updatePromises.length > 0) {
        const results = await Promise.all(updatePromises);
        console.log('업데이트 결과:', results);
        //Alert.alert('알림', '루틴 시간이 저장되었습니다.');
        
        navigation.goBack();
      } else {
        Alert.alert('알림', '업데이트할 루틴이 없습니다.');
      }
      
    } catch (error) {
      console.error('데이터 저장 중 오류:', error);
      Alert.alert('오류', '루틴 시간 저장에 실패했습니다.');
    }
  };
    
  const formatTime = date => {
    if (!date) return '';
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${ampm} ${formattedHours}시 ${formattedMinutes}분`;
  };

  // API 호출 실패 또는 데이터가 없을 경우 디폴트 시간 설정
  const setDefaultTimes = () => {
    const defaultBreakfastTime = new Date();
    defaultBreakfastTime.setHours(8, 0, 0, 0);

    const defaultLunchTime = new Date();
    defaultLunchTime.setHours(12, 0, 0, 0);

    const defaultDinnerTime = new Date();
    defaultDinnerTime.setHours(18, 0, 0, 0);

    const defaultBedTime = new Date();
    defaultBedTime.setHours(22, 0, 0, 0);

    setBreakfastDate(defaultBreakfastTime);
    setLunchDate(defaultLunchTime);
    setDinnerDate(defaultDinnerTime);
    setBedDate(defaultBedTime);

    setBreakfastTime(formatTime(defaultBreakfastTime));
    setLunchTime(formatTime(defaultLunchTime));
    setDinnerTime(formatTime(defaultDinnerTime));
    setBedTime(formatTime(defaultBedTime));
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || new Date();
    setSelectedTime(currentTime);
  };

  const openTimePicker = type => {
    // 시간 선택기를 열 때 현재 설정된 시간으로 초기화
    let initialTime;
    
    // 설정된 시간이 있으면 사용, 없으면 디폴트 설정
    switch (type) {
      case '아침식사':
        initialTime = breakfastDate ? new Date(breakfastDate) : new Date();
        if (!breakfastDate) initialTime.setHours(8, 0, 0, 0);
        break;
      case '점심식사':
        initialTime = lunchDate ? new Date(lunchDate) : new Date();
        if (!lunchDate) initialTime.setHours(12, 0, 0, 0);
        break;
      case '저녁식사':
        initialTime = dinnerDate ? new Date(dinnerDate) : new Date();
        if (!dinnerDate) initialTime.setHours(18, 0, 0, 0);
        break;
      case '취침시간':
        initialTime = bedDate ? new Date(bedDate) : new Date();
        if (!bedDate) initialTime.setHours(22, 0, 0, 0);
        break;
      default:
        initialTime = new Date();
    }
    
    setSelectedTime(initialTime);
    setCurrentSettingType(type);
    setShowTimePicker(true);
  };

  const handleConfirm = () => {
    const formattedTime = formatTime(selectedTime);

    // 현재 설정 중인 타입에 따라 시간 설정
    switch (currentSettingType) {
      case '아침식사':
        setBreakfastTime(formattedTime);
        setBreakfastDate(new Date(selectedTime));
        break;
      case '점심식사':
        setLunchTime(formattedTime);
        setLunchDate(new Date(selectedTime));
        break;
      case '저녁식사':
        setDinnerTime(formattedTime);
        setDinnerDate(new Date(selectedTime));
        break;
      case '취침시간':
        setBedTime(formattedTime);
        setBedDate(new Date(selectedTime));
        break;
    }

    setShowTimePicker(false);
  };

  // 모달 타이틀 텍스트를 결정하는 함수
  const getModalTitleText = () => {
    switch (currentSettingType) {
      case '아침식사':
        return '아침은 주로 몇시에 드시나요?';
      case '점심식사':
        return '점심은 주로 몇시에 드시나요?';
      case '저녁식사':
        return '저녁은 주로 몇시에 드시나요?';
      case '취침시간':
        return '취침은 주로 몇시에 하시나요?';
      default:
        return '시간을 선택해주세요';
    }
  };

  return (
    <Container>
      <ModalHeader showDelete="true" onDeletePress={() => {}}>
        루틴 설정
      </ModalHeader>

      <View
        style={{
          paddingTop: 39,
          paddingLeft: 30,
          paddingBottom: 30,
          gap: 7,
        }}>
        <Title fontSizeMode={fontSizeMode}>
          {userName}님의 하루 일과를 알려주세요.
        </Title>
        <Subtitle fontSizeMode={fontSizeMode}>
          메디지가 일정에 맞춰 복약 알림을 보내드릴게요!
        </Subtitle>
      </View>

      <View style={{paddingHorizontal: 20, gap: 20}}>
        <TimeSettingItem
          icon={<CupIcon width={20} height={20} style={{color: '#A0CC88'}} />}
          title={scheduleData.morning.name}
          time={breakfastTime}
          onPress={() => openTimePicker('아침식사')}
          fontSizeMode={fontSizeMode}
        />

        <TimeSettingItem
          icon={<SunIcon width={20} height={20} style={{color: '#FF8B25'}} />}
          title={scheduleData.lunch.name}
          time={lunchTime}
          onPress={() => openTimePicker('점심식사')}
          fontSizeMode={fontSizeMode}
        />

        <TimeSettingItem
          icon={
            <HomeRoutineIcon
              width={20}
              height={20}
              style={{color: '#A5BEF0'}}
            />
          }
          title={scheduleData.dinner.name}
          time={dinnerTime}
          onPress={() => openTimePicker('저녁식사')}
          fontSizeMode={fontSizeMode}
        />

        <TimeSettingItem
          icon={<MoonIcon width={20} height={20} style={{color: '#FED359'}} />}
          title={scheduleData.bedtime.name}
          time={bedTime}
          onPress={() => openTimePicker('취침시간')}
          fontSizeMode={fontSizeMode}
        />
      </View>

      <DateTimePickerModal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onConfirm={handleConfirm}
        mode="time"
        date={selectedTime}
        onChange={onTimeChange}
        title={getModalTitleText()}
      />

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 30,
          alignItems: 'center',
        }}>
        <Button title="저장" onPress={sendDataToServer} />
      </View>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const Title = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.title[fontSizeMode]}px;
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.textPrimary};
`;

const Subtitle = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary50};
`;

const IconTextContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10;
`;

const TimeSettingText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.heading[fontSizeMode]}px;
  font-family: 'Pretendard-Bold';
  color: ${themes.light.textColor.textPrimary};
`;

const TimeButton = styled(TouchableOpacity)`
  width: 100%;
  background-color: ${themes.light.boxColor.inputPrimary};
  padding: 18px 15px;
  border-radius: 10px;
`;

const TimeButtonText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  font-family: 'Pretendard-SemiBold';
  color: ${themes.light.textColor.textPrimary};
`;

export default SetRoutineTime;