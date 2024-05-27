import { useRouter } from "next/router";
import { useState, useMemo, useRef, useEffect, ChangeEvent, FormEvent } from "react";
import debounce from "lodash.debounce";
import algoliasearch, { SearchClient, SearchIndex } from "algoliasearch";
import { Input } from "@headlessui/react";
import Link from "next/link";
import { usePaths } from "@/lib/paths";
import { useIntl } from "react-intl";
import messages from "../translations";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { algoliaClient } from "@/lib/searchClient";

type SearchResult = {
  productName: string;
  variantId: string;
  slug: string | number;
  objectID: string;
  name: string;
  media?: { url: string }[];
};

function CustomSearchBox() {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [cache, setCache] = useState<{ [key: string]: SearchResult[] }>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const router = useRouter();
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const paths = usePaths();
  const t = useIntl();

  const searchIndex: SearchIndex | null = useMemo(() => {
    return (
      algoliaClient && algoliaClient.initIndex(process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "")
    );
  }, [algoliaClient]);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        if (cache[query]) {
          setResults(cache[query]);
        } else if (searchIndex) {
          try {
            const { hits } = await searchIndex.search<SearchResult>(query);
            setCache((prevCache) => ({ ...prevCache, [query]: hits }));
            setResults(hits);
          } catch (error) {
            console.error("Algolia search error: ", error);
          }
        }
        setShowResults(true);
      }, 300),
    [cache, searchIndex],
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setInputValue(value);
    if (value.length > 2) {
      debouncedSearch(value);
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  const handleFocus = () => {
    if (results.length > 0) {
      setShowResults(true);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowResults(false);
    router.push(`/search?q=${inputValue}`);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      searchBoxRef.current &&
      !searchBoxRef.current.contains(event.target as Node) &&
      resultsRef.current &&
      !resultsRef.current.contains(event.target as Node)
    ) {
      setShowResults(false);
    }
  };

  const handleLinkClick = () => {
    setShowResults(false);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={searchBoxRef}>
      <form
        onSubmit={handleSubmit}
        role="search"
        className="group relative my-2 flex w-full items-center justify-items-center text-sm lg:w-[32rem]"
      >
        <label className="w-full">
          <span className="sr-only">{t.formatMessage(messages.searchTitle)}</span>
          <Input
            id="algolia_search"
            type="search"
            placeholder="Search for products"
            value={inputValue}
            onChange={handleChange}
            onFocus={handleFocus}
            autoComplete="off"
            className="h-10 w-full rounded-md border border-neutral-300 bg-transparent bg-white px-4 py-2 pr-10 text-sm text-black placeholder:text-neutral-500 focus:border-black focus:ring-black"
          />
        </label>
        <div className="absolute inset-y-0 right-0">
          <button
            type="submit"
            className="inline-flex aspect-square w-10 items-center justify-center text-neutral-500 hover:text-neutral-700 focus:text-neutral-700 group-invalid:pointer-events-none group-invalid:opacity-80 mt-1"
          >
            <span className="sr-only">{t.formatMessage(messages.search)}</span>
            <MagnifyingGlassIcon className="w-6 h-6 relative top-1" />
          </button>
        </div>
      </form>
      {showResults && results && results.length > 0 && (
        <div
          className="absolute bg-white shadow-2xl overflow-y-scroll overflow-x-hidden z-50 w-[320px] max-h-[300px]"
          style={{ top: (searchBoxRef?.current?.offsetHeight || 0) + 10 }}
          ref={resultsRef}
        >
          <ul>
            {results.map((result) => (
              <li key={result.objectID} className="flex items-center p-2 hover:bg-gray-200">
                <Link
                  href={paths.products
                    ._slug(result.slug)
                    .$url({ ...(result.variantId && { query: { variant: result.variantId } }) })}
                  className="flex items-center w-full no-underline text-gray-900"
                  onClick={handleLinkClick}
                >
                  {result.media && (
                    <img
                      src={result.media[0]?.url}
                      alt={result.name}
                      className="w-12 h-12 object-cover mr-4"
                    />
                  )}
                  <p className="font-bold whitespace-normal break-words">{result.productName}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CustomSearchBox;
