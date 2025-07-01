// import viteLogo from '/vite.svg';

import { MapCom } from './components/MapCom/MapCom';
import { BASE_URL } from '@/config';

import './App.css';

function App() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MapCom
        mapParams={{ center: { lng: 113.329249, lat: 23.087309 }, zoom: 15 }}
        iconClusterUrl={`${BASE_URL}/images/iconCluster.png`}
        iconImageUrl={`${BASE_URL}/images/image.png`}
      />
    </div>
  );
}
export default App;
