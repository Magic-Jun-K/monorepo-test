import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import '@unocss/reset/tailwind.css'; /* 引入 CSS 重置 */
import 'virtual:uno.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
