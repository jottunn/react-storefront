import logger from "../../logger";
import { createClient } from "../../lib/create-graphq-client";
import { saleorApp } from "../../saleor-app";
const WEBHOOK_SECRET_KEY = process.env.NEXT_PUBLIC_PROCESS_TRANSACTION_SECRET_KEY;

export default async (
  req: { body: { checkoutId: string }; headers: { authorization: string }; payload: any },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: {
        (arg0: { error?: string; message?: string; order?: string; errorString?: string }): any;
        new (): any;
      };
    };
  }
) => {
  // logger.info(`Request headers: ${JSON.stringify(req.headers)}`);
  // logger.info(`Request body: ${JSON.stringify(req.body)}`);
  // Check for authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `${WEBHOOK_SECRET_KEY}`) {
    logger.warn("Unauthorized access attempt");
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Assuming the body parser is enabled for this route, if you're receiving JSON:
  const { checkoutId } = req.body;
  let notes;
  const authData = await saleorApp.apl.getAll();

  if (!authData || !authData[0] || !authData[0]["saleorApiUrl"] || !authData[0]["token"]) {
    console.error("Authentication data is missing or incomplete:", authData);
    logger.error("Authentication data is missing or incomplete");
    return res.status(500).json({ error: "Failed to retrieve valid authentication data" });
  }

  if (!checkoutId) {
    logger.warn(`Checkout information missing.`);
    return res.status(200).json({ error: "Checkout information missing" });
  }

  const client = createClient(authData[0]["saleorApiUrl"], async () => ({
    token: authData[0]["token"],
  }));

  let currentCheckout;
  const getCheckout = `
    query CheckoutFind($id: ID) {
      checkout(id: $id) {   
        transactions {          
          id
          createdAt
          authorizePendingAmount {
            amount
          }
          pspReference
          metadata {
            key
            value
          }          
        }
      }   
    }
    `;
  try {
    const result = await client.query(getCheckout, { id: checkoutId });
    console.log("checkoutId", checkoutId);
    console.log("resultCheckoutFind", result);
    currentCheckout = result.data.checkout;
  } catch (error) {
    logger.error(`Error fetching checkout details. Error: ${JSON.stringify(error)}`);
    console.error("Error fetching checkout details:", error);
    return res
      .status(500)
      .json({ error: "Internal server error - Error fetching checkout details" });
  }

  if (!currentCheckout) {
    let existingOrder = 0;
    const getOrderByCheckoutId = `
    query GetOrders($filter: OrderFilterInput) {
      orders(filter: $filter, first: 1) {   
        edges {
          node {
            id
          }
        }
      }   
    }
    `;
    try {
      const resultGetOrder = await client.query(getOrderByCheckoutId, {
        filter: { checkoutIds: [checkoutId] },
      });
      // console.log('resultGetOrder', resultGetOrder);
      existingOrder = resultGetOrder.data?.orders?.edges.length;
    } catch (error) {
      logger.error(`Error querying orders by checkout Id details. Error: ${JSON.stringify(error)}`);
    }
    if (existingOrder > 0) {
      return res.status(200).json({
        error: "Checkout already processes",
        errorString: "app.payment.checkoutAlreadyProcessed",
      });
    }
    return res.status(200).json({ error: "Checkout not found" });
  }

  try {
    // Mutation to process transaction
    const transactionProcessMutation = `
      mutation transactionProcess($transactionId: ID!, $data: JSON) {
        transactionProcess(id: $transactionId, data: $data) {
          transaction {
            id
            actions
          }
          transactionEvent {
            message
            type
          }
          data
          errors {
            field
            code
            message
          }
        }
      }
    `;

    const transaction = currentCheckout?.transactions
      ?.filter(
        (txn: { pspReference: string | null }) =>
          txn.pspReference !== null && txn.pspReference.trim() !== ""
      )
      ?.sort(
        (a: { createdAt: string }, b: { createdAt: string }) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )?.[0]; // Sort by createdAt descending and get the most recent transaction

    console.log("transaction", transaction);
    if (transaction?.id) {
      const result = await client
        .mutation(transactionProcessMutation, { transactionId: transaction.id })
        .toPromise();
      // Handle potential errors in the mutation result
      if (result.error || result.data.transactionProcess.errors.length > 0) {
        const err = result.error || JSON.stringify(result.data.transactionProcess.errors);
        console.error("Error processing transaction1:", err);
        logger.error(`Failed to process transaction. Error: ${err}`);
        return res.status(200).json({
          error: "Failed to process transaction.",
          errorString: "app.payment.errorTransactionProcessing",
        });
      }

      console.log("result processTransaction", result);
      if (result.data.errorCode && result.data.errorCode !== "0") {
        return res.status(200).json({
          error: "Failed to process transaction.",
          errorString: "app.payment.errorTransactionProcessing",
        });
      }
      const transactionMetadata = transaction?.metadata?.find(
        (metadata: { key: string }) => metadata.key === "notes"
      );
      notes = transactionMetadata ? transactionMetadata.value : null;
      logger.info(`Transaction successfully processed for checkout: ${checkoutId}`);
    } else {
      logger.error(`No transaction found to be processed for checkout ${checkoutId}`);
      return res.status(200).json({ error: "ING Transaction not found" });
    }
  } catch (error) {
    console.error("Error processing transaction2:", error);
    logger.error(`Error processing transaction. Error: ${JSON.stringify(error)}`);
    return res.status(500).json({
      error: "Internal server error - Error processing transaction",
      errorString: "app.payment.errorTransactionProcessing",
    });
  }

  if (checkoutId) {
    try {
      const checkoutCompleteMutation = `
      mutation CompleteCheckout($id: ID!, $metadata: [MetadataInput!]) {
          checkoutComplete(id: $id, metadata: $metadata) {
            errors {
              field
              message
            }
            order {
              id
              number
              paymentStatus
            }
          }
        }`;

      const orderResult = await client
        .mutation(checkoutCompleteMutation, {
          id: checkoutId,
          metadata: [
            {
              key: "observatii-comanda",
              value: notes || "",
            },
          ],
        })
        .toPromise();

      console.log("checkoutcomplete", orderResult.data.checkoutComplete);
      if (orderResult.data.checkoutComplete?.errors.length) {
        console.error(`Failed to complete checkout:`, orderResult.data.checkoutComplete.errors);
        logger.error(
          `Failed to complete checkout: ${JSON.stringify(orderResult.data.checkoutComplete.errors)}`
        );
        return res.status(400).json({ error: "Failed to complete checkout." });
      }
      logger.info(
        `Order successfully created ${JSON.stringify(orderResult.data.checkoutComplete.order)}`
      );
      return res.status(200).json({
        message: "Order successfully created",
        order: orderResult.data.checkoutComplete.order,
      });
    } catch (error) {
      console.error(`Failed to complete checkout.Err: ${JSON.stringify(error)}`);
      logger.error(`Failed to complete checkout.Err: ${JSON.stringify(error)}`);
      return res
        .status(400)
        .json({ error: `Failed to complete checkout.Err: ${JSON.stringify(error)}` });
    }
  }
};
