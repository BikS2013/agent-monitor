import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { DataProvider } from './context/DataContext';
import { RepositoryProvider } from './context/RepositoryContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RepositoryProvider>
      <DataProvider>
        <App />
      </DataProvider>
    </RepositoryProvider>
  </React.StrictMode>,
);
