import { ArrowPathIcon } from "@heroicons/react/24/outline";

export function Spinner() {
  return (
    <div className="flex items-center justify-center w-full h-full flex-grow gap-2">
      <ArrowPathIcon className="animate-spin w-5 h-5" data-testid="spinner" />
    </div>
  );
}

export default Spinner;
