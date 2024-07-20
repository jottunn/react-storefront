import { AddressDetailsFragment } from "@/saleor/api";

export interface AddressDisplayProps {
  address: AddressDetailsFragment;
}

export default function AddressDisplay({ address }: AddressDisplayProps) {
  return (
    <div className="text-base">
      <address className="not-italic mb-2">
        <p>
          {address?.firstName} {address?.lastName}
        </p>
        {address?.companyName && <p>{address?.companyName}</p>}
        <p>
          {address?.streetAddress1} {address?.streetAddress2}
        </p>
        <p>
          {address?.postalCode} {address?.city}
        </p>
        <p>
          {address?.countryArea}, {address?.country.country}
        </p>
      </address>
      <div>{address?.phone}</div>
    </div>
  );
}
