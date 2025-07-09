"use client";

import { useState, useMemo, useRef, useEffect, ChangeEvent, FormEvent } from "react";
import debounce from "lodash.debounce";
import { SearchIndex } from "algoliasearch";
import { Input } from "@headlessui/react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { algoliaClient } from "@/lib/searchClient";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Spinner from "@/components/Spinner";

type SearchResult = {
  productName: string;
  variantId: string;
  slug: string | number;
  objectID: string;
  name: string;
  media?: { url: string }[];
};

interface CustomSearchBoxProps {
  expanded?: boolean;
  onSearch?: (value: string | null) => void;
}

function CustomSearchBox({ expanded = false, onSearch }: CustomSearchBoxProps) {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [cache, setCache] = useState<{ [key: string]: SearchResult[] }>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState(expanded);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsExpanded(expanded);
    if (expanded) {
      setTimeout(() => document.getElementById("algolia_search")?.focus(), 10);
    }
  }, [expanded]);

  useEffect(() => {
    if (isLoading && pathname.startsWith("/search")) {
      setIsExpanded(false);
      setShowResults(false);
      setIsLoading(false);
    }
  }, [pathname, isLoading]);

  const searchIndex: SearchIndex | null = useMemo(() => {
    return (
      algoliaClient && algoliaClient.initIndex(process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "")
    );
  }, [algoliaClient]);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        if (query.length > 2) {
          // Only search if query is long enough
          if (cache[query]) {
            setResults(cache[query]);
          } else if (searchIndex) {
            try {
              const { hits } = await searchIndex.search<SearchResult>(query);
              setCache((prevCache) => ({ ...prevCache, [query]: hits }));
              //console.log('hits', hits);
              setResults(hits);
            } catch (error) {
              console.error("Algolia search error: ", error);
            }
          }
          setShowResults(true);
        } else {
          setResults([]); // Clear results if query is too short
          setShowResults(false);
        }
      }, 300),
    [cache, searchIndex],
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedValue = inputValue.trim();
    if (onSearch) {
      onSearch(trimmedValue || null);
    } else {
      if (!trimmedValue) return;
      setIsLoading(true);
      router.push(`/search?query=${trimmedValue}`);
    }
  };

  const toggleSearch = () => {
    setIsExpanded((prev) => {
      const newExpandedState = !prev;
      if (newExpandedState) {
        setTimeout(() => document.getElementById("algolia_search")?.focus(), 10);
      } else {
        setInputValue("");
        setResults([]);
        // When closing, if onSearch is provided AND input was empty, also clear the URL param via nuqs
        if (onSearch && inputValue === "") {
          onSearch(null);
        }
      }
      return newExpandedState;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={searchBoxRef}>
      {/* Search Toggle Button - Always visible */}
      <button
        onClick={toggleSearch}
        className="py-2 text-black-500 hover:text-action-1"
        aria-label={isExpanded ? "Close search" : "Open search"}
      >
        <MagnifyingGlassIcon className="w-6 h-6" />
      </button>

      {/* Full-width Search Overlay */}
      <div
        className={`fixed top-[130px] left-0 right-0 bg-white shadow-md transition-all duration-300 z-50 ${
          isExpanded
            ? "visible opacity-100 translate-y-0 border-t border-gray-300"
            : "invisible opacity-0 -translate-y-2"
        }`}
      >
        <div className="container mx-auto px-4 py-6 relative">
          <form onSubmit={handleSubmit} className="relative flex items-center w-[80%] m-auto">
            <Input
              id="algolia_search"
              type="search"
              placeholder="Cauta produse..."
              value={inputValue}
              onChange={handleChange}
              onFocus={() => results.length > 0 && setShowResults(true)}
              className="h-10 w-full rounded-md border border-neutral-300 bg-transparent bg-white px-4 py-2 pr-10 text-sm text-black placeholder:text-neutral-500 focus:border-black focus:ring-black [&::-webkit-search-cancel-button]:hidden"
              autoComplete="off"
            />
            <div className="absolute right-0 flex items-center">
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-2 text-neutral-500 hover:text-neutral-700 disabled:opacity-50"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={toggleSearch}
                className="p-2 text-neutral-500 hover:text-neutral-700"
                aria-label="Close search"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Search Results Dropdown */}
          {isLoading && (
            <div className="absolute right-0 top-[50%] translate-y-[-50%]">
              <Spinner />
            </div>
          )}
          {isExpanded && showResults && results.length > 0 && !isLoading && (
            <div
              ref={resultsRef}
              className="absolute left-0 right-0 mt-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
            >
              <div className="container">
                <ul className="w-[80%] m-auto max-h-96 overflow-auto">
                  {results.map((result) => (
                    <li key={result.objectID} className="border-b border-gray-100 last:border-0">
                      <Link
                        href={`/p/${result.slug}/?variant=${result.variantId}`}
                        className="flex items-center p-3 hover:bg-gray-50"
                        onClick={() => {
                          setShowResults(false);
                          setIsExpanded(false);
                        }}
                      >
                        {result.media?.[0]?.url && (
                          <img
                            src={result.media[0].url}
                            alt={result.name}
                            className="w-12 h-12 object-cover mr-3 rounded"
                          />
                        )}
                        <span className="font-medium">{result.productName}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomSearchBox;
