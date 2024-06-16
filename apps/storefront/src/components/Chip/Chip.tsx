"use client";

import { FC, ReactNode, MouseEvent } from "react";
import clsx from "clsx";

import styles from "./Chip.module.css";
import { RemoveIcon } from "./RemoveIcon";

interface ButtonLabelProps {
  content: string;
  className?: string;
}
export const ButtonLabel: FC<ButtonLabelProps> = ({ content, ...rest }) => (
  <span className="font-semibold" {...rest}>
    {content}
  </span>
);
export interface ChipProps {
  icon?: ReactNode;
  label: string;
  classNames?: ClassNames<"container" | "label" | "button">;
  onClick: (e?: MouseEvent) => void;
}

export type ClassNames<Keys extends string> = Partial<Record<Keys, string>>;

export const Chip: FC<ChipProps> = ({ label, icon, classNames, onClick, ...rest }) => (
  <div className={clsx(styles.chip, classNames?.container)} {...rest}>
    {icon}
    <ButtonLabel
      content={label}
      className={clsx({ [styles["chip-label-margin"]]: !!icon }, classNames?.label)}
    />
    <button
      type="button"
      className={clsx(styles["chip-button"], classNames?.button)}
      onClick={onClick}
    >
      <RemoveIcon />
    </button>
  </div>
);
