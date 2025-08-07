import { Request, Response } from 'express';
import { pricingTimelineAgent, PricingTimelineRequest } from '../services/pricingTimelineAgent';
import { supabase } from '../lib/supabase';

export interface PricingTimelineAPIRequest extends Request {
  body: {
    project_id?: string;
    pricing_request: PricingTimelineRequest;
    save_to_database?: boolean;
  };
  user?: {
    id: string;
    email?: string;
  };
}

export const analyzePricingTimeline = async (req: PricingTimelineAPIRequest, res: Response) => {
  try {
    const { pricing_request, project_id, save_to_database = true } = req.body;
    const userId = req.user?.id;

    if (!pricing_request) {
      return res.status(400).json({ 
        error: 'Missing pricing_request in request body' 
      });
    }

    console.log('🎯 Analyzing pricing and timeline for project:', project_id);
    
    const analysis = await pricingTimelineAgent.analyzePricingTimeline(pricing_request);

    if (save_to_database && userId) {
      const { error: dbError } = await supabase
        .from('pricing_analyses')
        .insert({
          user_id: userId,
          project_id: project_id || null,
          request_data: pricing_request,
          analysis_data: analysis,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Failed to save pricing analysis:', dbError);
      } else {
        console.log('✅ Pricing analysis saved to database');
      }
    }

    res.json({
      success: true,
      analysis,
      metadata: {
        generated_at: new Date().toISOString(),
        agent_version: '1.0.0',
        project_id: project_id || null
      }
    });

  } catch (error) {
    console.error('Error in pricing timeline analysis:', error);
    res.status(500).json({
      error: 'Failed to analyze pricing and timeline',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const generatePricingVariants = async (req: PricingTimelineAPIRequest, res: Response) => {
  try {
    const { pricing_request, project_id } = req.body;
    const userId = req.user?.id;

    if (!pricing_request) {
      return res.status(400).json({ 
        error: 'Missing pricing_request in request body' 
      });
    }

    console.log('🎯 Generating pricing variants for project:', project_id);
    
    const variants = await pricingTimelineAgent.generatePricingVariants(pricing_request);

    if (userId) {
      const { error: dbError } = await supabase
        .from('pricing_analyses')
        .insert({
          user_id: userId,
          project_id: project_id || null,
          request_data: pricing_request,
          analysis_data: variants,
          analysis_type: 'variants',
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Failed to save pricing variants:', dbError);
      }
    }

    res.json({
      success: true,
      variants,
      metadata: {
        generated_at: new Date().toISOString(),
        agent_version: '1.0.0',
        project_id: project_id || null
      }
    });

  } catch (error) {
    console.error('Error generating pricing variants:', error);
    res.status(500).json({
      error: 'Failed to generate pricing variants',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const optimizePricing = async (req: PricingTimelineAPIRequest, res: Response) => {
  try {
    const { base_analysis, constraints } = req.body;

    if (!base_analysis || !constraints) {
      return res.status(400).json({ 
        error: 'Missing base_analysis or constraints in request body' 
      });
    }

    console.log('🎯 Optimizing pricing with constraints:', constraints);
    
    const optimized = await pricingTimelineAgent.optimizePricing(base_analysis, constraints);

    res.json({
      success: true,
      optimized_analysis: optimized,
      metadata: {
        generated_at: new Date().toISOString(),
        agent_version: '1.0.0',
        optimization_constraints: constraints
      }
    });

  } catch (error) {
    console.error('Error optimizing pricing:', error);
    res.status(500).json({
      error: 'Failed to optimize pricing',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getPricingHistory = async (req: PricingTimelineAPIRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { project_id } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    let query = supabase
      .from('pricing_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (project_id) {
      query = query.eq('project_id', project_id);
    }

    const { data: analyses, error } = await query.limit(50);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      analyses: analyses || [],
      metadata: {
        total_count: analyses?.length || 0,
        user_id: userId,
        project_id: project_id || null
      }
    });

  } catch (error) {
    console.error('Error fetching pricing history:', error);
    res.status(500).json({
      error: 'Failed to fetch pricing history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Utility function for testing the agent
export const testPricingAgent = async (req: Request, res: Response) => {
  try {
    const testRequest: PricingTimelineRequest = {
      projectScope: "Modern e-commerce platform with AI-powered recommendations and multi-vendor support",
      clientBudget: "$50,000",
      projectType: "web-development",
      complexity: "complex",
      timeline: "6 months",
      teamSize: 4,
      clientProfile: {
        industry: "Retail/E-commerce",
        company_size: "medium",
        location: "Ukraine",
        previous_projects: "Basic WordPress website"
      },
      requirements: {
        features: [
          "Multi-vendor marketplace",
          "AI product recommendations",
          "Payment gateway integration",
          "Inventory management",
          "Mobile responsive design",
          "Admin dashboard",
          "Analytics and reporting"
        ],
        integrations: ["Stripe", "PayPal", "Google Analytics", "Mailchimp"],
        platforms: ["Web", "Mobile Web"],
        technologies: ["React", "Node.js", "PostgreSQL", "AI/ML"]
      }
    };

    console.log('🧪 Testing pricing agent with sample data...');
    
    const analysis = await pricingTimelineAgent.analyzePricingTimeline(testRequest);

    res.json({
      success: true,
      test_request: testRequest,
      analysis,
      metadata: {
        test_executed_at: new Date().toISOString(),
        agent_version: '1.0.0'
      }
    });

  } catch (error) {
    console.error('Error testing pricing agent:', error);
    res.status(500).json({
      error: 'Pricing agent test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};