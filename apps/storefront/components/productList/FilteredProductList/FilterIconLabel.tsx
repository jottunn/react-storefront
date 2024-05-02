import React from "react";
import { useIntl } from "react-intl";
import messages from "@/components/translations";

const FilterIconLabel = () => {
  const t = useIntl();
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L12 14.414V20a1 1 0 01-1.707.707l-4-4A1 1 0 016 16v-4.586L3.293 6.707A1 1 0 013 6V4z"
        />
      </svg>
      <span className="text-base font-medium md:font-bold">
        {t.formatMessage(messages.filterBy)}
      </span>
    </>
  );
};

export default FilterIconLabel;
