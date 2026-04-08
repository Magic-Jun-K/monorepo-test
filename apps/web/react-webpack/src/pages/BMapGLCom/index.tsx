import { Input } from '@eggshell/ui-tailwind';
import { MapCom, MapSearch, PlaceResult } from '@eggshell/core-business-components';

import { BASE_URL } from '@/config';

// 处理搜索结果
const handleSearchResult = (results: PlaceResult[]) => {
  console.log('搜索结果:', results);
};

// 处理选择地点
const handlePlaceSelect = (place: PlaceResult) => {
  console.log('选择地点:', place);
};

export default () => {
  return (
    <div className="w-full h-full relative">
      <MapCom
        mapParams={{ center: { lng: 113.329249, lat: 23.087309 }, zoom: 15 }}
        iconClusterUrl={`${BASE_URL}/images/iconCluster.png`}
        iconImageUrl={`${BASE_URL}/images/image.png`}
      />
      <div className="absolute top-0 w-full z-999 p-2.5 pointer-events-none flex justify-between items-center">
        <div className="relative w-75 bg-white pointer-events-auto">
          <MapSearch onSearchResult={handleSearchResult} onPlaceSelect={handlePlaceSelect} />
        </div>
        <div className="relative w-75 bg-white pointer-events-auto">
          <Input placeholder="搜索" />
        </div>
      </div>
    </div>
  );
};
