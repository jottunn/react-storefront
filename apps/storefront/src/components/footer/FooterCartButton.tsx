"use client";

interface Messages {
  [key: string]: string;
}

interface FooterCartButtonProps {
  messages: Messages;
}

export default function FooterCartButton({ messages }: FooterCartButtonProps) {
  const handleClick = () => {
    if (typeof document !== "undefined") {
      document.getElementById("navbar-cart-button")?.click();
    }
  };

  return (
    <button onClick={handleClick}>
      <span className="text-base cursor-pointer hover:underline">
        {messages["app.nwl.cartlink"]}
      </span>
    </button>
  );
}
