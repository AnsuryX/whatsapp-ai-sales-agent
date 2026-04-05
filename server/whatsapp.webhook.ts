import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import {
  getWhatsappConfig,
  getOrCreateContact,
  getOrCreateConversation,
  createMessage,
  getAgentConfig,
  logAnalyticsEvent,
  createNotification,
  getMessagesByConversation,
} from "./whatsapp.db";

/**
 * Verify webhook token from Meta
 */
export function verifyWebhookToken(token: string, verifyToken: string): boolean {
  return token === verifyToken;
}

/**
 * Parse incoming WhatsApp message from webhook
 */
export interface WhatsAppIncomingMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string };
  document?: { id: string; mime_type: string };
  audio?: { id: string; mime_type: string };
  video?: { id: string; mime_type: string };
}

export interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        messages?: WhatsAppIncomingMessage[];
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
    }>;
  }>;
}

/**
 * Process incoming WhatsApp message
 */
export async function processIncomingMessage(
  userId: number,
  message: WhatsAppIncomingMessage,
  phoneNumberId: string
) {
  try {
    // Get WhatsApp config
    const config = await getWhatsappConfig(userId);
    if (!config) {
      console.error("WhatsApp config not found for user:", userId);
      return;
    }

    // Get or create contact
    const contact = await getOrCreateContact(userId, message.from, message.from);
    if (!contact) {
      console.error("Failed to create contact");
      return;
    }

    // Get or create conversation
    const conversation = await getOrCreateConversation(userId, contact.id, message.from);
    if (!conversation) {
      console.error("Failed to create conversation");
      return;
    }

    // Store incoming message
    const incomingMsg = await createMessage({
      userId,
      conversationId: conversation.id,
      whatsappMessageId: message.id,
      sender: "customer",
      messageType: message.type as any,
      content: message.text?.body || `[${message.type} message]`,
      status: "delivered",
    });

    // Log analytics event
    await logAnalyticsEvent({
      userId,
      conversationId: conversation.id,
      eventType: "message_received",
      metadata: {
        messageType: message.type,
        from: message.from,
      },
    });

    // Get agent config
    const agent = await getAgentConfig(userId);
    if (!agent || !agent.isActive || !agent.autoRespond) {
      console.log("Agent is not active or auto-respond is disabled");
      return;
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(
      message.text?.body || "",
      agent,
      conversation.id,
      userId
    );

    if (!aiResponse) {
      console.error("Failed to generate AI response");
      return;
    }

    // Check for escalation keywords
    const shouldEscalate = checkEscalationKeywords(
      message.text?.body || "",
      agent.escalationKeywords || []
    );

    if (shouldEscalate) {
      // Create escalation notification
      await createNotification({
        userId,
        conversationId: conversation.id,
        title: "Escalation Required",
        content: `Customer message requires human intervention: "${message.text?.body}"`,
        type: "escalation",
      });

      // Notify owner
      await notifyOwner({
        title: "WhatsApp Escalation",
        content: `Customer from ${message.from} needs assistance: "${message.text?.body}"`,
      });
    }

    // Store AI response message
    const responseMsg = await createMessage({
      userId,
      conversationId: conversation.id,
      sender: "agent",
      messageType: "text",
      content: aiResponse,
      status: "sent",
      isFromTemplate: false,
    });

    // Log analytics event
    await logAnalyticsEvent({
      userId,
      conversationId: conversation.id,
      eventType: "message_sent",
      metadata: {
        messageType: "text",
        isAI: true,
      },
    });

    return {
      success: true,
      messageId: responseMsg,
      response: aiResponse,
    };
  } catch (error) {
    console.error("Error processing incoming message:", error);
    throw error;
  }
}

/**
 * Generate AI response using LLM
 */
async function generateAIResponse(
  customerMessage: string,
  agent: any,
  conversationId: number,
  userId: number
): Promise<string | null> {
  try {
    // Get conversation history for context
    const messages = await getMessagesByConversation(conversationId, 10);
    const reversedMessages = messages.reverse();

    // Build conversation context
    const conversationContext = reversedMessages
      .map((msg) => `${msg.sender === "customer" ? "Customer" : "Agent"}: ${msg.content}`)
      .join("\n");

    // Build system prompt
    const systemPrompt = `You are ${agent.agentName || "an AI Sales Agent"}. 
${agent.personality || "You are professional, friendly, and focused on helping customers."}

Sales Approach:
${agent.salesScript || "Focus on understanding customer needs and providing helpful solutions."}

Response Style: ${agent.responseStyle || "professional"}
Max Response Length: ${agent.maxResponseLength || 500} characters

Keep responses concise, helpful, and focused on the customer's needs.`;

    // Call LLM
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Previous conversation:\n${conversationContext}\n\nNew customer message: ${customerMessage}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;

    if (!content || typeof content !== "string") {
      console.error("No response from LLM");
      return null;
    }

    // Truncate if too long
    const maxLength = agent.maxResponseLength || 500;
    if (content.length > maxLength) {
      return content.substring(0, maxLength) + "...";
    }

    return content;
  } catch (error) {
    console.error("Error generating AI response:", error);
    return null;
  }
}

/**
 * Check if message contains escalation keywords
 */
function checkEscalationKeywords(message: string, keywords: string[]): boolean {
  if (!keywords || keywords.length === 0) return false;

  const lowerMessage = message.toLowerCase();
  return keywords.some((keyword) => lowerMessage.includes(keyword.toLowerCase()));
}

/**
 * Send WhatsApp message via Meta API
 */
export async function sendWhatsAppMessage(
  userId: number,
  phoneNumber: string,
  messageText: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const config = await getWhatsappConfig(userId);
    if (!config) {
      return { success: false, error: "WhatsApp config not found" };
    }

    const response = await fetch(
      `https://graph.instagram.com/v18.0/${config.businessPhoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: phoneNumber,
          type: "text",
          text: {
            body: messageText,
          },
        }),
      }
    );

    const data = (await response.json()) as any;

    if (!response.ok) {
      console.error("WhatsApp API error:", data);
      return { success: false, error: data.error?.message || "Failed to send message" };
    }

    return {
      success: true,
      messageId: data.messages[0]?.id,
    };
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Handle message status update from Meta
 */
export async function handleMessageStatusUpdate(
  userId: number,
  messageId: string,
  status: string
) {
  try {
    // Find message in database and update status
    console.log(`Message ${messageId} status updated to ${status}`);

    // Log analytics event
    await logAnalyticsEvent({
      userId,
      eventType: "message_status_updated",
      metadata: {
        messageId,
        status,
      },
    });
  } catch (error) {
    console.error("Error handling message status update:", error);
  }
}
