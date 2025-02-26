import React from 'react';
import { Modal } from 'react-native';
import styled from 'styled-components/native';
import { Button } from './../../components';
import { themes } from '../../styles';
import { LogoIcons } from '../../../assets/icons';

const ChatInfoModal = ({ visible, onClose }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <ModalContainer>
                <ModalContent>
                    <TopBar />
                    <CautionContainer>
                        <Title>AI 채팅 이용 안내</Title>
                        <LogoIcons.chatCaution width={178} height={139} />
                        <CautionText>
                            제공되는 모든 의약품 정보는 참고용으로만 제공됩니다. AI의 답변은 전문 의료 상담이 아니므로, 구체적인 복용법 및 치료에 관해서는 반드시 의사 또는 약사와 상담 후 결정하시기 바랍니다.
                        </CautionText>
                    </CautionContainer>
                    <Button title='확인' onPress={onClose}></Button>
                </ModalContent>
            </ModalContainer>
        </Modal>
    );
};

const ModalContainer = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.footerBG};
`;

const TopBar = styled.View`
  position: absolute;
  top: 10px;
  width: 40px;
  height: 5px;
  background-color: ${themes.light.textColor.Primary30};
  border-radius: 4px;
`;

const ModalContent = styled.View`
  width: 100%;
  height: 60%;
  margin-top: auto;
  background-color: ${themes.light.bgColor.bgPrimary};
  border-radius: 40px;
  justify-content: baseline;
  align-items: center;
  padding: 20px;
`;

const CautionContainer = styled.View`
    align-items: center;
    justify-content: center;
`;

const Title = styled.Text`
    font-size: 22px;
    font-family: 'KimjungchulGothic-Bold';
    color: ${themes.light.textColor.textPrimary};
    padding: 30px;
`;

const CautionText = styled.Text`
    font-size: 15px;
    font-family: 'Pretendard-Regular';
    color: ${themes.light.textColor.Primary50};
    padding: 30px 20px;
    line-height: 25px;
`;

export default ChatInfoModal;
