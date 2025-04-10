import { createRef } from 'react';

export const navigationRef = createRef();

export function navigate(name, params) {
  navigationRef.current?.navigate(name, params);
  console.log("name: ", name, "params: ", params);
}

export function resetNavigate(name, params) {
    navigationRef.current?.reset({
      index: 0,
      routes: [{ name: name, params: params }],
    });
    console.log("resetNavigate to - name:", name, "params:", params);
  }