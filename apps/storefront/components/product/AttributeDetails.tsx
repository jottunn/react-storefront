import { ATTR_BRAND_REF, ATTR_GHID_MARIMI } from "@/lib/const";
import { getProductAttributes } from "@/lib/product";
import { translate } from "@/lib/translations";
import { ProductDetailsFragment, ProductVariantDetailsFragment } from "@/saleor/api";

export interface AttributeDetailsProps {
  product: ProductDetailsFragment;
  selectedVariant?: ProductVariantDetailsFragment | null;
}

export function AttributeDetails({ product, selectedVariant }: AttributeDetailsProps) {
  // const t = useIntl();
  const attributes = getProductAttributes(product, selectedVariant)
    .filter((attr) => attr.attribute.slug !== ATTR_GHID_MARIMI)
    .filter((attr) => attr.attribute.slug !== ATTR_BRAND_REF);
  if (attributes.length === 0) {
    return null;
  }
  return (
    <div>
      {attributes.map((attribute) => (
        <div key={attribute.attribute.id} className="grid grid-cols-2">
          <div>
            <p className="text-base">{translate(attribute.attribute, "name")}</p>
          </div>
          <div>
            {attribute.values.map((value, index) => {
              if (!value) {
                return null;
              }
              return (
                <div key={value.id}>
                  <p className="text-base">
                    {translate(value, "name")}
                    {attribute.values.length !== index + 1 && <div>{" | "}</div>}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
