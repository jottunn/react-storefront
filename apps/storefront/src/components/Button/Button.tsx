import { type FC, type ReactNode, type ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import "./Button.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: ReactNode;
  variant?: "primary" | "secondary" | "tertiary";
  ariaLabel?: string;
  ariaDisabled?: boolean;
}
export const Button: FC<ButtonProps> = ({
  label,
  className,
  variant = "primary",
  disabled = false,
  children: _children,
  type = "button",
  ariaLabel,
  ariaDisabled,
  ...rest
}) => {
  const baseClasses = "button";
  const variantClasses = clsx({
    "button-primary": variant === "primary",
    "button-secondary": variant === "secondary",
    "button-tertiary": variant === "tertiary",
  });

  const classes = clsx(baseClasses, variantClasses, className);

  return (
    <button
      aria-label={ariaLabel}
      aria-disabled={ariaDisabled}
      disabled={disabled}
      className={classes}
      type={type === "submit" ? "submit" : "button"}
      {...rest}
    >
      {typeof label === "string" ? <span className="font-semibold">{label}</span> : label}
    </button>
  );
};
