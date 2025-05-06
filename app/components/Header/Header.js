import React from 'react';
import styled from 'styled-components/native';
import {TouchableOpacity, View, Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {HeaderIcons} from '../../../assets/icons';
import {themes} from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';

const Header = ({children, onBackPress}) => {
  const navigation = useNavigation();
  const handleBackPress = onBackPress || (() => navigation.goBack());
  const {fontSizeMode} = useFontSize();

  return (
    <HeaderContainer>
      <BackAndTitleContainer>
        <TouchableOpacity style={{padding: 12}} onPress={handleBackPress}>
          <HeaderIcons.chevron
            width={17}
            height={17}
            style={{color: themes.light.textColor.textPrimary}}
          />
        </TouchableOpacity>
        <Title
          fontSizeMode={fontSizeMode}
          numberOfLines={1}
          ellipsizeMode="tail">
          {children}
        </Title>
        <View width={41} height={41} />
      </BackAndTitleContainer>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.View`
  ${Platform.OS === 'ios' &&
  `
    height: 108px;
  `}
  ${Platform.OS === 'android' &&
  `
    height: 50px;
  `}
  justify-content: flex-end;
  background-color: ${themes.light.bgColor.bgPrimary};
  border-bottom-width: 1;
  border-bottom-color: ${themes.light.borderColor.borderPrimary};
`;

const BackAndTitleContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Title = styled.Text`
  flex: 1;
  text-align: center;
  font-family: 'Pretendard-SemiBold';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  color: ${themes.light.textColor.textPrimary};
`;

export {Header};
