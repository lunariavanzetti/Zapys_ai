-- Agent 1: Parser Notion CRM - Database Schema
-- This schema supports the data parsing and extraction agent

-- Create parsed_data table to store all parsing results
CREATE TABLE IF NOT EXISTS parsed_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Source information
    source VARCHAR(50) NOT NULL CHECK (source IN ('notion', 'hubspot', 'pipedrive', 'airtable', 'text', 'webhook')),
    source_url TEXT,
    
    -- Request and result data
    request_data JSONB NOT NULL,
    parsed_data JSONB NOT NULL,
    
    -- Quality metrics
    confidence_score DECIMAL(3,2) DEFAULT 0.0 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    item_count INTEGER DEFAULT 0,
    processing_time_ms INTEGER DEFAULT 0,
    
    -- Batch processing support
    batch_id VARCHAR(100),
    
    -- Agent metadata
    agent_version VARCHAR(20) DEFAULT '1.0.0',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_parsed_data_user_id ON parsed_data(user_id);
CREATE INDEX IF NOT EXISTS idx_parsed_data_source ON parsed_data(source);
CREATE INDEX IF NOT EXISTS idx_parsed_data_created_at ON parsed_data(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parsed_data_confidence ON parsed_data(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_parsed_data_batch_id ON parsed_data(batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_parsed_data_project_id ON parsed_data(project_id) WHERE project_id IS NOT NULL;

-- Create parsing_sources table for source configuration
CREATE TABLE IF NOT EXISTS parsing_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Source configuration
    source_type VARCHAR(50) NOT NULL,
    source_name VARCHAR(255) NOT NULL,
    source_url TEXT,
    
    -- Authentication/API configuration
    auth_config JSONB, -- API keys, tokens, credentials
    custom_mappings JSONB, -- Field mappings for different sources
    
    -- Parsing settings
    parsing_settings JSONB DEFAULT '{}',
    auto_parse BOOLEAN DEFAULT FALSE,
    language VARCHAR(5) DEFAULT 'en',
    
    -- Usage tracking
    last_used_at TIMESTAMPTZ,
    parse_count INTEGER DEFAULT 0,
    success_rate DECIMAL(3,2) DEFAULT 0.0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, source_name)
);

-- Create indexes for parsing sources
CREATE INDEX IF NOT EXISTS idx_parsing_sources_user_id ON parsing_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_parsing_sources_type ON parsing_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_parsing_sources_active ON parsing_sources(is_active) WHERE is_active = TRUE;

-- Create parsing_templates table for reusable parsing configurations
CREATE TABLE IF NOT EXISTS parsing_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Template metadata
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(50), -- 'notion-database', 'crm-lead', 'project-brief', etc.
    
    -- Template configuration
    field_mappings JSONB NOT NULL,
    validation_rules JSONB DEFAULT '{}',
    default_values JSONB DEFAULT '{}',
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    -- Template settings
    is_public BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for parsing templates
CREATE INDEX IF NOT EXISTS idx_parsing_templates_user_id ON parsing_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_parsing_templates_type ON parsing_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_parsing_templates_public ON parsing_templates(is_public) WHERE is_public = TRUE;

-- Create parsing_errors table for error tracking and debugging
CREATE TABLE IF NOT EXISTS parsing_errors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parsed_data_id UUID REFERENCES parsed_data(id) ON DELETE CASCADE,
    
    -- Error details
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    error_context JSONB,
    
    -- Source information
    source VARCHAR(50) NOT NULL,
    source_data JSONB,
    
    -- Resolution tracking
    is_resolved BOOLEAN DEFAULT FALSE,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id),
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for parsing errors
CREATE INDEX IF NOT EXISTS idx_parsing_errors_user_id ON parsing_errors(user_id);
CREATE INDEX IF NOT EXISTS idx_parsing_errors_type ON parsing_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_parsing_errors_resolved ON parsing_errors(is_resolved);
CREATE INDEX IF NOT EXISTS idx_parsing_errors_created_at ON parsing_errors(created_at DESC);

-- Create parsing_analytics table for performance tracking
CREATE TABLE IF NOT EXISTS parsing_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Time period for analytics
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Performance metrics
    total_parses INTEGER DEFAULT 0,
    successful_parses INTEGER DEFAULT 0,
    failed_parses INTEGER DEFAULT 0,
    avg_confidence_score DECIMAL(3,2),
    avg_processing_time_ms INTEGER,
    
    -- Source breakdown
    sources_breakdown JSONB DEFAULT '{}',
    
    -- Quality metrics
    total_projects_extracted INTEGER DEFAULT 0,
    complete_data_percentage DECIMAL(3,2),
    avg_fields_extracted DECIMAL(3,1),
    
    -- Analytics data (detailed breakdown)
    analytics_data JSONB,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for parsing analytics
CREATE INDEX IF NOT EXISTS idx_parsing_analytics_user_id ON parsing_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_parsing_analytics_period ON parsing_analytics(period_start, period_end);

