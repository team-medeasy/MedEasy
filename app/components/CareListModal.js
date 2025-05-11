import React, {useState} from 'react';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import {themes} from '../styles';
import FontSizes from '../../assets/fonts/fontSizes';
import {useFontSize} from '../../assets/fonts/FontSizeContext';
import CustomModal from './CustomModal';
import {Button, Tag} from '../components';
import {OtherIcons} from '../../assets/icons';

// 모달을 사용할 컴포넌트에서 이 함수를 가져다 사용할 수 있습니다.
export const useCareListModal = () => {
  const [modalVisible, setModalVisible] = useState(false);
  
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);
  
  return {
    modalVisible,
    openModal,
    closeModal,
    CareListModalComponent: (
      <CareListModal 
        visible={modalVisible} 
        onClose={closeModal} 
      />
    )
  };
};

export const CareListModal = ({
  visible,
  onClose,
}) => {
  const {fontSizeMode} = useFontSize();
  const navigation = useNavigation();  

  // 하드 코딩 목록 데이터
  const careList = [
    { name: '현주', email: 'aaa@medeasy.dev', type: '내 계정' },
    { name: '홍영준', email: 'bbb@medeasy.dev', type: '피보호자' },
    { name: '박지원', email: 'ccc@medeasy.dev', type: '피보호자' },
    { name: '양예영', email: 'ddd@medeasy.dev', type: '피보호자' },
    { name: '김가영', email: 'eee@medeasy.dev', type: '피보호자' },
  ];

  const handleAddCareTarget = () => {
    onClose();
    setTimeout(() => {
      navigation.navigate('AddCareTarget'); // 관리 대상 추가 페이지로 이동
    }, 200);
  };

  const handleVerifyCode = () => {
    onClose();
    setTimeout(() => {
      navigation.navigate('VerifyCode'); // 인증 코드 확인 페이지로 이동
    }, 200);
  };

  return (
    <CustomModal visible={visible} onClose={onClose} height="75%">
      <Title fontSizeMode={fontSizeMode}>복약 관리 목록</Title>

      <CareListContainer>
        {careList.map((item, index) => (
          <CareListItem key={index}>
            <LeftContainer>
              <IconContainer>
                {item.type === '내 계정' ? (
                  <OtherIcons.CheckCircle />
                ) : (
                  <PlaceholderView />
                )}
              </IconContainer>
              <UserInfoContainer>
                <UserName fontSizeMode={fontSizeMode}>{item.name}</UserName>
                <UserEmail fontSizeMode={fontSizeMode}>{item.email}</UserEmail>
              </UserInfoContainer>
            </LeftContainer>
            <Tag sizeType='small' colorType='resultPrimary'>{item.type}</Tag>
          </CareListItem>
        ))}
      </CareListContainer>

      <Button title="복약 관리 대상 추가하기" onPress={handleAddCareTarget} />
      
      <UnderlinedButton onPress={handleVerifyCode}>
        <UnderlinedButtonText fontSizeMode={fontSizeMode}>
          내 인증 코드 확인하기
        </UnderlinedButtonText>
      </UnderlinedButton>
    </CustomModal>
  );
};

const Title = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.title[fontSizeMode]}px;
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.textPrimary};
  padding-top: 30px;
  padding-bottom: 25px;
`;

const CareListContainer = styled.ScrollView`
  width: 100%;
`;

const CareListItem = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 25px;
`;

const LeftContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const IconContainer = styled.View`
  width: 24px;
  height: 24px;
  margin-right: 12px;
  justify-content: center;
  align-items: center;
`;

const PlaceholderView = styled.View`
  width: 24px;
  height: 24px;
`;

const UserInfoContainer = styled.View`
  flex-direction: column;
  justify-content: center;
`;

const UserName = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.heading[fontSizeMode]}px;
  font-family: 'Pretendard-Bold';
  color: ${themes.light.textColor.textPrimary};
  margin-bottom: 4px;
`;

const UserEmail = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary50};
`;

const UnderlinedButton = styled.TouchableOpacity`
  margin-top: 16px;
  margin-bottom: 10px;
`;

const UnderlinedButtonText = styled.Text`
  color: ${themes.light.textColor.Primary50};
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  text-decoration: underline;
  text-decoration-color: ${themes.light.textColor.Primary50};
`;

export default CareListModal;