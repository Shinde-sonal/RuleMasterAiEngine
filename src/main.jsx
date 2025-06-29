// src/main.jsx (or src/index.js) - Corrected

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client' // Correct: createRoot is imported directly
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import App from './App.jsx'

// Use createRoot directly here
createRoot(document.getElementById('root')).render(
  <StrictMode> {/* No need for React.StrictMode, just StrictMode */}
    {/* Wrap App with BrowserRouter here */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);