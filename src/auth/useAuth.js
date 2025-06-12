import { useContext } from 'react';
import { AuthContext } from './AuthContext.jsx';

/**
 * Custom hook to easily access the authentication context.
 * This is the central point for components to get user data.
 */
export const useAuth = () => {
  return useContext(AuthContext);
};