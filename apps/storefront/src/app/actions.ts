"use server";

import { executeGraphQL } from "@/lib/graphql";
import {
  AccountAddressUpdateDocument,
  AccountAddressUpdateMutation,
  AccountInput,
  AccountUpdateDocument,
  AccountUpdateMutation,
  AddressDeleteDocument,
  AddressDeleteMutation,
  AddressInput,
  ChannelDocument,
  ChannelQuery,
  ConfirmAccountDocument,
  ConfirmAccountMutation,
  ConfirmEmailChangeDocument,
  ConfirmEmailChangeMutation,
  OrderDetailsByIdDocument,
  OrderDetailsByIdQuery,
  PasswordChangeDocument,
  PasswordChangeMutation,
  ProductCollectionDocument,
  ProductCollectionQuery,
  ProductCountableEdge,
  ProductFilterInput,
  ProductVariant,
  RegisterDocument,
  RegisterMutation,
  RequestEmailChangeDocument,
  RequestEmailChangeMutation,
  RequestPasswordResetDocument,
  RequestPasswordResetMutation,
  SetAddressDefaultDocument,
  SetAddressDefaultMutation,
  SetPasswordDocument,
  SetPasswordMutation,
  User,
  UserDocument,
  UserQuery,
} from "@/saleor/api";
import { saleorAuthClient } from "src/app/config";
import { LoginFormData } from "./login/LoginForm";
import { RegisterFormData } from "./register/RegisterForm";
import { STOREFRONT_URL } from "@/lib/const";
import { DEFAULT_CHANNEL, defaultRegionQuery } from "@/lib/regions";
import { ResetFormData } from "./reset/ForgotPassword";
import { ResetPasswordFormData } from "./reset/ResetPasswordForm";
import { ConfirmData } from "./confirm/ConfirmResult";
import { customerDetach } from "@/components/checkout/actions";
import { cookies } from "next/headers";
import { readFile, stat } from "fs/promises";
import path from "path";
import { generateProductsJson } from "@/lib/generateProductsJson";
import Bull from "bull";
import { mapEdgesToItems } from "@/lib/maps";
import { UrlFilter } from "@/lib/searchParamsCache";
import { GroupedProduct, groupProductsByColor } from "@/lib/product";
import { generateFilterIndex } from "@/lib/generateFilterIndexJson";
import fs from "fs";

export async function logout() {
  //if any checkout and attached customer  =>  detach
  const cookieStore = await cookies();
  const checkoutId = cookieStore.get("checkoutId-default-channel")?.value;
  if (checkoutId) {
    await customerDetach(checkoutId);
  }
  (await saleorAuthClient()).signOut();
}

export async function login(formData: LoginFormData) {
  const email = formData.email.toString();
  const password = formData.password.toString();

  if (!email || !password) {
    return { success: false, errors: ["Email and password are required"] };
  }

  const { data } = await (
    await saleorAuthClient()
  ).signIn({ email, password }, { cache: "no-store" });

  if (data.tokenCreate.errors.length > 0) {
    const customError = data?.tokenCreate?.errors as any;
    return { success: false, errors: customError.map((error: { code: any }) => error.code) };
  }
  return { success: true, token: data.tokenCreate.token };
}

export async function register(formData: RegisterFormData | any) {
  try {
    interface RegisterInput {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      redirectUrl: string;
      channel: string;
      metadata?: any;
    }
    const confirmUrl = `${STOREFRONT_URL}/confirm`;
    const input: RegisterInput = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      redirectUrl: confirmUrl,
      channel: DEFAULT_CHANNEL.slug,
    };
    if (formData.nwlRegister) {
      input.metadata = [
        {
          key: "abonat_news",
          value: formData.nwlRegister,
        },
      ];
    }
    const response = await executeGraphQL<RegisterMutation, { input: RegisterInput }>(
      RegisterDocument,
      {
        variables: {
          input: input,
        },
      },
    );

    if (response?.accountRegister?.errors?.length) {
      return { success: false, errors: response.accountRegister.errors };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to execute RegisterMutation:", error);
    return { success: false };
  }
}

