-- Create demo data for current authenticated user
DO $$
DECLARE
    current_user_id UUID;
    demo_workspace_id UUID;
    demo_project_id UUID;
    demo_proposal_id UUID;
BEGIN
    -- Get current authenticated user
    SELECT auth.uid() INTO current_user_id;
    
    -- Only proceed if user is authenticated
    IF current_user_id IS NOT NULL THEN
        
        -- Create workspace if it doesn't exist
        INSERT INTO public.workspaces (owner_id, name, slug)
        VALUES (current_user_id, 'My Workspace', 'workspace-' || current_user_id::text)
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO demo_workspace_id;
        
        -- If workspace already existed, get its ID
        IF demo_workspace_id IS NULL THEN
            SELECT id INTO demo_workspace_id 
            FROM public.workspaces 
            WHERE owner_id = current_user_id 
            LIMIT 1;
        END IF;
        
        -- Create demo project
        INSERT INTO public.projects (workspace_id, created_by, title, client_name, client_company, estimated_budget)
        VALUES (demo_workspace_id, current_user_id, 'Website Redesign Project', 'John Smith', 'Tech Startup Co.', 5000.00)
        RETURNING id INTO demo_project_id;
        
        -- Create demo proposals
        INSERT INTO public.proposals (project_id, created_by, title, status, pricing_total, content)
        VALUES 
            (demo_project_id, current_user_id, 'Modern Website Redesign', 'sent', 5000.00, '{"sections": ["intro", "scope", "pricing"]}'),
            (demo_project_id, current_user_id, 'E-commerce Integration', 'draft', 3500.00, '{"sections": ["overview", "features", "timeline"]}'),
            (demo_project_id, current_user_id, 'Brand Identity Package', 'viewed', 2500.00, '{"sections": ["branding", "deliverables", "investment"]}')
        RETURNING id INTO demo_proposal_id;
        
        -- Add demo analytics for one proposal
        INSERT INTO public.proposal_analytics_summary (proposal_id, total_views, unique_visitors, last_viewed_at)
        VALUES (demo_proposal_id, 25, 12, NOW() - INTERVAL '2 hours')
        ON CONFLICT (proposal_id) DO UPDATE SET 
            total_views = EXCLUDED.total_views,
            unique_visitors = EXCLUDED.unique_visitors,
            last_viewed_at = EXCLUDED.last_viewed_at;
            
        RAISE NOTICE 'Demo data created successfully for user %', current_user_id;
        
    ELSE
        RAISE NOTICE 'No authenticated user found. Please run this while signed in.';
    END IF;
END $$;