-- =======================
-- ZAPYS AI - DATABASE SCHEMA
-- Complete Supabase PostgreSQL Schema
-- =======================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =======================
-- USERS & AUTHENTICATION
-- =======================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'agency')),
    locale TEXT DEFAULT 'en' CHECK (locale IN ('en', 'uk', 'ru', 'pl', 'de', 'es', 'pt')),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles for additional settings
CREATE TABLE public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    company_name TEXT,
    company_website TEXT,
    industry TEXT,
    team_size INTEGER,
    monthly_proposals INTEGER,
    timezone TEXT DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    branding_config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =======================
-- SUBSCRIPTIONS & BILLING
-- =======================

-- Subscriptions (Paddle integration)
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    paddle_subscription_id TEXT UNIQUE,
    paddle_customer_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'paused', 'trialing')),
    tier TEXT NOT NULL CHECK (tier IN ('starter', 'pro', 'agency')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    trial_end TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking for tier limits
CREATE TABLE public.usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('proposals', 'ai_generations', 'exports', 'analytics_views')),
    count INTEGER DEFAULT 0,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, resource_type, period_start)
);

-- =======================
-- WORKSPACES & TEAMS
-- =======================

-- Workspaces (for team collaboration)
CREATE TABLE public.workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    branding_config JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspace members
CREATE TABLE public.workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    permissions JSONB DEFAULT '{}',
    invited_by UUID REFERENCES public.users(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(workspace_id, user_id)
);

-- =======================
-- PROJECTS & PROPOSALS
-- =======================

-- Projects
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.users(id),
    title TEXT NOT NULL,
    description TEXT,
    client_name TEXT,
    client_email TEXT,
    client_company TEXT,
    project_data JSONB NOT NULL DEFAULT '{}',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    estimated_budget DECIMAL(10,2),
    estimated_timeline INTEGER, -- in days
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proposals
CREATE TABLE public.proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.users(id),
    title TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    content_html TEXT,
    content_markdown TEXT,
    public_url_slug TEXT UNIQUE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'signed', 'rejected', 'expired')),
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'uk', 'ru', 'pl', 'de', 'es', 'pt')),
    pricing_total DECIMAL(10,2),
    pricing_breakdown JSONB DEFAULT '{}',
    timeline_days INTEGER,
    expires_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    signed_at TIMESTAMP WITH TIME ZONE,
    signature_data JSONB,
    analytics_enabled BOOLEAN DEFAULT TRUE,
    password_protected BOOLEAN DEFAULT FALSE,
    password_hash TEXT,
    custom_branding JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proposal versions (for revision tracking)
CREATE TABLE public.proposal_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content JSONB NOT NULL,
    changes_summary TEXT,
    created_by UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(proposal_id, version_number)
);

-- =======================
-- ANALYTICS & TRACKING
-- =======================

-- Proposal analytics
CREATE TABLE public.proposal_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    visitor_ip TEXT,
    user_agent TEXT,
    referrer TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('view', 'scroll', 'click', 'download', 'signature_start', 'signature_complete', 'exit')),
    event_data JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX (proposal_id, timestamp),
    INDEX (event_type, timestamp)
);

-- Analytics summaries (pre-computed for performance)
CREATE TABLE public.proposal_analytics_summary (
    proposal_id UUID PRIMARY KEY REFERENCES public.proposals(id) ON DELETE CASCADE,
    total_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    avg_time_spent INTERVAL,
    avg_scroll_depth DECIMAL(5,2),
    bounce_rate DECIMAL(5,2),
    conversion_events INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =======================
-- INTEGRATIONS
-- =======================

-- External integrations
CREATE TABLE public.integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('notion', 'airtable', 'trello', 'asana', 'pipedrive', 'hubspot', 'zapier')),
    name TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    credentials_encrypted TEXT, -- encrypted credentials
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integration sync logs
CREATE TABLE public.integration_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
    sync_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial')),
    records_processed INTEGER DEFAULT 0,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =======================
-- TEMPLATES & ASSETS
-- =======================

