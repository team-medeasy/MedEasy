import React, { useRef, useEffect, useState } from 'react';
import { Modal, View, Animated, BackHandler } from 'react-native';
import styled from 'styled-components/native';
import {Button, ColorShapeView} from './../../components';
import {themes} from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import {PillsIcon} from '../../../assets/icons';

const pillIcons = {
  정제: PillsIcon.tablet,
  경질캡슐: PillsIcon.hard_capsule,
  연질캡슐: PillsIcon.soft_capsule,
  '그 외': PillsIcon.etc,
};

const ANIMATION_DURATION = 200;

export const FilterModal = ({
  visible,
  onClose,
  filterType,
  filterOptions,
  tempFilters,
  handleFilterChange,
  applyFilters,
}) => {
  if (!filterType) return null;
  
  // 애니메이션 상태 관리
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  
  // 애니메이션 중인지 여부를 추적
  const isAnimating = useRef(false);
  
  useEffect(() => {
    if (visible && !modalVisible) {
      // 모달 표시 시작
      setModalVisible(true);
      isAnimating.current = true;
      
      // 애니메이션 시작
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 애니메이션 완료 후 상태 업데이트
        isAnimating.current = false;
      });
    } else if (!visible && modalVisible) {
      // 이미 애니메이션 중이면 무시
      if (isAnimating.current) return;
      
      isAnimating.current = true;
      
      // 모달 닫힘 애니메이션
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION - 50,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: ANIMATION_DURATION - 50,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 애니메이션 완료 후 모달 숨김
        setModalVisible(false);
        isAnimating.current = false;
      });
    }
  }, [visible]);
  
  // 뒤로가기 버튼 처리
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (modalVisible) {
          // 모달이 열려있으면 닫기
          onClose();
          return true;
        }
        return false;
      }
    );
    
    return () => backHandler.remove();
  }, [modalVisible, onClose]);
  
  // 컴포넌트 언마운트 시 애니메이션 정리
  useEffect(() => {
    return () => {
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
    };
  }, []);

  const handleCloseModal = () => {
    // 이미 애니메이션 중이면 무시
    if (isAnimating.current) return;
    onClose();
  };

  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="none"
      onRequestClose={handleCloseModal}>
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: themes.light.bgColor.modalBG,
          opacity: fadeAnim,
        }}>
        <Animated.View
          style={{
            width: '100%',
            marginTop: 'auto',
            backgroundColor: themes.light.bgColor.bgPrimary,
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 10,
            paddingLeft: 20,
            paddingRight: 20,
            paddingBottom: 40,
            transform: [{ translateY: slideAnim }],
          }}>
          <TopBar />
          <Title>
            {filterType === 'color'
              ? '색상 선택'
              : filterType === 'shape'
              ? '모양 선택'
              : filterType === 'dosageForm'
              ? '제형 선택'
              : '분할선 선택'}
          </Title>
          
          <FilterOptionsContainer isDosageForm={filterType === 'dosageForm'}>
            {filterOptions[filterType].map((option, index) => (
              <FilterOptionButton
                key={index}
                selected={tempFilters[filterType].includes(option)}
                isDosageForm={filterType === 'dosageForm'}
                onPress={() => handleFilterChange(filterType, option)}>
                {filterType === 'dosageForm' ? (
                  // 제형 선택 시
                  <>
                    {pillIcons[option] &&
                      React.createElement(pillIcons[option], {
                        width: 77,
                        height: 50,
                      })}

                    <FilterOptionText
                      selected={tempFilters[filterType].includes(option)}>
                      {option}
                    </FilterOptionText>
                  </>
                ) : (
                  // 색상, 모양, 분할선 선택 시
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {filterType === 'color' && (
                      <ColorShapeView
                        type={filterType}
                        value={option}
                      />
                    )}
                    {filterType === 'shape' && (
                      <ColorShapeView
                        type={filterType}
                        value={option}
                      />
                    )}
                    <FilterOptionText
                      selected={tempFilters[filterType].includes(option)}>
                      {option}
                    </FilterOptionText>
                  </View>
                )}
              </FilterOptionButton>
            ))}
          </FilterOptionsContainer>

          <Button title="적용하기" onPress={applyFilters} />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const TopBar = styled.View`
  width: 40px;
  height: 5px;
  border-radius: 4px;
  background-color: ${themes.light.boxColor.modalBar};
  margin-bottom: 25px;
`;

const Title = styled.Text`
  font-size: ${FontSizes.title.default};
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.textPrimary};
  margin-bottom: 30px;
`;

const FilterOptionsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
  align-self: flex-start;
  width: 100%;
  align-items: ${({isDosageForm}) => (isDosageForm ? 'center' : 'flex-start')};
  justify-content: ${({isDosageForm}) =>
    isDosageForm ? 'space-between' : 'flex-start'};
`;

const FilterOptionButton = styled.TouchableOpacity`
  background-color: ${({selected}) =>
    selected
      ? themes.light.pointColor.Primary
      : themes.light.boxColor.inputPrimary};
  padding: 8px 16px;
  border-radius: 5px;
  align-items: center;
  justify-content: center;
  width: ${({isDosageForm}) => (isDosageForm ? '48%' : 'auto')};
  height: ${({isDosageForm}) => (isDosageForm ? '110px' : 'auto')};
  flex-direction: column;
`;

const FilterOptionText = styled.Text`
  color: ${({selected}) =>
    selected
      ? themes.light.textColor.buttonText
      : themes.light.textColor.Primary50};
  font-family: 'Pretendard-SemiBold';
`;