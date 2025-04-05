import React, {useEffect, useState} from 'react';
import {Platform, TouchableOpacity, View} from 'react-native';
import NfcManager, {NfcEvents} from 'react-native-nfc-manager';
import CustomModal from '../components/CustomModal';
import FontSizes from '../../assets/fonts/fontSizes';
import {themes} from '../styles';
import styled from 'styled-components/native';
import {Button} from '../components';
import RoutineCard from '../components/\bRoutineCard';

const dummyRoutines = [
  {
    id: 'medicine-MORNING',
    label: '아침',
    time: '오전 8:00',
    sortValue: 1,
    type: 'medicine',
    timeKey: 'MORNING',
    medicines: [
      {
        medicine_id: 1,
        nickname: '혈압약',
        dose: 1,
        day_of_weeks: [1, 2, 3, 4, 5, 6, 7],
        types: ['MORNING'],
      },
    ],
  },
];

const useNfcListener = () => {
  // const [nfcTag, setNfcTag] = useState(null);
  const [nfcTag, setNfcTag] = useState(true); // 개발용 항상 표시
  const dummyRoutine = dummyRoutines[0];

  useEffect(() => {
    NfcManager.start();

    NfcManager.setEventListener(NfcEvents.DiscoverTag, tag => {
      console.log('태그:', tag);
      setNfcTag(tag);
      NfcManager.unregisterTagEvent().catch(() => null);
    });

    return () => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      NfcManager.unregisterTagEvent().catch(() => null);
    };
  }, []);

  const ModalComponent = () =>
    nfcTag ? (
      <CustomModal visible={!!nfcTag} onClose={() => setNfcTag(null)}>
        <Title>{dummyRoutine.label}약 기록 완료!</Title>
        <Text>
          {dummyRoutine.time}의 {dummyRoutine.label}약을 모두 먹었어요!
        </Text>
        <View style={{width: '100%', paddingHorizontal: 16}}>
          <RoutineCard
            routine={dummyRoutine}
            checkedItems={{}}
            toggleCheck={() => {}}
            toggleTimeCheck={() => {}}
            isInModal={true}
          />
        </View>
        <Button title="확인" onPress={() => setNfcTag(null)} />
        <TouchableOpacity>
          <EditText>기록을 수정하고 싶어요.</EditText>
        </TouchableOpacity>
      </CustomModal>
    ) : null;

  return {ModalComponent};
};

export default useNfcListener;

const Title = styled.Text`
  font-size: ${FontSizes.title.default};
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.textPrimary};
  padding-top: 30px;
`;

const Text = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary50};
  padding: 8px 0 24px 0;
`;

const EditText = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary50};
  padding-top: 16px;
  text-decoration-line: underline;
`;
