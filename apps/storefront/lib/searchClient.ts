import algoliasearch, { SearchClient } from "algoliasearch";

export const algoliaClient: SearchClient | null = (() => {
  const algoliaAppId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const algoliaApiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;

  if (algoliaAppId && algoliaApiKey) {
    return algoliasearch(algoliaAppId, algoliaApiKey);
  }

  return null;
})();
