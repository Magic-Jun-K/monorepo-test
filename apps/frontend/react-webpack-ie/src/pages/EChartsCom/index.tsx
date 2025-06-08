import { FC } from 'react';

import EChartsCom from '@/components/echarts';
import { PieOptions } from './constant';

const options = PieOptions;

const MyChartComponent: FC = () => {
  return <EChartsCom options={options} />;
};

export default MyChartComponent;
