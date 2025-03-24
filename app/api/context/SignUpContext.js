import React, { createContext, useContext, useState } from 'react';

const SignUpContext = createContext({
  signUpData: {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    birthday: '',
    gender: '',
  },
  updateSignUpData: () => {},
  resetSignUpData: () => {},
});

export const SignUpProvider = ({children}) => {
  const [signUpData, setSignUpData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    birthday: '',
    gender: '',
  });
  
  const updateSignUpData = newData => {
    console.log('Updating SignUp Data:', newData);
    setSignUpData(prev => ({...prev, ...newData}));
  };
  
  const resetSignUpData = () => {
    console.log('Resetting SignUp Data');
    setSignUpData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      birthday: '',
      gender: '',
    });
  };
  
  console.log('Current SignUp Data:', signUpData);
  
  return (
    <SignUpContext.Provider value={{signUpData, updateSignUpData, resetSignUpData}}>
      {children}
    </SignUpContext.Provider>
  );
};

export const useSignUp = () => {
  const context = useContext(SignUpContext);
  if (!context) {
    throw new Error('useSignUp must be used within a SignUpProvider');
  }
  console.log('SignUp Context:', context);
  return context;
};