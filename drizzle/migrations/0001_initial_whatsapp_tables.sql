CREATE TABLE `agent_config` (
`id` int AUTO_INCREMENT NOT NULL,
`userId` int NOT NULL,
`agentName` varchar(255) DEFAULT 'AI Sales Agent',
`personality` text,
`salesScript` text,
`responseStyle` varchar(100) DEFAULT 'professional',
`maxResponseLength` int DEFAULT 500,
`isActive` boolean DEFAULT true,
`autoRespond` boolean DEFAULT true,
`escalationKeywords` json,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `agent_config_id` PRIMARY KEY(`id`),
CONSTRAINT `agent_config_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `analytics_events` (
`id` int AUTO_INCREMENT NOT NULL,
`userId` int NOT NULL,
`conversationId` int,
`eventType` varchar(100) NOT NULL,
`metadata` json,
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
`id` int AUTO_INCREMENT NOT NULL,
`userId` int NOT NULL,
`conversationId` int,
`title` varchar(255) NOT NULL,
`content` text NOT NULL,
`type` enum('lead','escalation','error','info') NOT NULL DEFAULT 'info',
`isRead` boolean DEFAULT false,
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `response_templates` (
`id` int AUTO_INCREMENT NOT NULL,
`userId` int NOT NULL,
`name` varchar(255) NOT NULL,
`category` varchar(100) NOT NULL,
`content` text NOT NULL,
`isActive` boolean DEFAULT true,
`usageCount` int DEFAULT 0,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `response_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsapp_config` (
`id` int AUTO_INCREMENT NOT NULL,
`userId` int NOT NULL,
`businessPhoneNumberId` varchar(255) NOT NULL,
`businessAccountId` varchar(255) NOT NULL,
`accessToken` text NOT NULL,
`webhookVerifyToken` varchar(255) NOT NULL,
`isActive` boolean NOT NULL DEFAULT true,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `whatsapp_config_id` PRIMARY KEY(`id`),
CONSTRAINT `whatsapp_config_businessPhoneNumberId_unique` UNIQUE(`businessPhoneNumberId`)
);
--> statement-breakpoint
CREATE TABLE `whatsapp_contacts` (
`id` int AUTO_INCREMENT NOT NULL,
`userId` int NOT NULL,
`phoneNumber` varchar(20) NOT NULL,
`displayName` varchar(255),
`firstName` varchar(100),
`lastName` varchar(100),
`email` varchar(320),
`tags` json DEFAULT ('[]'),
`leadScore` int DEFAULT 0,
`sentiment` enum('positive','neutral','negative') DEFAULT 'neutral',
`lastMessageAt` timestamp,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `whatsapp_contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsapp_conversations` (
`id` int AUTO_INCREMENT NOT NULL,
`userId` int NOT NULL,
`contactId` int NOT NULL,
`whatsappContactId` varchar(255) NOT NULL,
`status` enum('active','closed','escalated') NOT NULL DEFAULT 'active',
`lastMessageAt` timestamp,
`messageCount` int DEFAULT 0,
`aiMessageCount` int DEFAULT 0,
`humanMessageCount` int DEFAULT 0,
`averageResponseTime` int DEFAULT 0,
`leadQualified` boolean DEFAULT false,
`notes` text,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `whatsapp_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsapp_messages` (
`id` int AUTO_INCREMENT NOT NULL,
`userId` int NOT NULL,
`conversationId` int NOT NULL,
`whatsappMessageId` varchar(255),
`sender` enum('customer','agent','human') NOT NULL,
`messageType` enum('text','image','document','audio','video','template') NOT NULL DEFAULT 'text',
`content` text NOT NULL,
`mediaUrl` varchar(2048),
`status` enum('sent','delivered','read','failed') NOT NULL DEFAULT 'sent',
`sentiment` enum('positive','neutral','negative') DEFAULT 'neutral',
`isFromTemplate` boolean DEFAULT false,
`templateName` varchar(255),
`responseTime` int,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `whatsapp_messages_id` PRIMARY KEY(`id`),
CONSTRAINT `whatsapp_messages_whatsappMessageId_unique` UNIQUE(`whatsappMessageId`)
);
