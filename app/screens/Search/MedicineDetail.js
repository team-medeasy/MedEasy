import React from 'react';
import styled from 'styled-components/native';
import {themes} from '../../styles';
import {HeaderIcons} from './../../../assets/icons';
import {Footer} from './../../components';
import { ImageBackground, TouchableOpacity, View, Text } from 'react-native';
import FontSizes from '../../../assets/fonts/fontSizes';
import { ScrollView } from 'react-native-gesture-handler';


const MedicineDetailScreen = ({ navigation }) => {
  // 임시 데이터
  const medicine = {
    item_name: '지엘타이밍정(카페인무수물)',
    item_seq: '196500051',
    entp_name: '지엘파마(주)',
    entp_seq: '19650018',
    item_image: 'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/1NAT_bwbZd9',
    class_name: '각성제',
    etc_otc_name: '일반의약품',
    chart: '노란색의 팔각형 정제',
    print_front: '마크',
    print_back: 'T1E',
    drug_shape: '팔각형',
    color_class1: '노랑',
    leng_long: '7.9',
    leng_short: '7.9',
    thick: '3.9',
    color_class2: '',
    efcy_qesitm: '졸음',
    use_method_qesitm: '성인은 1회 2~6정(100~300 mg)씩, 1일 1~3회 복용합니다.연령, 증상에 따라 적절히 증감할 수 있습니다.',
    atpn_qesitm: '갈락토오스 불내성, Lapp 유당분해효소 결핍증 또는 포도당-갈락토오스 흡수장애 등의 유전적인 문제가 있는 환자는 이 약을 복용하지 마십시오.이 약을 복용하기 전에 임부 또는 임신하고 있을 가능성이 있는 여성 및 수유부, 고령자, 위궤양 환자 또는 경험자, 심질환, 녹내장 환자는 의사 또는 약사와 상의하십시오.',
    se_qusitm: '만성 녹내장을 악화시킬 경우 복용을 즉각 중지하고 의사 또는 약사와 상의하십시오.',
  };

  return (
    <Container>
      <HeaderContainer>
        <BackAndTitleContainer>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <HeaderIcons.chevron width={17} height={17} style={{color: themes.light.textColor.textPrimary}}/>
            </TouchableOpacity>
            <Title>{medicine.item_name}</Title>
            <View width={17} height={17} />
        </BackAndTitleContainer>
      </HeaderContainer>

      <ScrollView>
        <MedicineInfoContainer
            source={{uri: medicine.item_image}}
            blurRadius={15}
        >
            <Overlay/>
            <MedicineImage source={{uri: medicine.item_image}}/>
            <MedicineInfoSub style={{marginTop: 19}}>{medicine.entp_name}</MedicineInfoSub>
            <MedicineInfoName style={{marginTop: 6}}>{medicine.item_name}</MedicineInfoName>
            <MedicineInfoSub style={{marginTop: 10}}>{medicine.chart}</MedicineInfoSub>
            <MedicineUsageContainer style={{marginTop: 15}}>
                <InfoTag>{medicine.etc_otc_name}</InfoTag>
                <InfoTag bgColor={themes.light.boxColor.tagDetailSecondary}>{medicine.class_name}</InfoTag>
            </MedicineUsageContainer>
        </MedicineInfoContainer>

        <MedicineDetailContainer>
            <MedicineAppearanceContainer>
                <View style={{backgroundColor: themes.light.boxColor.inputPrimary, padding: 10, gap: 8}}>
                    <View style={{flexDirection: 'row', gap: 18}}>
                        <Text>표시(앞) </Text>
                        <Text>{medicine.print_front}</Text>
                    </View>
                    <View style={{flexDirection: 'row', gap: 18}}>
                        <Text>표시(뒤) </Text>
                        <Text>{medicine.print_back}</Text>
                    </View>
                    <View style={{flexDirection: 'row', gap: 18}}>
                        <Text>모양       </Text>
                        <Text>{medicine.drug_shape}</Text>
                    </View>
                    <View style={{flexDirection: 'row', gap: 18}}>
                        <Text>색상       </Text>
                        <Text>{medicine.color_class1}</Text>
                    </View>
                    <View style={{flexDirection: 'row', gap: 18}}>
                        <Text>크기       </Text>
                        <Text>{medicine.leng_long} X {medicine.leng_short} X {medicine.thick} (mm)</Text>
                    </View>
                </View>
            </MedicineAppearanceContainer>

            <MedicineUsageContainer>

            </MedicineUsageContainer>
        </MedicineDetailContainer>
        <Footer/>
      </ScrollView>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const HeaderContainer = styled.View`
  height: 108px;
  justify-content: flex-end;
  padding-bottom: 10px;
  background-color: ${themes.light.bgColor.bgPrimary};

`;

const BackAndTitleContainer = styled.View`
  flex-direction: row;
  padding: 0 15px;
  align-items: center;
`;

const MedicineInfoContainer = styled(ImageBackground)`
  align-items: flex-start;
  padding: 38px 25px 25px 25px;
`;

const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4); 
`;

const MedicineDetailContainer = styled.View`
  padding: 20px 0;
`;

const MedicineAppearanceContainer = styled.View`
  padding: 0 20px;
`;

const MedicineUsageContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  gap: 11px;
`;

const InfoTagContainer = styled.View`
  
`;

const Title = styled.Text`
  flex: 1;
  text-align: center;
  font-family: 'Pretendard-SemiBold';
  font-size: ${FontSizes.body.default};
  color: ${themes.light.textColor.textPrimary};
`;

const MedicineImage = styled.Image`
  width: 344px;
  height: 188px;
  border-radius: 10px;
`;

const MedicineInfoSub = styled.Text`
  flex: 1;
  text-align: center;
  font-family: 'Pretendard-SemiBold';
  font-size: ${FontSizes.body.default};
  color: ${themes.light.textColor.buttonText70};
`;

const MedicineInfoName = styled.Text`
  flex: 1;
  text-align: center;
  font-family: 'Pretendard-Bold';
  font-size: ${FontSizes.title.default};
  color: ${themes.light.textColor.buttonText};
`;

const InfoTag = styled.Text`
  font-size: 13px;
  font-family: 'Pretendard-SemiBold';
  background-color: ${(props) => props.bgColor || themes.light.boxColor.tagDetailPrimary};
  color: ${(props) => props.color || themes.light.textColor.buttonText};
  border-radius: 5px;
  padding: 6px 10px;
`;

export default MedicineDetailScreen;


