import { Input } from '@eggshell/unocss-ui';
import { MapCom, MapSearch, PlaceResult } from '@eggshell/core-business-components';

import { BASE_URL } from '@/config';

import styles from './index.module.scss';

export default () => {
  // 处理搜索结果
  const handleSearchResult = (results: PlaceResult[]) => {
    console.log('搜索结果:', results);
  };

  // 处理选择地点
  const handlePlaceSelect = (place: PlaceResult) => {
    console.log('选择地点:', place);
  };

  return (
    <div className={styles.mapContainer}>
      <MapCom
        mapParams={{ center: { lng: 113.329249, lat: 23.087309 }, zoom: 15 }}
        iconClusterUrl={`${BASE_URL}/images/iconCluster.png`}
        iconImageUrl={`${BASE_URL}/images/image.png`}
      />
      <div className={styles.mapContainerTop}>
        <div className={styles['search-input']}>
          <MapSearch 
            onSearchResult={handleSearchResult}
            onPlaceSelect={handlePlaceSelect}
          />
        </div>
        <div className={styles['search-input']}>
          <Input placeholder="搜索" />
        </div>
      </div>
    </div>
  );
};