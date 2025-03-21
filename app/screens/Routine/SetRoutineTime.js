import React, {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import {View, TouchableOpacity} from 'react-native';
import {themes} from './../../styles';
import {ModalHeader, Button, DateTimePickerModal} from '../../components';
import FontSizes from '../../../assets/fonts/fontSizes';
import {RoutineIcons} from '../../../assets/icons';
import {useNavigation} from '@react-navigation/native';

import { useSignUp } from '../../api/context/SignUpContext';
import { getUserSchedule } from '../../api/user';

const {
  moon: MoonIcon,
  sun: SunIcon,
  cup: CupIcon,
  homeRoutine: HomeRoutineIcon,
} = RoutineIcons;

const TimeSettingItem = ({icon, title, time, onPress}) => {
  return (
    <View style={{gap: 15}}>
      <IconTextContainer>
        {icon}
        <TimeSettingText>{title}</TimeSettingText>
      </IconTextContainer>
      <TimeButton onPress={onPress}>
        <TimeButtonText>{time}</TimeButtonText>
      </TimeButton>
    </View>
  );
};

const SetRoutineTime = () => {
  const {signUpData} = useSignUp();
  const navigation = useNavigation();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [currentSettingType, setCurrentSettingType] = useState('');
  
  // 시간 상태 초기값 설정
  const [breakfastTime, setBreakfastTime] = useState('');
  const [lunchTime, setLunchTime] = useState('');
  const [dinnerTime, setDinnerTime] = useState('');
  const [bedTime, setBedTime] = useState('');
  
  // scheduleIds 저장
  const [scheduleIds, setScheduleIds] = useState({
    breakfast: null,
    lunch: null,
    dinner: null,
    bedtime: null
  });

  // API에서 받아온 시간을 파싱하는 함수
  const parseApiTime = (timeString) => {
    if (!timeString) return null;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // 컴포넌트 마운트 시 사용자 일정 가져오기
  useEffect(() => {
    const fetchUserSchedule = async () => {
      try {
        const getData = await getUserSchedule();
        const scheduleData = getData.data;
        console.log('사용자 일정 데이터:', scheduleData);
        
        // API에서 받아온 시간으로 디폴트 시간 설정
        if (scheduleData && scheduleData.body && Array.isArray(scheduleData.body)) {
          // 각 일정 데이터 찾기
          const breakfastSchedule = scheduleData.body.find(item => item.name.includes('아침'));
          const lunchSchedule = scheduleData.body.find(item => item.name.includes('점심'));
          const dinnerSchedule = scheduleData.body.find(item => item.name.includes('저녁'));
          
          // ID 저장
          const newScheduleIds = {
            breakfast: breakfastSchedule?.user_schedule_id || null,
            lunch: lunchSchedule?.user_schedule_id || null,
            dinner: dinnerSchedule?.user_schedule_id || null,
            bedtime: null // 취침시간은 API 데이터에 없음
          };
          setScheduleIds(newScheduleIds);
          console.log('스케줄 ID:', newScheduleIds);
          
          // 시간 설정
          if (breakfastSchedule) {
            const breakfastDate = parseApiTime(breakfastSchedule.take_time);
            if (breakfastDate) {
              setBreakfastTime(formatTime(breakfastDate));
            }
          }
          
          if (lunchSchedule) {
            const lunchDate = parseApiTime(lunchSchedule.take_time);
            if (lunchDate) {
              setLunchTime(formatTime(lunchDate));
            }
          }
          
          if (dinnerSchedule) {
            const dinnerDate = parseApiTime(dinnerSchedule.take_time);
            if (dinnerDate) {
              setDinnerTime(formatTime(dinnerDate));
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
      // getUserSchedule을 다시 호출하여 최신 데이터 확인
      const latestSchedule = await getUserSchedule();
      console.log('저장 전 최신 사용자 일정:', latestSchedule);
      
      // 여기에 저장 로직 추가
      
    } catch (error) {
      console.error('데이터 저장 중 오류:', error);
    }
  }
    
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

    setBreakfastTime(formatTime(defaultBreakfastTime));
    setLunchTime(formatTime(defaultLunchTime));
    setDinnerTime(formatTime(defaultDinnerTime));
    setBedTime(formatTime(defaultBedTime));
  };
  
  // 컴포넌트 마운트 시 기본값 설정
  useEffect(() => {
    setDefaultTimes();
  }, []);

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || new Date();
    setSelectedTime(currentTime);
  };

  const openTimePicker = type => {
    setCurrentSettingType(type);
    setShowTimePicker(true);
  };

  const handleConfirm = () => {
    const formattedTime = formatTime(selectedTime);

    // 현재 설정 중인 타입에 따라 시간 설정
    switch (currentSettingType) {
      case '아침식사':
        setBreakfastTime(formattedTime);
        break;
      case '점심식사':
        setLunchTime(formattedTime);
        break;
      case '저녁식사':
        setDinnerTime(formattedTime);
        break;
      case '취침시간':
        setBedTime(formattedTime);
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
          paddingBottom: 53,
          gap: 7,
        }}>
        <Title>{signUpData.firstName}님의 하루 일과를 알려주세요.</Title>
        <Subtitle>메디지가 일정에 맞춰 복약 알림을 보내드릴게요!</Subtitle>
      </View>

      <View style={{paddingHorizontal: 20, gap: 20}}>
        <TimeSettingItem
          icon={<CupIcon width={20} height={20} style={{color: '#A0CC88'}} />}
          title="아침 식사"
          time={breakfastTime}
          onPress={() => openTimePicker('아침식사')}
        />

        <TimeSettingItem
          icon={<SunIcon width={20} height={20} style={{color: '#FF8B25'}} />}
          title="점심 식사"
          time={lunchTime}
          onPress={() => openTimePicker('점심식사')}
        />

        <TimeSettingItem
          icon={
            <HomeRoutineIcon
              width={20}
              height={20}
              style={{color: '#A5BEF0'}}
            />
          }
          title="저녁 식사"
          time={dinnerTime}
          onPress={() => openTimePicker('저녁식사')}
        />

        <TimeSettingItem
          icon={<MoonIcon width={20} height={20} style={{color: '#FED359'}} />}
          title="취침 시간"
          time={bedTime}
          onPress={() => openTimePicker('취침시간')}
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
  font-size: ${FontSizes.title.default};
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.textPrimary};
`;

const Subtitle = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary50};
`;

const IconTextContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10;
`;

const TimeSettingText = styled.Text`
  font-size: ${FontSizes.heading.default};
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
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-SemiBold';
  color: ${themes.light.textColor.textPrimary};
`;

export default SetRoutineTime;