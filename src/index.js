import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext';
import { AlertStackProvider } from './components/ui/alert-stack';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <AlertStackProvider>
        <App />
      </AlertStackProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
