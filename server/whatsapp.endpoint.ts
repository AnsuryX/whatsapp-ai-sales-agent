import { Router, Request, Response } from "express";
import {
  verifyWebhookToken,
  processIncomingMessage,
  handleMessageStatusUpdate,
  type WhatsAppWebhookPayload,
} from "./whatsapp.webhook";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { whatsappConfig } from "../drizzle/schema";

const router = Router();

/**
 * GET /webhook - Webhook verification from Meta
 */
router.get("/webhook", async (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode !== "subscribe" || !token || !challenge) {
    res.status(400).send("Bad Request");
    return;
  }

  try {
    // Get all WhatsApp configs to verify token
    const db = await getDb();
    if (!db) {
      res.status(500).send("Database not available");
      return;
    }

    const configs = await db.select().from(whatsappConfig);

    // Check if token matches any config
    const isValid = configs.some((config) =>
      verifyWebhookToken(token as string, config.webhookVerifyToken)
    );

    if (!isValid) {
      res.status(403).send("Forbidden");
      return;
    }

    res.status(200).send(challenge);
  } catch (error) {
    console.error("Error verifying webhook:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * POST /webhook - Receive WhatsApp messages from Meta
 */
router.post("/webhook", async (req: Request, res: Response) => {
  const payload = req.body as WhatsAppWebhookPayload;

  // Immediately acknowledge receipt
  res.status(200).send("OK");

  try {
    if (payload.object !== "whatsapp_business_account") {
      console.log("Ignoring non-WhatsApp payload");
      return;
    }

    // Get database connection
    const db = await getDb();
    if (!db) {
      console.error("Database not available");
      return;
    }

    // Process each entry
    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        const value = change.value;

        // Get WhatsApp config by phone number ID
        const config = await db
          .select()
          .from(whatsappConfig)
          .where(eq(whatsappConfig.businessPhoneNumberId, value.metadata.phone_number_id));

        if (!config.length) {
          console.error("WhatsApp config not found for phone number:", value.metadata.phone_number_id);
          continue;
        }

        const userId = config[0].userId;

        // Process incoming messages
        if (value.messages) {
          for (const message of value.messages) {
            try {
              await processIncomingMessage(userId, message, value.metadata.phone_number_id);
            } catch (error) {
              console.error("Error processing message:", error);
            }
          }
        }

        // Process message status updates
        if (value.statuses) {
          for (const status of value.statuses) {
            try {
              await handleMessageStatusUpdate(userId, status.id, status.status);
            } catch (error) {
              console.error("Error handling status update:", error);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in webhook handler:", error);
  }
});

export default router;