-- Proposal templates
CREATE TABLE public.proposal_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID REFERENCES public.users(id),
    workspace_id UUID REFERENCES public.workspaces(id),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    industry TEXT,
    template_data JSONB NOT NULL DEFAULT '{}',
    preview_image_url TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User's custom templates
CREATE TABLE public.user_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template_data JSONB NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File uploads and assets
CREATE TABLE public.assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id),
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT,
    alt_text TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =======================
-- AI & AUTOMATION
-- =======================

-- AI generation history
CREATE TABLE public.ai_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE,
    generation_type TEXT NOT NULL CHECK (generation_type IN ('proposal_content', 'pricing_suggestion', 'timeline_estimate', 'translation', 'optimization')),
    input_data JSONB NOT NULL,
    output_data JSONB NOT NULL,
    model_used TEXT,
    tokens_used INTEGER,
    processing_time_ms INTEGER,
    quality_score DECIMAL(3,2),
    user_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI model configurations
CREATE TABLE public.ai_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    model_type TEXT NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =======================
-- NOTIFICATIONS & COMMUNICATION
-- =======================

-- Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('proposal_viewed', 'proposal_signed', 'payment_received', 'trial_ending', 'system_update')),
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Email templates and logs
CREATE TABLE public.email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    recipient_email TEXT NOT NULL,
    template_name TEXT,
    subject TEXT,
    status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'bounced', 'failed')),
    provider_id TEXT,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =======================
-- INDEXES FOR PERFORMANCE
-- =======================

-- Users
CREATE INDEX idx_users_subscription_tier ON public.users(subscription_tier);
CREATE INDEX idx_users_locale ON public.users(locale);

-- Proposals
CREATE INDEX idx_proposals_status ON public.proposals(status);
CREATE INDEX idx_proposals_public_url ON public.proposals(public_url_slug);
CREATE INDEX idx_proposals_created_at ON public.proposals(created_at DESC);
CREATE INDEX idx_proposals_user_status ON public.proposals(created_by, status);

-- Analytics
CREATE INDEX idx_analytics_proposal_timestamp ON public.proposal_analytics(proposal_id, timestamp DESC);
CREATE INDEX idx_analytics_event_type ON public.proposal_analytics(event_type, timestamp DESC);

-- Projects
CREATE INDEX idx_projects_workspace ON public.projects(workspace_id);
CREATE INDEX idx_projects_status ON public.projects(status);

-- Integrations
CREATE INDEX idx_integrations_user_platform ON public.integrations(user_id, platform);

-- =======================
-- ROW LEVEL SECURITY (RLS)
-- =======================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Proposals have complex access patterns
CREATE POLICY "Users can view own proposals" ON public.proposals FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.workspace_members wm
        JOIN public.projects p ON p.workspace_id = wm.workspace_id
        WHERE p.id = proposals.project_id AND wm.user_id = auth.uid()
    )
);

-- Public proposals can be viewed by anyone (for client access)
CREATE POLICY "Public proposals viewable by all" ON public.proposals FOR SELECT USING (
    public_url_slug IS NOT NULL AND status IN ('sent', 'viewed')
);

-- =======================
-- FUNCTIONS & TRIGGERS
-- =======================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate public URL slug for proposals
CREATE OR REPLACE FUNCTION generate_proposal_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.public_url_slug IS NULL THEN
        NEW.public_url_slug = encode(gen_random_bytes(16), 'base64url');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_proposal_slug_trigger 
    BEFORE INSERT ON public.proposals 
    FOR EACH ROW EXECUTE FUNCTION generate_proposal_slug();

-- =======================
-- INITIAL DATA
-- =======================

-- Insert default proposal templates
INSERT INTO public.proposal_templates (name, description, category, template_data, is_public, is_featured) VALUES
('Modern Web Design', 'Clean, professional template for web design proposals', 'design', '{"sections": ["intro", "scope", "timeline", "pricing", "next_steps"]}', true, true),
('Mobile App Development', 'Comprehensive template for mobile app projects', 'development', '{"sections": ["overview", "features", "technical_specs", "timeline", "investment"]}', true, true),
('Branding Package', 'Complete branding and identity design proposal', 'branding', '{"sections": ["brand_analysis", "deliverables", "process", "timeline", "investment"]}', true, false);