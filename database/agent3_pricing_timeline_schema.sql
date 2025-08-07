-- Agent 3: AI Pricing Timeline - Database Schema
-- This schema supports the pricing and timeline analysis agent

-- Create pricing_analyses table to store all pricing analysis results
CREATE TABLE IF NOT EXISTS pricing_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Analysis metadata
    analysis_type VARCHAR(50) DEFAULT 'standard' CHECK (analysis_type IN ('standard', 'variants', 'optimized')),
    agent_version VARCHAR(20) DEFAULT '1.0.0',
    
    -- Input data (what was requested)
    request_data JSONB NOT NULL,
    
    -- Analysis results (what the AI generated)
    analysis_data JSONB NOT NULL,
    
    -- Additional metadata
    processing_time_ms INTEGER,
    model_used VARCHAR(50) DEFAULT 'gpt-4o-mini',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pricing_analyses_user_id ON pricing_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_pricing_analyses_project_id ON pricing_analyses(project_id);
CREATE INDEX IF NOT EXISTS idx_pricing_analyses_created_at ON pricing_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_analyses_type ON pricing_analyses(analysis_type);

-- Create pricing_templates table for reusable pricing configurations
CREATE TABLE IF NOT EXISTS pricing_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Template metadata
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'web-development', 'mobile-app', 'ai-integration', etc.
    
    -- Template configuration
    template_data JSONB NOT NULL,
    
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

-- Create indexes for pricing templates
CREATE INDEX IF NOT EXISTS idx_pricing_templates_user_id ON pricing_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_pricing_templates_category ON pricing_templates(category);
CREATE INDEX IF NOT EXISTS idx_pricing_templates_public ON pricing_templates(is_public) WHERE is_public = TRUE;

-- Create pricing_feedback table to store client feedback on pricing proposals
CREATE TABLE IF NOT EXISTS pricing_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pricing_analysis_id UUID NOT NULL REFERENCES pricing_analyses(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Feedback data
    client_response VARCHAR(50) CHECK (client_response IN ('accepted', 'rejected', 'negotiating', 'pending')),
    feedback_notes TEXT,
    proposed_budget DECIMAL(12,2),
    proposed_timeline_weeks INTEGER,
    
    -- Negotiation tracking
    negotiation_round INTEGER DEFAULT 1,
    final_agreed_price DECIMAL(12,2),
    final_agreed_timeline_weeks INTEGER,
    
    -- Outcome tracking
    project_status VARCHAR(50) DEFAULT 'proposal' CHECK (project_status IN ('proposal', 'negotiation', 'approved', 'rejected', 'completed')),
    actual_completion_time_weeks INTEGER,
    actual_final_cost DECIMAL(12,2),
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for pricing feedback
CREATE INDEX IF NOT EXISTS idx_pricing_feedback_analysis_id ON pricing_feedback(pricing_analysis_id);
CREATE INDEX IF NOT EXISTS idx_pricing_feedback_project_id ON pricing_feedback(project_id);
CREATE INDEX IF NOT EXISTS idx_pricing_feedback_status ON pricing_feedback(project_status);

-- Create pricing_analytics table for tracking agent performance
CREATE TABLE IF NOT EXISTS pricing_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Time period for analytics
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Performance metrics
    total_analyses INTEGER DEFAULT 0,
    successful_proposals INTEGER DEFAULT 0,
    avg_accuracy_score DECIMAL(3,2), -- 0.00 to 1.00
    avg_client_satisfaction DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Financial metrics
    total_proposed_value DECIMAL(15,2) DEFAULT 0,
    total_won_value DECIMAL(15,2) DEFAULT 0,
    avg_proposal_size DECIMAL(12,2),
    win_rate DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Analytics data (detailed breakdown)
    analytics_data JSONB,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for pricing analytics
CREATE INDEX IF NOT EXISTS idx_pricing_analytics_user_id ON pricing_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_pricing_analytics_period ON pricing_analytics(period_start, period_end);

-- Add RLS (Row Level Security) policies
ALTER TABLE pricing_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pricing_analyses
CREATE POLICY "Users can view their own pricing analyses" ON pricing_analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pricing analyses" ON pricing_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pricing analyses" ON pricing_analyses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pricing analyses" ON pricing_analyses
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for pricing_templates
CREATE POLICY "Users can view their own templates and public templates" ON pricing_templates
    FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can insert their own templates" ON pricing_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON pricing_templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON pricing_templates
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for pricing_feedback
CREATE POLICY "Users can access feedback for their analyses" ON pricing_feedback
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pricing_analyses pa 
            WHERE pa.id = pricing_feedback.pricing_analysis_id 
            AND pa.user_id = auth.uid()
        )
    );

