"use server";

import { executeGraphQL } from "@/lib/graphql";
import { defaultRegionQuery } from "@/lib/regions";
import {
  CheckoutAddProductLineDocument,
  CheckoutAddProductLineMutation,
  CheckoutAddPromoCodeDocument,
  CheckoutAddPromoCodeMutation,
  CheckoutBillingAddressUpdateDocument,
  CheckoutBillingAddressUpdateMutation,
  CheckoutCompleteDocument,
  CheckoutCompleteMutation,
  CheckoutCustomerAttachDocument,
  CheckoutCustomerAttachMutation,
  CheckoutCustomerDetachDocument,
  CheckoutCustomerDetachMutation,
  CheckoutDeliveryMethodUpdateDocument,
  CheckoutDeliveryMethodUpdateMutation,
  CheckoutEmailUpdateDocument,
  CheckoutEmailUpdateMutation,
  CheckoutLineUpdateDocument,
  CheckoutLineUpdateInput,
  CheckoutLineUpdateMutation,
  CheckoutPaymentCreateDocument,
  CheckoutPaymentCreateMutation,
  CheckoutShippingAddressUpdateDocument,
  CheckoutShippingAddressUpdateMutation,
  LanguageCodeEnum,
  MetadataInput,
  PaymentGatewayToInitialize,
  PaymentInput,
  RemoveProductFromCheckoutDocument,
  RemoveProductFromCheckoutMutation,
  TransactionFlowStrategyEnum,
  TransactionInitializeDocument,
  TransactionInitializeMutation,
  TransactionInitializeMutationVariables,
} from "@/saleor/api";
import { AddressFormData } from "../account/AddressForm";
import * as Checkout from "@/lib/checkout";
type updateEmailFromCheckoutArgs = {
  id: string;
  email: string;
};
type CheckoutEmailUpdateMutationVariables = {
  id: string;
  email: string;
  locale: string;
};
export const checkoutEmailUpdate = async ({ id, email }: updateEmailFromCheckoutArgs) => {
  try {
    const response = await executeGraphQL<
      CheckoutEmailUpdateMutation,
      CheckoutEmailUpdateMutationVariables
    >(CheckoutEmailUpdateDocument, {
      variables: {
        email: email,
        id: id,
        locale: defaultRegionQuery().locale,
      },
      cache: "no-cache",
      withAuth: false,
    });

    console.log(response.checkoutEmailUpdate?.errors);
    if (response.checkoutEmailUpdate?.errors.length) {
      const customError = response.checkoutEmailUpdate.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, checkout: response.checkoutEmailUpdate?.checkout };
  } catch (error) {
    console.error("Failed to add email to checkout:", error);
    return;
  }
};

type CheckoutCustomerAttachVariables = {
  id: string;
  locale: string;
};
export const customerAttach = async (id: string) => {
  try {
    const response = await executeGraphQL<
      CheckoutCustomerAttachMutation,
      CheckoutCustomerAttachVariables
    >(CheckoutCustomerAttachDocument, {
      variables: {
        id: id,
        locale: defaultRegionQuery().locale,
      },
      cache: "no-cache",
      withAuth: true,
    });

    //console.log(response.checkoutCustomerAttach?.errors);
    if (response.checkoutCustomerAttach?.errors.length) {
      const customError = response.checkoutCustomerAttach.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, checkout: response.checkoutCustomerAttach?.checkout };
  } catch (error) {
    console.error("Failed to attach customer to checkout:", error);
    return;
  }
};

type CheckoutCustomerDetachVariables = {
  id: string;
  locale: string;
};
export const customerDetach = async (id: string) => {
  try {
    const response = await executeGraphQL<
      CheckoutCustomerDetachMutation,
      CheckoutCustomerDetachVariables
    >(CheckoutCustomerDetachDocument, {
      variables: {
        id: id,
        locale: defaultRegionQuery().locale,
      },
      cache: "no-cache",
      withAuth: true,
    });

    // console.log("checkoutCustomerDetach", response.checkoutCustomerDetach?.errors);
    if (response.checkoutCustomerDetach?.errors.length) {
      const customError = response.checkoutCustomerDetach.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, checkout: response.checkoutCustomerDetach?.checkout };
  } catch (error) {
    console.error("Failed to detach customer from checkout:", error);
    return;
  }
};

export const checkoutBillingAddressUpdate = async (args: {
  address: AddressFormData;
  id: string;
}) => {
  const { address, id } = args;
  try {
    const response = await executeGraphQL<
      CheckoutBillingAddressUpdateMutation,
      {
        address: AddressFormData;
        id: string;
        locale: string;
      }
    >(CheckoutBillingAddressUpdateDocument, {
      variables: {
        address: address,
        id: id,
        locale: defaultRegionQuery().locale,
      },
      cache: "no-cache",
    });

    // console.log(response.checkoutBillingAddressUpdate?.errors);
    if (response.checkoutBillingAddressUpdate?.errors.length) {
      return { errors: response.checkoutBillingAddressUpdate.errors };
    }
    return { checkout: response.checkoutBillingAddressUpdate?.checkout };
  } catch (error) {
    console.error("Failed to update Billing Address on checkout:", error);
    return;
  }
};

