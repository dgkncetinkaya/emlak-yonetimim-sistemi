import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.sidebarTop}>
      <div className={styles.content}>
        <p className={styles.helloLaylaOdam}>Hello, Layla Odam!</p>
        <p className={styles.welcomeBackLetSExplo}>
          Welcome back, let's explore now!
        </p>
      </div>
      <div className={styles.frame1261159199}>
        <div className={styles.searchBar}>
          <img src="../image/mf43tyog-8eyffkv.svg" className={styles.seachIcon} />
          <p className={styles.searchHere}>Search here</p>
        </div>
        <div className={styles.frame327}>
          <img src="../image/mf43tyog-qm5o9tw.svg" className={styles.bell} />
        </div>
        <img src="../image/mf43tyog-wzlmpsb.svg" className={styles.icons} />
        <div className={styles.languange}>
          <div className={styles.text}>
            <img src="../image/mf43tyog-uc65ksb.svg" className={styles.united} />
            <p className={styles.engUs}>Eng (US)</p>
          </div>
          <img src="../image/mf43tyog-jdwl58c.svg" className={styles.united} />
        </div>
      </div>
    </div>
  );
}

export default Component;
