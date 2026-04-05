import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * WhatsApp Business Account Configuration
 * Stores Meta App credentials and WhatsApp Business Account settings
 */
export const whatsappConfig = mysqlTable("whatsapp_config", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  businessPhoneNumberId: varchar("businessPhoneNumberId", { length: 255 }).notNull().unique(),
  businessAccountId: varchar("businessAccountId", { length: 255 }).notNull(),
  accessToken: text("accessToken").notNull(),
  webhookVerifyToken: varchar("webhookVerifyToken", { length: 255 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WhatsappConfig = typeof whatsappConfig.$inferSelect;
export type InsertWhatsappConfig = typeof whatsappConfig.$inferInsert;

/**
 * WhatsApp Contacts
 * Stores customer contact information
 */
export const whatsappContacts = mysqlTable("whatsapp_contacts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
  displayName: varchar("displayName", { length: 255 }),
  firstName: varchar("firstName", { length: 100 }),
  lastName: varchar("lastName", { length: 100 }),
  email: varchar("email", { length: 320 }),
  tags: json("tags").$type<string[]>(),
  leadScore: int("leadScore").default(0),
  sentiment: mysqlEnum("sentiment", ["positive", "neutral", "negative"]).default("neutral"),
  lastMessageAt: timestamp("lastMessageAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WhatsappContact = typeof whatsappContacts.$inferSelect;
export type InsertWhatsappContact = typeof whatsappContacts.$inferInsert;

/**
 * WhatsApp Conversations
 * Stores conversation threads between the agent and customers
 */
export const whatsappConversations = mysqlTable("whatsapp_conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contactId: int("contactId").notNull(),
  whatsappContactId: varchar("whatsappContactId", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "closed", "escalated"]).default("active").notNull(),
  lastMessageAt: timestamp("lastMessageAt"),
  messageCount: int("messageCount").default(0),
  aiMessageCount: int("aiMessageCount").default(0),
  humanMessageCount: int("humanMessageCount").default(0),
  averageResponseTime: int("averageResponseTime").default(0), // in seconds
  leadQualified: boolean("leadQualified").default(false),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WhatsappConversation = typeof whatsappConversations.$inferSelect;
export type InsertWhatsappConversation = typeof whatsappConversations.$inferInsert;

/**
 * WhatsApp Messages
 * Stores individual messages in conversations
 */
export const whatsappMessages = mysqlTable("whatsapp_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  conversationId: int("conversationId").notNull(),
  whatsappMessageId: varchar("whatsappMessageId", { length: 255 }).unique(),
  sender: mysqlEnum("sender", ["customer", "agent", "human"]).notNull(),
  messageType: mysqlEnum("messageType", ["text", "image", "document", "audio", "video", "template"]).default("text").notNull(),
  content: text("content").notNull(),
  mediaUrl: varchar("mediaUrl", { length: 2048 }),
  status: mysqlEnum("status", ["sent", "delivered", "read", "failed"]).default("sent").notNull(),
  sentiment: mysqlEnum("sentiment", ["positive", "neutral", "negative"]).default("neutral"),
  isFromTemplate: boolean("isFromTemplate").default(false),
  templateName: varchar("templateName", { length: 255 }),
  responseTime: int("responseTime"), // in seconds, time to respond to previous message
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WhatsappMessage = typeof whatsappMessages.$inferSelect;
export type InsertWhatsappMessage = typeof whatsappMessages.$inferInsert;

/**
 * AI Agent Configuration
 * Stores customizable settings for the AI sales agent
 */
export const agentConfig = mysqlTable("agent_config", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  agentName: varchar("agentName", { length: 255 }).default("AI Sales Agent"),
  personality: text("personality"), // System prompt for AI personality
  salesScript: text("salesScript"), // Main sales pitch and approach
  responseStyle: varchar("responseStyle", { length: 100 }).default("professional"), // professional, casual, friendly
  maxResponseLength: int("maxResponseLength").default(500),
  isActive: boolean("isActive").default(true),
  autoRespond: boolean("autoRespond").default(true),
  escalationKeywords: json("escalationKeywords").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgentConfig = typeof agentConfig.$inferSelect;
export type InsertAgentConfig = typeof agentConfig.$inferInsert;

/**
 * Response Templates
 * Stores pre-configured response templates for common scenarios
 */
export const responseTemplates = mysqlTable("response_templates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // greeting, inquiry, objection, closing, etc.
  content: text("content").notNull(),
  isActive: boolean("isActive").default(true),
  usageCount: int("usageCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ResponseTemplate = typeof responseTemplates.$inferSelect;
export type InsertResponseTemplate = typeof responseTemplates.$inferInsert;

/**
 * Analytics Events
 * Stores events for analytics tracking
 */
export const analyticsEvents = mysqlTable("analytics_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  conversationId: int("conversationId"),
  eventType: varchar("eventType", { length: 100 }).notNull(), // message_sent, message_received, lead_qualified, escalation, etc.
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

/**
 * Notifications
 * Stores notifications for the owner
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  conversationId: int("conversationId"),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["lead", "escalation", "error", "info"]).default("info").notNull(),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
