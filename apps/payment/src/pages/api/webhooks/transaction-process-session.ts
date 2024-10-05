import { gql } from "urql";
import { TransactionProcessSessionPayloadFragment } from "../../../../generated/graphql";
import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import getINGWebPayPaymentStatus from "../../../lib/get-ing-payment-status";
import logger from "../../../logger";

const TransactionProcessSessionPayload = gql`
  fragment TransactionProcessSessionPayload on TransactionProcessSession {
    action {
      amount
      currency
      actionType
    }
    transaction {
      id
      pspReference
    }
  }
`;

const TransactionProcessSessionSubscription = gql`
  ${TransactionProcessSessionPayload}
  subscription TransactionProcessSession {
    event {
      ...TransactionProcessSessionPayload
    }
  }
`;

export const transactionProcessSessionWebhook =
  new SaleorSyncWebhook<TransactionProcessSessionPayloadFragment>({
    name: "Transaction Process Session",
    webhookPath: "/api/webhooks/transaction-process-session",
    event: "TRANSACTION_PROCESS_SESSION",
    apl: saleorApp.apl,
    query: TransactionProcessSessionSubscription,
  });

export default transactionProcessSessionWebhook.createHandler(async (req, res, ctx) => {
  const { payload, event, baseUrl, authData } = ctx;
  console.log("Transaction Process Session payload:", payload);
  const pspReference = payload.transaction?.pspReference;

  if (!pspReference) {
    logger.error(`PSP reference (orderId) is missing from the transaction: ${payload.transaction}`);
    console.error("PSP reference (orderId) is missing from the transaction");
    return res.status(400).json({ error: "PSP reference is missing" });
  }

  try {
    const statusResponse = await getINGWebPayPaymentStatus(pspReference);
    console.info("statusResponse", statusResponse);

    if (!statusResponse) {
      logger.error(
        `Failed to retrieve payment status from ING WebPay for transaction: ${payload.transaction}`
      );
      return res.status(500).json({ error: "Failed to retrieve payment status from ING WebPay" });
    }

    return res.status(200).json({
      result: statusResponse.result,
      amount: payload.action.amount,
      pspReference: pspReference || "",
      errorCode: statusResponse.errorCode,
      errorMessage: statusResponse.errorMessage,
      message: statusResponse.message,
    });
  } catch (error) {
    logger.error(`Error processing transaction: ${error}`);
    console.error("Error processing transaction:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};
