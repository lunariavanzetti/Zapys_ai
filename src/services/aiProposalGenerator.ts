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
  templateType?: 'web_design' | 'development' | 'branding' | 'marketing' | 'custom';
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
    
    return `You are an expert proposal writer and business consultant. Your job is to create compelling, professional proposals that win clients and clearly communicate value.

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
- Executive Summary: 150-200 words - Hook the reader, summarize project, highlight value proposition
- Project Understanding: 200-250 words - Demonstrate understanding of challenges and goals
- Proposed Solution: 300-400 words - Present approach, methodology, and technical details
- Deliverables: 150-200 words - List specific, measurable outcomes organized by phases
- Timeline: 100-150 words - Break down project phases with milestones
- Investment: 100-150 words - Present pricing clearly with value justification
- Why Choose Us: 150-200 words - Highlight experience and differentiation
- Next Steps: 50-100 words - Clear call-to-action and contact information

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
   * Call the AI service using Anthropic Claude
   */
  private async callAIService(systemPrompt: string, userPrompt: string): Promise<string> {
    const { anthropicClient } = await import('./anthropicClient');
    return anthropicClient.generateContent(systemPrompt, userPrompt);
  }

  /**
   * Parse sections from AI response
   */
  private parseSectionsFromResponse(response: string): string[] {
    const sections = response.split(/(?=EXECUTIVE SUMMARY:|PROJECT UNDERSTANDING:|PROPOSED SOLUTION:|DELIVERABLES:|TIMELINE:|INVESTMENT:|WHY CHOOSE US:|NEXT STEPS:)/);
    return sections.filter(section => section.trim().length > 0);
  }

  /**
   * Parse sections into structured format
   */
  private parseSectionsFromContent(sections: string[]): ProposalSection {
    const result: ProposalSection = this.getEmptySections();
    
    sections.forEach(section => {
      const content = section.replace(/^[A-Z\s:]+/, '').trim();
      
      if (section.includes('EXECUTIVE SUMMARY')) {
        result.executive_summary = content;
      } else if (section.includes('PROJECT UNDERSTANDING')) {
        result.project_understanding = content;
      } else if (section.includes('PROPOSED SOLUTION')) {
        result.proposed_solution = content;
      } else if (section.includes('DELIVERABLES')) {
        result.deliverables = content;
      } else if (section.includes('TIMELINE')) {
        result.timeline = content;
      } else if (section.includes('INVESTMENT')) {
        result.investment = content;
      } else if (section.includes('WHY CHOOSE US')) {
        result.why_choose_us = content;
      } else if (section.includes('NEXT STEPS')) {
        result.next_steps = content;
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
   * Generate pricing breakdown
   */
  private generatePricingBreakdown(totalBudget: number, templateType: string): {
    total: number;
    breakdown: Record<string, number>;
    currency: string;
  } {
    const breakdown: Record<string, number> = {};
    
    switch (templateType) {
      case 'web_design':
        breakdown['Design & UX'] = Math.round(totalBudget * 0.3);
        breakdown['Development'] = Math.round(totalBudget * 0.4);
        breakdown['Content & SEO'] = Math.round(totalBudget * 0.2);
        breakdown['Testing & Launch'] = Math.round(totalBudget * 0.1);
        break;
      case 'development':
        breakdown['Planning & Architecture'] = Math.round(totalBudget * 0.2);
        breakdown['Development'] = Math.round(totalBudget * 0.5);
        breakdown['Testing & QA'] = Math.round(totalBudget * 0.2);
        breakdown['Deployment & Support'] = Math.round(totalBudget * 0.1);
        break;
      case 'branding':
        breakdown['Brand Strategy'] = Math.round(totalBudget * 0.3);
        breakdown['Logo & Visual Identity'] = Math.round(totalBudget * 0.4);
        breakdown['Brand Guidelines'] = Math.round(totalBudget * 0.2);
        breakdown['Marketing Materials'] = Math.round(totalBudget * 0.1);
        break;
      case 'marketing':
        breakdown['Strategy & Planning'] = Math.round(totalBudget * 0.25);
        breakdown['Content Creation'] = Math.round(totalBudget * 0.35);
        breakdown['Campaign Management'] = Math.round(totalBudget * 0.25);
        breakdown['Analytics & Reporting'] = Math.round(totalBudget * 0.15);
        break;
      default:
        breakdown['Planning & Strategy'] = Math.round(totalBudget * 0.25);
        breakdown['Implementation'] = Math.round(totalBudget * 0.5);
        breakdown['Testing & Optimization'] = Math.round(totalBudget * 0.15);
        breakdown['Support & Maintenance'] = Math.round(totalBudget * 0.1);
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