-- Create enums
CREATE TYPE "MarketingCampaignStatus" AS ENUM (
  'DRAFT',
  'SCHEDULED',
  'SENDING',
  'SENT',
  'PARTIAL',
  'FAILED',
  'CANCELLED'
);

CREATE TYPE "CampaignAudienceType" AS ENUM (
  'ALL_MEMBERS',
  'INACTIVE_MEMBERS',
  'BIRTHDAY_MEMBERS',
  'CLASS_ATTENDEES',
  'CUSTOM'
);

CREATE TYPE "CampaignRecipientStatus" AS ENUM (
  'PENDING',
  'SENT',
  'FAILED',
  'OPENED',
  'CLICKED'
);

CREATE TYPE "CampaignEventType" AS ENUM (
  'DELIVERED',
  'OPENED',
  'CLICKED',
  'FAILED'
);

CREATE TYPE "MarketingAutomationType" AS ENUM (
  'BIRTHDAY_WISHES',
  'REENGAGEMENT',
  'CLASS_PROMOTION',
  'NEWSLETTER'
);

-- Create tables
CREATE TABLE "marketing_campaigns" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "type" "NotificationType" NOT NULL,
  "category" "NotificationCategory" NOT NULL DEFAULT 'MARKETING',
  "status" "MarketingCampaignStatus" NOT NULL DEFAULT 'DRAFT',
  "audience_type" "CampaignAudienceType" NOT NULL DEFAULT 'ALL_MEMBERS',
  "custom_user_ids" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "class_id" TEXT,
  "template_id" TEXT,
  "created_by_user_id" TEXT,
  "subject" TEXT,
  "content" TEXT NOT NULL,
  "special_offer" TEXT,
  "scheduled_at" TIMESTAMP(3),
  "sent_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "marketing_campaigns_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "campaign_recipients" (
  "id" TEXT NOT NULL,
  "campaign_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "destination" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "status" "CampaignRecipientStatus" NOT NULL DEFAULT 'PENDING',
  "sent_at" TIMESTAMP(3),
  "opened_at" TIMESTAMP(3),
  "clicked_at" TIMESTAMP(3),
  "fail_reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "campaign_recipients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "campaign_events" (
  "id" TEXT NOT NULL,
  "recipient_id" TEXT NOT NULL,
  "event_type" "CampaignEventType" NOT NULL,
  "metadata" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "campaign_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketing_automations" (
  "id" TEXT NOT NULL,
  "type" "MarketingAutomationType" NOT NULL,
  "name" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "channel" "NotificationType" NOT NULL DEFAULT 'EMAIL',
  "template_id" TEXT,
  "subject" TEXT,
  "content" TEXT NOT NULL,
  "special_offer" TEXT,
  "inactive_days" INTEGER NOT NULL DEFAULT 30,
  "class_id" TEXT,
  "last_run_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "marketing_automations_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "marketing_campaigns_status_idx" ON "marketing_campaigns"("status");
CREATE INDEX "marketing_campaigns_audience_type_idx" ON "marketing_campaigns"("audience_type");
CREATE INDEX "marketing_campaigns_scheduled_at_idx" ON "marketing_campaigns"("scheduled_at");
CREATE INDEX "marketing_campaigns_class_id_idx" ON "marketing_campaigns"("class_id");
CREATE INDEX "marketing_campaigns_template_id_idx" ON "marketing_campaigns"("template_id");
CREATE INDEX "marketing_campaigns_created_by_user_id_idx" ON "marketing_campaigns"("created_by_user_id");

CREATE UNIQUE INDEX "campaign_recipients_campaign_id_user_id_type_key" ON "campaign_recipients"("campaign_id", "user_id", "type");
CREATE INDEX "campaign_recipients_campaign_id_idx" ON "campaign_recipients"("campaign_id");
CREATE INDEX "campaign_recipients_user_id_idx" ON "campaign_recipients"("user_id");
CREATE INDEX "campaign_recipients_status_idx" ON "campaign_recipients"("status");
CREATE INDEX "campaign_recipients_sent_at_idx" ON "campaign_recipients"("sent_at");

CREATE INDEX "campaign_events_recipient_id_idx" ON "campaign_events"("recipient_id");
CREATE INDEX "campaign_events_event_type_idx" ON "campaign_events"("event_type");
CREATE INDEX "campaign_events_created_at_idx" ON "campaign_events"("created_at");

CREATE UNIQUE INDEX "marketing_automations_type_name_key" ON "marketing_automations"("type", "name");
CREATE INDEX "marketing_automations_type_idx" ON "marketing_automations"("type");
CREATE INDEX "marketing_automations_is_active_idx" ON "marketing_automations"("is_active");
CREATE INDEX "marketing_automations_class_id_idx" ON "marketing_automations"("class_id");
CREATE INDEX "marketing_automations_template_id_idx" ON "marketing_automations"("template_id");

-- Add foreign keys
ALTER TABLE "marketing_campaigns"
ADD CONSTRAINT "marketing_campaigns_class_id_fkey"
FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "marketing_campaigns"
ADD CONSTRAINT "marketing_campaigns_template_id_fkey"
FOREIGN KEY ("template_id") REFERENCES "notification_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "marketing_campaigns"
ADD CONSTRAINT "marketing_campaigns_created_by_user_id_fkey"
FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "campaign_recipients"
ADD CONSTRAINT "campaign_recipients_campaign_id_fkey"
FOREIGN KEY ("campaign_id") REFERENCES "marketing_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "campaign_recipients"
ADD CONSTRAINT "campaign_recipients_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "campaign_events"
ADD CONSTRAINT "campaign_events_recipient_id_fkey"
FOREIGN KEY ("recipient_id") REFERENCES "campaign_recipients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "marketing_automations"
ADD CONSTRAINT "marketing_automations_template_id_fkey"
FOREIGN KEY ("template_id") REFERENCES "notification_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "marketing_automations"
ADD CONSTRAINT "marketing_automations_class_id_fkey"
FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
