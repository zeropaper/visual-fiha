import styles from "./LoadingFallback.module.css";

export function LoadingFallback() {
  return (
    <div className={styles.root}>
      <svg
        className={styles.logo}
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox="0 0 1000 1000"
      >
        <title>Visual Fiha logo</title>
        <path
          d="m 42.144772,100.70423 460.738378,798.02231 137.92084,-238.11891 -100.83949,0 -83.42113,-144.48961 267.68175,0 78.38889,-135.77355 -424.45952,0 -83.42215,-144.49139 591.30382,0 78.02825,-135.14885 z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
