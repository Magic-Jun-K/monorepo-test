import { render } from 'react-dom';

import App from './App.tsx';
import '@unocss/reset/tailwind.css'; /* 引入 CSS 重置 */
import 'virtual:uno.css';

render(<App />, document.getElementById('root')!);
