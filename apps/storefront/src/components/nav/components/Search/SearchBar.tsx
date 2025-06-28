import { DEFAULT_LOCALE } from "@/lib/regions";
import { getMessages } from "@/lib/util";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { redirect } from "next/navigation";

export const SearchBar = () => {
  const messages = getMessages(DEFAULT_LOCALE);
  async function onSubmit(formData: FormData) {
    "use server";
    const search = formData.get("search") as string;
    if (search && search.trim().length > 0) {
      redirect(`/search?query=${encodeURIComponent(search)}`);
    }
  }

  return (
    <form
      action={onSubmit}
      className="group relative my-2 flex w-full items-center justify-items-center text-sm lg:w-[32rem]"
    >
      <label className="w-full">
        <span className="sr-only">{messages["app.search.searchTitle"]}</span>
        <input
          type="text"
          name="search"
          placeholder={messages["app.search.searchTitle"]}
          autoComplete="on"
          required
          className="h-10 w-full rounded-md border border-neutral-300 bg-transparent bg-white px-4 py-2 pr-10 text-sm text-black placeholder:text-neutral-500 focus:border-black focus:ring-black"
        />
      </label>
      <button
        type="submit"
        className="absolute inset-y-0 right-0 inline-flex aspect-square w-10 items-center justify-center text-neutral-500 hover:text-neutral-700 focus:text-neutral-700 group-invalid:pointer-events-none group-invalid:opacity-80"
        aria-label={messages["app.search.searchTitle"]}
      >
        <span className="sr-only">{messages["search"]}</span>
        <MagnifyingGlassIcon className="w-6 h-6 relative" />
      </button>
    </form>
  );
};
