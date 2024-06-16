// components/Icon.tsx
import React from "react";

interface IconProps {
  name: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className }) => {
  return (
    <svg className={className} aria-hidden="true">
      <use xlinkHref={`#${name}`} />
    </svg>
  );
};

export default Icon;
