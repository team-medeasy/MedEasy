import React from 'react';
import {View, Text} from 'react-native';
import {themes} from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';

const MedicineAppearance = ({ item }) => {
    if (!item.print_front && !item.print_back && !item.drug_shape && !item.color_class1 && !(item.leng_long && item.leng_short && item.thick)) {
      return null; // 값이 하나도 없으면 렌더링하지 않음
    }
  
    return (
      <View
        style={{
          backgroundColor: themes.light.boxColor.inputPrimary,
          padding: 10,
          gap: 8,
          borderRadius: 10,
        }}>
        {/* 값이 존재하는 데이터만 렌더링 */}
        {item.print_front && <Appearance label={'표시(앞) '} value={item.print_front} />}
        {item.print_back && <Appearance label={'표시(뒤) '} value={item.print_back} />}
        {item.drug_shape && <Appearance label={'모양       '} value={item.drug_shape} />}
        {item.color_class1 && <Appearance label={'색상       '} value={item.color_class1} />}
        {item.leng_long && item.leng_short && item.thick && (
          <Appearance
            label={'크기       '}
            value={`${item.leng_long} X ${item.leng_short} X ${item.thick} (mm)`}
          />
        )}
      </View>
    );
  };
  
  const Appearance = ({ label, value }) => (
    <View style={{ flexDirection: 'row', gap: 18 }}>
      <Text
        style={{
          color: themes.light.textColor.Primary50,
          fontFamily: 'Pretendard-Medium',
          fontSize: FontSizes.caption.default,
        }}>
        {label}
      </Text>
      <Text
        style={{
          color: themes.light.pointColor.Primary,
          fontFamily: 'Pretendard-Bold',
          fontSize: FontSizes.caption.default,
        }}>
        {value}
      </Text>
    </View>
  );
  
export {MedicineAppearance};