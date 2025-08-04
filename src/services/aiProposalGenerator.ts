// AI Proposal Generator Service
// Generates complete, professional proposal content using AI

export interface ProposalGenerationRequest {
  projectData: {
    title: string;
    clientName: string;
    clientEmail?: string;
    clientCompany?: string;
    description: string;
    deliverables?: string[];
    estimatedBudget?: number;
    timeline?: number; // in weeks
    industry?: string;
  };
  userPreferences: {
    tone: 'professional' | 'friendly' | 'premium' | 'casual';
    language: 'en' | 'uk' | 'ru' | 'pl';
    brandVoice?: string;
    customInstructions?: string;
  };
  templateType?: 'web_design' | 'development' | 'branding' | 'marketing' | 'ecommerce' | 'mobile_app' | 'consulting' | 'custom';
}

export interface ProposalSection {
  executive_summary: string;
  project_understanding: string;
  proposed_solution: string;
  deliverables: string;
  timeline: string;
  investment: string;
  why_choose_us: string;
  next_steps: string;
}

export interface ProposalGenerationResponse {
  success: boolean;
  content: {
    title: string;
    sections: ProposalSection;
    metadata: {
      wordCount: number;
      estimatedReadingTime: number;
      language: string;
      tone: string;
    };
  };
  pricing?: {
    total: number;
    breakdown: Record<string, number>;
    currency: string;
  };
  error?: string;
}

export interface ProposalTemplate {
  name: string;
  industry: string;
  sections: {
    [K in keyof ProposalSection]: {
      prompt: string;
      wordCount: [number, number]; // [min, max]
      tone_adaptations: Record<string, string>;
    };
  };
}

