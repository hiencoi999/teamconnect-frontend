import { createContext, useState } from 'react';
const AuthContext = createContext({
  accessToken: null,
  setAccessToken: () => {},
});

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
