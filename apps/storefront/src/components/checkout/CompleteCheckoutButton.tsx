import { Messages } from "@/lib/util";

interface CompleteCheckoutButtonProps {
  isDisabled: boolean;
  isProcessing: boolean;
  agreedToTerms: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  messages: Messages;
}

export function CompleteCheckoutButton({
  isDisabled,
  isProcessing,
  agreedToTerms,
  children,
  onClick,
  messages,
}: CompleteCheckoutButtonProps) {
  const commonClasses =
    "w-full md:w-auto mt-6 border border-transparent shadow-sm py-4 px-8 text-md font-medium text-white flex items-center justify-center uppercase";
  const processingClasses = "bg-main-3 cursor-not-allowed";
  const defaultClasses = "bg-action-1 hover:bg-action-2";

  return (
    <>
      <button
        onClick={onClick}
        disabled={isProcessing || isDisabled || !agreedToTerms}
        type={isProcessing ? "button" : "submit"}
        className={`${commonClasses} ${isProcessing || isDisabled || !agreedToTerms ? processingClasses : defaultClasses}`}
      >
        {isProcessing ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="animate-spin h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {messages["app.checkout.processing"]}
          </>
        ) : (
          children
        )}
      </button>
      {!agreedToTerms && (
        <p className="text-base mt-2 text-main-2">{messages["app.checkout.terms"]}</p>
      )}
    </>
  );
}

export default CompleteCheckoutButton;
