import messages from "@/components/translations";
import { Chip } from "@saleor/ui-kit";
import { useIntl } from "react-intl";

export interface FilterPill {
  label: string;
  choiceSlug: string;
  attributeSlug: string;
}

export interface FilterPillsProps {
  pills: FilterPill[];
  onRemoveAttribute: (attributeSlug: string, choiceSlug: string) => void;
  onClearFilters: () => void;
}

export function FilterPills({ pills, onRemoveAttribute, onClearFilters }: FilterPillsProps) {
  const t = useIntl();
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
          {t.formatMessage(messages.clearAll)}
        </button>
      </div>
    </div>
  );
}

export default FilterPills;
