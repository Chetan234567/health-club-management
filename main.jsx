/*
 * File Path: src/main.jsx
 * Description: React application entry point initializing DOM root and rendering top-level App component inside StrictMode.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
