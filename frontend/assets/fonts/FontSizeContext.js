import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FONT_SIZE_STORAGE_KEY = '@app_font_size_mode';

const FontSizeContext = createContext();

export const FontSizeProvider = ({ children }) => {
  const [fontSizeMode, setFontSizeModeState] = useState('default');
  const [isLoading, setIsLoading] = useState(true);

  // AsyncStorage에서 폰트 크기 로딩
  useEffect(() => {
    const loadFontSize = async () => {
      try {
        const savedFontSize = await AsyncStorage.getItem(FONT_SIZE_STORAGE_KEY);
        if (savedFontSize !== null) {
          setFontSizeModeState(savedFontSize);
        }
      } catch (error) {
        console.error('폰트 사이즈 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFontSize();
  }, []);

  // 폰트 사이즈 변경 시 AsyncStorage에 저장
  const setFontSizeMode = async (newMode) => {
    try {
      await AsyncStorage.setItem(FONT_SIZE_STORAGE_KEY, newMode);
      setFontSizeModeState(newMode);
    } catch (error) {
      console.error('폰트 사이즈 저장 실패:', error);
    }
  };

  return (
    <FontSizeContext.Provider 
      value={{ 
        fontSizeMode, 
        setFontSizeMode,
        isLoading 
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (context === undefined) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
};

export default FontSizeContext;