class AIProposalGeneratorService {
  private templates: Map<string, ProposalTemplate> = new Map();
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_ANTHROPIC_API_KEY || '';
    this.initializeTemplates();
  }

  /**
   * Generate a complete proposal in the exact JSON format specified
   */
  async generateProposalJSON(request: ProposalGenerationRequest): Promise<{
    success: boolean;
    content: {
      title: string;
      sections: {
        executive_summary: string;
        project_understanding: string;
        proposed_solution: string;
        deliverables: string;
        timeline: string;
        investment: string;
        why_choose_us: string;
        next_steps: string;
      };
      metadata: {
        wordCount: number;
        estimatedReadingTime: number;
        language: string;
        tone: string;
      };
    };
    pricing: {
      total: number;
      breakdown: Record<string, number>;
      currency: string;
    };
  }> {
    const response = await this.generateProposal(request);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to generate proposal');
    }

    return {
      success: true,
      content: response.content,
      pricing: response.pricing || {
        total: request.projectData.estimatedBudget || 5000,
        breakdown: { 'design': 2000, 'development': 2500, 'testing': 500 },
        currency: 'USD'
      }
    };
  }

  /**
   * Generate a complete proposal based on project data and preferences
   */
  async generateProposal(request: ProposalGenerationRequest): Promise<ProposalGenerationResponse> {
    try {
      // Validate input
      const validation = this.validateRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
          content: {
            title: '',
            sections: this.getEmptySections(),
            metadata: {
              wordCount: 0,
              estimatedReadingTime: 0,
              language: request.userPreferences.language,
              tone: request.userPreferences.tone
            }
          }
        };
      }

      // Get appropriate template
      const template = this.getTemplate(request.templateType, request.projectData.industry);
      
      // Generate each section
      const sections = await this.generateAllSections(request, template);
      
      // Calculate metadata
      const content = sections.join(' ');
      const wordCount = this.countWords(content);
      const estimatedReadingTime = Math.ceil(wordCount / 200); // 200 words per minute

      // Generate pricing if budget provided
      const pricing = request.projectData.estimatedBudget 
        ? this.generatePricingBreakdown(request.projectData.estimatedBudget, template.name)
        : undefined;

      return {
        success: true,
        content: {
          title: this.generateTitle(request.projectData),
          sections: this.parseSectionsFromContent(sections),
          metadata: {
            wordCount,
            estimatedReadingTime,
            language: request.userPreferences.language,
            tone: request.userPreferences.tone
          }
        },
        pricing
      };

    } catch (error) {
      console.error('Error generating proposal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        content: {
          title: '',
          sections: this.getEmptySections(),
          metadata: {
            wordCount: 0,
            estimatedReadingTime: 0,
            language: request.userPreferences.language,
            tone: request.userPreferences.tone
          }
        }
      };
    }
  }

  /**
   * Generate all proposal sections using AI
   */
  private async generateAllSections(
    request: ProposalGenerationRequest, 
    template: ProposalTemplate
  ): Promise<string[]> {
    const systemPrompt = this.buildSystemPrompt(request, template);
    const userPrompt = this.buildUserPrompt(request);

    // Call AI service (using mock for now - replace with actual API call)
    const response = await this.callAIService(systemPrompt, userPrompt);
    
    return this.parseSectionsFromResponse(response);
  }

  /**
   * Build the system prompt for the AI
   */
  private buildSystemPrompt(request: ProposalGenerationRequest, template: ProposalTemplate): string {
    const { tone, language, brandVoice, customInstructions } = request.userPreferences;
    
    return `You are an expert proposal writer creating compelling, professional proposals for agencies and freelancers.

TASK: Generate complete proposal content optimized for client conversion.

WRITING RULES:
- Start with client's business goals, not your services
- Use specific numbers and outcomes, not vague promises
- Address potential objections proactively
- Include social proof and case study references
- End each section with benefit to client
- Maintain consistent tone throughout
- Optimize for scanning (headers, bullet points)

CORE INSTRUCTIONS:
1. Understand the Context: Analyze the project data to understand client needs, goals, and constraints
2. Structure Professionally: Create well-organized sections that flow logically
3. Focus on Value: Emphasize benefits and outcomes, not just features
4. Match Tone: Use ${tone} tone throughout
5. Language: Write in ${language === 'en' ? 'English' : language === 'uk' ? 'Ukrainian' : language === 'ru' ? 'Russian' : 'Polish'}
6. Be Specific: Include concrete deliverables, timelines, and pricing when possible

TONE GUIDELINES:
${this.getToneGuidelines(tone)}

LANGUAGE ADAPTATIONS:
${this.getLanguageAdaptations(language)}

${brandVoice ? `BRAND VOICE: ${brandVoice}` : ''}
${customInstructions ? `CUSTOM INSTRUCTIONS: ${customInstructions}` : ''}

SECTION REQUIREMENTS:
- Executive Summary: 150-200 words - Compelling summary highlighting value proposition
- Project Understanding: 200-250 words - Demonstrating deep understanding of client needs
- Proposed Solution: 300-400 words - Detailing specific approach and methodology
- Deliverables: 150-200 words - Listing concrete, measurable outcomes
- Timeline: 100-150 words - Clear project phases and milestones
- Investment: 100-150 words - Presenting pricing confidently with value justification
- Why Choose Us: 150-200 words - Highlighting unique expertise and advantages
- Next Steps: 50-100 words - Clear call-to-action and urgency

RESPONSE FORMAT:
Structure your response with clear section headers:

EXECUTIVE SUMMARY:
[Content here]

PROJECT UNDERSTANDING:
[Content here]

PROPOSED SOLUTION:
[Content here]

DELIVERABLES:
[Content here]

TIMELINE:
[Content here]

INVESTMENT:
[Content here]

WHY CHOOSE US:
[Content here]

NEXT STEPS:
[Content here]

Generate a proposal that feels personally crafted for this specific client and project.`;
  }

  /**
   * Build the user prompt with project details
   */
  private buildUserPrompt(request: ProposalGenerationRequest): string {
    const { projectData } = request;
    
    return `Generate a complete proposal for the following project:

PROJECT DETAILS:
- Title: ${projectData.title}
- Client: ${projectData.clientName}${projectData.clientCompany ? ` (${projectData.clientCompany})` : ''}
- Description: ${projectData.description}
- Industry: ${projectData.industry || 'General Business'}
- Estimated Budget: ${projectData.estimatedBudget ? `$${projectData.estimatedBudget.toLocaleString()}` : 'To be discussed'}
- Timeline: ${projectData.timeline ? `${projectData.timeline} weeks` : 'To be determined'}
${projectData.deliverables ? `- Key Deliverables: ${projectData.deliverables.join(', ')}` : ''}

Please generate all 8 sections of the proposal, ensuring each section is complete, compelling, and tailored to this specific project and client.`;
  }

  /**
   * Call the AI service using Anthropic Claude with enhanced error handling
   */
  private async callAIService(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const { anthropicClient } = await import('./anthropicClient');
      const response = await anthropicClient.generateContent(systemPrompt, userPrompt);
      
      // Validate the response contains all required sections
      const validationResult = this.validateAIResponse(response);
      if (!validationResult.isValid) {
        console.warn('AI response validation failed:', validationResult.errors);
        // Return a fallback response if AI response is incomplete
        return this.generateFallbackResponse(userPrompt);
      }
      
      return response;
    } catch (error) {
      console.error('Error calling AI service:', error);
      // Return fallback response on error
      return this.generateFallbackResponse(userPrompt);
    }
  }

  /**
   * Validate AI response contains all required sections
   */
  private validateAIResponse(response: string): { isValid: boolean; errors: string[] } {
    const requiredSections = [
      'EXECUTIVE SUMMARY',
      'PROJECT UNDERSTANDING', 
      'PROPOSED SOLUTION',
      'DELIVERABLES',
      'TIMELINE',
      'INVESTMENT',
      'WHY CHOOSE US',
      'NEXT STEPS'
    ];

    const errors: string[] = [];
    const responseUpper = response.toUpperCase();

    requiredSections.forEach(section => {
      if (!responseUpper.includes(section)) {
        errors.push(`Missing section: ${section}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate fallback response when AI service fails
   */
  private generateFallbackResponse(userPrompt: string): string {
    // Extract basic information from user prompt
    const clientMatch = userPrompt.match(/Client:\s*([^\n(]+)/);
    const clientName = clientMatch ? clientMatch[1].trim() : 'your business';
    
    const titleMatch = userPrompt.match(/Title:\s*([^\n]+)/);
    const projectTitle = titleMatch ? titleMatch[1].trim() : 'this project';

    return `
EXECUTIVE SUMMARY:
We're excited to partner with ${clientName} on ${projectTitle}. Our comprehensive approach will deliver exceptional results that exceed your expectations and provide significant value to your business. With our proven expertise and client-focused methodology, we're confident this project will achieve your goals and drive meaningful growth.

PROJECT UNDERSTANDING:
We understand the unique challenges and opportunities that ${clientName} faces in today's competitive market. Your project requirements align perfectly with our expertise, and we recognize the importance of delivering a solution that not only meets your immediate needs but also supports your long-term business objectives.

PROPOSED SOLUTION:
Our strategic approach combines industry best practices with innovative solutions tailored specifically for your needs. We'll implement a comprehensive methodology that ensures quality, efficiency, and results. Our team will work closely with you throughout the process to ensure alignment and exceed expectations.

DELIVERABLES:
- Complete project deliverables as specified in your requirements
- High-quality outputs that meet professional standards
- Comprehensive documentation and support materials
- Training and knowledge transfer as needed
- Post-project support and maintenance options

TIMELINE:
We propose a structured timeline that balances quality with efficiency:
- Phase 1: Planning and strategy development
- Phase 2: Implementation and development
- Phase 3: Testing and refinement
- Phase 4: Launch and support
This approach ensures thorough execution while meeting your project deadlines.

INVESTMENT:
Our competitive pricing reflects the value and expertise we bring to your project. The investment includes all specified deliverables, professional project management, and ongoing support. We offer flexible payment terms to accommodate your business needs and ensure a smooth project experience.

WHY CHOOSE US:
Our team brings extensive experience and a proven track record of successful project delivery. We pride ourselves on clear communication, attention to detail, and exceeding client expectations. Our client-focused approach ensures your success is our priority throughout the project lifecycle.

NEXT STEPS:
To proceed with this exciting project, please review this proposal and let us know if you have any questions. We're ready to begin immediately upon your approval and look forward to partnering with ${clientName} on ${projectTitle}. Contact us to schedule a kick-off meeting and start achieving your goals.
    `;
  }

  /**
   * Parse sections from AI response
   */
  private parseSectionsFromResponse(response: string): string[] {
    // Split by section headers (case insensitive)
    const sections = response.split(/(?=(?:EXECUTIVE SUMMARY|PROJECT UNDERSTANDING|PROPOSED SOLUTION|DELIVERABLES|TIMELINE|INVESTMENT|WHY CHOOSE US|NEXT STEPS):\s*)/i);
    return sections.filter(section => section.trim().length > 0);
  }

  /**
   * Parse sections into structured format
   */
  private parseSectionsFromContent(sections: string[]): ProposalSection {
    const result: ProposalSection = this.getEmptySections();
    
    sections.forEach(section => {
      const trimmedSection = section.trim();
      
      // Extract content after the header
      const headerMatch = trimmedSection.match(/^([A-Z\s]+):\s*([\s\S]*)/i);
      if (!headerMatch) return;
      
      const header = headerMatch[1].trim().toUpperCase();
      const content = headerMatch[2].trim();
      
      switch (header) {
        case 'EXECUTIVE SUMMARY':
          result.executive_summary = content;
          break;
        case 'PROJECT UNDERSTANDING':
          result.project_understanding = content;
          break;
        case 'PROPOSED SOLUTION':
          result.proposed_solution = content;
          break;
        case 'DELIVERABLES':
          result.deliverables = content;
          break;
        case 'TIMELINE':
          result.timeline = content;
          break;
        case 'INVESTMENT':
          result.investment = content;
          break;
        case 'WHY CHOOSE US':
          result.why_choose_us = content;
          break;
        case 'NEXT STEPS':
          result.next_steps = content;
          break;
      }
    });
    
    return result;
  }

  /**
   * Generate proposal title
   */
  private generateTitle(projectData: { title: string; clientName: string }): string {
    return `${projectData.title} - Proposal for ${projectData.clientName}`;
  }

  /**
   * Generate pricing breakdown with sophisticated calculations
   */
  private generatePricingBreakdown(totalBudget: number, templateType: string): {
    total: number;
    breakdown: Record<string, number>;
    currency: string;
  } {
    const breakdown: Record<string, number> = {};
    
    // Ensure total matches breakdown exactly
    const allocatePercentages = (percentages: Record<string, number>) => {
      const keys = Object.keys(percentages);
      let remaining = totalBudget;
      
      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          // Last item gets the remainder to ensure exact total
          breakdown[key] = remaining;
        } else {
          const amount = Math.round(totalBudget * percentages[key]);
          breakdown[key] = amount;
          remaining -= amount;
        }
      });
    };
    
    switch (templateType) {
      case 'web_design':
        allocatePercentages({
          'Design & UX': 0.35,
          'Development': 0.40,
          'Content & SEO': 0.15,
          'Testing & Launch': 0.10
        });
        break;
      case 'development':
        allocatePercentages({
          'Planning & Architecture': 0.20,
          'Development': 0.50,
          'Testing & QA': 0.20,
          'Deployment & Support': 0.10
        });
        break;
      case 'branding':
        allocatePercentages({
          'Brand Strategy': 0.30,
          'Logo & Visual Identity': 0.40,
          'Brand Guidelines': 0.20,
          'Marketing Materials': 0.10
        });
        break;
      case 'marketing':
        allocatePercentages({
          'Strategy & Planning': 0.25,
          'Content Creation': 0.35,
          'Campaign Management': 0.25,
          'Analytics & Reporting': 0.15
        });
        break;
      case 'ecommerce':
        allocatePercentages({
          'Platform Setup & Design': 0.30,
          'Product Catalog & Integration': 0.25,
          'Payment & Security': 0.20,
          'Testing & Launch': 0.15,
          'Training & Support': 0.10
        });
        break;
      case 'mobile_app':
        allocatePercentages({
          'UI/UX Design': 0.25,
          'Development (iOS/Android)': 0.45,
          'Testing & QA': 0.15,
          'App Store Deployment': 0.10,
          'Post-Launch Support': 0.05
        });
        break;
      case 'consulting':
        allocatePercentages({
          'Analysis & Research': 0.30,
          'Strategy Development': 0.35,
          'Implementation Planning': 0.20,
          'Follow-up & Optimization': 0.15
        });
        break;
      default:
        allocatePercentages({
          'Planning & Strategy': 0.25,
          'Implementation': 0.50,
          'Testing & Optimization': 0.15,
          'Support & Maintenance': 0.10
        });
    }

    return {
      total: totalBudget,
      breakdown,
      currency: 'USD'
    };
  }

  /**
   * Get tone guidelines for AI prompt
   */
  private getToneGuidelines(tone: string): string {
    const guidelines = {
      professional: 'Formal language, industry terminology, structured approach, authoritative voice',
      friendly: 'Conversational tone, personal touches, warm language, approachable style',
      premium: 'Sophisticated vocabulary, luxury positioning, exclusive feel, high-end language',
      casual: 'Relaxed language, approachable style, informal structure, conversational flow'
    };
    return guidelines[tone as keyof typeof guidelines] || guidelines.professional;
  }

  /**
   * Get language adaptations for AI prompt
   */
  private getLanguageAdaptations(language: string): string {
    const adaptations = {
      en: 'Direct, results-focused, concise communication style',
      uk: 'Warm, relationship-oriented, detailed explanations with cultural sensitivity',
      ru: 'Formal, authoritative, comprehensive approach with respect for hierarchy',
      pl: 'Professional, detail-oriented, systematic presentation with thoroughness'
    };
    return adaptations[language as keyof typeof adaptations] || adaptations.en;
  }

  /**
   * Initialize proposal templates
   */
  private initializeTemplates(): void {
    // Web Design Template
    this.templates.set('web_design', {
      name: 'web_design',
      industry: 'Web Design & Development',
      sections: {
        executive_summary: {
          prompt: 'Focus on digital transformation and online presence improvement',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Emphasize technical expertise and proven methodologies',
            friendly: 'Highlight collaborative approach and understanding of client needs',
            premium: 'Position as exclusive digital experience transformation',
            casual: 'Focus on making the web presence awesome and engaging'
          }
        },
        project_understanding: {
          prompt: 'Demonstrate understanding of current website challenges and digital goals',
          wordCount: [200, 250],
          tone_adaptations: {
            professional: 'Analyze current digital presence gaps and opportunities',
            friendly: 'Show empathy for current website frustrations',
            premium: 'Position current state as opportunity for digital excellence',
            casual: 'Acknowledge that the current site needs some love'
          }
        },
        proposed_solution: {
          prompt: 'Outline comprehensive web design and development approach',
          wordCount: [300, 400],
          tone_adaptations: {
            professional: 'Detail technical architecture and development methodology',
            friendly: 'Explain the process in accessible terms with collaboration focus',
            premium: 'Present bespoke digital solution with cutting-edge features',
            casual: 'Break down how we\'ll build something amazing together'
          }
        },
        deliverables: {
          prompt: 'List specific website components, features, and deliverables',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Itemize technical deliverables with specifications',
            friendly: 'Describe what you\'ll receive in practical terms',
            premium: 'Present exclusive features and premium components',
            casual: 'List all the cool stuff you\'ll get'
          }
        },
        timeline: {
          prompt: 'Break down web development phases and milestones',
          wordCount: [100, 150],
          tone_adaptations: {
            professional: 'Present structured development timeline with dependencies',
            friendly: 'Explain the journey from start to launch',
            premium: 'Outline meticulous development process with quality gates',
            casual: 'Show the roadmap to your new awesome website'
          }
        },
        investment: {
          prompt: 'Present web design and development pricing with value justification',
          wordCount: [100, 150],
          tone_adaptations: {
            professional: 'Justify investment with ROI and technical value',
            friendly: 'Explain pricing in terms of value and benefits',
            premium: 'Position as investment in digital excellence',
            casual: 'Break down what you get for your investment'
          }
        },
        why_choose_us: {
          prompt: 'Highlight web design expertise, portfolio, and differentiators',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Present credentials, certifications, and proven results',
            friendly: 'Share passion for web design and client success stories',
            premium: 'Position as elite digital agency with exclusive expertise',
            casual: 'Show why we\'re the right team for your project'
          }
        },
        next_steps: {
          prompt: 'Provide clear call-to-action for starting the web project',
          wordCount: [50, 100],
          tone_adaptations: {
            professional: 'Present formal project initiation process',
            friendly: 'Invite to start the exciting journey together',
            premium: 'Offer exclusive consultation and project onboarding',
            casual: 'Make it easy to get started right away'
          }
        }
      }
    });

    // Development Template
    this.templates.set('development', {
      name: 'development',
      industry: 'Software Development',
      sections: {
        executive_summary: {
          prompt: 'Focus on custom software solutions and technical innovation',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Emphasize technical expertise and proven development methodologies',
            friendly: 'Highlight collaborative development approach and partnership',
            premium: 'Position as cutting-edge software engineering excellence',
            casual: 'Focus on building awesome software solutions together'
          }
        },
        project_understanding: {
          prompt: 'Demonstrate understanding of technical requirements and business challenges',
          wordCount: [200, 250],
          tone_adaptations: {
            professional: 'Analyze current system limitations and technical opportunities',
            friendly: 'Show empathy for current software challenges and pain points',
            premium: 'Position current state as opportunity for technical transformation',
            casual: 'Acknowledge that the current system needs some technical love'
          }
        },
        proposed_solution: {
          prompt: 'Outline comprehensive software development approach and architecture',
          wordCount: [300, 400],
          tone_adaptations: {
            professional: 'Detail technical architecture and development methodology',
            friendly: 'Explain the development process in accessible terms',
            premium: 'Present bespoke software solution with enterprise-grade features',
            casual: 'Break down how we\'ll build something technically awesome'
          }
        },
        deliverables: {
          prompt: 'List specific software components, features, and technical deliverables',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Itemize technical deliverables with specifications',
            friendly: 'Describe what software components you\'ll receive',
            premium: 'Present exclusive features and premium technical components',
            casual: 'List all the cool technical stuff you\'ll get'
          }
        },
        timeline: {
          prompt: 'Break down software development phases and technical milestones',
          wordCount: [100, 150],
          tone_adaptations: {
            professional: 'Present structured development timeline with dependencies',
            friendly: 'Explain the development journey from concept to deployment',
            premium: 'Outline meticulous development process with quality gates',
            casual: 'Show the roadmap to your new software solution'
          }
        },
        investment: {
          prompt: 'Present software development pricing with technical value justification',
          wordCount: [100, 150],
          tone_adaptations: {
            professional: 'Justify investment with ROI and technical value',
            friendly: 'Explain pricing in terms of software value and benefits',
            premium: 'Position as investment in technical excellence',
            casual: 'Break down what you get for your development investment'
          }
        },
        why_choose_us: {
          prompt: 'Highlight software development expertise, portfolio, and technical differentiators',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Present technical credentials and proven development results',
            friendly: 'Share passion for software development and client success stories',
            premium: 'Position as elite development team with exclusive expertise',
            casual: 'Show why we\'re the right development team for your project'
          }
        },
        next_steps: {
          prompt: 'Provide clear call-to-action for starting the development project',
          wordCount: [50, 100],
          tone_adaptations: {
            professional: 'Present formal development project initiation process',
            friendly: 'Invite to start the exciting development journey together',
            premium: 'Offer exclusive technical consultation and project onboarding',
            casual: 'Make it easy to get started with development right away'
          }
        }
      }
    });

    // Branding Template
    this.templates.set('branding', {
      name: 'branding',
      industry: 'Brand Design & Strategy',
      sections: {
        executive_summary: {
          prompt: 'Focus on brand identity creation and market positioning',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Emphasize strategic brand development and market positioning',
            friendly: 'Highlight collaborative brand creation and partnership',
            premium: 'Position as exclusive brand identity transformation',
            casual: 'Focus on creating an awesome brand that stands out'
          }
        },
        project_understanding: {
          prompt: 'Demonstrate understanding of brand challenges and market positioning needs',
          wordCount: [200, 250],
          tone_adaptations: {
            professional: 'Analyze current brand positioning and market opportunities',
            friendly: 'Show empathy for current brand challenges and aspirations',
            premium: 'Position current state as opportunity for brand excellence',
            casual: 'Acknowledge that the current brand needs some creative love'
          }
        },
        proposed_solution: {
          prompt: 'Outline comprehensive brand development strategy and creative approach',
          wordCount: [300, 400],
          tone_adaptations: {
            professional: 'Detail brand strategy methodology and creative process',
            friendly: 'Explain the brand development process in accessible terms',
            premium: 'Present bespoke brand solution with luxury positioning',
            casual: 'Break down how we\'ll build an amazing brand together'
          }
        },
        deliverables: {
          prompt: 'List specific brand assets, guidelines, and creative deliverables',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Itemize brand deliverables with specifications',
            friendly: 'Describe what brand assets you\'ll receive',
            premium: 'Present exclusive brand elements and premium components',
            casual: 'List all the cool brand stuff you\'ll get'
          }
        },
        timeline: {
          prompt: 'Break down brand development phases and creative milestones',
          wordCount: [100, 150],
          tone_adaptations: {
            professional: 'Present structured brand development timeline',
            friendly: 'Explain the brand creation journey from concept to launch',
            premium: 'Outline meticulous brand development process',
            casual: 'Show the roadmap to your new brand identity'
          }
        },
        investment: {
          prompt: 'Present brand development pricing with strategic value justification',
          wordCount: [100, 150],
          tone_adaptations: {
            professional: 'Justify investment with brand ROI and strategic value',
            friendly: 'Explain pricing in terms of brand value and benefits',
            premium: 'Position as investment in brand excellence',
            casual: 'Break down what you get for your brand investment'
          }
        },
        why_choose_us: {
          prompt: 'Highlight brand design expertise, portfolio, and creative differentiators',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Present brand credentials and proven creative results',
            friendly: 'Share passion for brand design and client success stories',
            premium: 'Position as elite brand agency with exclusive expertise',
            casual: 'Show why we\'re the right creative team for your brand'
          }
        },
        next_steps: {
          prompt: 'Provide clear call-to-action for starting the brand project',
          wordCount: [50, 100],
          tone_adaptations: {
            professional: 'Present formal brand project initiation process',
            friendly: 'Invite to start the exciting brand journey together',
            premium: 'Offer exclusive brand consultation and project onboarding',
            casual: 'Make it easy to get started with branding right away'
          }
        }
      }
    });

    // Marketing Template
    this.templates.set('marketing', {
      name: 'marketing',
      industry: 'Marketing & Advertising',
      sections: {
        executive_summary: {
          prompt: 'Focus on marketing strategy and campaign performance',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Emphasize data-driven marketing strategies and ROI',
            friendly: 'Highlight collaborative marketing approach and partnership',
            premium: 'Position as exclusive marketing excellence and premium service',
            casual: 'Focus on creating awesome marketing that gets results'
          }
        },
        project_understanding: {
          prompt: 'Demonstrate understanding of marketing challenges and growth objectives',
          wordCount: [200, 250],
          tone_adaptations: {
            professional: 'Analyze current marketing performance and growth opportunities',
            friendly: 'Show empathy for current marketing challenges and goals',
            premium: 'Position current state as opportunity for marketing excellence',
            casual: 'Acknowledge that the current marketing needs some strategic love'
          }
        },
        proposed_solution: {
          prompt: 'Outline comprehensive marketing strategy and campaign approach',
          wordCount: [300, 400],
          tone_adaptations: {
            professional: 'Detail marketing methodology and campaign strategy',
            friendly: 'Explain the marketing process in accessible terms',
            premium: 'Present bespoke marketing solution with premium positioning',
            casual: 'Break down how we\'ll create amazing marketing together'
          }
        },
        deliverables: {
          prompt: 'List specific marketing campaigns, assets, and performance deliverables',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Itemize marketing deliverables with KPI specifications',
            friendly: 'Describe what marketing assets and results you\'ll receive',
            premium: 'Present exclusive marketing elements and premium components',
            casual: 'List all the cool marketing stuff you\'ll get'
          }
        },
        timeline: {
          prompt: 'Break down marketing campaign phases and performance milestones',
          wordCount: [100, 150],
          tone_adaptations: {
            professional: 'Present structured marketing timeline with KPIs',
            friendly: 'Explain the marketing journey from strategy to results',
            premium: 'Outline meticulous marketing process with quality gates',
            casual: 'Show the roadmap to your marketing success'
          }
        },
        investment: {
          prompt: 'Present marketing investment with ROI and performance justification',
          wordCount: [100, 150],
          tone_adaptations: {
            professional: 'Justify investment with marketing ROI and performance metrics',
            friendly: 'Explain pricing in terms of marketing value and results',
            premium: 'Position as investment in marketing excellence',
            casual: 'Break down what you get for your marketing investment'
          }
        },
        why_choose_us: {
          prompt: 'Highlight marketing expertise, case studies, and performance differentiators',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Present marketing credentials and proven campaign results',
            friendly: 'Share passion for marketing and client success stories',
            premium: 'Position as elite marketing agency with exclusive expertise',
            casual: 'Show why we\'re the right marketing team for your business'
          }
        },
        next_steps: {
          prompt: 'Provide clear call-to-action for starting the marketing project',
          wordCount: [50, 100],
          tone_adaptations: {
            professional: 'Present formal marketing project initiation process',
            friendly: 'Invite to start the exciting marketing journey together',
            premium: 'Offer exclusive marketing consultation and campaign onboarding',
            casual: 'Make it easy to get started with marketing right away'
          }
        }
      }
    });

    // E-commerce Template
    this.templates.set('ecommerce', {
      name: 'ecommerce',
      industry: 'E-commerce & Online Retail',
      sections: {
        executive_summary: {
          prompt: 'Focus on online sales growth, conversion optimization, and revenue increase',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Emphasize e-commerce expertise and revenue optimization strategies',
            friendly: 'Highlight collaborative approach to growing online sales',
            premium: 'Position as exclusive e-commerce transformation service',
            casual: 'Focus on making online selling awesome and profitable'
          }
        },
        project_understanding: {
          prompt: 'Demonstrate understanding of e-commerce challenges, competition, and market opportunities',
          wordCount: [200, 250],
          tone_adaptations: {
            professional: 'Analyze current e-commerce performance and growth opportunities',
            friendly: 'Show empathy for online selling challenges and goals',
            premium: 'Position current e-commerce state as opportunity for luxury market positioning',
            casual: 'Acknowledge that the online store needs some expert attention'
          }
        },
        proposed_solution: {
          prompt: 'Outline comprehensive e-commerce strategy including platform, UX, and conversion optimization',
          wordCount: [300, 400],
          tone_adaptations: {
            professional: 'Detail e-commerce methodology and technical implementation',
            friendly: 'Explain the e-commerce improvement process in accessible terms',
            premium: 'Present bespoke e-commerce solution with luxury positioning',
            casual: 'Break down how we\'ll build an amazing online store together'
          }
        },
        deliverables: {
          prompt: 'List e-commerce platform features, integrations, and optimization deliverables',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Itemize e-commerce deliverables with technical specifications',
            friendly: 'Describe what e-commerce features and improvements you\'ll receive',
            premium: 'Present exclusive e-commerce elements and premium features',
            casual: 'List all the cool e-commerce stuff you\'ll get'
          }
        },
        timeline: {
          prompt: 'Break down e-commerce development phases and launch milestones',
          wordCount: [100, 150],
          tone_adaptations: {
            professional: 'Present structured e-commerce development timeline',
            friendly: 'Explain the journey from concept to successful online store',
            premium: 'Outline meticulous e-commerce development process',
            casual: 'Show the roadmap to e-commerce success'
          }
        },
        investment: {
          prompt: 'Present e-commerce investment with ROI and sales growth justification',
          wordCount: [100, 150],
          tone_adaptations: {
            professional: 'Justify investment with e-commerce ROI and revenue projections',
            friendly: 'Explain pricing in terms of sales growth and value',
            premium: 'Position as investment in e-commerce excellence',
            casual: 'Break down what you get for your e-commerce investment'
          }
        },
        why_choose_us: {
          prompt: 'Highlight e-commerce expertise, successful store launches, and conversion results',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Present e-commerce credentials and proven sales results',
            friendly: 'Share passion for e-commerce and client success stories',
            premium: 'Position as elite e-commerce agency with exclusive expertise',
            casual: 'Show why we\'re the right e-commerce team for your business'
          }
        },
        next_steps: {
          prompt: 'Provide clear call-to-action for starting the e-commerce project',
          wordCount: [50, 100],
          tone_adaptations: {
            professional: 'Present formal e-commerce project initiation process',
            friendly: 'Invite to start the exciting e-commerce journey together',
            premium: 'Offer exclusive e-commerce consultation and onboarding',
            casual: 'Make it easy to get started with e-commerce right away'
          }
        }
      }
    });

    // Mobile App Template
    this.templates.set('mobile_app', {
      name: 'mobile_app',
      industry: 'Mobile App Development',
      sections: {
        executive_summary: {
          prompt: 'Focus on mobile user experience, app store success, and user engagement',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Emphasize mobile development expertise and app store optimization',
            friendly: 'Highlight collaborative approach to creating amazing mobile experiences',
            premium: 'Position as exclusive mobile app development service',
            casual: 'Focus on building an awesome app that users will love'
          }
        },
        project_understanding: {
          prompt: 'Demonstrate understanding of mobile market, user needs, and technical requirements',
          wordCount: [200, 250],
          tone_adaptations: {
            professional: 'Analyze mobile market opportunities and technical challenges',
            friendly: 'Show empathy for mobile app vision and user needs',
            premium: 'Position mobile app as opportunity for market leadership',
            casual: 'Acknowledge that the mobile app idea needs expert development'
          }
        },
        proposed_solution: {
          prompt: 'Outline comprehensive mobile development strategy including platforms, features, and user experience',
          wordCount: [300, 400],
          tone_adaptations: {
            professional: 'Detail mobile development methodology and technical architecture',
            friendly: 'Explain the app development process in accessible terms',
            premium: 'Present bespoke mobile solution with cutting-edge features',
            casual: 'Break down how we\'ll build an incredible mobile app together'
          }
        },
        deliverables: {
          prompt: 'List mobile app features, platforms, testing, and app store deliverables',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Itemize mobile deliverables with technical specifications',
            friendly: 'Describe what mobile app features and capabilities you\'ll receive',
            premium: 'Present exclusive mobile features and premium functionality',
            casual: 'List all the cool mobile app features you\'ll get'
          }
        },
        timeline: {
          prompt: 'Break down mobile development phases from wireframes to app store launch',
          wordCount: [100, 150],
          tone_adaptations: {
            professional: 'Present structured mobile development timeline',
            friendly: 'Explain the journey from concept to app store success',
            premium: 'Outline meticulous mobile development process',
            casual: 'Show the roadmap to mobile app success'
          }
        },
        investment: {
          prompt: 'Present mobile development investment with user acquisition and revenue justification',
          wordCount: [100, 150],
          tone_adaptations: {
            professional: 'Justify investment with mobile ROI and user engagement metrics',
            friendly: 'Explain pricing in terms of app success and value',
            premium: 'Position as investment in mobile excellence',
            casual: 'Break down what you get for your mobile app investment'
          }
        },
        why_choose_us: {
          prompt: 'Highlight mobile development expertise, successful app launches, and user ratings',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Present mobile credentials and proven app store results',
            friendly: 'Share passion for mobile development and client success stories',
            premium: 'Position as elite mobile development team with exclusive expertise',
            casual: 'Show why we\'re the right mobile team for your app'
          }
        },
        next_steps: {
          prompt: 'Provide clear call-to-action for starting the mobile app project',
          wordCount: [50, 100],
          tone_adaptations: {
            professional: 'Present formal mobile development project initiation process',
            friendly: 'Invite to start the exciting mobile app journey together',
            premium: 'Offer exclusive mobile consultation and development onboarding',
            casual: 'Make it easy to get started with mobile app development right away'
          }
        }
      }
    });

    // Consulting Template
    this.templates.set('consulting', {
      name: 'consulting',
      industry: 'Business Consulting & Strategy',
      sections: {
        executive_summary: {
          prompt: 'Focus on business transformation, strategic growth, and competitive advantage',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Emphasize strategic consulting expertise and business transformation',
            friendly: 'Highlight collaborative approach to business growth',
            premium: 'Position as exclusive strategic consulting service',
            casual: 'Focus on helping the business reach its full potential'
          }
        },
        project_understanding: {
          prompt: 'Demonstrate understanding of business challenges, market position, and growth opportunities',
          wordCount: [200, 250],
          tone_adaptations: {
            professional: 'Analyze current business situation and strategic opportunities',
            friendly: 'Show empathy for business challenges and growth aspirations',
            premium: 'Position current business state as opportunity for excellence',
            casual: 'Acknowledge that the business needs some strategic guidance'
          }
        },
        proposed_solution: {
          prompt: 'Outline comprehensive consulting methodology including analysis, strategy, and implementation',
          wordCount: [300, 400],
          tone_adaptations: {
            professional: 'Detail consulting methodology and strategic framework',
            friendly: 'Explain the consulting process in accessible business terms',
            premium: 'Present bespoke consulting solution with executive-level approach',
            casual: 'Break down how we\'ll transform the business together'
          }
        },
        deliverables: {
          prompt: 'List strategic analysis, recommendations, implementation plans, and business outcomes',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Itemize consulting deliverables with strategic specifications',
            friendly: 'Describe what strategic insights and plans you\'ll receive',
            premium: 'Present exclusive consulting elements and premium analysis',
            casual: 'List all the strategic tools and insights you\'ll get'
          }
        },
        timeline: {
          prompt: 'Break down consulting phases from analysis to implementation and results',
          wordCount: [100, 150],
          tone_adaptations: {
            professional: 'Present structured consulting engagement timeline',
            friendly: 'Explain the journey from analysis to business transformation',
            premium: 'Outline meticulous consulting process with executive checkpoints',
            casual: 'Show the roadmap to business success'
          }
        },
        investment: {
          prompt: 'Present consulting investment with ROI and business growth justification',
          wordCount: [100, 150],
          tone_adaptations: {
            professional: 'Justify investment with business ROI and strategic value',
            friendly: 'Explain pricing in terms of business growth and value',
            premium: 'Position as investment in strategic excellence',
            casual: 'Break down what you get for your consulting investment'
          }
        },
        why_choose_us: {
          prompt: 'Highlight consulting expertise, successful transformations, and business results',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Present consulting credentials and proven business results',
            friendly: 'Share passion for business success and client transformations',
            premium: 'Position as elite consulting firm with exclusive expertise',
            casual: 'Show why we\'re the right consulting team for your business'
          }
        },
        next_steps: {
          prompt: 'Provide clear call-to-action for starting the consulting engagement',
          wordCount: [50, 100],
          tone_adaptations: {
            professional: 'Present formal consulting engagement initiation process',
            friendly: 'Invite to start the exciting business transformation journey',
            premium: 'Offer exclusive strategic consultation and engagement onboarding',
            casual: 'Make it easy to get started with consulting right away'
          }
        }
      }
    });

    // Custom/Generic Template
    this.templates.set('custom', {
      name: 'custom',
      industry: 'Custom Solutions',
      sections: {
        executive_summary: {
          prompt: 'Focus on custom solution benefits and business transformation',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Emphasize strategic approach and proven methodologies',
            friendly: 'Highlight collaborative approach and partnership',
            premium: 'Position as exclusive custom solution excellence',
            casual: 'Focus on creating something awesome and unique'
          }
        },
        project_understanding: {
          prompt: 'Demonstrate understanding of unique challenges and specific requirements',
          wordCount: [200, 250],
          tone_adaptations: {
            professional: 'Analyze current situation and strategic opportunities',
            friendly: 'Show empathy for current challenges and aspirations',
            premium: 'Position current state as opportunity for excellence',
            casual: 'Acknowledge that the current situation needs some expert love'
          }
        },
        proposed_solution: {
          prompt: 'Outline comprehensive custom approach and methodology',
          wordCount: [300, 400],
          tone_adaptations: {
            professional: 'Detail methodology and implementation strategy',
            friendly: 'Explain the process in accessible and collaborative terms',
            premium: 'Present bespoke solution with premium positioning',
            casual: 'Break down how we\'ll build something amazing together'
          }
        },
        deliverables: {
          prompt: 'List specific outcomes, assets, and project deliverables',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Itemize deliverables with detailed specifications',
            friendly: 'Describe what outcomes and assets you\'ll receive',
            premium: 'Present exclusive elements and premium components',
            casual: 'List all the cool stuff you\'ll get from this project'
          }
        },
        timeline: {
          prompt: 'Break down project phases and key milestones',
          wordCount: [100, 150],
          tone_adaptations: {
            professional: 'Present structured timeline with dependencies',
            friendly: 'Explain the journey from start to successful completion',
            premium: 'Outline meticulous process with quality checkpoints',
            casual: 'Show the roadmap to your project success'
          }
        },
        investment: {
          prompt: 'Present pricing with value and outcome justification',
          wordCount: [100, 150],
          tone_adaptations: {
            professional: 'Justify investment with ROI and strategic value',
            friendly: 'Explain pricing in terms of value and benefits',
            premium: 'Position as investment in excellence and transformation',
            casual: 'Break down what you get for your investment'
          }
        },
        why_choose_us: {
          prompt: 'Highlight relevant expertise, experience, and differentiators',
          wordCount: [150, 200],
          tone_adaptations: {
            professional: 'Present credentials and proven track record',
            friendly: 'Share passion for the work and client success stories',
            premium: 'Position as elite service provider with exclusive expertise',
            casual: 'Show why we\'re the right team for your project'
          }
        },
        next_steps: {
          prompt: 'Provide clear call-to-action for project initiation',
          wordCount: [50, 100],
          tone_adaptations: {
            professional: 'Present formal project initiation process',
            friendly: 'Invite to start the exciting journey together',
            premium: 'Offer exclusive consultation and project onboarding',
            casual: 'Make it easy to get started right away'
          }
        }
      }
    });
  }

  /**
   * Get appropriate template based on type and industry
   */
  private getTemplate(templateType?: string, industry?: string): ProposalTemplate {
    if (templateType && this.templates.has(templateType)) {
      return this.templates.get(templateType)!;
    }
    
    // Default to web_design template if none specified
    return this.templates.get('web_design')!;
  }

  /**
   * Validate the proposal generation request
   */
  private validateRequest(request: ProposalGenerationRequest): { isValid: boolean; error?: string } {
    if (!request.projectData.title) {
      return { isValid: false, error: 'Project title is required' };
    }
    
    if (!request.projectData.clientName) {
      return { isValid: false, error: 'Client name is required' };
    }
    
    if (!request.projectData.description) {
      return { isValid: false, error: 'Project description is required' };
    }
    
    if (!['professional', 'friendly', 'premium', 'casual'].includes(request.userPreferences.tone)) {
      return { isValid: false, error: 'Invalid tone preference' };
    }
    
    if (!['en', 'uk', 'ru', 'pl'].includes(request.userPreferences.language)) {
      return { isValid: false, error: 'Invalid language preference' };
    }
    
    return { isValid: true };
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Get empty sections structure
   */
  private getEmptySections(): ProposalSection {
    return {
      executive_summary: '',
      project_understanding: '',
      proposed_solution: '',
      deliverables: '',
      timeline: '',
      investment: '',
      why_choose_us: '',
      next_steps: ''
    };
  }
}

// Export singleton instance
export const aiProposalGenerator = new AIProposalGeneratorService();
export default AIProposalGeneratorService;