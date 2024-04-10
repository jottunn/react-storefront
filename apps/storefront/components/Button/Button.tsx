import { type FC, type ReactNode, type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

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
  const classes = clsx(
    "inline-flex h-10 items-center justify-center whitespace-nowrap border active:outline-none text-sm uppercase",
    {
      "border-action-1 bg-action-2 hover:bg-action-1 disabled:bg-neutral-700 text-white px-4 aria-disabled:cursor-not-allowed aria-disabled:opacity-70 hover:aria-disabled:bg-neutral-700":
        variant === "primary",
      "border-neutral-600 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white active:bg-neutral-300 disabled:border-neutral-300 aria-disabled:border-neutral-300 bg-transparent disabled:bg-transparent aria-disabled:bg-transparent px-4":
        variant === "secondary",
      "h-auto border-none bg-transparent p-0": variant === "tertiary",
    },
    className
  );

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
