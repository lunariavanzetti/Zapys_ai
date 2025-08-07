// Internal OpenAI client for parser agent
const createOpenAICompletion = async (messages: Array<{role: string, content: string}>, temperature = 0.2) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  return await response.json();
};

export interface ParsedProject {
  title: string;
  clientName: string;
  clientEmail?: string;
  clientCompany?: string;
  description: string;
  deliverables: string[];
  estimatedBudget?: number;
  timeline?: number;
  industry: string;
  priority: 'high' | 'medium' | 'low';
  status: 'discovery' | 'proposal' | 'active' | 'completed';
  tags: string[];
  deadline?: string;
  platform?: string;
}

export interface ParsingRequest {
  source: 'notion' | 'hubspot' | 'pipedrive' | 'airtable' | 'text' | 'webhook';
  data: string | object;
  sourceUrl?: string;
  language?: 'en' | 'uk' | 'ru' | 'pl';
  customMappings?: Record<string, string>;
}

export interface ParsingResponse {
  success: boolean;
  projects: ParsedProject[];
  metadata: {
    source: string;
    confidence: number;
    itemCount: number;
    language: string;
    processingTime?: number;
    errors?: string[];
    warnings?: string[];
  };
  rawData?: any; // For debugging
}

class ParserNotionCrmAgent {
  private static readonly EXTRACTION_PROMPT = `
You are a data extraction expert specializing in parsing project information from Notion pages and CRM data.

EXTRACTION EXPERTISE:
- Notion Database Analysis: Parse structured databases, properties, and relations
- CRM Data Processing: Extract leads, opportunities, and project data
- Natural Language Processing: Understand project descriptions and requirements
- Multi-language Support: Handle EN, UK, RU, PL content accurately
- Data Normalization: Standardize formats across different sources

PARSING METHODOLOGY:
1. Content Analysis: Identify project-related information patterns
2. Client Extraction: Find contact details, company information
3. Requirement Analysis: Parse descriptions for deliverables and scope
4. Budget Detection: Identify pricing mentions, quotes, estimates
5. Timeline Calculation: Extract dates, milestones, duration indicators
6. Classification: Categorize industry, priority, status based on context
7. Quality Validation: Ensure data consistency and completeness

NOTION-SPECIFIC PARSING:
- Database Properties: Title, Status, Priority, Assignee, Due Date
- Rich Text Fields: Descriptions, Notes, Requirements
- Relations: Client connections, Project dependencies
- Formulas: Calculated fields, Budget totals
- Multi-select: Tags, Categories, Technologies
- Date Properties: Deadlines, Start dates, Milestones

CRM-SPECIFIC PARSING:
- Lead Information: Contact details, Company, Source
- Opportunity Data: Deal value, Stage, Probability
- Activity Records: Notes, Communications, Tasks
- Custom Fields: Industry-specific data points
- Pipeline Stages: Convert to standardized status

DATA QUALITY STANDARDS:
- Confidence Scoring: Rate extraction accuracy (0.0-1.0)
- Error Detection: Identify incomplete or inconsistent data
- Language Detection: Auto-detect content language
- Validation Rules: Check email formats, date validity, budget ranges
- Normalization: Standardize currencies, date formats, naming

OUTPUT REQUIREMENTS:
- Return valid JSON matching ParsingResponse interface exactly
- Include confidence scores for quality assessment
- Provide detailed metadata for transparency
- Handle multiple projects in single input
- Maintain original language context while standardizing structure
`;

