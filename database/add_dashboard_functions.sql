-- =======================
-- ZAPYS AI - ADD MISSING DASHBOARD FUNCTIONS
-- Only adds the functions needed for dashboard to work
-- =======================

-- Dashboard stats function
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
            COALESCE(SUM(pas.total_views), 0) as total_views,
            COALESCE(AVG(CASE WHEN p.status = 'signed' THEN 1.0 ELSE 0.0 END) * 100, 0) as avg_conversion_rate,
            COALESCE(SUM(CASE WHEN p.signed_at >= month_start THEN p.pricing_total ELSE 0 END), 0) as revenue_this_month
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

-- User proposals function
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

-- Create proposal_analytics_summary table if it doesn't exist
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

-- Enable RLS on the new table if it was just created
ALTER TABLE public.proposal_analytics_summary ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for analytics summary
DROP POLICY IF EXISTS "Users can view proposal analytics" ON public.proposal_analytics_summary;
CREATE POLICY "Users can view proposal analytics" ON public.proposal_analytics_summary FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.proposals p 
        WHERE p.id = proposal_analytics_summary.proposal_id 
        AND p.created_by = auth.uid()
    )
);

-- Insert some demo data if no proposals exist for testing
DO $$
DECLARE
    user_id UUID;
    workspace_id UUID;
    project_id UUID;
    proposal_id UUID;
BEGIN
    -- Get the current authenticated user
    SELECT auth.uid() INTO user_id;
    
    -- Only create demo data if user exists and has no proposals
    IF user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.proposals WHERE created_by = user_id) THEN
        
        -- Get or create a workspace for this user
        SELECT id INTO workspace_id 
        FROM public.workspaces 
        WHERE owner_id = user_id 
        LIMIT 1;
        
        IF workspace_id IS NULL THEN
            INSERT INTO public.workspaces (owner_id, name, slug)
            VALUES (user_id, 'My Workspace', 'workspace-' || user_id::text)
            RETURNING id INTO workspace_id;
        END IF;
        
        -- Create a demo project
        INSERT INTO public.projects (workspace_id, created_by, title, client_name, client_company, estimated_budget)
        VALUES (workspace_id, user_id, 'Website Redesign Project', 'John Smith', 'Tech Startup Co.', 5000.00)
        RETURNING id INTO project_id;
        
        -- Create demo proposals
        INSERT INTO public.proposals (project_id, created_by, title, status, pricing_total, content)
        VALUES 
            (project_id, user_id, 'Modern Website Redesign', 'sent', 5000.00, '{"sections": ["intro", "scope", "pricing"]}')
            RETURNING id INTO proposal_id;
            
        INSERT INTO public.proposals (project_id, created_by, title, status, pricing_total, content)
        VALUES 
            (project_id, user_id, 'E-commerce Integration', 'draft', 3500.00, '{"sections": ["overview", "features", "timeline"]}'),
            (project_id, user_id, 'Brand Identity Package', 'viewed', 2500.00, '{"sections": ["branding", "deliverables", "investment"]}');
            
        -- Add demo analytics for the sent proposal
        INSERT INTO public.proposal_analytics_summary (proposal_id, total_views, unique_visitors, last_viewed_at)
        VALUES (proposal_id, 25, 12, NOW() - INTERVAL '2 hours');
        
    END IF;
END $$;