import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { gql } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import type { User } from '../types';
import { jwtDecode } from 'jwt-decode';

// Define the query here directly to avoid import issues
const GET_ME_QUERY = gql`
  query GetMe($token: String!) {
    me(token: $token) {
      id
      name
      email
      role
      createdAt
    }
  }
`;

// ✅ ADD THIS: Define the query response type
interface GetMeQueryData {
  me: User;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const client = useApolloClient();

  // Load user from token
  const loadUser = async (authToken: string) => {
    try {
      const { data } = await client.query<GetMeQueryData>({
        query: GET_ME_QUERY,
        variables: { token: authToken },
        fetchPolicy: 'network-only',
      });
      
      if (data?.me) {
        setUser(data.me);
        setToken(authToken);
        localStorage.setItem('token', authToken);
      } else {
        // If no user data, clear token
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded: any = jwtDecode(storedToken);
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          loadUser(storedToken);
        } else {
          localStorage.removeItem('token');
          setLoading(false);
        }
      } catch {
        localStorage.removeItem('token');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (newToken: string) => {
    setLoading(true);
    await loadUser(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token && !!user,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};