-- Add RLS (Row Level Security) policies
ALTER TABLE parsed_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE parsing_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE parsing_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE parsing_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE parsing_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parsed_data
CREATE POLICY "Users can view their own parsed data" ON parsed_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own parsed data" ON parsed_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own parsed data" ON parsed_data
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own parsed data" ON parsed_data
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for parsing_sources
CREATE POLICY "Users can manage their own parsing sources" ON parsing_sources
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for parsing_templates
CREATE POLICY "Users can view their own templates and public templates" ON parsing_templates
    FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can manage their own templates" ON parsing_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON parsing_templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON parsing_templates
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for parsing_errors
CREATE POLICY "Users can view their own parsing errors" ON parsing_errors
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own parsing errors" ON parsing_errors
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for parsing_analytics
CREATE POLICY "Users can view their own analytics" ON parsing_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" ON parsing_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create functions for parsing analytics
CREATE OR REPLACE FUNCTION calculate_parsing_analytics(
    user_uuid UUID,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ
) RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_parses', COUNT(*),
        'successful_parses', COUNT(*) FILTER (WHERE (parsed_data->>'success')::boolean = true),
        'failed_parses', COUNT(*) FILTER (WHERE (parsed_data->>'success')::boolean = false),
        'avg_confidence', COALESCE(AVG(confidence_score), 0),
        'avg_processing_time', COALESCE(AVG(processing_time_ms), 0),
        'total_projects_extracted', COALESCE(SUM(item_count), 0),
        'sources_breakdown', json_object_agg(source, source_count),
        'confidence_distribution', json_build_object(
            'high_confidence', COUNT(*) FILTER (WHERE confidence_score >= 0.8),
            'medium_confidence', COUNT(*) FILTER (WHERE confidence_score >= 0.5 AND confidence_score < 0.8),
            'low_confidence', COUNT(*) FILTER (WHERE confidence_score < 0.5)
        )
    ) INTO result
    FROM (
        SELECT 
            source, 
            confidence_score, 
            processing_time_ms, 
            item_count,
            parsed_data,
            COUNT(*) OVER (PARTITION BY source) as source_count
        FROM parsed_data
        WHERE user_id = user_uuid
        AND created_at BETWEEN start_date AND end_date
    ) subq;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get parsing insights
CREATE OR REPLACE FUNCTION get_parsing_insights(user_uuid UUID) RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_projects_parsed', COUNT(*),
        'avg_confidence_score', COALESCE(AVG(confidence_score), 0),
        'most_reliable_source', (
            SELECT source
            FROM parsed_data
            WHERE user_id = user_uuid
            GROUP BY source
            ORDER BY AVG(confidence_score) DESC
            LIMIT 1
        ),
        'fastest_source', (
            SELECT source
            FROM parsed_data
            WHERE user_id = user_uuid
            GROUP BY source
            ORDER BY AVG(processing_time_ms) ASC
            LIMIT 1
        ),
        'recent_activity', (
            SELECT json_agg(
                json_build_object(
                    'date', created_at,
                    'source', source,
                    'projects_extracted', item_count,
                    'confidence', confidence_score
                )
                ORDER BY created_at DESC
            )
            FROM parsed_data
            WHERE user_id = user_uuid
            AND created_at > NOW() - INTERVAL '30 days'
            LIMIT 10
        ),
        'error_rate_by_source', (
            SELECT json_object_agg(
                source, 
                ROUND((failed_count::decimal / total_count) * 100, 2)
            )
            FROM (
                SELECT 
                    source,
                    COUNT(*) as total_count,
                    COUNT(*) FILTER (WHERE (parsed_data->>'success')::boolean = false) as failed_count
                FROM parsed_data
                WHERE user_id = user_uuid
                GROUP BY source
                HAVING COUNT(*) >= 5
            ) error_stats
        )
    ) INTO result
    FROM parsed_data
    WHERE user_id = user_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean up old parsing data
CREATE OR REPLACE FUNCTION cleanup_old_parsing_data(
    retention_days INTEGER DEFAULT 90
) RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM parsed_data
    WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL
    AND confidence_score < 0.3; -- Only delete low-confidence old data
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_parsed_data_updated_at 
    BEFORE UPDATE ON parsed_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parsing_sources_updated_at 
    BEFORE UPDATE ON parsing_sources 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parsing_templates_updated_at 
    BEFORE UPDATE ON parsing_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parsing_analytics_updated_at 
    BEFORE UPDATE ON parsing_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON parsed_data TO authenticated;
GRANT ALL ON parsing_sources TO authenticated;
GRANT ALL ON parsing_templates TO authenticated;
GRANT ALL ON parsing_errors TO authenticated;
GRANT ALL ON parsing_analytics TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION calculate_parsing_analytics(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION get_parsing_insights(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_parsing_data(INTEGER) TO authenticated;

-- Add helpful comments
COMMENT ON TABLE parsed_data IS 'Stores results from AI-powered data parsing operations across various sources';
COMMENT ON TABLE parsing_sources IS 'Configuration for different data sources (Notion, CRMs, etc.)';
COMMENT ON TABLE parsing_templates IS 'Reusable templates for consistent data parsing across projects';
COMMENT ON TABLE parsing_errors IS 'Error tracking and debugging information for failed parsing operations';
COMMENT ON TABLE parsing_analytics IS 'Performance analytics for parsing agent accuracy and efficiency';

COMMENT ON FUNCTION calculate_parsing_analytics IS 'Calculates detailed parsing analytics for a user within a date range';
COMMENT ON FUNCTION get_parsing_insights IS 'Returns parsing insights and performance metrics for a user';
COMMENT ON FUNCTION cleanup_old_parsing_data IS 'Cleans up old low-confidence parsing data to manage storage';