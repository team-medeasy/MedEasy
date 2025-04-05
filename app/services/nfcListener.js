import {useEffect} from 'react';
import {Alert} from 'react-native';
import NfcManager, {NfcEvents} from 'react-native-nfc-manager';

const useNfcListener = () => {
  useEffect(() => {
    NfcManager.start();

    NfcManager.setEventListener(NfcEvents.DiscoverTag, tag => {
      Alert.alert('NFC 태그 감지됨!', 'NFC가 인식됐어요!');
      console.log('태그:', tag);

      NfcManager.unregisterTagEvent().catch(() => null);
    });

    NfcManager.registerTagEvent({alertMessage: '최강 메디지!!'});

    return () => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      NfcManager.unregisterTagEvent().catch(() => null);
    };
  }, []);
};

export default useNfcListener;
