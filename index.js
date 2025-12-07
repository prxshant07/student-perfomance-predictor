import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.js'; // Import your main component or application logic
import './index.css';
// --- Modern React 18+ Setup ---

/**
 * The main entry point for the application.
 * It uses ReactDOM.createRoot to initialize and render the root component (App)
 * into the DOM element with the ID 'root'.
 */
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    // StrictMode is a tool for highlighting potential problems in an application.
    // It does not render any visible UI.
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("The root element with ID 'root' was not found in the DOM.");
}

// NOTE: If you are using this in a simple environment without React/JSX setup,
// you might need to adapt './app.js' to export a simple function or class
// and call it directly here, or if 'app.js' is an Express server, you would

// import it here and call its 'listen' method.
