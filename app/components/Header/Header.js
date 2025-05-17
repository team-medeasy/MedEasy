import React from 'react';
import styled from 'styled-components/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {HeaderIcons} from '../../../assets/icons';
import {themes} from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';

const Header = ({
  children, 
  onBackPress, 
  hideBorder = false,
  transparentBg = false,
  titleColor,
  iconColor,
}) => {
  const navigation = useNavigation();
  const handleBackPress = onBackPress || (() => navigation.goBack());
  const {fontSizeMode} = useFontSize();
  const insets = useSafeAreaInsets(); // SafeArea 인셋 가져오기

  return (
    <HeaderContainer 
      hideBorder={hideBorder}
      transparentBg={transparentBg}
      style={{ paddingTop: insets.top }}
    >
      <BackAndTitleContainer>
        <TouchableOpacity style={{padding: 12}} onPress={handleBackPress}>
          <HeaderIcons.chevron
            width={17}
            height={17}
            style={{color: iconColor || themes.light.textColor.textPrimary}}
          />
        </TouchableOpacity>
        <Title
          fontSizeMode={fontSizeMode}
          numberOfLines={1}
          ellipsizeMode="tail"
          titleColor={titleColor}>
          {children}
        </Title>
        <View width={41} height={41} />
      </BackAndTitleContainer>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.View`
  justify-content: flex-end;
  background-color: ${({transparentBg}) =>
    transparentBg ? 'transparent' : themes.light.bgColor.bgPrimary};
  border-bottom-width: ${props => (props.hideBorder ? 0 : 1)}px;
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
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  color: ${({titleColor}) => titleColor || themes.light.textColor.textPrimary};
`;

export {Header};