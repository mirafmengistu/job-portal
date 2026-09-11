import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client/react';
import { client } from './apollo/client';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './components/common/theme-provider';
import { Toaster } from 'sonner';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ApolloProvider client={client}>
        <AuthProvider>
          <App />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </ApolloProvider>
    </ThemeProvider>
  </React.StrictMode>
);