export const checkoutShippingAddressUpdate = async (args: {
  address: AddressFormData;
  id: string;
}) => {
  const { address, id } = args;
  try {
    const response = await executeGraphQL<
      CheckoutShippingAddressUpdateMutation,
      {
        address: AddressFormData;
        locale: string;
        id: string;
      }
    >(CheckoutShippingAddressUpdateDocument, {
      variables: {
        address: address,
        id: id,
        locale: defaultRegionQuery().locale,
      },
      cache: "no-cache",
    });

    // console.log("checkoutShippingAddressUpdate", response.checkoutShippingAddressUpdate?.errors);
    if (response.checkoutShippingAddressUpdate?.errors.length) {
      return { errors: response.checkoutShippingAddressUpdate.errors };
    }
    return { checkout: response.checkoutShippingAddressUpdate?.checkout };
  } catch (error) {
    console.error("Failed to update Shipping Address on checkout:", error);
    return;
  }
};

export const checkoutDeliveryMethodUpdate = async (args: {
  deliveryMethodId: string;
  id: string;
}) => {
  const { deliveryMethodId, id } = args;
  try {
    const response = await executeGraphQL<
      CheckoutDeliveryMethodUpdateMutation,
      {
        deliveryMethodId: string;
        locale: string;
        id: string;
      }
    >(CheckoutDeliveryMethodUpdateDocument, {
      variables: {
        deliveryMethodId: deliveryMethodId,
        id: id,
        locale: defaultRegionQuery().locale,
      },
      cache: "no-cache",
    });

    if (response.checkoutDeliveryMethodUpdate?.errors.length) {
      const customError = response.checkoutDeliveryMethodUpdate.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, checkout: response.checkoutDeliveryMethodUpdate?.checkout };
  } catch (error) {
    console.error("Failed to update Shipping Method on checkout:", error);
    return;
  }
};

