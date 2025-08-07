import { Request, Response } from 'express';
import { parserNotionCrmAgent, ParsingRequest, ParsingResponse } from '../services/parserNotionCrmAgent';
import { supabase } from '../lib/supabase';

export interface ParserAPIRequest extends Request {
  body: {
    parsing_request: ParsingRequest;
    save_to_database?: boolean;
    project_id?: string;
  };
  user?: {
    id: string;
    email?: string;
  };
}

export const parseProjectData = async (req: ParserAPIRequest, res: Response) => {
  try {
    const { parsing_request, save_to_database = true, project_id } = req.body;
    const userId = req.user?.id;

    if (!parsing_request) {
      return res.status(400).json({
        error: 'Missing parsing_request in request body'
      });
    }

    console.log('🔍 Parsing project data from:', parsing_request.source);
    
    const startTime = Date.now();
    const result = await parserNotionCrmAgent.parseProjectData(parsing_request);
    const totalProcessingTime = Date.now() - startTime;

    // Save to database if requested and user is authenticated
    if (save_to_database && userId && result.success) {
      try {
        const { error: dbError } = await supabase
          .from('parsed_data')
          .insert({
            user_id: userId,
            project_id: project_id || null,
            source: parsing_request.source,
            source_url: parsing_request.sourceUrl || null,
            request_data: parsing_request,
            parsed_data: result,
            confidence_score: result.metadata.confidence,
            item_count: result.metadata.itemCount,
            processing_time_ms: totalProcessingTime,
            created_at: new Date().toISOString()
          });

        if (dbError) {
          console.error('Failed to save parsed data:', dbError);
        } else {
          console.log('✅ Parsed data saved to database');
        }
      } catch (saveError) {
        console.error('Database save error:', saveError);
      }
    }

    res.json({
      success: result.success,
      result,
      metadata: {
        agent_version: '1.0.0',
        total_processing_time: totalProcessingTime,
        saved_to_database: save_to_database && userId && result.success,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in parse project data endpoint:', error);
    res.status(500).json({
      error: 'Failed to parse project data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const parseNotionUrl = async (req: ParserAPIRequest, res: Response) => {
  try {
    const { url, options = {}, save_to_database = true } = req.body;
    const userId = req.user?.id;

    if (!url) {
      return res.status(400).json({
        error: 'Missing url in request body'
      });
    }

    if (!url.includes('notion.so') && !url.includes('notion.site')) {
      return res.status(400).json({
        error: 'Invalid Notion URL format'
      });
    }

    console.log('🔍 Parsing Notion URL:', url);
    
    const startTime = Date.now();
    const result = await parserNotionCrmAgent.parseNotionUrl(url, options);
    const totalProcessingTime = Date.now() - startTime;

    // Save to database if successful
    if (save_to_database && userId && result.success) {
      try {
        const { error: dbError } = await supabase
          .from('parsed_data')
          .insert({
            user_id: userId,
            source: 'notion',
            source_url: url,
            request_data: { source: 'notion', data: url, sourceUrl: url, ...options },
            parsed_data: result,
            confidence_score: result.metadata.confidence,
            item_count: result.metadata.itemCount,
            processing_time_ms: totalProcessingTime,
            created_at: new Date().toISOString()
          });

        if (dbError) {
          console.error('Failed to save Notion parse result:', dbError);
        }
      } catch (saveError) {
        console.error('Database save error:', saveError);
      }
    }

    res.json({
      success: result.success,
      result,
      metadata: {
        agent_version: '1.0.0',
        source_url: url,
        total_processing_time: totalProcessingTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error parsing Notion URL:', error);
    res.status(500).json({
      error: 'Failed to parse Notion URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const processCrmWebhook = async (req: ParserAPIRequest, res: Response) => {
  try {
    const { source = 'hubspot', save_to_database = true } = req.body;
    const webhookPayload = req.body;
    const userId = req.user?.id;

    if (!webhookPayload || Object.keys(webhookPayload).length === 0) {
      return res.status(400).json({
        error: 'Empty webhook payload'
      });
    }

    console.log('🔗 Processing CRM webhook from:', source);
    
    const startTime = Date.now();
    const result = await parserNotionCrmAgent.processCrmWebhook(webhookPayload, source);
    const totalProcessingTime = Date.now() - startTime;

    // Save to database if successful
    if (save_to_database && userId && result.success) {
      try {
        const { error: dbError } = await supabase
          .from('parsed_data')
          .insert({
            user_id: userId,
            source: source,
            request_data: { source, data: webhookPayload },
            parsed_data: result,
            confidence_score: result.metadata.confidence,
            item_count: result.metadata.itemCount,
            processing_time_ms: totalProcessingTime,
            created_at: new Date().toISOString()
          });

        if (dbError) {
          console.error('Failed to save CRM webhook result:', dbError);
        }
      } catch (saveError) {
        console.error('Database save error:', saveError);
      }
    }

    res.json({
      success: result.success,
      result,
      metadata: {
        agent_version: '1.0.0',
        webhook_source: source,
        total_processing_time: totalProcessingTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error processing CRM webhook:', error);
    res.status(500).json({
      error: 'Failed to process CRM webhook',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const parseTextData = async (req: ParserAPIRequest, res: Response) => {
  try {
    const { text, options = {}, save_to_database = true } = req.body;
    const userId = req.user?.id;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid text data'
      });
    }

    if (text.length > 50000) {
      return res.status(400).json({
        error: 'Text data too large (max 50,000 characters)'
      });
    }

    console.log('📝 Parsing text data, length:', text.length);
    
    const startTime = Date.now();
    const result = await parserNotionCrmAgent.parseTextData(text, options);
    const totalProcessingTime = Date.now() - startTime;

    // Save to database if successful
    if (save_to_database && userId && result.success) {
      try {
        const { error: dbError } = await supabase
          .from('parsed_data')
          .insert({
            user_id: userId,
            source: 'text',
            request_data: { source: 'text', data: text, ...options },
            parsed_data: result,
            confidence_score: result.metadata.confidence,
            item_count: result.metadata.itemCount,
            processing_time_ms: totalProcessingTime,
            created_at: new Date().toISOString()
          });

        if (dbError) {
          console.error('Failed to save text parse result:', dbError);
        }
      } catch (saveError) {
        console.error('Database save error:', saveError);
      }
    }

    res.json({
      success: result.success,
      result,
      metadata: {
        agent_version: '1.0.0',
        text_length: text.length,
        total_processing_time: totalProcessingTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error parsing text data:', error);
    res.status(500).json({
      error: 'Failed to parse text data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const batchParseProjects = async (req: ParserAPIRequest, res: Response) => {
  try {
    const { requests, save_to_database = true } = req.body;
    const userId = req.user?.id;

    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({
        error: 'Missing or invalid requests array'
      });
    }

    if (requests.length > 10) {
      return res.status(400).json({
        error: 'Too many requests (max 10 per batch)'
      });
    }

    console.log('🔄 Processing batch of', requests.length, 'parsing requests');
    
    const startTime = Date.now();
    const results = await parserNotionCrmAgent.batchParseProjects(requests);
    const totalProcessingTime = Date.now() - startTime;

    // Save successful results to database
    if (save_to_database && userId) {
      try {
        const dbInserts = results
          .filter(result => result.success)
          .map((result, index) => ({
            user_id: userId,
            source: requests[index].source,
            source_url: requests[index].sourceUrl || null,
            request_data: requests[index],
            parsed_data: result,
            confidence_score: result.metadata.confidence,
            item_count: result.metadata.itemCount,
            processing_time_ms: result.metadata.processingTime || 0,
            batch_id: `batch_${Date.now()}`,
            created_at: new Date().toISOString()
          }));

        if (dbInserts.length > 0) {
          const { error: dbError } = await supabase
            .from('parsed_data')
            .insert(dbInserts);

          if (dbError) {
            console.error('Failed to save batch results:', dbError);
          } else {
            console.log(`✅ Saved ${dbInserts.length} batch results to database`);
          }
        }
      } catch (saveError) {
        console.error('Batch database save error:', saveError);
      }
    }

    const successCount = results.filter(r => r.success).length;

    res.json({
      success: successCount > 0,
      results,
      metadata: {
        agent_version: '1.0.0',
        batch_size: requests.length,
        successful_parses: successCount,
        failed_parses: requests.length - successCount,
        total_processing_time: totalProcessingTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in batch parsing:', error);
    res.status(500).json({
      error: 'Failed to process batch parsing requests',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getParsingHistory = async (req: ParserAPIRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { source, limit = 50, offset = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    let query = supabase
      .from('parsed_data')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset as number, (offset as number) + (limit as number) - 1);

    if (source) {
      query = query.eq('source', source);
    }

    const { data: parsedData, error } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: parsedData || [],
      metadata: {
        total_count: parsedData?.length || 0,
        source_filter: source || null,
        limit: limit,
        offset: offset
      }
    });

  } catch (error) {
    console.error('Error fetching parsing history:', error);
    res.status(500).json({
      error: 'Failed to fetch parsing history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getParsingStats = async (req: ParserAPIRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const { data: stats, error } = await supabase
      .from('parsed_data')
      .select('source, confidence_score, item_count, processing_time_ms, created_at')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    const analytics = {
      total_parses: stats?.length || 0,
      avg_confidence: stats && stats.length > 0 
        ? stats.reduce((sum, s) => sum + s.confidence_score, 0) / stats.length 
        : 0,
      avg_processing_time: stats && stats.length > 0
        ? stats.reduce((sum, s) => sum + s.processing_time_ms, 0) / stats.length
        : 0,
      total_projects_extracted: stats?.reduce((sum, s) => sum + s.item_count, 0) || 0,
      sources_breakdown: stats?.reduce((acc: Record<string, number>, s) => {
        acc[s.source] = (acc[s.source] || 0) + 1;
        return acc;
      }, {}) || {},
      recent_activity: stats?.slice(0, 10) || []
    };

    const capabilities = parserNotionCrmAgent.getParsingStats();

    res.json({
      success: true,
      analytics,
      capabilities,
      metadata: {
        user_id: userId,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating parsing stats:', error);
    res.status(500).json({
      error: 'Failed to generate parsing statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Test endpoint for validating Agent 1 functionality
export const testParsingAgent = async (req: Request, res: Response) => {
  try {
    const sampleData = {
      title: "Website Redesign Project",
      client: "TechCorp Inc. (john@techcorp.com)",
      description: "Complete redesign of corporate website with modern UX/UI, mobile optimization, and CMS integration",
      budget: "$15,000 - $20,000",
      timeline: "6-8 weeks",
      deliverables: [
        "User research and wireframes",
        "Visual design mockups", 
        "Frontend development",
        "CMS integration",
        "Mobile optimization",
        "Testing and launch"
      ],
      priority: "High",
      industry: "Technology",
      status: "Proposal stage",
      deadline: "2025-04-15"
    };

    console.log('🧪 Testing parsing agent with sample data...');
    
    const result = await parserNotionCrmAgent.testParsingCapability(sampleData, 'test');

    res.json({
      success: result.success,
      test_data: sampleData,
      parsing_result: result,
      capabilities: parserNotionCrmAgent.getParsingStats(),
      metadata: {
        test_executed_at: new Date().toISOString(),
        agent_version: '1.0.0'
      }
    });

  } catch (error) {
    console.error('Error testing parsing agent:', error);
    res.status(500).json({
      error: 'Parsing agent test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};