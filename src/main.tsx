import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { DataProvider } from './context/DataContext';
import { RepositoryProvider } from './context/RepositoryContext';
import { ThemeProvider } from './context/ThemeContext';
import { ConversationsRepositoryProvider } from './context/ConversationsRepositoryContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RepositoryProvider>
      <DataProvider>
        <ThemeProvider>
          <ConversationsRepositoryProvider>
            <App />
          </ConversationsRepositoryProvider>
        </ThemeProvider>
      </DataProvider>
    </RepositoryProvider>
  </React.StrictMode>,
);