export const checkoutPaymentCreateMutation = async (args: { id: string; input: PaymentInput }) => {
  const { id, input } = args;
  try {
    const response = await executeGraphQL<
      CheckoutPaymentCreateMutation,
      {
        id: string;
        input: PaymentInput;
      }
    >(CheckoutPaymentCreateDocument, {
      variables: {
        input: input,
        id: id,
      },
      cache: "no-cache",
    });

    if (response.checkoutPaymentCreate?.errors.length) {
      const customError = response.checkoutPaymentCreate.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to create Payment on checkout:", error);
    return;
  }
};

export const checkoutCompleteMutation = async (args: { id: string; note: string }) => {
  const { id, note } = args;
  try {
    const response = await executeGraphQL<
      CheckoutCompleteMutation,
      {
        id: string;
        metadata: [MetadataInput];
      }
    >(CheckoutCompleteDocument, {
      variables: {
        id: id,
        metadata: [
          {
            key: "observatii-comanda",
            value: note,
          },
        ],
      },
      cache: "no-cache",
    });

    if (response.checkoutComplete?.errors.length) {
      const customError = response.checkoutComplete.errors as any;
      // console.log("customError", customError);
      return {
        success: false,
        errors: customError.map(
          (error: { code?: string; message?: string }) => error.code || error.message,
        ),
      };
    }
    return { success: true, order: response?.checkoutComplete?.order };
  } catch (error) {
    console.error("Failed to complete checkout:", error);
    return;
  }
};

export const checkoutAddPromoCodeMutation = async (args: { id: string; promoCode: String }) => {
  const { id, promoCode } = args;
  try {
    const response = await executeGraphQL<
      CheckoutAddPromoCodeMutation,
      {
        id: string;
        promoCode: String;
        locale: string;
      }
    >(CheckoutAddPromoCodeDocument, {
      variables: {
        id: id,
        promoCode: promoCode,
        locale: defaultRegionQuery().locale,
      },
      cache: "no-cache",
    });
    // console.log("checkoutAddPromoCodeMutation", response);

    if (response.checkoutAddPromoCode?.errors.length) {
      const customError = response.checkoutAddPromoCode.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { checkout: response?.checkoutAddPromoCode?.checkout };
  } catch (error) {
    console.error("Failed to add Promo Code on checkout:", error);
    return;
  }
};

type removeLineFromCheckoutArgs = {
  lineId: string;
  id: string;
};
type RemoveProductFromCheckoutVariables = {
  id: string;
  lineId: string;
  locale: string;
};

export const deleteLineFromCheckout = async ({ lineId, id }: removeLineFromCheckoutArgs) => {
  try {
    const response = await executeGraphQL<
      RemoveProductFromCheckoutMutation,
      RemoveProductFromCheckoutVariables
    >(RemoveProductFromCheckoutDocument, {
      variables: {
        id: id,
        lineId: lineId,
        locale: defaultRegionQuery().locale,
      },
      cache: "no-cache",
    });
    //console.log(response);
    if (response.checkoutLineDelete?.errors.length) {
      const customError = response.checkoutLineDelete.errors as any;
      // console.log(customError);
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, checkout: response.checkoutLineDelete?.checkout };
  } catch (error) {
    console.error("Failed to remove checkout line:", error);
    return;
  }
};

type updateLineFromCheckoutArgs = {
  lineUpdateInput: CheckoutLineUpdateInput;
  id: string;
};
type CheckoutLineUpdateVariables = {
  id: string;
  lines: CheckoutLineUpdateInput[];
  locale: string;
};
export const updateLineFromCheckout = async ({
  lineUpdateInput,
  id,
}: updateLineFromCheckoutArgs) => {
  try {
    const response = await executeGraphQL<CheckoutLineUpdateMutation, CheckoutLineUpdateVariables>(
      CheckoutLineUpdateDocument,
      {
        variables: {
          id: id,
          lines: [lineUpdateInput],
          locale: defaultRegionQuery().locale,
        },
        cache: "no-cache",
      },
    );

    //console.log(response.checkoutLinesUpdate?.errors);
    if (response.checkoutLinesUpdate?.errors.length) {
      const customError = response.checkoutLinesUpdate.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, checkout: response.checkoutLinesUpdate?.checkout };
  } catch (error) {
    console.error("Failed to remove checkout line:", error);
    return;
  }
};

type AddItemArgs = {
  selectedVariantId: string;
};

export const addItem = async ({ selectedVariantId }: AddItemArgs) => {
  if (!selectedVariantId) {
    return;
  }

  const checkoutId = await Checkout.getIdFromCookies(defaultRegionQuery().channel);
  const resultCheckoutCreate = await Checkout.findOrCreate({
    checkoutId: checkoutId,
    channel: defaultRegionQuery().channel,
  });

  if (resultCheckoutCreate.errors) {
    console.error("Error in checkout creation/retrieval:", resultCheckoutCreate.errors[0]);
    return { error: resultCheckoutCreate.errors[0] };
  }

  //console.log("Checkout after findOrCreate:", resultCheckoutCreate.checkout);
  const checkout = resultCheckoutCreate.checkout;

  if (!checkout) {
    console.error("Checkout is null after findOrCreate");
    return { error: "Unable to create or retrieve checkout" };
    //throw new Error("Unable to create or retrieve checkout");
  }

  Checkout.saveIdToCookie(defaultRegionQuery().channel, checkout.id);

  const addProducts = await executeGraphQL<
    CheckoutAddProductLineMutation,
    { id: string; locale: LanguageCodeEnum; productVariantId: string }
  >(CheckoutAddProductLineDocument, {
    variables: {
      id: checkout.id,
      productVariantId: decodeURIComponent(selectedVariantId),
      locale: defaultRegionQuery().locale,
    },
    cache: "no-cache",
  });
  if (addProducts.checkoutLinesAdd?.errors.length) {
    console.log(addProducts.checkoutLinesAdd?.errors);
    const addProductErr =
      addProducts.checkoutLinesAdd?.errors[0]["code"] === "QUANTITY_GREATER_THAN_LIMIT"
        ? "QUANTITY_GREATER_THAN_LIMIT_PRODUCT"
        : addProducts.checkoutLinesAdd?.errors[0]["code"];
    return { error: addProductErr };
  }

  return { success: true, checkout: checkout };
};

type initializeTransactionArgs = {
  checkoutId: string;
  action?: TransactionFlowStrategyEnum;
  paymentGateway: PaymentGatewayToInitialize;
  amount?: number;
};
export const initializeTransaction = async ({
  checkoutId,
  action,
  paymentGateway,
  amount,
}: initializeTransactionArgs) => {
  try {
    const response = await executeGraphQL<
      TransactionInitializeMutation,
      TransactionInitializeMutationVariables
    >(TransactionInitializeDocument, {
      variables: {
        checkoutId,
        action,
        paymentGateway,
        amount,
      },
      cache: "no-cache",
    });

    if (response.transactionInitialize?.errors.length) {
      console.log(response.transactionInitialize?.errors);
      const customError = response.transactionInitialize.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    console.log(response.transactionInitialize);
    return { success: true, transaction: response.transactionInitialize };
  } catch (error) {
    console.error("Failed to remove checkout line:", error);
    return;
  }
};
