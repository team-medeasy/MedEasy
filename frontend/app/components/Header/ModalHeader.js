import React from 'react'; 
import styled from 'styled-components/native'; 
import {TouchableOpacity, View} from 'react-native'; 
import {useNavigation} from '@react-navigation/native'; 
import {HeaderIcons} from '../../../assets/icons'; 
import {themes} from '../../styles'; 
import FontSizes from '../../../assets/fonts/fontSizes';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';

const ModalHeader = ({
  children, 
  onBackPress, 
  showDelete = false, 
  DeleteColor, 
  onDeletePress
}) => {   
  const navigation = useNavigation();   
  const handleBackPress = onBackPress || (() => navigation.goBack());
  const { fontSizeMode } = useFontSize();
  
  return (     
    <HeaderContainer>       
      <BackAndTitleContainer>         
        <TouchableOpacity onPress={handleBackPress} style={{padding: 15}}>           
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
        {showDelete ? (
          <TouchableOpacity onPress={onDeletePress} style={{padding: 15}}>
            <HeaderIcons.trash
              width={17}
              height={17}
              style={{color: DeleteColor || themes.light.textColor.Primary30}}
            />
          </TouchableOpacity>
        ) : (
          <View width={17} height={17} />
        )}
      </BackAndTitleContainer>     
    </HeaderContainer>   
  ); 
};  

const HeaderContainer = styled.View`   
  justify-content: flex-end;   
  //padding: 15px 0px;   
  background-color: ${themes.light.bgColor.bgPrimary};   
  border-bottom-width: 1px;   
  border-bottom-color: ${themes.light.borderColor.borderPrimary}; 
`;  

const BackAndTitleContainer = styled.View`   
  flex-direction: row;   
  //padding: 0 15px;   
  align-items: center; 
`;  

const Title = styled.Text`   
  flex: 1;   
  text-align: center;   
  font-family: 'Pretendard-SemiBold';   
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  color: ${themes.light.textColor.textPrimary}; 
`;  

export {ModalHeader};