  async parseProjectData(request: ParsingRequest): Promise<ParsingResponse> {
    try {
      const startTime = Date.now();
      
      const systemPrompt = this.EXTRACTION_PROMPT;
      const userPrompt = this.buildParsingPrompt(request);
      
      const completion = await createOpenAICompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], 0.2);

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI API');
      }

      const parsedResult = JSON.parse(response) as ParsingResponse;
      
      // Add processing metadata
      parsedResult.metadata.processingTime = Date.now() - startTime;
      
      // Validate and enhance result
      return this.validateAndEnhanceResult(parsedResult, request);
      
    } catch (error) {
      console.error('Error in project data parsing:', error);
      
      return {
        success: false,
        projects: [],
        metadata: {
          source: request.source,
          confidence: 0,
          itemCount: 0,
          language: request.language || 'en',
          errors: [error instanceof Error ? error.message : 'Unknown parsing error']
        }
      };
    }
  }

  async parseNotionUrl(url: string, options?: { 
    customMappings?: Record<string, string>;
    language?: 'en' | 'uk' | 'ru' | 'pl';
  }): Promise<ParsingResponse> {
    try {
      // Fetch Notion page content
      const notionData = await this.fetchNotionContent(url);
      
      const request: ParsingRequest = {
        source: 'notion',
        data: notionData,
        sourceUrl: url,
        language: options?.language,
        customMappings: options?.customMappings
      };
      
      return await this.parseProjectData(request);
      
    } catch (error) {
      console.error('Error parsing Notion URL:', error);
      
      return {
        success: false,
        projects: [],
        metadata: {
          source: 'notion',
          confidence: 0,
          itemCount: 0,
          language: options?.language || 'en',
          errors: [`Failed to fetch Notion content: ${error instanceof Error ? error.message : 'Unknown error'}`]
        }
      };
    }
  }

  async processCrmWebhook(payload: any, source: 'hubspot' | 'pipedrive' | 'airtable' = 'hubspot'): Promise<ParsingResponse> {
    try {
      const request: ParsingRequest = {
        source,
        data: payload
      };
      
      return await this.parseProjectData(request);
      
    } catch (error) {
      console.error('Error processing CRM webhook:', error);
      
      return {
        success: false,
        projects: [],
        metadata: {
          source,
          confidence: 0,
          itemCount: 0,
          language: 'en',
          errors: [`CRM webhook processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
        }
      };
    }
  }

  async parseTextData(text: string, options?: {
    source?: string;
    language?: 'en' | 'uk' | 'ru' | 'pl';
  }): Promise<ParsingResponse> {
    try {
      const request: ParsingRequest = {
        source: 'text',
        data: text,
        language: options?.language
      };
      
      return await this.parseProjectData(request);
      
    } catch (error) {
      console.error('Error parsing text data:', error);
      
      return {
        success: false,
        projects: [],
        metadata: {
          source: options?.source || 'text',
          confidence: 0,
          itemCount: 0,
          language: options?.language || 'en',
          errors: [`Text parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
        }
      };
    }
  }

  async batchParseProjects(requests: ParsingRequest[]): Promise<ParsingResponse[]> {
    try {
      const results = await Promise.all(
        requests.map(request => this.parseProjectData(request))
      );
      
      return results;
      
    } catch (error) {
      console.error('Error in batch parsing:', error);
      throw error;
    }
  }

  private buildParsingPrompt(request: ParsingRequest): string {
    const { source, data, sourceUrl, language, customMappings } = request;
    
    const dataString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    
    return `
PARSING REQUEST: Extract structured project data from ${source.toUpperCase()} source

SOURCE DETAILS:
- Type: ${source}
- URL: ${sourceUrl || 'Not provided'}
- Language: ${language || 'Auto-detect'}
- Custom Mappings: ${customMappings ? JSON.stringify(customMappings) : 'None'}

DATA TO PARSE:
${dataString}

EXTRACTION REQUIREMENTS:
1. Identify ALL potential projects in the data
2. Extract client information (name, email, company)
3. Parse project descriptions and requirements
4. Identify deliverables from lists, bullet points, or descriptions
5. Estimate budgets from any pricing mentions
6. Calculate timelines from dates, milestones, or duration indicators
7. Classify industry based on content keywords and context
8. Set priority based on urgency indicators, deadlines, or explicit priority
9. Determine status from pipeline stages, completion indicators, or explicit status
10. Extract relevant tags from categories, technologies, or keywords

VALIDATION RULES:
- Email addresses must be valid format
- Budget should be numerical (null if unclear)
- Timeline should be in weeks (null if unclear)
- Dates should be in YYYY-MM-DD format
- Industry should be specific (technology, healthcare, retail, etc.)
- Priority must be: high, medium, or low
- Status must be: discovery, proposal, active, or completed
- Tags should be relevant and concise

CONFIDENCE SCORING:
- 0.9-1.0: Complete data with all fields clearly identified
- 0.7-0.9: Most fields identified with some estimation
- 0.5-0.7: Basic information extracted with significant estimation
- 0.3-0.5: Limited information with high uncertainty
- 0.0-0.3: Very little useful information extracted

Return JSON with ParsingResponse structure including confidence scores and detailed metadata.
If no clear project data is found, return empty projects array with appropriate confidence score.
`;
  }

  private async fetchNotionContent(url: string): Promise<string> {
    try {
      // For demo purposes, we'll simulate fetching Notion content
      // In production, this would use Notion API or web scraping
      
      if (!url.includes('notion.so') && !url.includes('notion.site')) {
        throw new Error('Invalid Notion URL format');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return simulated Notion content for testing
      return `
# Project: E-commerce Website Redesign

**Client:** TechCorp Inc.
**Contact:** john.doe@techcorp.com
**Budget:** $25,000 - $35,000
**Timeline:** 8-10 weeks
**Priority:** High

## Project Description
Complete redesign of existing e-commerce platform with modern UX/UI, mobile optimization, and performance improvements.

## Deliverables
- [ ] User research and competitor analysis
- [ ] Wireframes and prototypes
- [ ] Visual design system
- [ ] Frontend development (React)
- [ ] Backend API integration
- [ ] Payment gateway setup
- [ ] Mobile responsive design
- [ ] Performance optimization
- [ ] Testing and QA
- [ ] Launch and handover

## Requirements
- Modern, clean design
- Mobile-first approach
- Integration with Stripe payments
- Product catalog management
- User authentication
- Order tracking system
- Admin dashboard

## Technologies
React, Node.js, PostgreSQL, Stripe API

## Industry
E-commerce / Retail

## Status
Proposal stage - awaiting client approval

## Deadline
March 15, 2025
`;
      
    } catch (error) {
      throw new Error(`Failed to fetch Notion content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateAndEnhanceResult(result: ParsingResponse, request: ParsingRequest): ParsingResponse {
    try {
      // Validate projects structure
      result.projects = result.projects.map(project => this.validateProject(project));
      
      // Enhance metadata
      result.metadata = {
        ...result.metadata,
        source: request.source,
        itemCount: result.projects.length
      };
      
      // Add warnings for incomplete data
      const warnings: string[] = [];
      result.projects.forEach((project, index) => {
        if (!project.clientEmail) warnings.push(`Project ${index + 1}: Missing client email`);
        if (!project.estimatedBudget) warnings.push(`Project ${index + 1}: No budget information`);
        if (!project.timeline) warnings.push(`Project ${index + 1}: No timeline specified`);
      });
      
      if (warnings.length > 0) {
        result.metadata.warnings = warnings;
      }
      
      return result;
      
    } catch (error) {
      console.error('Error validating result:', error);
      result.metadata.errors = result.metadata.errors || [];
      result.metadata.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  private validateProject(project: ParsedProject): ParsedProject {
    // Validate and normalize project data
    return {
      title: project.title || 'Untitled Project',
      clientName: project.clientName || 'Unknown Client',
      clientEmail: this.validateEmail(project.clientEmail),
      clientCompany: project.clientCompany,
      description: project.description || '',
      deliverables: Array.isArray(project.deliverables) ? project.deliverables : [],
      estimatedBudget: this.validateBudget(project.estimatedBudget),
      timeline: this.validateTimeline(project.timeline),
      industry: project.industry || 'General',
      priority: this.validatePriority(project.priority),
      status: this.validateStatus(project.status),
      tags: Array.isArray(project.tags) ? project.tags : [],
      deadline: this.validateDate(project.deadline),
      platform: project.platform
    };
  }

  private validateEmail(email?: string): string | undefined {
    if (!email) return undefined;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email : undefined;
  }

  private validateBudget(budget?: number): number | undefined {
    if (budget === null || budget === undefined) return undefined;
    
    const numBudget = typeof budget === 'string' ? parseFloat(budget) : budget;
    return !isNaN(numBudget) && numBudget > 0 ? numBudget : undefined;
  }

  private validateTimeline(timeline?: number): number | undefined {
    if (timeline === null || timeline === undefined) return undefined;
    
    const numTimeline = typeof timeline === 'string' ? parseFloat(timeline) : timeline;
    return !isNaN(numTimeline) && numTimeline > 0 ? numTimeline : undefined;
  }

  private validatePriority(priority?: string): 'high' | 'medium' | 'low' {
    if (!priority) return 'medium';
    
    const lowercasePriority = priority.toLowerCase();
    if (['high', 'urgent', '1', 'critical'].includes(lowercasePriority)) return 'high';
    if (['low', '3', 'minor'].includes(lowercasePriority)) return 'low';
    return 'medium';
  }

  private validateStatus(status?: string): 'discovery' | 'proposal' | 'active' | 'completed' {
    if (!status) return 'discovery';
    
    const lowercaseStatus = status.toLowerCase();
    if (['proposal', 'quote', 'pending'].includes(lowercaseStatus)) return 'proposal';
    if (['active', 'in progress', 'working', 'development'].includes(lowercaseStatus)) return 'active';
    if (['completed', 'done', 'finished', 'delivered'].includes(lowercaseStatus)) return 'completed';
    return 'discovery';
  }

  private validateDate(date?: string): string | undefined {
    if (!date) return undefined;
    
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) ? parsedDate.toISOString().split('T')[0] : undefined;
  }

  // Utility methods for testing and debugging
  async testParsingCapability(sampleData: any, source: string = 'test'): Promise<ParsingResponse> {
    console.log('🧪 Testing parsing capability...');
    
    const request: ParsingRequest = {
      source: source as any,
      data: sampleData
    };
    
    return await this.parseProjectData(request);
  }

  getParsingStats(): {
    supportedSources: string[];
    supportedLanguages: string[];
    extractionCapabilities: string[];
  } {
    return {
      supportedSources: ['notion', 'hubspot', 'pipedrive', 'airtable', 'text', 'webhook'],
      supportedLanguages: ['en', 'uk', 'ru', 'pl'],
      extractionCapabilities: [
        'Client information extraction',
        'Project requirement analysis',
        'Budget estimation',
        'Timeline calculation',
        'Industry classification',
        'Priority assessment',
        'Status determination',
        'Tag generation',
        'Multi-language support',
        'Batch processing'
      ]
    };
  }
}

export const parserNotionCrmAgent = new ParserNotionCrmAgent();