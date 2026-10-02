import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
// @ts-expect-error CSS side-effect imports are handled by the bundler.
import './index.css';

createRoot(document.getElementById('root')!)
.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
