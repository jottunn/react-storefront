"use server";

import { executeGraphQL } from "@/lib/graphql";
import { defaultRegionQuery } from "@/lib/regions";
import {
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
  CheckoutEmailUpdateDocument,
  CheckoutEmailUpdateMutation,
  CheckoutLineUpdateDocument,
  CheckoutLineUpdateInput,
  CheckoutLineUpdateMutation,
  CheckoutPaymentCreateDocument,
  CheckoutPaymentCreateMutation,
  CheckoutShippingAddressUpdateDocument,
  CheckoutShippingAddressUpdateMutation,
  CheckoutShippingMethodUpdateDocument,
  CheckoutShippingMethodUpdateMutation,
  MetadataInput,
  PaymentInput,
  RemoveProductFromCheckoutDocument,
  RemoveProductFromCheckoutMutation,
} from "@/saleor/api";
import { AddressFormData } from "./address/AddressForm";

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
    });

    //console.log(response.checkoutEmailUpdate?.errors);
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
    });

    console.log("checkoutCustomerDetach", response.checkoutCustomerDetach?.errors);
    if (response.checkoutCustomerDetach?.errors.length) {
      const customError = response.checkoutCustomerDetach.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, checkout: response.checkoutCustomerDetach?.checkout };
  } catch (error) {
    console.error("Failed to attach customer to checkout:", error);
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

    console.log(response.checkoutBillingAddressUpdate?.errors);
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

    console.log("checkoutShippingAddressUpdate", response.checkoutShippingAddressUpdate?.errors);
    if (response.checkoutShippingAddressUpdate?.errors.length) {
      return { errors: response.checkoutShippingAddressUpdate.errors };
    }
    return { checkout: response.checkoutShippingAddressUpdate?.checkout };
  } catch (error) {
    console.error("Failed to update Shipping Address on checkout:", error);
    return;
  }
};

export const checkoutShippingMethodUpdate = async (args: {
  shippingMethodId: string;
  id: string;
}) => {
  const { shippingMethodId, id } = args;
  try {
    const response = await executeGraphQL<
      CheckoutShippingMethodUpdateMutation,
      {
        shippingMethodId: string;
        locale: string;
        id: string;
      }
    >(CheckoutShippingMethodUpdateDocument, {
      variables: {
        shippingMethodId: shippingMethodId,
        id: id,
        locale: defaultRegionQuery().locale,
      },
      cache: "no-cache",
    });

    if (response.checkoutShippingMethodUpdate?.errors.length) {
      const customError = response.checkoutShippingMethodUpdate.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, checkout: response.checkoutShippingMethodUpdate?.checkout };
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
      console.log("customError", customError);
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
    console.log("checkoutAddPromoCodeMutation", response);

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
