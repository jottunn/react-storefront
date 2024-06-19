"use client";

type Props = {
  disabled?: boolean;
  checkoutId?: string;
  className?: string;
  btnName?: string;
};

const CheckoutLink = ({ disabled, checkoutId, className = "", btnName }: Props) => {
  console.log("btnName", btnName);
  return (
    <a
      data-testid="CheckoutLink"
      aria-disabled={disabled}
      onClick={(e) => disabled && e.preventDefault()}
      href={`/checkout?checkout=${checkoutId}`}
      className={`inline-block max-w-full rounded border border-transparent px-6 py-3 text-center font-medium text-neutral-50 aria-disabled:cursor-not-allowed aria-disabled:bg-neutral-500 sm:px-16 ${className}`}
    >
      {btnName}
    </a>
  );
};
export default CheckoutLink;
