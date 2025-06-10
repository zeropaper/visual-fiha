import { forwardRef } from "react";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={[styles.button, variant && styles[variant]].join(" ")}
        type="button"
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
