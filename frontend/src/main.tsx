import React from 'react';
import ReactDOM from 'react-dom/client';
// Self-hosted variable font: no third-party font CDN request (privacy), and
// unicode-range subsets mean Polish glyphs (latin-ext) load only when needed.
import '@fontsource-variable/plus-jakarta-sans';
import App from './App';
import './app/globals.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
