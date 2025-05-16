import React from 'react';
import styled from 'styled-components/native';
import {themes} from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';
import {ColorShapeView} from '../ColorShapeView';

const MedicineAppearance = ({item, size = 'small'}) => {
  const {fontSizeMode} = useFontSize();
  
  if (!item.print_front && !item.print_back && !item.drug_shape && !item.color_classes && !(item.leng_long && item.leng_short && item.thick)) {
    return null; // 값이 하나도 없으면 렌더링하지 않음
  }
  
  // 색상 분리 처리
  const colors = item.color_classes ? item.color_classes.split(',').map(color => color.trim()) : [];
  
  return (
    <AppearanceContainer>
      {item.print_front && <Appearance label={'표시(앞) '} value={item.print_front} size={size} fontSizeMode={fontSizeMode} />}
      {item.print_back && <Appearance label={'표시(뒤) '} value={item.print_back} size={size} fontSizeMode={fontSizeMode} />}
      {item.drug_shape && (
        <Appearance
          label={'모양       '}
          value={item.drug_shape}
          icon={<ColorShapeView type="shape" value={item.drug_shape} width={10} height={10}/>}
          size={size}
          fontSizeMode={fontSizeMode}
        />
      )}
      {item.color_classes && (
        <Appearance
          label={'색상       '}
          value={colors}
          isColorArray={true}
          size={size}
          fontSizeMode={fontSizeMode}
        />
      )}
      {item.leng_long && item.leng_short && item.thick && (
        <Appearance
          label={'크기       '}
          value={`${item.leng_long} X ${item.leng_short} X ${item.thick} (mm)`}
          size={size}
          fontSizeMode={fontSizeMode}
        />
      )}
    </AppearanceContainer>
  );
};

const Appearance = ({label, value, icon, isColorArray = false, size = 'large', fontSizeMode}) => {
  return (
    <AppearanceRow>
      <AppearanceLabel fontSizeMode={fontSizeMode} size={size}>
        {label}
      </AppearanceLabel>
      
      {isColorArray ? (
        <ColorContainer>
          {value.map((color, index) => (
            <ColorItem key={index}>
              <ColorShapeView type="color" value={color} width={10} height={10}/>
              <AppearanceValue fontSizeMode={fontSizeMode} size={size}>
                {color}
              </AppearanceValue>
            </ColorItem>
          ))}
        </ColorContainer>
      ) : (
        <ValueContainer>
          {icon && <IconWrapper>{icon}</IconWrapper>}
          <AppearanceValue fontSizeMode={fontSizeMode} size={size}>
            {value}
          </AppearanceValue>
        </ValueContainer>
      )}
    </AppearanceRow>
  );
};

const AppearanceContainer = styled.View`
  background-color: ${themes.light.boxColor.inputPrimary};
  padding: 10px;
  gap: 8px;
  border-radius: 10px;
`;

const AppearanceRow = styled.View`
  flex-direction: row;
  gap: 18px;
  align-items: center;
`;

const AppearanceLabel = styled.Text`
  color: ${themes.light.textColor.Primary50};
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode, size}) => 
    size === 'large' ? FontSizes.body[fontSizeMode] : FontSizes.caption[fontSizeMode]};
`;

const AppearanceValue = styled.Text`
  color: ${themes.light.pointColor.Primary};
  font-family: 'Pretendard-Bold';
  font-size: ${({fontSizeMode, size}) => 
    size === 'large' ? FontSizes.body[fontSizeMode] : FontSizes.caption[fontSizeMode]};
`;

const ColorContainer = styled.View`
  flex-direction: row;
  gap: 10px;
`;

const ColorItem = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ValueContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const IconWrapper = styled.View`
  margin-right: 5px;
`;

export {MedicineAppearance};