export async function setPassword(formData: ResetPasswordFormData) {
  try {
    const response = await executeGraphQL<
      SetPasswordMutation,
      { email: string; password: string; token: string }
    >(SetPasswordDocument, {
      variables: {
        email: formData.email,
        password: formData.password,
        token: formData.token,
      },
    });
    //console.log("setPassword", response.setPassword?.errors);
    if (response?.setPassword?.errors?.length) {
      const customError = response.setPassword.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to execute setPasswordMutation:", error);
    return { success: false, errors: ["INVALID"] };
  }
}

export async function requestPasswordReset(formData: ResetFormData) {
  try {
    const response = await executeGraphQL<
      RequestPasswordResetMutation,
      { email: string; channel: string; redirectUrl: string }
    >(RequestPasswordResetDocument, {
      variables: {
        email: formData.email,
        channel: DEFAULT_CHANNEL.slug,
        redirectUrl: `${STOREFRONT_URL}/reset`,
      },
    });
    console.log("requestPasswordReset", response.requestPasswordReset?.errors);
    if (response?.requestPasswordReset?.errors?.length) {
      const customError = response.requestPasswordReset.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to execute RequestPasswordResetMutation:", error);
    return { success: false };
  }
}

export async function confirmAccount(confirmData: ConfirmData) {
  try {
    const response = await executeGraphQL<ConfirmAccountMutation, { email: string; token: string }>(
      ConfirmAccountDocument,
      {
        variables: {
          email: confirmData.email,
          token: confirmData.token,
        },
      },
    );

    if (response.confirmAccount?.errors.length) {
      const customError = response.confirmAccount.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    const nwlItem = response?.confirmAccount?.user?.metadata.find(
      (meta) => meta.key === "abonat_news",
    );
    const nwlValue = nwlItem?.value;
    return { success: true, newsletter: nwlValue };
  } catch (error) {
    console.error("Failed to execute ConfirmAccountMutationResult:", error);
    return { success: false };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { user } = await executeGraphQL<UserQuery, {}>(UserDocument, {
      cache: "no-cache",
      withAuth: true,
    });

    return user as User;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return null;
  }
}

function isCategoryDescendant(category: any | null, filterCategories: string[]): boolean {
  if (!category) {
    // console.log('Category is null');
    return false;
  }
  if (filterCategories.includes(category.id)) {
    // console.log(`Direct match found: ${category.id}`);
    return true;
  }
  // console.log('Checking ancestors:', category.ancestors);
  const isDescendant =
    category.ancestors?.some((ancestor: { id: string }) => {
      const match = filterCategories.includes(ancestor.id);
      if (match) {
        // console.log(`Ancestor match found: ${ancestor.id}`);
      }
      return match;
    }) || false;
  // console.log(`Is descendant: ${isDescendant}`);
  return isDescendant;
}

//generate products.json for faster product filtering
//cache the file reading operation + Only sets up the Bull queue when the file needs to be generated initially
const PRODUCTS_JSON_PATH = path.join(process.cwd(), "public/generated", "products.json");
const FILTER_INDEX_PATH = path.join(process.cwd(), "public/generated", "filter-index.json");
let cachedProductsData: any = null;
let lastUpdated = 0;
let lastModifiedTime: number | null = null;

const getProductsFromDisk = async () => {
  //console.log("Reading products.json from disk");
  try {
    const data = await readFile(PRODUCTS_JSON_PATH, "utf8");
    cachedProductsData = JSON.parse(data);
    lastUpdated = Date.now(); // Update the cache timestamp
    lastModifiedTime = (await stat(PRODUCTS_JSON_PATH)).mtimeMs;
    return cachedProductsData;
  } catch (error) {
    console.error("Error reading products.json:", error);
    return null;
  }
};

export const checkAndScheduleJob = async (queue: Bull.Queue, frequency: string) => {
  try {
    // Get all repeat jobs
    const repeatableJobs = await queue.getRepeatableJobs();
    console.log("Existing repeatable jobs:", repeatableJobs);

    // Find and remove only the job with our specific cron pattern
    const existingJob = repeatableJobs.find((job: { cron: string }) => job.cron === frequency);

    if (existingJob) {
      await queue.removeRepeatableByKey(existingJob.key);
      console.log(`Removed existing products generation job: ${existingJob.key}`);
    }

    // Schedule new job with latest processor
    const job = await queue.add(
      {},
      {
        repeat: {
          cron: frequency,
        },
      },
    );
    console.log("New daily products generation scheduled, job ID:", job.id);
  } catch (error) {
    console.error("Error checking/scheduling job:", error);
  }
};

export const getFilterIndex = async (): Promise<any | null> => {
  try {
    const filterIndex = await readFile(FILTER_INDEX_PATH, "utf8");
    return JSON.parse(filterIndex);
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "ENOENT") {
      console.log("Index file not found, generating new file...");
      await generateFilterIndex();
      const filterIndex = await readFile(FILTER_INDEX_PATH, "utf8");
      return JSON.parse(filterIndex);
    }
  }
};

export const getProductsData = async (): Promise<any | null> => {
  //console.log("getProductsData called");
  // Log the current state of the cache
  // console.log(`Current cachedProductsData: ${cachedProductsData ? "Exists" : "Does not exist"}`);
  // console.log(`Current lastUpdated: ${lastUpdated}`);
  // console.log(`Current lastModifiedTime: ${lastModifiedTime}`);

  let fileStats;
  try {
    fileStats = await stat(PRODUCTS_JSON_PATH);
    const currentModifiedTime = fileStats.mtimeMs;

    if (
      !cachedProductsData ||
      Date.now() - lastUpdated > 24 * 60 * 60 * 1000 ||
      (lastModifiedTime !== null && currentModifiedTime !== lastModifiedTime)
    ) {
      console.log("Cache expired or missing, reloading products.json from disk");
      return await getProductsFromDisk();
    }
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "ENOENT") {
      console.log("Products file not found, generating new file...");
      await generateProductsJson();
      fileStats = await stat(PRODUCTS_JSON_PATH);

      // Set up Bull queue for daily updates
      const Bull = require("bull");
      const generateProductsQueue = new Bull("generateProductsQueue", {
        redis: {
          host: process.env.REDIS_HOST || "localhost",
          port: Number(process.env.REDIS_PORT) || 6379,
          maxRetriesPerRequest: 1,
          connectTimeout: 2000,
        },
      });
      // Define the processor
      generateProductsQueue.process(async () => {
        try {
          //console.log('Starting scheduled products generation');
          await generateProductsJson();
          await generateFilterIndex();
          console.log("Scheduled products JSON created successfully");
          return { status: "success" };
        } catch (error) {
          console.error("Error in scheduled products generation:", error);
          throw error;
        }
      });

      // Check and schedule job
      await checkAndScheduleJob(generateProductsQueue, "0 5 * * *");

      return await getProductsFromDisk();
    } else {
      console.error("Unexpected error reading products file:", error);
      throw error;
    }
  }

  //console.log("Returning cached data");
  return cachedProductsData;
};

/**
 * 1. Create a separate function to extract brands from products.
   2. Modify the main filtering logic to always include all brands, regardless of other filters.
   3. Add the extracted brands to the returned filter object.
 */
function extractBrands(products: ProductCountableEdge[]) {
  const brands = new Set<string>();
  products.forEach((edge) => {
    const product = edge.node;
    const brandAttribute = product.attributes.find((attr) => attr.attribute.slug === "brand");
    if (brandAttribute && brandAttribute.values.length > 0) {
      brandAttribute.values.forEach((value) => brands.add(value.slug || ""));
    }
  });
  return Array.from(brands);
}

function extractCategories(products: ProductCountableEdge[]): any[] {
  const categoriesMap = new Map<string, any>();

  products.forEach((edge) => {
    const product = edge.node;
    let category: any | null = product.category;

    while (category) {
      if (!categoriesMap.has(category.id)) {
        categoriesMap.set(category.id, {
          id: category.id,
          name: category.name,
          slug: category.slug,
          parent: category.parent ? { id: category.parent.id } : null,
        });
      }
      category = category.parent;
    }
  });

  return Array.from(categoriesMap.values());
}

export const getProductCollection = async (queryVariables: any) => {
  try {
    const { products } = await executeGraphQL<ProductCollectionQuery, { variables: any }>(
      ProductCollectionDocument,
      {
        variables: queryVariables,
      },
    );
    return products;
  } catch (error) {
    console.error("Failed to execute graphql for products query:", error);
    return null;
  }
};

// Helper functions for filtering products by variants
function variantSatisfiesFilter(variant: ProductVariant, filter: any): boolean {
  let isCompliant = true;
  if (filter.attributes && filter.attributes.length > 0) {
    for (const filterAttr of filter.attributes) {
      // Check if the variant has the filter attribute
      const variantAttribute = variant.attributes.find(
        (variantAttr) => variantAttr.attribute.slug === filterAttr.slug,
      );

      // If the variant does not have the attribute at all, consider it compliant for this specific attribute
      if (!variantAttribute) {
        continue; // Skip to the next filter attribute
      }

      // If the variant has the attribute, check if any of its values match the filter's values
      const hasMatchingValue = variantAttribute.values.some((value) =>
        filterAttr.values?.includes(value.slug ?? ""),
      );

      if (!hasMatchingValue) {
        isCompliant = false;
        break; // Exit early if any filter criterion is not met
      }
    }
  }

  // Additionally, check stock availability if required by the filter
  if (
    filter.stockAvailability === "IN_STOCK" &&
    (variant.quantityAvailable == null || variant.quantityAvailable <= 0)
  ) {
    isCompliant = false;
  }

  return isCompliant;
}

// Check if a product complies with the filter based on product-level attributes
function doesProductComplyWithFilter(product: any, filter: any): boolean {
  // If the filter specifies attributes, check compliance based on product-level attributes
  if (filter.attributes && filter.attributes.length > 0) {
    return filter.attributes.every((filterAttr: any) => {
      // Check if the product has the filter attribute
      const productAttribute = product.attributes.find(
        (productAttr: any) => productAttr.attribute.slug === filterAttr.slug,
      );

      // If the product does not have the attribute at all, consider it compliant for this specific attribute
      if (!productAttribute) {
        return true; // Skip to the next filter attribute because the absence is considered compliant
      }

      // If the product has the attribute, check if any of its values match the filter's values
      return productAttribute.values.some((value: any) =>
        filterAttr.values?.includes(value.slug ?? ""),
      );
    });
  }

  // If filter.attributes is null, undefined, or empty, consider the product compliant by default
  return true;
}

// Filter products based on the variants that satisfy the filter criteria
function filterAndTransformProducts(products: any[], filter: any) {
  return products.reduce((acc: any[], product) => {
    // First, check if the product itself complies with the filter (based on product-level attributes)
    const productComplies = doesProductComplyWithFilter(product, filter);

    if (!productComplies) {
      // If the product does not comply with the product-level attributes, do not include it in the result
      return acc;
    }

    // Filter variants for this product based on compliance with the filter
    const compliantVariants = product.variants?.filter((variant: ProductVariant) =>
      variantSatisfiesFilter(variant, filter),
    );

    if (compliantVariants && compliantVariants.length > 0) {
      // Construct a new product object with only compliant variants
      const transformedProduct = {
        ...product, // Spread the original product to copy its properties
        variants: compliantVariants, // Assign the filtered, compliant variants
      };
      acc.push(transformedProduct); // Add the transformed product to the accumulator
    }

    return acc;
  }, []);
}
interface ProductCollectionProps {
  filters: UrlFilter[];
  sortBy: string | null;
  page?: number;
  categoryIDs?: string[];
  collectionIDs?: string[];
  productsIDs?: string[];
  search?: string | "";
  messages: Record<string, string>;
  after?: string;
}

function getCategoryIdsFromSlugs(slugs: string[]): string[] {
  const categoryIds: string[] = [];
  try {
    const fileContents = fs.readFileSync(FILTER_INDEX_PATH, "utf-8");
    const filterIndex = JSON.parse(fileContents);
    // const filterIndex = require('../../public/filter-index.json');

    slugs.forEach((slug) => {
      const category = filterIndex.categoryStructure.find((cat: any) => cat.slug === slug);
      if (category) {
        categoryIds.push(category.id);
      }
    });
  } catch {
    console.log("no filter available");
  }

  return categoryIds;
}

export async function getProductCollectionData(props: ProductCollectionProps) {
  const { filters, sortBy, categoryIDs, collectionIDs, productsIDs, search, after } = props;
  // Handle special case for category filter
  let finalCategoryIDs = categoryIDs || [];
  const categoryFilter = filters.find((filter) => filter.slug === "categorie");

  if (categoryFilter && categoryFilter.values) {
    const categoryIdsFromSlugs = getCategoryIdsFromSlugs(categoryFilter.values);
    finalCategoryIDs = [...new Set([...finalCategoryIDs, ...categoryIdsFromSlugs])];
    // Remove the category filter from the filters array
    filters.splice(filters.indexOf(categoryFilter), 1);
  }
  // Create query variables from the provided filters/params
  const queryVariables = {
    filter: {
      attributes: filters.filter((filter) => filter.values?.length),
      ...(finalCategoryIDs?.length ? { categories: finalCategoryIDs } : {}),
      ...(collectionIDs?.length ? { collections: collectionIDs } : {}),
      ...(productsIDs?.length && { ids: productsIDs }),
      ...(search && { search: search }),
      stockAvailability: "IN_STOCK",
      isPublished: true,
      isVisibleInListing: true,
    },
    // Add sorting if provided
    ...(sortBy
      ? {
          sortBy: {
            direction: sortBy.endsWith("_DESC") ? "DESC" : "ASC",
            field: sortBy.split("_")[0].toUpperCase(),
          },
        }
      : {
          sortBy: {
            direction: "DESC",
            field: "MINIMAL_PRICE",
          },
        }),
    ...defaultRegionQuery(),
    ...(after ? { after } : {}),
  };

  // console.log("queryVariables", queryVariables, queryVariables.filter.attributes);

  // Fetch products
  const prodCollection = await getProductCollection(queryVariables);
  let products = mapEdgesToItems(prodCollection);

  // Apply additional client-side filtering for variants
  if (filters.length > 0) {
    products = filterAndTransformProducts(products, {
      attributes: filters.filter((filter) => filter.values?.length),
      stockAvailability: "IN_STOCK",
    });
  }
  // Group products by color to display color variants as separate cards
  products = groupProductsByColor(products as GroupedProduct[]);
  const pageInfo = (prodCollection as any)?.pageInfo;
  return {
    products,
    pageInfo,
  };
}

export const requestEmailChange = async (args: {
  newEmail: string;
  password: string;
  redirectUrl: String;
}) => {
  const { newEmail, password, redirectUrl } = args;
  try {
    const response = await executeGraphQL<
      RequestEmailChangeMutation,
      {
        newEmail: string;
        password: string;
        redirectUrl: String;
      }
    >(RequestEmailChangeDocument, {
      variables: {
        newEmail: newEmail,
        password: password,
        redirectUrl: redirectUrl,
      },
      cache: "no-cache",
      withAuth: true,
    });

    if (response.requestEmailChange?.errors.length) {
      const customError = response.requestEmailChange.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, user: response?.requestEmailChange?.user };
  } catch (error) {
    console.error("Failed to change email:", error);
    return;
  }
};

export const confirmEmailChange = async (args: { token: String }) => {
  const { token } = args;
  try {
    const response = await executeGraphQL<
      ConfirmEmailChangeMutation,
      {
        token: String;
        channel: String;
      }
    >(ConfirmEmailChangeDocument, {
      variables: {
        token: String(token),
        channel: DEFAULT_CHANNEL.slug,
      },
      cache: "no-cache",
      withAuth: true,
    });

    if (response.confirmEmailChange?.errors.length) {
      const customError = response.confirmEmailChange.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to confirm email change:", error);
    return;
  }
};

export const passwordChange = async (args: { newPassword: string; oldPassword: string }) => {
  const { newPassword, oldPassword } = args;
  try {
    const response = await executeGraphQL<
      PasswordChangeMutation,
      {
        newPassword: string;
        oldPassword: string;
      }
    >(PasswordChangeDocument, {
      variables: {
        newPassword: newPassword,
        oldPassword: oldPassword,
      },
      cache: "no-cache",
      withAuth: true,
    });

    if (response.passwordChange?.errors.length) {
      const customError = response.passwordChange.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, user: response.passwordChange?.user };
  } catch (error) {
    console.error("Failed to change password:", error);
    return;
  }
};

export const deleteAddressMutation = async (args: { id: string }) => {
  const { id } = args;
  try {
    const response = await executeGraphQL<
      AddressDeleteMutation,
      {
        id: string;
      }
    >(AddressDeleteDocument, {
      variables: {
        id: id,
      },
      cache: "no-cache",
      withAuth: true,
    });

    if (response.accountAddressDelete?.errors.length) {
      const customError = response.accountAddressDelete.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, addresses: response.accountAddressDelete?.user?.addresses };
  } catch (error) {
    console.error("Failed to remove address:", error);
    return;
  }
};

export const updateAddressMutation = async (args: { id: string; address: AddressInput }) => {
  const { id, address } = args;
  try {
    const response = await executeGraphQL<
      AccountAddressUpdateMutation,
      {
        id: string;
        address: AddressInput;
      }
    >(AccountAddressUpdateDocument, {
      variables: {
        id: id,
        address: address,
      },
      cache: "no-cache",
      withAuth: true,
    });

    if (response.accountAddressUpdate?.errors.length) {
      return { errors: response.accountAddressUpdate?.errors };
    }
    return { success: true, addresses: response.accountAddressUpdate?.user?.addresses };
  } catch (error) {
    console.error("Failed to update address:", error);
    return;
  }
};

export const setAddressDefaultMutation = async (args: { id: string; type: string }) => {
  const { id, type } = args;
  try {
    const response = await executeGraphQL<
      SetAddressDefaultMutation,
      {
        id: string;
        type: string;
      }
    >(SetAddressDefaultDocument, {
      variables: {
        id: id,
        type: type,
      },
      cache: "no-cache",
      withAuth: true,
    });

    if (response.accountSetDefaultAddress?.errors.length) {
      const customError = response.accountSetDefaultAddress.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, addresses: response.accountSetDefaultAddress?.user?.addresses };
  } catch (error) {
    console.error("Failed to set default adresss:", error);
    return;
  }
};

export const updateWishlist = async ({ selectedVariantId }: { selectedVariantId: string }) => {
  if (!selectedVariantId) {
    return;
  }
  const user = await getCurrentUser();
  if (!user) {
    return { error: true, message: "app.product.loginWishlist" };
  }

  const userWishlist = user?.metadata.find((meta) => meta.key === "wishlist");
  const currentWishlist = userWishlist ? JSON.parse(userWishlist.value) : [];
  let newWishlist;
  if (currentWishlist.includes(decodeURIComponent(selectedVariantId))) {
    //remove it
    newWishlist = currentWishlist.filter(
      (item: string) => item !== decodeURIComponent(selectedVariantId),
    );
  } else {
    newWishlist = [...currentWishlist, decodeURIComponent(selectedVariantId)];
  }

  try {
    const response = await executeGraphQL<
      AccountUpdateMutation,
      {
        input: AccountInput;
      }
    >(AccountUpdateDocument, {
      variables: {
        input: {
          metadata: [
            {
              key: "wishlist",
              value: JSON.stringify(newWishlist),
            },
          ],
        },
      },
      cache: "no-cache",
      withAuth: true,
    });

    if (response.accountUpdate?.errors.length) {
      return { errors: response.accountUpdate?.errors };
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to update address:", error);
    return;
  }
};

export const orderDetails = async (args: { id: String }) => {
  const { id } = args;
  try {
    const response = await executeGraphQL<
      OrderDetailsByIdQuery,
      {
        id: String;
      }
    >(OrderDetailsByIdDocument, {
      variables: {
        id: id,
      },
      cache: "no-cache",
      withAuth: true,
    });

    if (response.order) {
      return { success: true, order: response.order };
    }
  } catch (error) {
    console.error("Failed to remove address:", error);
    return;
  }
};

export async function getChannelCountries(channelSlug: string) {
  try {
    const { channel } = await executeGraphQL<ChannelQuery, { slug: string }>(ChannelDocument, {
      variables: { slug: channelSlug },
    });
    return channel?.countries;
  } catch (error) {
    console.error("Failed to execute getChannelCountries", error);
    return null;
  }
}
