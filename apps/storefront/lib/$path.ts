import type { OptionalQuery as OptionalQuery_d6ouis } from "../pages/account/login";
import type { OptionalQuery as OptionalQuery_1mqg7f9 } from "../pages/products/[slug]";

export const pagesPath = {
  $404: {
    $url: (url?: { hash?: string | undefined } | undefined) => ({
      pathname: "/404" as const,
      hash: url?.hash,
    }),
  },
  account: {
    addressBook: {
      $url: (url?: { hash?: string | undefined } | undefined) => ({
        pathname: "/account/addressBook" as const,
        hash: url?.hash,
      }),
    },
    confirm: {
      $url: (url?: { hash?: string | undefined } | undefined) => ({
        pathname: "/account/confirm" as const,
        hash: url?.hash,
      }),
    },
    login: {
      $url: (
        url?: { query?: OptionalQuery_d6ouis | undefined; hash?: string | undefined } | undefined,
      ) => ({ pathname: "/account/login" as const, query: url?.query, hash: url?.hash }),
    },
    orders: {
      $url: (url?: { hash?: string | undefined } | undefined) => ({
        pathname: "/account/orders" as const,
        hash: url?.hash,
      }),
      _token: (token: string | number) => ({
        $url: (url?: { hash?: string | undefined } | undefined) => ({
          pathname: "/account/orders/[token]" as const,
          query: { token },
          hash: url?.hash,
        }),
      }),
    },
    preferences: {
      $url: (url?: { hash?: string | undefined } | undefined) => ({
        pathname: "/account/preferences" as const,
        hash: url?.hash,
      }),
    },
    register: {
      $url: (url?: { hash?: string | undefined } | undefined) => ({
        pathname: "/account/register" as const,
        hash: url?.hash,
      }),
    },
    reset: {
      $url: (url?: { hash?: string | undefined } | undefined) => ({
        pathname: "/account/reset" as const,
        hash: url?.hash,
      }),
    },
  },
  brands: {
    _slug: (slug: string | number) => ({
      $url: (url?: { hash?: string | undefined } | undefined) => ({
        pathname: "/brands/[slug]" as const,
        query: { slug },
        hash: url?.hash,
      }),
    }),
    $url: (url?: { hash?: string | undefined } | undefined) => ({
      pathname: "/brands" as const,
      hash: url?.hash,
    }),
  },
  categories: {
    _slug: (slug: string | number) => ({
      $url: (url?: { hash?: string | undefined } | undefined) => ({
        pathname: "/categories/[slug]" as const,
        query: { slug },
        hash: url?.hash,
      }),
    }),
  },
  checkout: {
    $url: (url?: { hash?: string | undefined } | undefined) => ({
      pathname: "/checkout" as const,
      hash: url?.hash,
    }),
  },
  collections: {
    _slug: (slug: string | number) => ({
      $url: (url?: { hash?: string | undefined } | undefined) => ({
        pathname: "/collections/[slug]" as const,
        query: { slug },
        hash: url?.hash,
      }),
    }),
  },
  new_arrivals: {
    $url: (url?: { hash?: string | undefined } | undefined) => ({
      pathname: "/new-arrivals" as const,
      hash: url?.hash,
    }),
  },
  order: {
    $url: (url?: { hash?: string | undefined } | undefined) => ({
      pathname: "/order" as const,
      hash: url?.hash,
    }),
  },
  outlet: {
    $url: (url?: { hash?: string | undefined } | undefined) => ({
      pathname: "/outlet" as const,
      hash: url?.hash,
    }),
  },
  pages: {
    _slug: (slug: string | number) => ({
      $url: (url?: { hash?: string | undefined } | undefined) => ({
        pathname: "/pages/[slug]" as const,
        query: { slug },
        hash: url?.hash,
      }),
    }),
  },
  products: {
    _slug: (slug: string | number) => ({
      $url: (
        url?: { query?: OptionalQuery_1mqg7f9 | undefined; hash?: string | undefined } | undefined,
      ) => ({
        pathname: "/products/[slug]" as const,
        query: { slug, ...url?.query },
        hash: url?.hash,
      }),
    }),
  },
  search: {
    $url: (url?: { hash?: string | undefined } | undefined) => ({
      pathname: "/search" as const,
      hash: url?.hash,
    }),
  },
  $url: (url?: { hash?: string | undefined } | undefined) => ({
    pathname: "/" as const,
    hash: url?.hash,
  }),
};

export type PagesPath = typeof pagesPath;
