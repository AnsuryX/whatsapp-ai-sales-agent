import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  getWhatsappConfig,
  upsertWhatsappConfig,
  getContactsByUserId,
  getConversationsByUserId,
  getConversationWithMessages,
  createMessage,
  getAgentConfig,
  upsertAgentConfig,
  getTemplatesByUserId,
  createTemplate,
  getNotificationsByUserId,
  markNotificationAsRead,
} from "./whatsapp.db";
import { sendWhatsAppMessage } from "./whatsapp.webhook";
import { checkWebhookStatus, validateWebhookConfig } from "./whatsapp.status";

export const whatsappRouter = router({
  // WhatsApp Configuration
  getConfig: protectedProcedure.query(async ({ ctx }) => {
    return await getWhatsappConfig(ctx.user.id);
  }),

  updateConfig: protectedProcedure
    .input(
      z.object({
        businessPhoneNumberId: z.string(),
        businessAccountId: z.string(),
        accessToken: z.string(),
        webhookVerifyToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await upsertWhatsappConfig({
        userId: ctx.user.id,
        ...input,
      });
      return { success: true };
    }),

  // Contacts
  getContacts: protectedProcedure.query(async ({ ctx }) => {
    return await getContactsByUserId(ctx.user.id);
  }),

  // Conversations
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    return await getConversationsByUserId(ctx.user.id);
  }),

  getConversationDetail: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const data = await getConversationWithMessages(input.conversationId);
      if (!data) return null;

      // Verify ownership
      if (data.conversation.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      return data;
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        phoneNumber: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Store message in database
      const msg = await createMessage({
        userId: ctx.user.id,
        conversationId: input.conversationId,
        sender: "human",
        messageType: "text",
        content: input.message,
        status: "sent",
      });

      // Send via WhatsApp
      const result = await sendWhatsAppMessage(ctx.user.id, input.phoneNumber, input.message);

      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      };
    }),

  // Agent Configuration
  getAgentConfig: protectedProcedure.query(async ({ ctx }) => {
    return await getAgentConfig(ctx.user.id);
  }),

  updateAgentConfig: protectedProcedure
    .input(
      z.object({
        agentName: z.string().optional(),
        personality: z.string().optional(),
        salesScript: z.string().optional(),
        responseStyle: z.enum(["professional", "casual", "friendly"]).optional(),
        maxResponseLength: z.number().optional(),
        isActive: z.boolean().optional(),
        autoRespond: z.boolean().optional(),
        escalationKeywords: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await upsertAgentConfig({
        userId: ctx.user.id,
        ...input,
      });
      return { success: true };
    }),

  // Response Templates
  getTemplates: protectedProcedure.query(async ({ ctx }) => {
    return await getTemplatesByUserId(ctx.user.id);
  }),

  createTemplate: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        category: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await createTemplate({
        userId: ctx.user.id,
        ...input,
        isActive: true,
      });
      return { success: true };
    }),

  // Notifications
  getNotifications: protectedProcedure.query(async ({ ctx }) => {
    return await getNotificationsByUserId(ctx.user.id);
  }),

  markNotificationAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await markNotificationAsRead(input.notificationId);
      return { success: true };
    }),

  // Webhook Status
  checkWebhookStatus: protectedProcedure.query(async ({ ctx }) => {
    return await checkWebhookStatus(ctx.user.id);
  }),

  validateWebhookConfig: protectedProcedure
    .input(
      z.object({
        businessPhoneNumberId: z.string().optional(),
        accessToken: z.string().optional(),
        webhookVerifyToken: z.string().optional(),
      })
    )
    .query(({ input }) => {
      return validateWebhookConfig(
        input.businessPhoneNumberId,
        input.accessToken,
        input.webhookVerifyToken
      );
    }),
});
