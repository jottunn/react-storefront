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
  AvailableProductFiltersDocument,
  AvailableProductFiltersQuery,
  Category,
  ChannelDocument,
  ChannelQuery,
  ConfirmAccountDocument,
  ConfirmAccountMutation,
  ConfirmEmailChangeDocument,
  ConfirmEmailChangeMutation,
  LanguageCodeEnum,
  OrderDetailsByIdDocument,
  OrderDetailsByIdQuery,
  PasswordChangeDocument,
  PasswordChangeMutation,
  ProductCollectionDocument,
  ProductCollectionQuery,
  ProductCountableEdge,
  ProductFilterInput,
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

export async function logout() {
  //if any checkout and attached customer  =>  detach
  const cookieStore = cookies();
  const checkoutId = cookieStore.get("checkoutId-default-channel")?.value;
  if (checkoutId) {
    await customerDetach(checkoutId);
  }
  saleorAuthClient().signOut();
}

export async function login(formData: LoginFormData) {
  const email = formData.email.toString();
  const password = formData.password.toString();

  if (!email || !password) {
    return { success: false, errors: ["Email and password are required"] };
  }

  const { data } = await saleorAuthClient().signIn({ email, password }, { cache: "no-store" });

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

// export async function reset(formData: ResetPasswordFormData) {
//   try {
//     const response = await saleorAuthClient.resetPassword({
//       email: formData.email,
//       password: formData.password,
//       token: formData.token,
//     });

//     if (response.data?.setPassword?.errors?.length) {
//       const customError = response.data.setPassword.errors as any;
//       return { success: false, errors: customError.map((error: { code: any }) => error.code) };
//     }
//     return { success: true };
//   } catch (error) {
//     console.error("Failed to resetPassword:", error);
//     return { success: false };
//   }
// }

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
const PRODUCTS_JSON_PATH = path.join(process.cwd(), "public", "products.json");
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

const checkAndScheduleJob = async (queue: Bull.Queue) => {
  try {
    // Get all repeat jobs
    const repeatableJobs = await queue.getRepeatableJobs();
    console.log("Existing repeatable jobs:", repeatableJobs);

    // Check if our specific job already exists
    const existingJob = repeatableJobs.find(
      (job: { cron: string }) => job.cron === "0 5 * * *", // Same cron pattern
    );

    if (existingJob) {
      console.log("Job already scheduled:", existingJob);
      return;
    }

    // Schedule new job only if none exists
    const job = await queue.add(
      {},
      {
        repeat: {
          cron: "0 5 * * *", // Run daily at 5 AM
        },
        removeOnComplete: true,
      },
    );
    console.log("New daily products generation scheduled, job ID:", job.id);
  } catch (error) {
    console.error("Error checking/scheduling job:", error);
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
          console.log("Scheduled products JSON created successfully");
          return { status: "success" };
        } catch (error) {
          console.error("Error in scheduled products generation:", error);
          throw error;
        }
      });

      // Check and schedule job
      await checkAndScheduleJob(generateProductsQueue);

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

export async function getAvailableFilters(productsFilter: ProductFilterInput) {
  try {
    const productsData = await getProductsData();

    // Step 1: Filter products by collections and categories
    const filteredEdges = productsData.edges.filter((edge: any) => {
      const product = edge.node;

      // Filter by collections
      if (productsFilter.collections && productsFilter.collections.length > 0) {
        return productsFilter.collections.some((filterCollection) =>
          product.collections?.includes(filterCollection),
        );
      } else {
        // Filter by categories
        if (productsFilter.categories && productsFilter.categories.length > 0) {
          return isCategoryDescendant(product.category, productsFilter.categories);
        }
      }
      return true; // Include product if it matches collections and categories
    });

    // Step 2: Filter variants for the remaining products
    const finalFilteredEdges = filteredEdges
      .map((edge: any) => {
        const product = edge.node;
        // Filter variants based on the attributes (excluding brand)
        const filteredVariants = (product.variants || []).filter((variant: any) => {
          const matchesAllAttributes = productsFilter.attributes?.every((filterAttr) => {
            if (filterAttr.slug === "brand") return true; // Skip brand filtering for now

            // Check product-level attributes
            const productAttr = product.attributes?.find(
              (attr: { attribute: { slug: string } }) => attr.attribute.slug === filterAttr.slug,
            );
            if (productAttr) {
              return filterAttr.values?.some((value) =>
                productAttr.values.some((attrValue: { slug: string }) => attrValue.slug === value),
              );
            }

            // Check variant-level attributes
            const variantAttr = variant.attributes?.find(
              (attr: any) => attr.attribute.slug === filterAttr.slug,
            );
            if (!variantAttr) return false;
            return filterAttr.values?.some((value) =>
              variantAttr.values.some((attrValue: { slug: string }) => attrValue.slug === value),
            );
          });
          return matchesAllAttributes;
        });

        // Return the product with only the filtered variants
        return {
          ...edge,
          node: {
            ...product,
            variants: filteredVariants,
          },
        };
      })
      .filter((edge: any) => edge.node.variants.length > 0); // Exclude products with no matching variants

    // Extract all brands from the filtered products
    let allBrands = extractBrands(finalFilteredEdges);
    // Step 3: Apply brand filter if it exists
    const brandFilter = productsFilter.attributes?.find((attr) => attr.slug === "brand");
    const finalFilteredEdgesWithBrand =
      brandFilter && brandFilter.values && brandFilter.values.length > 0
        ? finalFilteredEdges.filter((edge: any) => {
            const product = edge.node;
            const productBrand = product.attributes?.find(
              (attr: { attribute: { slug: string } }) => attr.attribute.slug === "brand",
            );
            return (
              productBrand &&
              brandFilter?.values?.some((value) =>
                productBrand.values.some(
                  (brandValue: { slug: string }) => brandValue.slug === value,
                ),
              )
            );
          })
        : finalFilteredEdges;

    let allCategories;
    if (productsFilter.collections && productsFilter.collections.length > 0) {
      allCategories = extractCategories(finalFilteredEdgesWithBrand);
    }

    const finalFilteredEdgesWithCateg =
      productsFilter.collections &&
      productsFilter.collections.length > 0 &&
      productsFilter.categories &&
      productsFilter.categories.length > 0
        ? finalFilteredEdgesWithBrand.filter((edge: any) => {
            const product = edge.node;
            return isCategoryDescendant(product.category, productsFilter.categories || []);
          })
        : finalFilteredEdgesWithBrand;

    if (
      productsFilter.collections &&
      productsFilter.collections.length > 0 &&
      productsFilter.categories &&
      productsFilter.categories.length > 0
    ) {
      allBrands = extractBrands(finalFilteredEdgesWithCateg);
    }

    const filteredProducts = {
      edges: finalFilteredEdgesWithCateg,
      availableBrands: allBrands,
      availableCategories: allCategories,
    };

    return filteredProducts;
  } catch (error) {
    console.error("Failed to execute AvailableProductFiltersQuery", error);
    return null;
  }
}

export async function getProductCollection(queryVariables: any, cache?: RequestCache) {
  try {
    const { products } = await executeGraphQL<ProductCollectionQuery, { variables: any }>(
      ProductCollectionDocument,
      {
        variables: queryVariables,
        cache: cache ? cache : "default",
      },
    );
    return products;
  } catch (error) {
    console.error("Failed to execute graphql for products query:", error);
    return null;
  }
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
