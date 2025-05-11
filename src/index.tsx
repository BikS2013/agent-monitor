import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { RepositoryProvider } from './context/RepositoryContext';
import { DataProvider } from './context/DataContext';
import { ErrorProvider } from './context/ErrorContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorProvider>
      <RepositoryProvider>
        <DataProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </DataProvider>
      </RepositoryProvider>
    </ErrorProvider>
  </React.StrictMode>
);