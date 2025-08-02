// Anthropic Claude API Client
// Handles communication with Claude AI for proposal generation

interface AnthropicMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AnthropicRequest {
  model: string;
  max_tokens: number;
  temperature: number;
  messages: AnthropicMessage[];
  system?: string;
}

interface AnthropicResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  id: string;
  model: string;
  role: 'assistant';
  stop_reason: string;
  stop_sequence: null;
  type: 'message';
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class AnthropicClient {
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1/messages';
  private model = 'claude-3-5-sonnet-20241022';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_ANTHROPIC_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Anthropic API key not found. Using mock responses.');
    }
  }

  /**
   * Generate content using Claude AI
   */
  async generateContent(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.apiKey) {
      // Return mock response for development
      return this.getMockResponse(userPrompt);
    }

    try {
      const request: AnthropicRequest = {
        model: this.model,
        max_tokens: 4000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data: AnthropicResponse = await response.json();
      
      if (!data.content || data.content.length === 0) {
        throw new Error('No content received from Anthropic API');
      }

      return data.content[0].text;

    } catch (error) {
      console.error('Error calling Anthropic API:', error);
      
      // Fallback to mock response on error
      console.warn('Falling back to mock response due to API error');
      return this.getMockResponse(userPrompt);
    }
  }

  /**
   * Get mock response for development/fallback
   */
  private getMockResponse(userPrompt: string): string {
    const isWebProject = userPrompt.toLowerCase().includes('website') || userPrompt.toLowerCase().includes('web');
    const isDevelopment = userPrompt.toLowerCase().includes('development') || userPrompt.toLowerCase().includes('app');
    const isBranding = userPrompt.toLowerCase().includes('brand') || userPrompt.toLowerCase().includes('logo');
    const isMarketing = userPrompt.toLowerCase().includes('marketing') || userPrompt.toLowerCase().includes('campaign');

    // Extract client name from prompt
    const clientMatch = userPrompt.match(/Client:\s*([^\n(]+)/);
    const clientName = clientMatch ? clientMatch[1].trim() : 'your business';

    // Extract project title
    const titleMatch = userPrompt.match(/Title:\s*([^\n]+)/);
    const projectTitle = titleMatch ? titleMatch[1].trim() : 'this project';

    // Extract budget
    const budgetMatch = userPrompt.match(/Budget:\s*\$?([\d,]+)/);
    const budget = budgetMatch ? `$${budgetMatch[1]}` : 'the estimated budget range';

    if (isWebProject) {
      return this.getWebDesignMockResponse(clientName, projectTitle, budget);
    } else if (isDevelopment) {
      return this.getDevelopmentMockResponse(clientName, projectTitle, budget);
    } else if (isBranding) {
      return this.getBrandingMockResponse(clientName, projectTitle, budget);
    } else if (isMarketing) {
      return this.getMarketingMockResponse(clientName, projectTitle, budget);
    } else {
      return this.getGenericMockResponse(clientName, projectTitle, budget);
    }
  }

  private getWebDesignMockResponse(clientName: string, projectTitle: string, budget: string): string {
    return `
EXECUTIVE SUMMARY:
We understand that ${clientName} needs a modern, engaging website that drives customer engagement and increases revenue. Our comprehensive web design solution will transform your online presence with a user-friendly interface, mobile optimization, and conversion-focused features. With our proven track record of delivering exceptional results for businesses in your industry, we're confident this project will exceed your expectations and provide a strong return on investment.

PROJECT UNDERSTANDING:
Your current website challenges likely include outdated design, poor mobile experience, and limited conversion optimization. We recognize that in today's competitive market, your website must serve as a powerful sales tool that engages visitors and converts them into customers. Our team has analyzed your requirements and understands the importance of creating a solution that not only looks professional but also drives measurable business results through improved user experience and strategic design elements.

PROPOSED SOLUTION:
Our approach combines strategic planning, modern design principles, and technical excellence to deliver a website that achieves your business goals. We'll begin with comprehensive research and strategy development, followed by custom design creation that reflects your brand identity. The development phase will focus on responsive design, performance optimization, and SEO best practices. We'll implement conversion optimization techniques, integrate necessary third-party tools, and ensure the site is fully tested across all devices and browsers before launch.

DELIVERABLES:
- Custom website design with 5-8 pages including homepage, about, services, portfolio, and contact
- Fully responsive design optimized for desktop, tablet, and mobile devices
- Content management system (CMS) for easy updates
- SEO optimization including meta tags, structured data, and performance optimization
- Contact forms and lead capture functionality
- Social media integration
- Google Analytics setup and configuration
- 30 days of post-launch support and training
- Complete source code and documentation

TIMELINE:
Week 1-2: Discovery, research, and strategy development
Week 3-4: Design concepts and revisions
Week 5-6: Development and CMS integration
Week 7: Content implementation and testing
Week 8: Final revisions, launch, and training
This timeline allows for thorough planning, creative development, and quality assurance while meeting your project deadline.

INVESTMENT:
Our comprehensive website design and development package is competitively priced at ${budget}. This investment includes all design work, development, testing, and post-launch support. The value you'll receive far exceeds the cost through increased online visibility, improved user engagement, and enhanced conversion rates. We offer flexible payment terms with 50% due at project start and 50% upon completion, ensuring you're comfortable with the investment structure.

WHY CHOOSE US:
Our team brings over 10 years of combined experience in web design and development, with a portfolio of successful projects across various industries. We pride ourselves on delivering projects on time and within budget while maintaining the highest quality standards. Our client-focused approach ensures clear communication throughout the project, and our post-launch support guarantees your continued success. We stay current with the latest design trends and technologies to ensure your website remains competitive and effective.

NEXT STEPS:
To move forward with this project, simply reply to this proposal with your approval or any questions you may have. We'll schedule a kick-off meeting within 48 hours to finalize project details and begin the discovery phase. Our team is excited to partner with you on this project and help your business achieve its online goals. Contact us at [your email] or [your phone] to get started immediately.
    `;
  }

  private getDevelopmentMockResponse(clientName: string, projectTitle: string, budget: string): string {
    return `
EXECUTIVE SUMMARY:
${clientName} requires a robust, scalable software solution that streamlines operations and drives business growth. Our development approach combines cutting-edge technology with proven methodologies to deliver a custom application that meets your exact specifications. We'll create a solution that not only solves your current challenges but also scales with your business needs, providing long-term value and competitive advantage.

PROJECT UNDERSTANDING:
We recognize that your current systems may be limiting your operational efficiency and growth potential. Modern businesses need software solutions that are reliable, user-friendly, and capable of handling increased demand. Our team understands the critical importance of creating a system that your team can easily adopt while providing the functionality and performance your business requires to stay competitive in today's market.

PROPOSED SOLUTION:
Our development methodology follows industry best practices with a focus on scalability, security, and maintainability. We'll start with thorough requirements analysis and system architecture design, followed by iterative development cycles that allow for continuous feedback and refinement. The solution will be built using modern frameworks and technologies, ensuring optimal performance and future-proofing. We'll implement comprehensive testing, security measures, and documentation throughout the development process.

DELIVERABLES:
- Custom software application with full functionality as specified
- Clean, well-documented source code following industry standards
- Comprehensive testing suite including unit tests and integration tests
- User documentation and training materials
- Administrative dashboard and reporting features
- API documentation and integration guidelines
- Security implementation and vulnerability assessment
- Performance optimization and load testing results
- Deployment package and environment setup instructions

TIMELINE:
Week 1-3: Requirements analysis, system design, and architecture planning
Week 4-8: Core development and feature implementation
Week 9-10: Integration testing and quality assurance
Week 11: User acceptance testing and final refinements
Week 12: Deployment, training, and project handover
This structured approach ensures thorough development while maintaining flexibility for adjustments based on your feedback.

INVESTMENT:
The development investment of ${budget} reflects the comprehensive nature of this custom solution. This includes all development work, testing, documentation, and post-launch support. The return on investment will be realized through improved efficiency, reduced operational costs, and enhanced business capabilities. We offer milestone-based payments aligned with project deliverables, ensuring transparency and accountability throughout the development process.

WHY CHOOSE US:
Our development team has extensive experience building custom software solutions for businesses across various industries. We follow agile development practices, maintain high code quality standards, and prioritize security in every project. Our track record includes successful deployments of scalable applications that continue to serve our clients years after initial development. We provide ongoing support and are committed to your long-term success.

NEXT STEPS:
Let's schedule a technical discovery session to dive deeper into your requirements and finalize the project scope. Upon approval, we'll begin with a comprehensive requirements workshop and provide you with a detailed project roadmap. Our team is ready to start immediately and looks forward to building a solution that transforms your business operations. Contact us to begin this exciting development journey.
    `;
  }

  private getBrandingMockResponse(clientName: string, projectTitle: string, budget: string): string {
    return `
EXECUTIVE SUMMARY:
${clientName} deserves a brand identity that truly represents your values, connects with your audience, and sets you apart from competitors. Our comprehensive branding solution will create a cohesive visual identity and brand strategy that resonates with your target market and drives business growth. We'll develop a timeless yet contemporary brand that reflects your unique personality and positions you for long-term success in your industry.

PROJECT UNDERSTANDING:
Strong branding is essential for building trust, recognition, and loyalty with your customers. We understand that your brand needs to communicate your values clearly while appealing to your target audience's emotions and preferences. Whether you're launching a new business or refreshing an existing brand, we recognize the importance of creating a consistent identity that works across all touchpoints and marketing channels.

PROPOSED SOLUTION:
Our branding process begins with deep discovery to understand your business, audience, and competitive landscape. We'll develop a comprehensive brand strategy that includes positioning, messaging, and visual direction. The creative development phase will produce multiple logo concepts, color palettes, typography systems, and brand elements. We'll then create detailed brand guidelines and apply the new identity across various marketing materials to ensure consistent implementation.

DELIVERABLES:
- Complete brand strategy document with positioning and messaging
- Primary logo design with multiple variations and orientations
- Comprehensive color palette with technical specifications
- Typography system with primary and secondary font selections
- Brand pattern, texture, and graphic element library
- Detailed brand guidelines document (30-40 pages)
- Business card, letterhead, and email signature designs
- Social media templates and profile graphics
- Brand application mockups showing real-world usage
- All source files in vector and raster formats

TIMELINE:
Week 1-2: Brand discovery, research, and strategy development
Week 3-4: Logo concepts and initial design exploration
Week 5-6: Design refinement and brand system development
Week 7: Brand guidelines creation and marketing material design
Week 8: Final revisions, file preparation, and brand presentation
This timeline ensures thorough exploration and refinement while delivering a polished brand identity on schedule.

INVESTMENT:
Our comprehensive branding package is priced at ${budget}, which includes all strategy development, creative work, and deliverables outlined above. This investment will provide you with a complete brand system that can be implemented across all your marketing efforts for years to come. The value extends far beyond the initial cost through increased brand recognition, customer trust, and market differentiation that drives long-term business growth.

WHY CHOOSE US:
Our branding expertise spans over a decade of creating successful identities for businesses of all sizes. We combine strategic thinking with creative excellence to produce brands that not only look exceptional but also perform in the marketplace. Our collaborative approach ensures your vision is realized while leveraging our expertise to create something truly memorable. We've helped numerous clients achieve significant growth through strategic rebranding initiatives.

NEXT STEPS:
We're excited to begin developing your new brand identity. The first step is scheduling a brand discovery session where we'll dive deep into your business goals, target audience, and competitive landscape. Once you approve this proposal, we'll send you a comprehensive brand questionnaire and schedule our strategy session. Let's create a brand that truly represents your business and resonates with your customers.
    `;
  }

  private getMarketingMockResponse(clientName: string, projectTitle: string, budget: string): string {
    return `
EXECUTIVE SUMMARY:
${clientName} needs a strategic marketing approach that drives measurable results and accelerates business growth. Our comprehensive marketing solution combines data-driven strategy with creative execution to reach your target audience effectively and convert prospects into loyal customers. We'll develop and execute campaigns that maximize your ROI while building long-term brand awareness and market position.

PROJECT UNDERSTANDING:
In today's competitive marketplace, effective marketing requires a multi-channel approach backed by solid strategy and continuous optimization. We understand that you need marketing efforts that not only generate leads but also nurture relationships and drive conversions. Our team recognizes the importance of aligning marketing activities with your business goals while adapting to changing market conditions and consumer behaviors.

PROPOSED SOLUTION:
Our marketing approach begins with comprehensive market research and competitor analysis to identify opportunities and develop targeted strategies. We'll create detailed buyer personas and customer journey maps to guide our campaign development. The execution phase includes content creation, campaign management across multiple channels, and continuous performance monitoring. We'll implement advanced analytics and reporting systems to track ROI and optimize performance throughout the campaign lifecycle.

DELIVERABLES:
- Comprehensive marketing strategy and campaign plan
- Target audience analysis and buyer persona development
- Content calendar with 3 months of planned content
- Creative assets including graphics, videos, and copy
- Multi-channel campaign setup (social media, email, PPC, content marketing)
- Landing pages and conversion optimization elements
- Marketing automation workflows and email sequences
- Performance tracking dashboard and analytics setup
- Monthly performance reports with insights and recommendations
- Campaign optimization and A/B testing results

TIMELINE:
Week 1-2: Market research, strategy development, and campaign planning
Week 3-4: Creative asset development and content creation
Week 5-6: Campaign setup, testing, and initial launch
Week 7-8: Campaign optimization, performance analysis, and scaling
This timeline allows for strategic planning, creative development, and performance optimization to maximize campaign effectiveness.

INVESTMENT:
The marketing investment of ${budget} covers strategy development, creative production, campaign management, and performance optimization. This comprehensive approach ensures maximum return on your marketing spend through targeted campaigns and continuous optimization. The investment will be recouped through increased leads, sales, and brand awareness that drives long-term business growth and market share expansion.

WHY CHOOSE US:
Our marketing team has successfully managed campaigns across various industries, consistently delivering above-average performance metrics and ROI. We stay current with the latest marketing trends, tools, and best practices while maintaining focus on what drives real business results. Our data-driven approach combined with creative excellence ensures campaigns that not only perform well but also resonate with your target audience and build lasting brand connections.

NEXT STEPS:
Let's schedule a marketing consultation to discuss your specific goals, target audience, and competitive landscape in detail. We'll conduct a thorough audit of your current marketing efforts and present a customized strategy that aligns with your business objectives. Upon approval, we can begin campaign development immediately and have your first campaigns live within two weeks. Contact us to start driving measurable marketing results for your business.
    `;
  }

  private getGenericMockResponse(clientName: string, projectTitle: string, budget: string): string {
    return `
EXECUTIVE SUMMARY:
${clientName} requires a comprehensive solution that addresses your specific business challenges and drives measurable results. Our tailored approach combines industry expertise with proven methodologies to deliver outcomes that exceed expectations. We'll work closely with your team to understand your unique requirements and create a solution that not only solves current challenges but also positions your business for future growth and success.

PROJECT UNDERSTANDING:
We recognize that every business faces unique challenges that require customized solutions rather than one-size-fits-all approaches. Your specific needs demand careful analysis, strategic thinking, and expert execution to achieve the desired outcomes. Our team understands the importance of aligning our solution with your business objectives while considering your operational constraints and growth goals.

PROPOSED SOLUTION:
Our methodology begins with thorough discovery and analysis to understand your current situation and desired outcomes. We'll develop a comprehensive strategy that addresses your specific requirements while leveraging industry best practices. The implementation phase will be carefully managed with regular check-ins and progress updates. We'll ensure quality at every step while maintaining flexibility to adapt to changing requirements or new opportunities that arise during the project.

DELIVERABLES:
- Comprehensive project plan with detailed scope and milestones
- Custom solution designed specifically for your requirements
- Implementation support and project management
- Quality assurance and testing throughout the process
- Documentation and training materials for your team
- Post-implementation support and optimization
- Performance metrics and success measurement framework
- Regular progress reports and communication updates
- Final project review and recommendations for future enhancements

TIMELINE:
Week 1-2: Discovery, analysis, and strategic planning
Week 3-6: Implementation and development phase
Week 7: Testing, refinement, and quality assurance
Week 8: Final delivery, training, and project handover
This structured timeline ensures thorough execution while maintaining flexibility for adjustments based on your feedback and evolving needs.

INVESTMENT:
The project investment of ${budget} reflects the comprehensive nature of this custom solution and the value it will deliver to your business. This includes all planning, implementation, testing, and support activities outlined in this proposal. The return on investment will be realized through improved efficiency, enhanced capabilities, and achievement of your specific business objectives.

WHY CHOOSE US:
Our team brings extensive experience and a proven track record of successful project delivery across various industries. We pride ourselves on understanding each client's unique needs and delivering solutions that provide real business value. Our collaborative approach ensures clear communication throughout the project, and our commitment to quality guarantees results that meet or exceed your expectations.

NEXT STEPS:
We're ready to begin working on your project immediately upon approval. The first step is scheduling a detailed discovery session to finalize requirements and confirm project scope. We'll provide regular updates throughout the project and ensure you're completely satisfied with the results. Contact us to move forward with this exciting opportunity to transform your business operations.
    `;
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get current model information
   */
  getModelInfo(): { model: string; configured: boolean } {
    return {
      model: this.model,
      configured: this.isConfigured()
    };
  }
}

// Export singleton instance
export const anthropicClient = new AnthropicClient();
export default AnthropicClient;