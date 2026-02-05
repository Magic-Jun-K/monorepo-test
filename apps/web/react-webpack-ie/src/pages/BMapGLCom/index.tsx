import { Input } from '@eggshell/ui-unocss-ie';
import MapCom from './components/MapCom/MapCom';
import AutoCompleteCom from './components/AutoCompleteCom';
import styles from './index.module.scss';

export default () => {
  return (
    <div className={styles.mapContainer}>
      <MapCom mapParams={{ center: { lng: 113.329249, lat: 23.087309 }, zoom: 15 }} />
      <div className={styles.mapContainerTop}>
        <div className={styles['search-input']} style={{ width: '360px' }}>
          <AutoCompleteCom />
        </div>
        <div className={styles['search-input']}>
          <Input placeholder="搜索" />
        </div>
      </div>
    </div>
  );
};
