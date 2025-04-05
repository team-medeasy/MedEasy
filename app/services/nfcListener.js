import React, {useEffect, useState} from 'react';
import {Platform} from 'react-native';
import NfcManager, {NfcEvents} from 'react-native-nfc-manager';
import CustomModal from '../components/CustomModal';
import FontSizes from '../../assets/fonts/fontSizes';
import {themes} from '../styles';
import styled from 'styled-components/native';

const useNfcListener = () => {
  // const [nfcTag, setNfcTag] = useState(null);
  const [nfcTag, setNfcTag] = useState(true); // 모달 항상 표시

  useEffect(() => {
    NfcManager.start();

    NfcManager.setEventListener(NfcEvents.DiscoverTag, tag => {
      console.log('태그:', tag);
      setNfcTag(tag); // 태그 저장해서 모달 띄움
      NfcManager.unregisterTagEvent().catch(() => null);
    });

    NfcManager.registerTagEvent({
      alertMessage: Platform.OS === 'ios' ? '최강 메디지!!' : undefined,
    });

    return () => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      NfcManager.unregisterTagEvent().catch(() => null);
    };
  }, []);

  const ModalComponent = () =>
    nfcTag ? (
      <CustomModal visible={!!nfcTag} onClose={() => setNfcTag(null)}>
        <Title>NFC 태그 감지됨</Title>
      </CustomModal>
    ) : null;

  return {ModalComponent};
};

export default useNfcListener;

const Title = styled.Text`
  font-size: ${FontSizes.title.default};
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.textPrimary};
  padding: 30px;
`;
