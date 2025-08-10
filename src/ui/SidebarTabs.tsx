import { Button } from "@ui/Button";
import styles from "./SidebarTabs.module.css";

export interface SidebarTab {
  title: string;
  icon: JSX.Element;
  content: JSX.Element;
}

export function SidebarTabs<T extends Record<string, SidebarTab>>({
  tabs,
  currentTab,
  setCurrentTab,
}: {
  tabs: T;
  currentTab: keyof T;
  setCurrentTab: (tab: keyof T) => void;
}) {
  return (
    <div
      className={`${styles.sidebarTabs} sidebar sidebar-${String(currentTab)}`}
    >
      <nav>
        <ul className={`${styles.tabsList} tab-list`}>
          {Object.entries(tabs).map(([key, { title, icon }]) => (
            <li key={key} className={styles.tabItem}>
              <Button
                title={title}
                onClick={() => setCurrentTab(key)}
                className={
                  currentTab === key
                    ? `${styles.tabButton} ${styles.tabButtonActive}`
                    : styles.tabButton
                }
              >
                {icon}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.tabContent}>
        <strong className={styles.tabTitle}>{tabs[currentTab].title}</strong>
        <div className={styles.sidebarScrollable}>
          <div className={`${styles.sidebarScrollableInner} tab-content`}>
            {Object.entries(tabs).map(([key, { content }]) => (
              <div
                key={key}
                className={
                  key === currentTab
                    ? styles.tabPanelActive
                    : styles.tabPanelInactive
                }
              >
                {content}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
