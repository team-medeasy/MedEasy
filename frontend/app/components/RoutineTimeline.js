import React, {useEffect, useState, useRef} from 'react';
import {Animated} from 'react-native';
import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import {pointColor} from '../styles';
import RoutineCard from './RoutineCard';
import EmptyState from './EmptyState';
import {Images} from '../../assets/icons';

// 타임라인 컨테이너 스타일
const TimelineContainer = styled.View`
  padding: 0 24px;
  position: relative;
`;

// 빈 상태 컨테이너 스타일 (타임라인 컨테이너 내 중앙 정렬을 위해)
const EmptyContainer = styled.View`
  align-items: center;
  justify-content: center;
  width: 100%;
  padding-right: 30px; /* TimelineContainer의 padding-left와 동일하게 설정하여 중앙 정렬 */
`;

// AnimatedGradient 컴포넌트 생성 (LinearGradient를 Animation으로 감싸기 위함)
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

const RoutineTimeline = ({
  allRoutines,
  checkedItems,
  selectedDateString,
  toggleTimeCheck,
  toggleCheck,
  routineMode = 'default', // 기본값 설정
  emptyTitle = '루틴이 없습니다.', // 기본 빈 상태 제목
  emptyDescription = '현재 등록된 루틴이 없습니다.', // 기본 빈 상태 설명
}) => {
  // 애니메이션 값 설정
  const heightAnim = useRef(new Animated.Value(0)).current;
  const [timelineHeight, setTimelineHeight] = useState(100);
  const previousDateRef = useRef(selectedDateString);
  const previousRoutinesLengthRef = useRef(allRoutines.length);

  // 날짜 변경 또는 루틴 데이터 변경 시 애니메이션 재시작
  useEffect(() => {
    // 날짜가 변경되었거나 루틴 길이가 변경된 경우
    const dateChanged = previousDateRef.current !== selectedDateString;
    const routinesLengthChanged =
      previousRoutinesLengthRef.current !== allRoutines.length;

    // 현재 값 저장
    previousDateRef.current = selectedDateString;
    previousRoutinesLengthRef.current = allRoutines.length;

    // 애니메이션 값 초기화 및 재시작
    if (dateChanged || routinesLengthChanged) {
      // 애니메이션 리셋
      heightAnim.setValue(0);

      // 루틴이 있는 경우에만 애니메이션 실행
      if (allRoutines.length > 0) {
        Animated.timing(heightAnim, {
          toValue: 1,
          duration: 800, // 애니메이션 지속 시간 (ms)
          useNativeDriver: false, // height 애니메이션은 네이티브 드라이버 사용 불가
        }).start();
      }
    }
  }, [allRoutines, selectedDateString, heightAnim]);

  // 전체 타임라인 컨테이너의 레이아웃을 측정하여 실제 높이 설정
  const onTimelineLayout = event => {
    const {height} = event.nativeEvent.layout;
    setTimelineHeight(height);
  };

  // 애니메이션된 높이 값 계산
  const animatedHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, timelineHeight - 20], // 20px은 상단 시작 위치 (top: 20px)를 고려
  });

  return (
    <TimelineContainer onLayout={onTimelineLayout}>
      {/* 루틴 데이터가 있을 때만 타임라인 세로줄 렌더링 */}
      {/* {allRoutines.length > 0 && (
        <AnimatedGradient
          colors={[pointColor.pointPrimaryDark, pointColor.primary20]}
          start={{x: 0.5, y: 0}}
          end={{x: 0.5, y: 1}}
          style={{
            position: 'absolute',
            left: 22,
            top: 20,
            width: 6,
            height: animatedHeight, // 애니메이션된 높이 적용
            borderRadius: 3,
            zIndex: 0,
          }}
        />
      )} */}

      {/* 루틴 데이터가 없을 경우 빈 상태 UI 표시 */}
      {allRoutines.length === 0 ? (
        <EmptyContainer>
          <EmptyState
            image={
              <Images.emptyRoutine style={{marginBottom: 32, marginTop: 80}} />
            }
            title={emptyTitle}
            description={emptyDescription}
          />
        </EmptyContainer>
      ) : (
        // 루틴 데이터가 있을 경우 RoutineCard 목록 렌더링
        // 키에 selectedDateString 추가하여 날짜 변경 시 컴포넌트 재렌더링 보장
        allRoutines.map((routine, index) => (
          <RoutineCard
            key={`${routine.id}-${selectedDateString}`}
            routine={routine}
            index={index}
            allLength={allRoutines.length}
            checkedItems={
              routineMode === 'care' ? routine.checkedItems || {} : checkedItems
            } // care 모드일 때와 아닐 때 checkedItems 전달 방식 구분
            selectedDateString={selectedDateString}
            toggleTimeCheck={toggleTimeCheck}
            toggleCheck={toggleCheck}
            routineMode={routineMode} // routineMode prop 전달
          />
        ))
      )}
    </TimelineContainer>
  );
};

export default RoutineTimeline;
