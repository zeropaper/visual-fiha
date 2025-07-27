import { forwardRef } from "react";
import styles from "./Select.module.css";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (props, ref) => {
    return <select ref={ref} className={styles.select} {...props} />;
  },
);
Select.displayName = "Select";
