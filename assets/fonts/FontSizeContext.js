import {createContext, useContext, useState} from 'react';

const FontSizeContext = createContext();

export const FontSizeProvider = ({children}) => {
  const [fontSizeMode, setFontSizeMode] = useState('default');

  return (
    <FontSizeContext.Provider value={{fontSizeMode, setFontSizeMode}}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => useContext(FontSizeContext);
