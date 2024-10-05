import logger from "../../logger";
import { createClient } from "../../lib/create-graphq-client";
import { saleorApp } from "../../saleor-app";
const WEBHOOK_SECRET_KEY = process.env.NEXT_PUBLIC_PROCESS_TRANSACTION_SECRET_KEY;

export default async (
  req: {
    body: { transactionId: string; notes: string };
    headers: { authorization: string };
    payload: any;
  },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: { (arg0: { error?: string; message?: string; order?: string }): any; new (): any };
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
  const { transactionId, notes } = req.body;
  const authData = await saleorApp.apl.getAll();

  if (!authData || !authData[0] || !authData[0]["saleorApiUrl"] || !authData[0]["token"]) {
    console.error("Authentication data is missing or incomplete:", authData);
    logger.error("Authentication data is missing or incomplete");
    return res.status(500).json({ error: "Failed to retrieve valid authentication data" });
  }

  if (!transactionId) {
    logger.warn(`Couldn't update transaction. TransactionId is missing. ${notes}`);
    return res.status(200).json({ error: "transaction information missing" });
  }

  const client = createClient(authData[0]["saleorApiUrl"], async () => ({
    token: authData[0]["token"],
  }));
  const transactionUpdateMutation = `
	mutation transactionUpdate($transactionId: ID!, $transaction: TransactionUpdateInput) {
    	transactionUpdate(id: $transactionId, transaction: $transaction) {
        	transaction {
            	id
            	actions
        	}
        	errors {
            	field
            	code
            	message
        	}
    	}
	}`;

  try {
    const result = await client.mutation(transactionUpdateMutation, {
      transactionId: transactionId,
      transaction: {
        metadata: [{ key: "notes", value: notes }],
      },
    });
    if (result.data.transactionUpdate.errors?.length) {
      logger.error(
        `Failed to update transaction ${transactionId} with notes ${notes}. Error: ${JSON.stringify(
          result.data.transactionUpdate.errors
        )}`
      );
    }
    return res.status(200).json({ message: JSON.stringify(result.data.transactionUpdate.errors) });
  } catch (error) {
    logger.error(
      `Failed to update transaction ${transactionId} with notes ${notes}. Error: ${JSON.stringify(
        error
      )}`
    );
    return res
      .status(400)
      .json({ error: `Failed to update transaction. Err: ${JSON.stringify(error)}` });
  }
};
