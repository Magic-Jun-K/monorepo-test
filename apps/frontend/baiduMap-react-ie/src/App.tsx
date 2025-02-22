import { FC } from 'react';

import Router from './router';

import '@/assets/css/index.scss';
import '@/assets/css/font.scss';
import '@eggshell/unocss-ui-ie/build/es/index.css';

const App: FC = () => {
  return <Router />;
};

export default App;
