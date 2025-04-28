import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import styled from 'styled-components/native';
import { themes } from '../styles';
import { DualTextButton } from '../components';
import { getUserSchedule } from '../api/user';

export const ScheduleSelector = ({ 
  selectedTimings, 
  setSelectedTimings,
  onScheduleMappingChange,
  initialData = [], 
}) => {
  const [scheduleData, setScheduleData] = useState({});
  const [scheduleMapping, setScheduleMapping] = useState({});
  
  // 디버깅: 컴포넌트 마운트 시 로그
  useEffect(() => {
    console.log('🔍 ScheduleSelector 마운트됨');
    console.log('🔍 initialData:', initialData);
    console.log('🔍 selectedTimings:', selectedTimings);
  }, []);

  // 디버깅: initialData 변경 시 로그
  useEffect(() => {
    console.log('🔍 initialData 변경됨:', initialData);
    
    // initialData가 있고 selectedTimings가 비어있으면 바로 적용
    if (initialData && initialData.length > 0 && selectedTimings.length === 0) {
      console.log('🟢 initialData에서 시간대 직접 설정:', initialData);
      setSelectedTimings([...initialData]);
    }
  }, [initialData, selectedTimings]);

  // 시간 변환 함수
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
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
      console.log('🔍 화면 포커스 - 사용자 스케줄 가져오기');
      fetchUserSchedule();
    }, [])
  );

  const fetchUserSchedule = async () => {
    try {
      console.log('🔍 사용자 일정 데이터 요청 중...');
      const response = await getUserSchedule();
      const scheduleData = response.data;
      console.log('🟢 사용자 일정 데이터 성공:', scheduleData);

      if (scheduleData && scheduleData.body && Array.isArray(scheduleData.body)) {
        // 매핑을 위한 객체
        const mapping = {};
        // 시간 표시를 위한 객체
        const formattedSchedule = {};

        scheduleData.body.forEach((item) => {
          console.log('🔍 스케줄 항목 처리:', item);
          
          // 매핑 설정
          if (item.name.includes('아침')) {
            mapping['🐥️ 아침'] = item.user_schedule_id;
            formattedSchedule['아침 식사 후'] = formatTime(item.take_time);
            console.log(`🟢 아침 매핑 완료: ID ${item.user_schedule_id}, 시간 ${formatTime(item.take_time)}`);
          } else if (item.name.includes('점심')) {
            mapping['🥪️ 점심'] = item.user_schedule_id;
            formattedSchedule['점심 식사 후'] = formatTime(item.take_time);
            console.log(`🟢 점심 매핑 완료: ID ${item.user_schedule_id}, 시간 ${formatTime(item.take_time)}`);
          } else if (item.name.includes('저녁')) {
            mapping['🌙️ 저녁'] = item.user_schedule_id;
            formattedSchedule['저녁 식사 후'] = formatTime(item.take_time);
            console.log(`🟢 저녁 매핑 완료: ID ${item.user_schedule_id}, 시간 ${formatTime(item.take_time)}`);
          } else if (item.name.includes('자기')) {
            mapping['🛏️️ 자기 전'] = item.user_schedule_id;
            formattedSchedule['자기 전'] = formatTime(item.take_time);
            console.log(`🟢 자기 전 매핑 완료: ID ${item.user_schedule_id}, 시간 ${formatTime(item.take_time)}`);
          }
          
          // 원래 이름으로도 매핑
          mapping[item.name] = item.user_schedule_id;
          
          // ID로도 매핑 (역매핑)
          if (item.name.includes('아침')) {
            mapping[item.user_schedule_id] = '아침';
          } else if (item.name.includes('점심')) {
            mapping[item.user_schedule_id] = '점심';
          } else if (item.name.includes('저녁')) {
            mapping[item.user_schedule_id] = '저녁';
          } else if (item.name.includes('자기')) {
            mapping[item.user_schedule_id] = '자기 전';
          }
        });

        setScheduleMapping(mapping);
        setScheduleData(formattedSchedule);
        console.log('🟢 시간대 매핑 완료:', mapping);
        console.log('🟢 시간 데이터 완료:', formattedSchedule);
        
        // 부모 컴포넌트에 매핑 정보 전달
        if (onScheduleMappingChange) {
          console.log('🟢 부모 컴포넌트에 매핑 전달');
          onScheduleMappingChange(mapping);
        }
        
        // 중요: 스케줄 데이터가 로드되고 나서 initialData가 있는데 selectedTimings가 비어있으면
        // 다시 한번 initialData를 selectedTimings에 적용
        if (initialData && initialData.length > 0 && selectedTimings.length === 0) {
          console.log('🟢 스케줄 로드 후 initialData 적용:', initialData);
          setSelectedTimings([...initialData]);
        }
      }
    } catch (error) {
      console.error('❌ 사용자 일정 가져오기 실패:', error);
    }
  };

  const toggleTiming = (timing) => {
    console.log('🔍 시간대 토글:', timing);
    console.log('🔍 현재 선택된 시간대:', selectedTimings);
    
    setSelectedTimings(prev => {
      const newTimings = prev.includes(timing)
        ? prev.filter(t => t !== timing)
        : [...prev, timing];
      
      console.log('🟢 업데이트된 선택 시간대:', newTimings);
      return newTimings;
    });
  };

  // 디버깅을 위한 로그
  useEffect(() => {
    console.log('🔍 selectedTimings 변경됨:', selectedTimings);
  }, [selectedTimings]);

  return (
    <SelectTime>
      <DualTextButton
        title={'🐥️ 아침'}
        messageText={scheduleData['아침 식사 후'] || '오전 7시'}
        onPress={() => toggleTiming('아침')}
        bgColor={selectedTimings.includes('아침') ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
        textColor={selectedTimings.includes('아침') ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
  />
      <DualTextButton
        title={'🥪️ 점심'}
        messageText={scheduleData['점심 식사 후'] || '오후 12시'}
        onPress={() => toggleTiming('점심')}
        bgColor={selectedTimings.includes('점심') ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
        textColor={selectedTimings.includes('점심') ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
      />
      <DualTextButton
        title={'🌙️ 저녁'}
        messageText={scheduleData['저녁 식사 후'] || '오후 7시'}
        onPress={() => toggleTiming('저녁')}
        bgColor={selectedTimings.includes('저녁') ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
        textColor={selectedTimings.includes('저녁') ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
      />
      <DualTextButton
        title={'🛏️️ 자기 전'}
        messageText={scheduleData['자기 전'] || '오후 10시 30분'}
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