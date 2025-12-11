import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.leftSideMenu}>
      <div className={styles.logo}>
        <img src="../image/mf43o2ld-zhuefnr.svg" className={styles.icon} />
        <p className={styles.logoSName}>Logo's Name</p>
      </div>
      <div className={styles.options}>
        <div className={styles.frame25}>
          <div className={styles.frame19}>
            <div className={styles.frame9}>
              <img
                src="../image/mf43o2ld-zvcd7yh.svg"
                className={styles.template}
              />
              <p className={styles.dashboard}>Dashboard</p>
            </div>
            <div className={styles.autoWrapper}>
              <div className={styles.line5} />
            </div>
          </div>
          <div className={styles.frame1}>
            <img src="../image/mf43o2ld-f5caed3.svg" className={styles.template} />
            <p className={styles.discover}>Discover</p>
          </div>
          <div className={styles.frame22}>
            <div className={styles.frame2}>
              <img
                src="../image/mf43o2ld-l3k64mj.svg"
                className={styles.template}
              />
              <p className={styles.discover}>Inbox</p>
            </div>
            <div className={styles.ellipse14}>
              <p className={styles.a3}>3</p>
            </div>
          </div>
          <div className={styles.frame4}>
            <img src="../image/mf43o2ld-8jj7ao2.svg" className={styles.template} />
            <p className={styles.discover}>My Wallet</p>
          </div>
          <div className={styles.frame5}>
            <img src="../image/mf43o2ld-isggq6l.svg" className={styles.template} />
            <p className={styles.discover}>Analytics</p>
          </div>
          <div className={styles.frame23}>
            <div className={styles.frame6}>
              <img
                src="../image/mf43o2ld-vp4zd3h.svg"
                className={styles.template}
              />
              <p className={styles.discover}>Notifications</p>
            </div>
            <div className={styles.ellipse142}>
              <p className={styles.a5}>5</p>
            </div>
          </div>
          <div className={styles.frame3}>
            <img src="../image/mf43o2ld-k8ix65c.svg" className={styles.template} />
            <p className={styles.discover}>Settings</p>
          </div>
        </div>
        <div className={styles.frame7}>
          <img src="../image/mf43o2ld-ttjrq8z.svg" className={styles.template} />
          <p className={styles.helpSupport}>Help & Support</p>
        </div>
      </div>
      <div className={styles.frame8}>
        <img src="../image/mf43o2ld-ahotd64.svg" className={styles.template} />
        <p className={styles.logOut}>Log Out</p>
      </div>
    </div>
  );
}

export default Component;
