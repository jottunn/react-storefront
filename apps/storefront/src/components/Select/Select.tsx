import {
  ChangeEvent,
  ForwardedRef,
  forwardRef,
  ReactNode,
  SelectHTMLAttributes,
  useState,
} from "react";
import clsx from "clsx";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
const PLACEHOLDER_KEY = "placeholder";

type ClassNames<Keys extends string> = Partial<Record<Keys, string>>;
export interface Option<TData extends string = string> {
  label: string | ReactNode;
  value: TData;
  disabled?: boolean;
  icon?: string | ReactNode;
  [key: string]: unknown;
}

export type SelectOnChangeHandler<TData extends string = string> = (value: TData) => void;

export interface SelectProps<TData extends string = string>
  extends SelectHTMLAttributes<HTMLSelectElement> {
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: Option<TData>[];
  classNames?: ClassNames<"container">;
  placeholder?: string;
}

const SelectComponent = <TData extends string = string>(
  { options, classNames, placeholder = "", onChange, ...rest }: SelectProps<TData>,
  ref: ForwardedRef<HTMLSelectElement>,
) => {
  const [showPlaceholder, setShowPlaceholder] = useState(!!placeholder);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if ((event.target as HTMLSelectElement).value === PLACEHOLDER_KEY) {
      return;
    }

    setShowPlaceholder(false);
    onChange(event);
  };

  return (
    <div className={clsx("relative inline-block min-w-[50px] w-full", classNames?.container)}>
      <select
        {...rest}
        onChange={handleChange}
        ref={ref}
        className="h-10 border rounded border-gray-400 py-2 px-3 pr-12 w-full text-base appearance-none cursor-pointer disabled:pointer-events-none disabled:select-none disabled:text-gray-500 focus:border-gray-700 active:border-gray-700 focus:outline-none active:outline-none"
      >
        {showPlaceholder && (
          <option disabled value="">
            {placeholder}
          </option>
        )}
        {options.map(({ label, value, disabled = false }) => (
          <option value={value} disabled={disabled} key={(label || "").toString() + "_" + value}>
            {label}
          </option>
        ))}
      </select>
      <div className="absolute top-2 right-2 pl-2 border-l border-gray-500 pointer-events-none">
        <ChevronDownIcon />
      </div>
    </div>
  );
};

export const Select = forwardRef(SelectComponent);
