import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { CashProvider } from './context/CashContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CashProvider>
      <App />
    </CashProvider>
  </React.StrictMode>
);
