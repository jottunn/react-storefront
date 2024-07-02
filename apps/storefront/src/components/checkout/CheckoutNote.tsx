import { Messages } from "@/lib/util";
import Link from "next/link";
interface CheckoutNoteProps {
  messages: Messages;
  agreedToTerms: boolean;
  setAgreedToTerms: (agreed: boolean) => void;
}
const CheckoutNote: React.FC<CheckoutNoteProps> = ({
  messages,
  agreedToTerms,
  setAgreedToTerms,
}) => {
  return (
    <div className="my-8">
      <h2 className="checkout-section-header-active">{messages["app.checkout.noteTitle"]}</h2>
      <p className="text-base font-medium mt-4 mb-2">{messages["app.checkout.note"]}</p>
      <textarea
        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
        name="checkoutNotes"
      ></textarea>
      <div className="my-3">
        <label htmlFor="gdprConsent" className="text-base">
          <input
            type="checkbox"
            id="gdprConsent"
            className="mr-2 w-4 h-4 text-action-1 bg-gray-100 border-gray-300 focus:ring-action-1 dark:focus:ring-action-1 dark:ring-offset-gray-800 focus:ring-2 dark:bg-neutral-100 dark:border-gray-600 !opacity-100"
            name="agreedToTerms"
            checked={agreedToTerms}
            onChange={() => setAgreedToTerms(!agreedToTerms)}
          />
          <span className="mr-1">{messages["app.login.gdprConsent"]}</span>
          <Link href="/termeni-si-conditii" className="inline-block underline hover:text-action-1">
            {messages["app.nwl.terms"]}
          </Link>
        </label>
      </div>
    </div>
  );
};

export default CheckoutNote;
