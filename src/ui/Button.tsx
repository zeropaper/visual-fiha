import { forwardRef } from "react";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "icon";
  mode?: "ghost";
  outcome?: "error" | "success";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, mode, outcome, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={[
          styles.button,
          variant && styles[variant],
          mode && styles[mode],
          outcome && styles[outcome],
        ].join(" ")}
        type="button"
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export const buttonStyles = styles; // Export styles for custom styling if needed
