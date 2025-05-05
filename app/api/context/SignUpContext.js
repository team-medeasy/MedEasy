import React, { createContext, useContext, useEffect, useState } from 'react';

const SignUpContext = createContext({
  signUpData: {
    email: '',
    password: '',
    birthday: '',
    gender: '',
    name: '', 
  },
  updateSignUpData: () => {},
  resetSignUpData: () => {},
});

export const SignUpProvider = ({ children }) => {
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    birthday: '',
    gender: '',
    name: '', 
  });

  const updateSignUpData = newData => {
    console.log('Updating SignUp Data:', newData);
    setSignUpData(prev => ({...prev, ...newData}));
  };

  const resetSignUpData = () => {
    console.log('Resetting SignUp Data');
    setSignUpData({
      email: '',
      password: '',
      birthday: '',
      gender: '',
      name: '', 
    });
  };

  console.log('Current SignUp Data:', signUpData);

  return (
    <SignUpContext.Provider value={{ signUpData, updateSignUpData, resetSignUpData }}>
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