-- RLS Policies for pricing_analytics  
CREATE POLICY "Users can view their own analytics" ON pricing_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" ON pricing_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create functions for pricing analytics
CREATE OR REPLACE FUNCTION calculate_pricing_analytics(
    user_uuid UUID,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ
) RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_analyses', COUNT(*),
        'total_proposed_value', COALESCE(SUM((analysis_data->>'pricing'->>'base_price')::DECIMAL), 0),
        'avg_proposal_size', COALESCE(AVG((analysis_data->>'pricing'->>'base_price')::DECIMAL), 0),
        'most_common_project_type', MODE() WITHIN GROUP (ORDER BY request_data->>'projectType'),
        'avg_timeline_weeks', COALESCE(AVG((analysis_data->>'timeline'->>'total_duration_weeks')::INTEGER), 0),
        'analysis_by_type', json_agg(DISTINCT analysis_type)
    ) INTO result
    FROM pricing_analyses
    WHERE user_id = user_uuid
    AND created_at BETWEEN start_date AND end_date;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get pricing insights
CREATE OR REPLACE FUNCTION get_pricing_insights(user_uuid UUID) RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_proposals', COUNT(*),
        'avg_project_value', COALESCE(AVG((analysis_data->>'pricing'->>'base_price')::DECIMAL), 0),
        'most_profitable_category', (
            SELECT request_data->>'projectType'
            FROM pricing_analyses
            WHERE user_id = user_uuid
            GROUP BY request_data->>'projectType'
            ORDER BY AVG((analysis_data->>'pricing'->>'base_price')::DECIMAL) DESC
            LIMIT 1
        ),
        'recent_activity', (
            SELECT json_agg(
                json_build_object(
                    'date', created_at,
                    'project_type', request_data->>'projectType',
                    'value', analysis_data->>'pricing'->>'base_price'
                )
                ORDER BY created_at DESC
            )
            FROM pricing_analyses
            WHERE user_id = user_uuid
            AND created_at > NOW() - INTERVAL '30 days'
            LIMIT 10
        )
    ) INTO result
    FROM pricing_analyses
    WHERE user_id = user_uuid;
    
    RETURN result;
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
CREATE TRIGGER update_pricing_analyses_updated_at 
    BEFORE UPDATE ON pricing_analyses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_templates_updated_at 
    BEFORE UPDATE ON pricing_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_feedback_updated_at 
    BEFORE UPDATE ON pricing_feedback 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_analytics_updated_at 
    BEFORE UPDATE ON pricing_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON pricing_analyses TO authenticated;
GRANT ALL ON pricing_templates TO authenticated;
GRANT ALL ON pricing_feedback TO authenticated;
GRANT ALL ON pricing_analytics TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION calculate_pricing_analytics(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pricing_insights(UUID) TO authenticated;

-- Add helpful comments
COMMENT ON TABLE pricing_analyses IS 'Stores AI-generated pricing and timeline analyses for projects';
COMMENT ON TABLE pricing_templates IS 'Reusable pricing templates for different project types';
COMMENT ON TABLE pricing_feedback IS 'Client feedback and negotiation tracking for pricing proposals';
COMMENT ON TABLE pricing_analytics IS 'Performance analytics for pricing agent accuracy and success rates';

COMMENT ON FUNCTION calculate_pricing_analytics IS 'Calculates pricing analytics for a user within a date range';
COMMENT ON FUNCTION get_pricing_insights IS 'Returns pricing insights and recent activity for a user';