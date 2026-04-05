import { eq, and, desc } from "drizzle-orm";
import {
  whatsappConfig,
  whatsappContacts,
  whatsappConversations,
  whatsappMessages,
  agentConfig,
  responseTemplates,
  analyticsEvents,
  notifications,
  type InsertWhatsappContact,
  type InsertWhatsappConversation,
  type InsertWhatsappMessage,
  type InsertAgentConfig,
  type InsertResponseTemplate,
  type InsertAnalyticsEvent,
  type InsertNotification,
} from "../drizzle/schema";
import { getDb } from "./db";

/**
 * WhatsApp Configuration
 */
export async function getWhatsappConfig(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(whatsappConfig)
    .where(and(eq(whatsappConfig.userId, userId), eq(whatsappConfig.isActive, true)))
    .limit(1);

  return result[0] || null;
}

export async function upsertWhatsappConfig(config: {
  userId: number;
  businessPhoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  webhookVerifyToken: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(whatsappConfig)
    .where(eq(whatsappConfig.userId, config.userId))
    .limit(1);

  if (existing.length > 0) {
    return await db
      .update(whatsappConfig)
      .set({
        businessPhoneNumberId: config.businessPhoneNumberId,
        businessAccountId: config.businessAccountId,
        accessToken: config.accessToken,
        webhookVerifyToken: config.webhookVerifyToken,
        updatedAt: new Date(),
      })
      .where(eq(whatsappConfig.userId, config.userId));
  }

  return await db.insert(whatsappConfig).values(config);
}

/**
 * WhatsApp Contacts
 */
export async function getOrCreateContact(userId: number, phoneNumber: string, displayName?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(whatsappContacts)
    .where(
      and(
        eq(whatsappContacts.userId, userId),
        eq(whatsappContacts.phoneNumber, phoneNumber)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const newContact: InsertWhatsappContact = {
    userId,
    phoneNumber,
    displayName: displayName || phoneNumber,
  };

  await db.insert(whatsappContacts).values(newContact);

  const created = await db
    .select()
    .from(whatsappContacts)
    .where(
      and(
        eq(whatsappContacts.userId, userId),
        eq(whatsappContacts.phoneNumber, phoneNumber)
      )
    )
    .limit(1);

  return created[0];
}

export async function getContactsByUserId(userId: number, limit_count = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(whatsappContacts)
    .where(eq(whatsappContacts.userId, userId))
    .orderBy(desc(whatsappContacts.lastMessageAt))
    .limit(limit_count);
}

/**
 * WhatsApp Conversations
 */
export async function getOrCreateConversation(
  userId: number,
  contactId: number,
  whatsappContactId: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(whatsappConversations)
    .where(
      and(
        eq(whatsappConversations.userId, userId),
        eq(whatsappConversations.contactId, contactId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const newConversation: InsertWhatsappConversation = {
    userId,
    contactId,
    whatsappContactId,
  };

  await db.insert(whatsappConversations).values(newConversation);

  const created = await db
    .select()
    .from(whatsappConversations)
    .where(
      and(
        eq(whatsappConversations.userId, userId),
        eq(whatsappConversations.contactId, contactId)
      )
    )
    .limit(1);

  return created[0];
}

export async function getConversationsByUserId(userId: number, limit_count = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(whatsappConversations)
    .where(eq(whatsappConversations.userId, userId))
    .orderBy(desc(whatsappConversations.lastMessageAt))
    .limit(limit_count);
}

export async function getConversationWithMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return null;

  const conversation = await db
    .select()
    .from(whatsappConversations)
    .where(eq(whatsappConversations.id, conversationId))
    .limit(1);

  if (!conversation.length) return null;

  const messages = await db
    .select()
    .from(whatsappMessages)
    .where(eq(whatsappMessages.conversationId, conversationId))
    .orderBy(desc(whatsappMessages.createdAt));

  return {
    conversation: conversation[0],
    messages,
  };
}

/**
 * WhatsApp Messages
 */
export async function createMessage(message: InsertWhatsappMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(whatsappMessages).values(message);
  return result;
}

export async function getMessagesByConversation(conversationId: number, limit_count = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(whatsappMessages)
    .where(eq(whatsappMessages.conversationId, conversationId))
    .orderBy(desc(whatsappMessages.createdAt))
    .limit(limit_count);
}

export async function updateMessageStatus(messageId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(whatsappMessages)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(whatsappMessages.id, messageId));
}

/**
 * Agent Configuration
 */
export async function getAgentConfig(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(agentConfig)
    .where(eq(agentConfig.userId, userId))
    .limit(1);

  return result[0] || null;
}

export async function upsertAgentConfig(config: InsertAgentConfig) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(agentConfig)
    .where(eq(agentConfig.userId, config.userId!))
    .limit(1);

  if (existing.length > 0) {
    return await db
      .update(agentConfig)
      .set({ ...config, updatedAt: new Date() })
      .where(eq(agentConfig.userId, config.userId!));
  }

  return await db.insert(agentConfig).values(config);
}

/**
 * Response Templates
 */
export async function getTemplatesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(responseTemplates)
    .where(and(eq(responseTemplates.userId, userId), eq(responseTemplates.isActive, true)))
    .orderBy(responseTemplates.category);
}

export async function createTemplate(template: InsertResponseTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(responseTemplates).values(template);
}

/**
 * Analytics Events
 */
export async function logAnalyticsEvent(event: InsertAnalyticsEvent) {
  const db = await getDb();
  if (!db) return null;

  return await db.insert(analyticsEvents).values(event);
}

/**
 * Notifications
 */
export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) return null;

  return await db.insert(notifications).values(notification);
}

export async function getNotificationsByUserId(userId: number, limit_count = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit_count);
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));
}
