import { useRef } from "react"; // Import useRef
import { useRouter } from "next/router";
import NavIconButton from "./NavIconButton";
import { usePaths } from "@/lib/paths";
import { useIntl } from "react-intl";
import messages from "../translations";

export const SearchBar = () => {
  const paths = usePaths();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const t = useIntl();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = formData.get("search") as string;
    if (search && search.trim().length > 0) {
      const searchPath = paths.search.$url().pathname;
      await router.push(`${searchPath}?q=${encodeURIComponent(search)}`);
      if (formRef.current) {
        // Check if formRef.current is not null
        formRef.current.reset(); // Reset the form
      }
    }
  };

  return (
    <form
      method="POST"
      ref={formRef} // Attach the ref to the form
      onSubmit={onSubmit}
      className="group relative my-2 flex w-full items-center justify-items-center text-sm lg:w-[32rem]"
    >
      <label className="w-full">
        <span className="sr-only">{t.formatMessage(messages.searchTitle)}</span>
        <input
          type="text"
          name="search"
          placeholder={t.formatMessage(messages.searchTitle)}
          autoComplete="on"
          required
          className="h-10 w-full rounded-md border border-neutral-300 bg-transparent bg-white px-4 py-2 pr-10 text-sm text-black placeholder:text-neutral-500 focus:border-black focus:ring-black"
        />
      </label>
      <div className="absolute inset-y-0 right-0">
        <button
          type="submit"
          className="inline-flex aspect-square w-10 items-center justify-center text-neutral-500 hover:text-neutral-700 focus:text-neutral-700 group-invalid:pointer-events-none group-invalid:opacity-80 mt-1"
        >
          <span className="sr-only">{t.formatMessage(messages.search)}</span>
          <NavIconButton isButton={false} icon="spyglass" />
        </button>
      </div>
    </form>
  );
};
