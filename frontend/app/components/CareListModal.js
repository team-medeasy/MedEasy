import React, {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import {themes} from '../styles';
import FontSizes from '../../assets/fonts/fontSizes';
import {useFontSize} from '../../assets/fonts/FontSizeContext';
import CustomModal from './CustomModal';
import {Button, Tag} from '../components';
import {OtherIcons} from '../../assets/icons';
import { deleteReceiver, getCareList } from '../api/userCare';
import { Alert } from 'react-native';

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
  const [careList, setCareList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
  const fetchCareList = async () => {
    try {
      const response = await getCareList();
      const careList = response.data.body;
      console.log("관리 대상 목록: ", careList);
      setCareList(careList);
      const myAccount = careList.find(item => item.tag === '내 계정');
      if (myAccount) setSelectedUserId(myAccount.user_id);
    } catch (error) {
      console.error('careList 불러오기 실패:', error);
    }
  };

    if (visible) fetchCareList();
  }, [visible]);

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

  const handleCareRoutine = (userId, userName, tag) => {
    if (tag === '내 계정') {
      onClose(); // 내 계정인 경우 모달만 닫음
      return;
    }
    
    setSelectedUserId(userId);
    
    onClose();
    setTimeout(() => {
      navigation.navigate('CareRoutine', { userId, userName }); // userId를 파라미터로 넘김
    }, 200);
  };

  const handleDeleteCareTarget = (userId, userName) => {
    Alert.alert(
      '삭제 확인',
      `${userName}님을 복약 관리 목록에서 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReceiver(userId);
              setCareList(prev => prev.filter(user => user.user_id !== userId));
            } catch (error) {
              console.error('삭제 실패:', error);
              Alert.alert('오류', '삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const renderRightActions = (userId, userName) => (
    <DeleteButtonWrapper>
      <DeleteButton onPress={() => handleDeleteCareTarget(userId, userName)}>
        <OtherIcons.deleteCircle width={16} height={16} style={{color: themes.light.textColor.buttonText70}}/>
      </DeleteButton>
    </DeleteButtonWrapper>
  );

  return (
    <CustomModal visible={visible} onClose={onClose} height="75%">
      <Title fontSizeMode={fontSizeMode}>복약 관리 목록</Title>

      <CareListContainer>
        {careList.map((item) => (
          <GestureHandlerRootView key={item.user_id} style={{ width: '100%' }}>
            <Swipeable
              key={item.user_id}
              renderRightActions={() =>
                item.tag === '내 계정' ? null : renderRightActions(item.user_id, item.name)
              }
            >
              <TouchableCareItem
                onPress={() => handleCareRoutine(item.user_id, item.name, item.tag)}
              >
                <CareListItem>
                  <LeftContainer>
                    <IconContainer>
                      {selectedUserId === item.user_id ? (
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
                  <Tag
                    sizeType="small"
                    colorType={item.tag === "내 계정" ? "resultSecondary" : "resultPrimary"}
                  >
                    {item.tag}
                  </Tag>
                </CareListItem>
              </TouchableCareItem>
            </Swipeable>
          </GestureHandlerRootView>
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
  font-size: ${({fontSizeMode}) => FontSizes.title[fontSizeMode]};
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
  background-color: ${themes.light.bgColor.bgPrimary};
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
  font-size: ${({fontSizeMode}) => FontSizes.heading[fontSizeMode]};
  font-family: 'Pretendard-Bold';
  color: ${themes.light.textColor.textPrimary};
  margin-bottom: 4px;
`;

const UserEmail = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
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
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  text-decoration: underline;
  text-decoration-color: ${themes.light.textColor.Primary50};
`;

const TouchableCareItem = styled.TouchableOpacity``;

const DeleteButtonWrapper = styled.View`
  justify-content: center;
  align-items: center;
  padding-left: 10px;
  padding-bottom: 25px;
`;

const DeleteButton = styled.TouchableOpacity`
  background-color:${themes.light.pointColor.Secondary};
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  padding: 15px;
`;

const DeleteText = styled.Text`
  color: ${themes.light.textColor.buttonText};
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};;
  font-family: 'Pretendard-Bold';
`;

export default CareListModal;