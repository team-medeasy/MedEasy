import React from 'react';
import {View, Text} from 'react-native';
import {themes} from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import {ColorShapeView} from '../ColorShapeView';

const MedicineAppearance = ({ item, size = 'small' }) => {
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
      {item.print_front && <Appearance label={'표시(앞) '} value={item.print_front} size={size} />}
      {item.print_back && <Appearance label={'표시(뒤) '} value={item.print_back} size={size} />}
      {item.drug_shape && (
        <Appearance
          label={'모양       '}
          value={item.drug_shape}
          icon={<ColorShapeView type="shape" value={item.drug_shape} width={10} height={10}/>}
          size={size}
        />
      )}
      {item.color_class1 && (
        <Appearance
          label={'색상       '}
          value={item.color_class1}
          icon={<ColorShapeView type="color" value={item.color_class1} width={10} height={10}/>}
          size={size}
        />
      )}
      {item.leng_long && item.leng_short && item.thick && (
        <Appearance
          label={'크기       '}
          value={`${item.leng_long} X ${item.leng_short} X ${item.thick} (mm)`}
          size={size}
        />
      )}
    </View>
  );
};

const Appearance = ({ label, value, icon, size = 'large' }) => {
  // 폰트 사이즈 결정 로직
  const fontSize = size === 'large' ? FontSizes.body.default : FontSizes.caption.default;
  
  return (
    <View style={{ flexDirection: 'row', gap: 18, alignItems: 'center' }}>
      <Text
        style={{
          color: themes.light.textColor.Primary50,
          fontFamily: 'Pretendard-Medium',
          fontSize: fontSize,
        }}>
        {label}
      </Text>
      <View style={{flexDirection: 'row', alignItems: 'center' }}>
        {icon && <View>{icon}</View>}
        <Text
          style={{
            color: themes.light.pointColor.Primary,
            fontFamily: 'Pretendard-Bold',
            fontSize: fontSize,
          }}>
          {value}
        </Text>
      </View>
    </View>
  );
};

export {MedicineAppearance};