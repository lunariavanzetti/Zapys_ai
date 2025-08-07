-- =======================
-- ZAPYS AI - MINIMAL SETUP
-- Quick setup to make dashboard work
-- =======================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create basic workspaces table (needed for projects)
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL,
    name TEXT NOT NULL DEFAULT 'Default Workspace',
    slug TEXT UNIQUE NOT NULL DEFAULT 'default',
    description TEXT,
    branding_config JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basic projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_by UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    client_name TEXT,
    client_email TEXT,
    client_company TEXT,
    project_data JSONB NOT NULL DEFAULT '{}',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    estimated_budget DECIMAL(10,2),
    estimated_timeline INTEGER,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basic proposals table
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    created_by UUID NOT NULL,
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

-- Create analytics summary table
CREATE TABLE IF NOT EXISTS public.proposal_analytics_summary (
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

-- Create minimal dashboard stats function
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_uuid UUID)
RETURNS TABLE (
    total_proposals INTEGER,
    proposals_this_month INTEGER,
    total_views INTEGER,
    avg_conversion_rate DECIMAL(5,2),
    revenue_this_month DECIMAL(10,2),
    active_proposals INTEGER
) AS $$
DECLARE
    month_start TIMESTAMP WITH TIME ZONE;
BEGIN
    month_start = DATE_TRUNC('month', NOW());
    
    RETURN QUERY
    WITH proposal_stats AS (
        SELECT 
            COUNT(*) as total_proposals,
            COUNT(*) FILTER (WHERE p.created_at >= month_start) as proposals_this_month,
            COUNT(*) FILTER (WHERE p.status IN ('sent', 'viewed')) as active_proposals,
            SUM(COALESCE(pas.total_views, 0)) as total_views,
            AVG(CASE WHEN p.status = 'signed' THEN 1.0 ELSE 0.0 END) * 100 as avg_conversion_rate,
            SUM(CASE WHEN p.signed_at >= month_start THEN p.pricing_total ELSE 0 END) as revenue_this_month
        FROM public.proposals p
        JOIN public.projects pr ON pr.id = p.project_id
        LEFT JOIN public.proposal_analytics_summary pas ON pas.proposal_id = p.id
        WHERE p.created_by = user_uuid
    )
    SELECT 
        COALESCE(total_proposals::INTEGER, 0),
        COALESCE(proposals_this_month::INTEGER, 0),
        COALESCE(total_views::INTEGER, 0),
        COALESCE(avg_conversion_rate, 0.0),
        COALESCE(revenue_this_month, 0),
        COALESCE(active_proposals::INTEGER, 0)
    FROM proposal_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create minimal user proposals function
CREATE OR REPLACE FUNCTION get_user_proposals(
    user_uuid UUID,
    workspace_uuid UUID DEFAULT NULL,
    status_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    status TEXT,
    client_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    public_url_slug TEXT,
    total_views INTEGER,
    pricing_total DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.status,
        pr.client_name,
        p.created_at,
        p.updated_at,
        p.public_url_slug,
        COALESCE(pas.total_views, 0) as total_views,
        p.pricing_total
    FROM public.proposals p
    JOIN public.projects pr ON pr.id = p.project_id
    LEFT JOIN public.proposal_analytics_summary pas ON pas.proposal_id = p.id
    WHERE p.created_by = user_uuid
    AND (workspace_uuid IS NULL OR pr.workspace_id = workspace_uuid)
    AND (status_filter IS NULL OR p.status = status_filter)
    ORDER BY p.created_at DESC
    LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Enable RLS (basic security)
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Users can view own workspaces" ON public.workspaces FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Users can view own proposals" ON public.proposals FOR SELECT USING (created_by = auth.uid());

-- Insert policies
CREATE POLICY "Users can create workspaces" ON public.workspaces FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can create projects" ON public.projects FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can create proposals" ON public.proposals FOR INSERT WITH CHECK (created_by = auth.uid());

-- Update policies
CREATE POLICY "Users can update own workspaces" ON public.workspaces FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Users can update own proposals" ON public.proposals FOR UPDATE USING (created_by = auth.uid());

-- Function to auto-create default workspace for new users
CREATE OR REPLACE FUNCTION create_default_workspace_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.workspaces (owner_id, name, slug)
    VALUES (NEW.id, 'My Workspace', NEW.id::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create workspace when user is created
CREATE TRIGGER create_workspace_on_user_insert
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION create_default_workspace_for_user();

-- Sample data for testing (optional - creates some demo data)
DO $$
DECLARE
    sample_user_id UUID;
    sample_workspace_id UUID;
    sample_project_id UUID;
BEGIN
    -- Only create sample data if no proposals exist
    IF NOT EXISTS (SELECT 1 FROM public.proposals LIMIT 1) THEN
        -- Get a random user ID from auth.users (if any exist)
        SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
        
        IF sample_user_id IS NOT NULL THEN
            -- Create sample workspace
            INSERT INTO public.workspaces (owner_id, name, slug)
            VALUES (sample_user_id, 'Demo Workspace', 'demo-' || sample_user_id::text)
            RETURNING id INTO sample_workspace_id;
            
            -- Create sample project
            INSERT INTO public.projects (workspace_id, created_by, title, client_name, client_company, estimated_budget)
            VALUES (sample_workspace_id, sample_user_id, 'Website Redesign', 'John Smith', 'Tech Startup Co.', 5000.00)
            RETURNING id INTO sample_project_id;
            
            -- Create sample proposals
            INSERT INTO public.proposals (project_id, created_by, title, status, pricing_total, content)
            VALUES 
                (sample_project_id, sample_user_id, 'Modern Website Redesign Proposal', 'sent', 5000.00, '{"sections": ["intro", "scope", "pricing"]}'),
                (sample_project_id, sample_user_id, 'E-commerce Integration Proposal', 'draft', 3500.00, '{"sections": ["overview", "features", "timeline"]}'),
                (sample_project_id, sample_user_id, 'Brand Identity Package', 'viewed', 2500.00, '{"sections": ["branding", "deliverables", "investment"]}');
                
            -- Create sample analytics
            INSERT INTO public.proposal_analytics_summary (proposal_id, total_views, unique_visitors)
            SELECT id, 15, 8 FROM public.proposals WHERE created_by = sample_user_id LIMIT 1;
        END IF;
    END IF;
END $$;