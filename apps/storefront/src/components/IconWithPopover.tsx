import { PhoneIcon } from "@heroicons/react/24/outline";
const IconWithPopover: React.FC = () => {
  return (
    <div className="relative inline-block cursor-pointer group">
      <button className="mt-1" aria-label="Telefon">
        <PhoneIcon className="relative hover:text-brand w-6 h-6 flex justify-center items-center" />
      </button>
      <div
        className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100
         absolute top-full right-0 px-[10px] py-3 w-max bg-white border border-gray-300 rounded shadow-md z-[1000]
         transition-opacity transition-[visibility] duration-200 ease-in-out"
      >
        <a href="tel:0728949494" title="Telefon no" className="text-md">
          0728 94 94 94
        </a>
      </div>
    </div>
  );
};

export default IconWithPopover;
