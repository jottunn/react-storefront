import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { createClient } from "../../../lib/create-graphq-client";
import { gql } from "urql";
import {
  CheckoutFindDocument,
  TransactionInitializeSessionPayloadFragment,
} from "../../../../generated/graphql";
import axios from "axios";
import logger from "../../../logger";

const TransactionInitializeSessionPayload = gql`
  fragment TransactionInitializeSessionPayload on TransactionInitializeSession {
    action {
      amount
      currency
      actionType
    }
    data
  }
`;

const TransactionInitializeSessionSubscription = gql`
  # Payload fragment must be included in the root query
  ${TransactionInitializeSessionPayload}
  subscription TransactionInitializeSession {
    event {
      ...TransactionInitializeSessionPayload
    }
  }
`;

export const transactionInitializeSessionWebhook =
  new SaleorSyncWebhook<TransactionInitializeSessionPayloadFragment>({
    name: "Transaction Initialize Session",
    webhookPath: "/api/webhooks/transaction-initialize-session",
    event: "TRANSACTION_INITIALIZE_SESSION",
    apl: saleorApp.apl,
    query: TransactionInitializeSessionSubscription,
  });

export default transactionInitializeSessionWebhook.createHandler(async (req, res, ctx) => {
  const { payload, event, baseUrl, authData } = ctx;
  const checkoutId = payload.data.checkoutId;

  const client = createClient(authData.saleorApiUrl, async () => ({ token: authData.token }));
  const { data } = await client.query(CheckoutFindDocument, { id: checkoutId }).toPromise();

  if (data?.checkout) {
    const checkout = data.checkout;

    const paymentDataWithoutAuth = {
      orderNumber: "0001", //TODO
      amount: checkout.totalPrice.gross.amount,
      currency: checkout.totalPrice.gross.currency === "RON" ? "946" : "978", // 946 for RON, 978 for EUR
      language: "ro",
      email: checkout.email,
      orderBundle: JSON.stringify({
        orderCreationDate: checkout.created,
        customerDetails: {
          email: checkout.email,
          phone: checkout.billingAddress?.phone || "NA",
          contact: `${checkout.billingAddress?.firstName} ${checkout.billingAddress?.lastName}`,
        },
        billingInfo: {
          country: checkout.billingAddress?.country.code,
          city: checkout.billingAddress?.city,
          postAddress: checkout.billingAddress?.streetAddress1,
          postAddress2: checkout.billingAddress?.streetAddress2 || "NA",
          postAddress3: "NA",
          postalCode: checkout.billingAddress?.postalCode || "010011",
          state: checkout.billingAddress?.countryArea || "B",
        },
        deliveryInfo: {
          country: checkout.shippingAddress?.country.code,
          city: checkout.shippingAddress?.city,
          postAddress: checkout.shippingAddress?.streetAddress1,
          postAddress2: checkout.shippingAddress?.streetAddress2 || "NA",
          postAddress3: "NA",
          postalCode: checkout.shippingAddress?.postalCode || "010011",
          state: checkout.shippingAddress?.countryArea || "B",
        },
      }),
      returnUrl: `${process.env.RETURN_URL}?checkoutId=${checkoutId}`,
      jsonParams: JSON.stringify({ FORCE_3DS2: "true" }),
    };
    const username =
      process.env.NEXT_PUBLIC_ENV === "test"
        ? process.env.ING_WEBPAY_USERNAME_TEST
        : process.env.ING_WEBPAY_USERNAME_PROD;
    const password =
      process.env.NEXT_PUBLIC_ENV === "test"
        ? process.env.ING_WEBPAY_PASSWORD_TEST
        : process.env.ING_WEBPAY_PASSWORD_PROD;
    const apiInitUrl =
      process.env.NEXT_PUBLIC_ENV === "test"
        ? process.env.ING_WEBPAY_API_URL_INIT_TEST
        : process.env.ING_WEBPAY_API_URL_INIT_PROD;

    const paymentData = { userName: username, password: password, ...paymentDataWithoutAuth };
    try {
      // Make the API call to ING WebPay
      const apiUrl = apiInitUrl || "";
      const response = await axios.post(apiUrl, paymentData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("ING response", response);
      console.log("API Response: errorCode", response.data.errorCode);
      //check if any errors are returned, errorCode > 0
      if (response.data?.errorCode > 0 || response.status !== 200) {
        logger.error(
          `Failed to initiate payment with ING WebPay: paymentData: ${JSON.stringify(
            paymentDataWithoutAuth
          )} ///// Error code ${response.data?.errorCode} : ${response.data?.errorMessage}`
        );
        // return res.status(400).json({
        //   error: response.data?.errorMessage || "Failed to delivery request. Please contact us!",
        // });
        return res.status(200).json({
          result: "AUTHORIZATION_FAILURE",
          pspReference: response.data.orderId,
          amount: payload.action.amount,
          message: response.data?.errorMessage || "Failed to delivery request. Please contact us!",
          data: {
            exception: true,
          },
        });
      }

      if (response.data.formUrl && response.data.orderId) {
        logger.info(
          `Payment initiated in ING with orderId=${
            response.data.orderId
          } for paymentData: ${JSON.stringify(paymentDataWithoutAuth)}`
        );
        console.log("API Response:", response.data.formUrl, response.data.orderId);

        // Redirect the user to ING WebPay to complete the payment
        return res.status(200).json({
          result: "AUTHORIZATION_ACTION_REQUIRED",
          pspReference: response.data.orderId,
          amount: payload.action.amount,
          data: {
            paymentUrl: response.data.formUrl,
          },
        });
      } else {
        logger.error(
          `Failed to initiate payment with ING WebPay (formUrl or orderId are missing) ///// formUrl: ${
            response.data.formUrl
          }, oriderId: ${response.data.orderId} for PaymentData: ${JSON.stringify(
            paymentDataWithoutAuth
          )}. Response data ${response.data}`
        );
        // return res.status(400).json({
        //   error: "Failed to delivery request. Please retry or contact us!",
        // });
        return res.status(200).json({
          result: "AUTHORIZATION_FAILURE",
          pspReference: response.data.orderId,
          amount: payload.action.amount,
          message: "Failed to initiate payment with ING WebPay (formUrl or orderId are missing)",
          data: {
            exception: true,
          },
        });
      }
    } catch (error) {
      console.error("Error initiating payment with ING WebPay:", error);
      logger.error(
        `Failed to initiate payment with ING WebPay: paymentData: ${JSON.stringify(
          paymentDataWithoutAuth
        )} ////// ERROR: ${(error as any).message} - ${(error as any).name} - ${
          (error as any).code
        }`
      );
      return res.status(500).json({
        error: "Internal Server Error",
        errorMessage: (error as any).message,
      });
    }
  } else {
    logger.error(`Checkout not found: ${checkoutId}`);
    return res.status(400).json({
      error: "Checkout not found",
    });
  }
});

/**
 * Disable body parser for this endpoint, so signature can be verified
 */
export const config = {
  api: {
    bodyParser: false,
  },
};
