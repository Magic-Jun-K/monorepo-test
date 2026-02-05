import { FC } from 'react';

import Router from './router';

import '@/assets/css/index.scss';
import '@/assets/css/font.scss';
import '@eggshell/ui-unocss-ie/lib/es/index.css';

const App: FC = () => {
  return <Router />;
};

export default App;
