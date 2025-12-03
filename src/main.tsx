// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import AFrameViewer from './App.tsx'; // Import komponen baru
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AFrameViewer />
  </React.StrictMode>,
);
