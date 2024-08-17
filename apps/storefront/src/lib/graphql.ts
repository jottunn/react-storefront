import { saleorAuthClient } from "src/app/config";
import { DocumentNode } from "graphql";
import { invariant } from "ts-invariant";

type GraphQLErrorResponse = {
  errors: readonly {
    message: string;
  }[];
};

type GraphQLRespone<T> = { data: T } | GraphQLErrorResponse;

export async function executeGraphQL<Result, Variables>(
  operation: DocumentNode,
  options: {
    headers?: HeadersInit;
    cache?: RequestCache;
    revalidate?: number;
    withAuth?: boolean;
  } & (Variables extends Record<string, never> ? { variables?: never } : { variables: Variables }),
): Promise<Result> {
  invariant(
    process.env.NEXT_PUBLIC_SALEOR_API_URL,
    "Missing NEXT_PUBLIC_SALEOR_API_URL env variable",
  );
  const { variables, headers, cache, revalidate, withAuth = false } = options;

  // Ensure the query is a string
  const queryString = typeof operation === "string" ? operation : operation.loc?.source.body;

  if (!queryString) {
    throw new Error("Failed to extract GraphQL query string from operation.");
  }

  // Logging the query and variables for debugging
  // console.log('operation', operation);
  // console.log("GraphQL Query:", queryString);
  // console.log("Variables:", variables);

  const input = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({
      query: queryString,
      ...(variables && { variables }),
    }),
    cache: cache,
    next: { revalidate },
  };

  try {
    const response = withAuth
      ? await saleorAuthClient().fetchWithAuth(process.env.NEXT_PUBLIC_SALEOR_API_URL, input)
      : await fetch(process.env.NEXT_PUBLIC_SALEOR_API_URL, input);

    if (!response.ok) {
      const body = await (async () => {
        try {
          return await response.text();
        } catch {
          return "";
        }
      })();
      console.error("HTTPError", input.body);
      throw new HTTPError(response, body);
    }

    const body = await response.json();

    if ("errors" in body) {
      const errorMessage = body.errors[0]?.message;

      console.log("GraphQL Query:", queryString);
      if (errorMessage === "Signature has expired" && withAuth) {
        console.log("body hh Signature has expired", body);
      } else {
        console.log("GraphQL Error for Query:", queryString);
        throw new GraphQLError(body);
      }
    }

    return body.data;
  } catch (error) {
    if (error instanceof GraphQLError) {
      console.error("GraphQL Error:", error.message);
      throw error; // or return an error object
    } else if (error instanceof HTTPError) {
      console.error("HTTP Error:", error.message);
      throw error; // or return an error object
    } else {
      console.error("Unexpected Errorrrr:", error);
      // console.error("Variables:", variables);
      // console.error("GraphQL Query:", queryString);
      // console.error("input", input);
      throw error; // or return an error object
    }
  }
}

class GraphQLError extends Error {
  constructor(public errorResponse: GraphQLErrorResponse) {
    const message = errorResponse.errors.map((error) => error.message).join("\n");
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class HTTPError extends Error {
  constructor(response: Response, body: string) {
    const message = `HTTP error ${response.status}: ${response.statusText}\n${body}`;
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
