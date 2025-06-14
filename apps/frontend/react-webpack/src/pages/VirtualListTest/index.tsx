import VirtualList from './VirtualList';

import styles from './index.module.scss';

export default () => {
  return (
    <div className={styles.container}>
      <VirtualList />
    </div>
  );
};
