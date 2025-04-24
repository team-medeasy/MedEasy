import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import styled from 'styled-components/native';
import { themes } from '../styles';
import { SelectTimeButton } from '../components';
import { getUserSchedule } from '../api/user';

export const ScheduleSelector = ({ 
  selectedTimings, 
  setSelectedTimings,
  onScheduleMappingChange,
}) => {
  const [scheduleData, setScheduleData] = useState({});
  const [scheduleMapping, setScheduleMapping] = useState({});

  // 시간 변환 함수
  const formatTime = (timeString) => {
    const [hour, minute] = timeString.split(':').map(Number);
    const period = hour < 12 ? '오전' : '오후';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;

    return minute === 0
      ? `${period} ${formattedHour}시`
      : `${period} ${formattedHour}시 ${minute}분`;
  };

  // 화면에 포커스될 때마다 실행
  useFocusEffect(
    React.useCallback(() => {
      fetchUserSchedule();
    }, [])
  );

  const fetchUserSchedule = async () => {
    try {
      const getData = await getUserSchedule();
      const scheduleData = getData.data;
      console.log('사용자 일정 데이터:', scheduleData);

      if (scheduleData && scheduleData.body && Array.isArray(scheduleData.body)) {
        // 매핑을 위한 객체
        const mapping = {};
        // 시간 표시를 위한 객체
        const formattedSchedule = {};

        scheduleData.body.forEach((item) => {
          // 매핑 설정
          if (item.name.includes('아침')) {
            mapping['🐥️ 아침'] = item.user_schedule_id;
            formattedSchedule['아침 식사 후'] = formatTime(item.take_time);
          } else if (item.name.includes('점심')) {
            mapping['🥪️ 점심'] = item.user_schedule_id;
            formattedSchedule['점심 식사 후'] = formatTime(item.take_time);
          } else if (item.name.includes('저녁')) {
            mapping['🌙️ 저녁'] = item.user_schedule_id;
            formattedSchedule['저녁 식사 후'] = formatTime(item.take_time);
          } else if (item.name.includes('자기 전')) {
            mapping['🛏️️ 자기 전'] = item.user_schedule_id;
            formattedSchedule['자기 전'] = formatTime(item.take_time);
          }
        });

        setScheduleMapping(mapping);
        setScheduleData(formattedSchedule);
        console.log('시간대 매핑:', mapping);
        console.log('시간 데이터:', formattedSchedule);
        
        // 부모 컴포넌트에 매핑 정보 전달
        if (onScheduleMappingChange) {
          onScheduleMappingChange(mapping);
        }
      }
    } catch (error) {
      console.error('사용자 일정 가져오기 실패:', error);
    }
  };

  const toggleTiming = (timing) => {
    setSelectedTimings(prev =>
      prev.includes(timing)
        ? prev.filter(t => t !== timing)
        : [...prev, timing],
    );
  };

  return (
    <SelectTime>
      <SelectTimeButton
        title={'🐥️ 아침'}
        timeText={scheduleData['아침 식사 후'] || '오전 7시'}
        onPress={() => toggleTiming('아침')}
        bgColor={selectedTimings.includes('아침') ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
        textColor={selectedTimings.includes('아침') ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
      />
      <SelectTimeButton
        title={'🥪️ 점심'}
        timeText={scheduleData['점심 식사 후'] || '오후 12시'}
        onPress={() => toggleTiming('점심')}
        bgColor={selectedTimings.includes('점심') ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
        textColor={selectedTimings.includes('점심') ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
      />
      <SelectTimeButton
        title={'🌙️ 저녁'}
        timeText={scheduleData['저녁 식사 후'] || '오후 7시'}
        onPress={() => toggleTiming('저녁')}
        bgColor={selectedTimings.includes('저녁') ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
        textColor={selectedTimings.includes('저녁') ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
      />
      <SelectTimeButton
        title={'🛏️️ 자기 전'}
        timeText={scheduleData['자기 전'] || '오후 10시 30분'}
        onPress={() => toggleTiming('자기 전')}
        bgColor={selectedTimings.includes('자기 전') ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
        textColor={selectedTimings.includes('자기 전') ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
      />
    </SelectTime>
  );
};

const SelectTime = styled.View`
  gap: 10px;
`;