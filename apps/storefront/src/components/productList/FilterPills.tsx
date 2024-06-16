"use client";

import { Chip } from "@/components/Chip";
import { Messages } from "@/lib/util";

export interface FilterPill {
  label: string;
  choiceSlug: string;
  attributeSlug: string;
}

export interface FilterPillsProps {
  pills: FilterPill[];
  onRemoveAttribute: (attributeSlug: string, choiceSlug: string) => void;
  onClearFilters: () => void;
  messages: Messages;
}

export function FilterPills({
  pills,
  onRemoveAttribute,
  onClearFilters,
  messages,
}: FilterPillsProps) {
  return (
    <div className="flex justify-start pr-3 w-full order-3 md:order-2">
      <div className="flex items-end flex-wrap gap-2.5 justify-start flex-grow">
        {typeof window !== "undefined" &&
          pills.map(({ label, attributeSlug, choiceSlug }) => (
            <Chip
              key={`${attributeSlug}-${choiceSlug}`}
              label={label}
              data-testid={`filterPill${choiceSlug}`}
              onClick={() => {
                onRemoveAttribute(attributeSlug, choiceSlug);
              }}
              classNames={{
                container: "!h-[3rem]",
                label: "!text-[1.2rem]",
              }}
            />
          ))}
        <button
          onClick={onClearFilters}
          className="text-main-1 hover:text-main-2 text-[1.4rem] underline relative transform -translate-y-[4px]"
          type="button"
          data-testid="clearFilters"
        >
          {messages["app.clearAll"]}
        </button>
      </div>
    </div>
  );
}

export default FilterPills;
