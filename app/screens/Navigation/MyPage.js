import React from 'react';
import styled from 'styled-components/native';
import {pointColor, themes} from './../../styles';
import {LogoIcons, CameraIcons} from './../../../assets/icons';
import {Footer} from '../../components';
import MedicationInfo from '../../components/MedicationInfo';
import SettingList from '../../components/SettingList';

const MyPage = () => {
  return (
    <Container>
      <ScrollContent>
        {/* 헤더 */}
        <HeaderContainer>
          <Title>내 정보</Title>
        </HeaderContainer>
        {/* 웰컴 메시지, 프로필 설정 */}
        <ProfileContainer>
          <TextContainer>
            <UserText>안녕하세요, 김한성님🩵</UserText>
            <SmallText>오늘도 건강한 하루 되세요!</SmallText>
          </TextContainer>
          <EditProfile>
            <ProfileAddButton onPress={() => alert('프로필 추가')}>
              <LogoIcons.logo
                width={30}
                height={47}
                style={{color: themes.light.bgColor.protileIcon}}
              />
              <EditButton onPress={() => alert('프로필 수정')}>
                <CameraIcons.camera
                  width={15}
                  height={15}
                  style={{color: themes.light.textColor.buttonText}}
                  opacity={0.5}
                />
              </EditButton>
            </ProfileAddButton>
          </EditProfile>
        </ProfileContainer>
        {/* 약 챙겨먹은 일수 */}
        <MedicationInfo days={32} medicationCount={5} />
        {/* 설정 리스트 */}
        <SettingList />
        {/* Footer */}
        <Footer />
      </ScrollContent>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const HeaderContainer = styled.View`
  justify-content: flex-end;
  background-color: ${themes.light.boxColor.buttonPrimary};
  padding-top: 50px;
  padding-left: 20px;
`;

const Title = styled.Text`
  font-size: 22px;
  font-family: 'KimjungchulGothic-Bold';
  font-weight: bold;
  color: ${themes.light.textColor.buttonText};
  margin-bottom: 20px;
  margin-top: 20px;
`;

const ScrollContent = styled.ScrollView`
  flex: 1;
`;

const ProfileContainer = styled.View`
  align-items: center;
  background-color: ${themes.light.boxColor.buttonPrimary};
  flex-direction: row;
`;
const TextContainer = styled.View`
  justify-content: center;
  padding: 20px;
  position: relative;
`;

const UserText = styled.Text`
  font-size: 22px;
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.buttonText};
`;

const SmallText = styled.Text`
  font-size: 14px;
  font-family: 'KimjungchulGothic-Regular';
  color: ${themes.light.textColor.buttonText};
`;

const EditProfile = styled.View`
  padding: 25px;
`;

const ProfileAddButton = styled.TouchableOpacity`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: ${themes.light.bgColor.protileIcon};
  justify-content: center;
  align-items: center;
  position: relative;
`;

const EditButton = styled.TouchableOpacity`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${themes.light.boxColor.buttonPrimary};
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: -5px;
  right: -5px;
  border-width: 1px;
  border-color: ${themes.light.boxColor.tagDetailSecondary};
`;

export default MyPage;
