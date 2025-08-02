-- =======================
-- ZAPYS AI - DATABASE QUERIES
-- Common queries and functions
-- =======================

-- =======================
-- USER MANAGEMENT QUERIES
-- =======================

-- Get user with subscription info
CREATE OR REPLACE FUNCTION get_user_with_subscription(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    subscription_tier TEXT,
    locale TEXT,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_status TEXT,
    current_period_end TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.full_name,
        u.subscription_tier,
        u.locale,
        u.trial_ends_at,
        COALESCE(s.status, 'none') as subscription_status,
        s.current_period_end
    FROM public.users u
    LEFT JOIN public.subscriptions s ON s.user_id = u.id AND s.status = 'active'
    WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user subscription tier
CREATE OR REPLACE FUNCTION update_user_subscription(
    user_uuid UUID,
    new_tier TEXT,
    paddle_sub_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.users 
    SET subscription_tier = new_tier, updated_at = NOW()
    WHERE id = user_uuid;
    
    IF paddle_sub_id IS NOT NULL THEN
        INSERT INTO public.subscriptions (user_id, paddle_subscription_id, tier, status)
        VALUES (user_uuid, paddle_sub_id, new_tier, 'active')
        ON CONFLICT (paddle_subscription_id) 
        DO UPDATE SET tier = new_tier, status = 'active', updated_at = NOW();
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =======================
-- USAGE TRACKING QUERIES
-- =======================

-- Get current usage for user
CREATE OR REPLACE FUNCTION get_user_usage(
    user_uuid UUID,
    resource TEXT DEFAULT 'proposals'
)
RETURNS INTEGER AS $$
DECLARE
    current_usage INTEGER;
    period_start TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate current billing period start
    period_start = DATE_TRUNC('month', NOW());
    
    SELECT COALESCE(count, 0) INTO current_usage
    FROM public.usage_tracking
    WHERE user_id = user_uuid 
    AND resource_type = resource
    AND period_start = period_start;
    
    RETURN COALESCE(current_usage, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment usage counter
CREATE OR REPLACE FUNCTION increment_usage(
    user_uuid UUID,
    resource TEXT,
    increment_by INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
    period_start TIMESTAMP WITH TIME ZONE;
    period_end TIMESTAMP WITH TIME ZONE;
BEGIN
    period_start = DATE_TRUNC('month', NOW());
    period_end = period_start + INTERVAL '1 month' - INTERVAL '1 second';
    
    INSERT INTO public.usage_tracking (user_id, resource_type, count, period_start, period_end)
    VALUES (user_uuid, resource, increment_by, period_start, period_end)
    ON CONFLICT (user_id, resource_type, period_start)
    DO UPDATE SET count = usage_tracking.count + increment_by;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =======================
-- PROPOSAL QUERIES
-- =======================

-- Get proposals for user/workspace
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

-- Get proposal by public URL (for client viewing)
CREATE OR REPLACE FUNCTION get_proposal_by_url(url_slug TEXT)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content_html TEXT,
    status TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    password_protected BOOLEAN,
    custom_branding JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.content_html,
        p.status,
        p.expires_at,
        p.password_protected,
        p.custom_branding
    FROM public.proposals p
    WHERE p.public_url_slug = url_slug
    AND p.status IN ('sent', 'viewed', 'signed')
    AND (p.expires_at IS NULL OR p.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update proposal status
CREATE OR REPLACE FUNCTION update_proposal_status(
    proposal_uuid UUID,
    new_status TEXT,
    signature_data JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.proposals 
    SET 
        status = new_status,
        signed_at = CASE WHEN new_status = 'signed' THEN NOW() ELSE signed_at END,
        signature_data = COALESCE(signature_data, proposals.signature_data),
        updated_at = NOW()
    WHERE id = proposal_uuid;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =======================
-- ANALYTICS QUERIES
-- =======================

-- Record analytics event
CREATE OR REPLACE FUNCTION record_analytics_event(
    proposal_uuid UUID,
    session_id TEXT,
    event_type TEXT,
    event_data JSONB DEFAULT '{}',
    visitor_ip TEXT DEFAULT NULL,
    user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO public.proposal_analytics (
        proposal_id, session_id, event_type, event_data, visitor_ip, user_agent
    ) VALUES (
        proposal_uuid, session_id, event_type, event_data, visitor_ip, user_agent
    );
    
    -- Update summary table
    INSERT INTO public.proposal_analytics_summary (proposal_id, total_views, last_viewed_at)
    VALUES (proposal_uuid, 1, NOW())
    ON CONFLICT (proposal_id)
    DO UPDATE SET 
        total_views = proposal_analytics_summary.total_views + 1,
        last_viewed_at = NOW(),
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get proposal analytics summary
CREATE OR REPLACE FUNCTION get_proposal_analytics(proposal_uuid UUID)
RETURNS TABLE (
    total_views INTEGER,
    unique_visitors INTEGER,
    avg_time_spent INTERVAL,
    avg_scroll_depth DECIMAL(5,2),
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    hourly_views JSONB,
    events_timeline JSONB
) AS $$
DECLARE
    result_row RECORD;
BEGIN
    -- Get basic summary
    SELECT 
        pas.total_views,
        pas.unique_visitors,
        pas.avg_time_spent,
        pas.avg_scroll_depth,
        pas.last_viewed_at
    INTO result_row
    FROM public.proposal_analytics_summary pas
    WHERE pas.proposal_id = proposal_uuid;
    
    -- Get hourly views for last 7 days
    WITH hourly_data AS (
        SELECT 
            DATE_TRUNC('hour', timestamp) as hour,
            COUNT(*) as views
        FROM public.proposal_analytics
        WHERE proposal_id = proposal_uuid
        AND timestamp >= NOW() - INTERVAL '7 days'
        AND event_type = 'view'
        GROUP BY DATE_TRUNC('hour', timestamp)
        ORDER BY hour
    )
    SELECT json_agg(
        json_build_object('hour', hour, 'views', views)
    ) INTO result_row.hourly_views
    FROM hourly_data;
    
    -- Get recent events timeline
    SELECT json_agg(
        json_build_object(
            'event_type', event_type,
            'timestamp', timestamp,
            'data', event_data
        ) ORDER BY timestamp DESC
    ) INTO result_row.events_timeline
    FROM (
        SELECT event_type, timestamp, event_data
        FROM public.proposal_analytics
        WHERE proposal_id = proposal_uuid
        ORDER BY timestamp DESC
        LIMIT 50
    ) recent_events;
    
    RETURN QUERY SELECT 
        COALESCE(result_row.total_views, 0),
        COALESCE(result_row.unique_visitors, 0),
        result_row.avg_time_spent,
        result_row.avg_scroll_depth,
        result_row.last_viewed_at,
        COALESCE(result_row.hourly_views, '[]'::jsonb),
        COALESCE(result_row.events_timeline, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =======================
-- WORKSPACE QUERIES
-- =======================

-- Get user workspaces
CREATE OR REPLACE FUNCTION get_user_workspaces(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    role TEXT,
    member_count INTEGER,
    project_count INTEGER,
    is_owner BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id,
        w.name,
        w.slug,
        wm.role,
        (SELECT COUNT(*) FROM public.workspace_members WHERE workspace_id = w.id AND is_active = true)::INTEGER,
        (SELECT COUNT(*) FROM public.projects WHERE workspace_id = w.id)::INTEGER,
        (w.owner_id = user_uuid) as is_owner
    FROM public.workspaces w
    JOIN public.workspace_members wm ON wm.workspace_id = w.id
    WHERE wm.user_id = user_uuid AND wm.is_active = true AND w.is_active = true
    ORDER BY w.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =======================
-- INTEGRATION QUERIES
-- =======================

-- Get active integrations for user
CREATE OR REPLACE FUNCTION get_user_integrations(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    platform TEXT,
    name TEXT,
    is_active BOOLEAN,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.platform,
        i.name,
        i.is_active,
        i.last_sync_at,
        i.last_error
    FROM public.integrations i
    WHERE i.user_id = user_uuid
    ORDER BY i.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =======================
-- AI GENERATION QUERIES
-- =======================

-- Record AI generation
CREATE OR REPLACE FUNCTION record_ai_generation(
    user_uuid UUID,
    proposal_uuid UUID,
    generation_type TEXT,
    input_data JSONB,
    output_data JSONB,
    model_used TEXT DEFAULT 'claude-3-sonnet',
    tokens_used INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
    generation_id UUID;
BEGIN
    INSERT INTO public.ai_generations (
        user_id, proposal_id, generation_type, input_data, output_data, model_used, tokens_used
    ) VALUES (
        user_uuid, proposal_uuid, generation_type, input_data, output_data, model_used, tokens_used
    ) RETURNING id INTO generation_id;
    
    -- Increment usage
    PERFORM increment_usage(user_uuid, 'ai_generations', 1);
    
    RETURN generation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get AI generation history
CREATE OR REPLACE FUNCTION get_ai_generation_history(
    user_uuid UUID,
    generation_type_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    generation_type TEXT,
    model_used TEXT,
    tokens_used INTEGER,
    quality_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ag.id,
        ag.generation_type,
        ag.model_used,
        ag.tokens_used,
        ag.quality_score,
        ag.created_at
    FROM public.ai_generations ag
    WHERE ag.user_id = user_uuid
    AND (generation_type_filter IS NULL OR ag.generation_type = generation_type_filter)
    ORDER BY ag.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =======================
-- DASHBOARD QUERIES
-- =======================

-- Get dashboard stats for user
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
        total_proposals::INTEGER,
        proposals_this_month::INTEGER,
        total_views::INTEGER,
        avg_conversion_rate,
        COALESCE(revenue_this_month, 0),
        active_proposals::INTEGER
    FROM proposal_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;