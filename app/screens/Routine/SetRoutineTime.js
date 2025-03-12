import React, {useState} from 'react';
import styled from 'styled-components/native';
import {View, TouchableOpacity} from 'react-native';
import {themes} from './../../styles';
import {ModalHeader, Button, DateTimePickerModal} from '../../components';
import FontSizes from '../../../assets/fonts/fontSizes';
import {RoutineIcons} from '../../../assets/icons';
import {useNavigation} from '@react-navigation/native';

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
  const navigation = useNavigation();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [currentSettingType, setCurrentSettingType] = useState('');

  const formatTime = date => {
    if (!date) return '';
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${ampm} ${formattedHours}시 ${formattedMinutes}분`;
  };

  // 디폴트 시간 설정
  const defaultBreakfastTime = new Date();
  defaultBreakfastTime.setHours(8, 0, 0, 0);

  const defaultLunchTime = new Date();
  defaultLunchTime.setHours(12, 0, 0, 0);

  const defaultDinnerTime = new Date();
  defaultDinnerTime.setHours(18, 0, 0, 0);

  const defaultBedTime = new Date();
  defaultBedTime.setHours(22, 0, 0, 0);

  const [breakfastTime, setBreakfastTime] = useState(
    formatTime(defaultBreakfastTime),
  );
  const [lunchTime, setLunchTime] = useState(formatTime(defaultLunchTime));
  const [dinnerTime, setDinnerTime] = useState(formatTime(defaultDinnerTime));
  const [bedTime, setBedTime] = useState(formatTime(defaultBedTime));

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
        <Title>한성님의 하루 일과를 알려주세요.</Title>
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
        <Button title="닫기" onPress={() => navigation.goBack()} />
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