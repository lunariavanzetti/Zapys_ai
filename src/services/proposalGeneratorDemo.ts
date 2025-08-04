// Demo/Test file for AI Proposal Generator
// Shows how to use the proposal generator with different templates and configurations

import { aiProposalGenerator, ProposalGenerationRequest } from './aiProposalGenerator';

/**
 * Demo function showing how to generate proposals for different project types
 */
export async function runProposalGeneratorDemo() {
  console.log('🚀 AI Proposal Generator Demo Starting...\n');

  // Example 1: Web Design Project
  const webDesignRequest: ProposalGenerationRequest = {
    projectData: {
      title: 'Modern E-commerce Website Redesign',
      clientName: 'TechStyle Boutique',
      clientCompany: 'TechStyle Inc.',
      clientEmail: 'sarah@techstyle.com',
      description: 'We need a complete redesign of our fashion e-commerce website to improve user experience, increase conversions, and modernize our brand presence. The current site is outdated and not mobile-friendly.',
      deliverables: ['Responsive website design', 'Shopping cart integration', 'Payment gateway setup', 'SEO optimization'],
      estimatedBudget: 15000,
      timeline: 8,
      industry: 'Fashion & Retail'
    },
    userPreferences: {
      tone: 'professional',
      language: 'en',
      brandVoice: 'Modern, trustworthy, and results-driven',
      customInstructions: 'Emphasize our experience with e-commerce and conversion optimization'
    },
    templateType: 'ecommerce'
  };

  try {
    console.log('📝 Generating Web Design/E-commerce Proposal...');
    const webProposal = await aiProposalGenerator.generateProposalJSON(webDesignRequest);
    console.log('✅ Web Design Proposal Generated Successfully!');
    console.log(`📊 Word Count: ${webProposal.content.metadata.wordCount}`);
    console.log(`⏱️ Reading Time: ${webProposal.content.metadata.estimatedReadingTime} minutes`);
    console.log(`💰 Total Investment: $${webProposal.pricing.total.toLocaleString()}\n`);
  } catch (error) {
    console.error('❌ Error generating web design proposal:', error);
  }

  // Example 2: Mobile App Development
  const mobileAppRequest: ProposalGenerationRequest = {
    projectData: {
      title: 'Fitness Tracking Mobile App',
      clientName: 'FitLife Solutions',
      clientCompany: 'FitLife Health Corp',
      description: 'Develop a comprehensive fitness tracking app with workout plans, nutrition tracking, progress monitoring, and social features. Target both iOS and Android platforms.',
      deliverables: ['iOS and Android apps', 'Backend API', 'Admin dashboard', 'App store deployment'],
      estimatedBudget: 45000,
      timeline: 16,
      industry: 'Health & Fitness'
    },
    userPreferences: {
      tone: 'friendly',
      language: 'en',
      brandVoice: 'Innovative, health-focused, and user-centric'
    },
    templateType: 'mobile_app'
  };

  try {
    console.log('📱 Generating Mobile App Proposal...');
    const mobileProposal = await aiProposalGenerator.generateProposalJSON(mobileAppRequest);
    console.log('✅ Mobile App Proposal Generated Successfully!');
    console.log(`📊 Word Count: ${mobileProposal.content.metadata.wordCount}`);
    console.log(`⏱️ Reading Time: ${mobileProposal.content.metadata.estimatedReadingTime} minutes`);
    console.log(`💰 Total Investment: $${mobileProposal.pricing.total.toLocaleString()}\n`);
  } catch (error) {
    console.error('❌ Error generating mobile app proposal:', error);
  }

  // Example 3: Business Consulting
  const consultingRequest: ProposalGenerationRequest = {
    projectData: {
      title: 'Digital Transformation Strategy',
      clientName: 'Global Manufacturing Inc.',
      description: 'Help our traditional manufacturing business develop and implement a comprehensive digital transformation strategy to improve efficiency, reduce costs, and stay competitive in the modern market.',
      estimatedBudget: 25000,
      timeline: 12,
      industry: 'Manufacturing'
    },
    userPreferences: {
      tone: 'premium',
      language: 'en',
      brandVoice: 'Executive-level, strategic, and transformation-focused'
    },
    templateType: 'consulting'
  };

  try {
    console.log('💼 Generating Business Consulting Proposal...');
    const consultingProposal = await aiProposalGenerator.generateProposalJSON(consultingRequest);
    console.log('✅ Consulting Proposal Generated Successfully!');
    console.log(`📊 Word Count: ${consultingProposal.content.metadata.wordCount}`);
    console.log(`⏱️ Reading Time: ${consultingProposal.content.metadata.estimatedReadingTime} minutes`);
    console.log(`💰 Total Investment: $${consultingProposal.pricing.total.toLocaleString()}\n`);
  } catch (error) {
    console.error('❌ Error generating consulting proposal:', error);
  }

  console.log('🎉 AI Proposal Generator Demo Completed!');
}

/**
 * Test function for different languages and tones
 */
export async function testLanguagesAndTones() {
  console.log('🌍 Testing Different Languages and Tones...\n');

  const baseRequest: ProposalGenerationRequest = {
    projectData: {
      title: 'Website Development Project',
      clientName: 'Local Business',
      description: 'Create a professional website for our local business to attract more customers and showcase our services.',
      estimatedBudget: 8000,
      timeline: 6,
      industry: 'Local Business'
    },
    userPreferences: {
      tone: 'professional',
      language: 'en'
    },
    templateType: 'web_design'
  };

  const testCases = [
    { tone: 'professional', language: 'en', label: 'Professional English' },
    { tone: 'friendly', language: 'en', label: 'Friendly English' },
    { tone: 'premium', language: 'en', label: 'Premium English' },
    { tone: 'casual', language: 'en', label: 'Casual English' }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`🧪 Testing ${testCase.label}...`);
      const request = {
        ...baseRequest,
        userPreferences: {
          ...baseRequest.userPreferences,
          tone: testCase.tone as any,
          language: testCase.language as any
        }
      };

      const proposal = await aiProposalGenerator.generateProposalJSON(request);
      console.log(`✅ ${testCase.label} - Success! (${proposal.content.metadata.wordCount} words)\n`);
    } catch (error) {
      console.error(`❌ ${testCase.label} - Error:`, error);
    }
  }
}

/**
 * Export available templates for reference
 */
export const availableTemplates = [
  { key: 'web_design', name: 'Web Design & Development', industry: 'Web Design & Development' },
  { key: 'development', name: 'Software Development', industry: 'Software Development' },
  { key: 'branding', name: 'Brand Identity & Design', industry: 'Branding & Design' },
  { key: 'marketing', name: 'Digital Marketing', industry: 'Marketing & Advertising' },
  { key: 'ecommerce', name: 'E-commerce Solutions', industry: 'E-commerce & Online Retail' },
  { key: 'mobile_app', name: 'Mobile App Development', industry: 'Mobile App Development' },
  { key: 'consulting', name: 'Business Consulting', industry: 'Business Consulting & Strategy' },
  { key: 'custom', name: 'Custom Solutions', industry: 'Custom Solutions' }
];

/**
 * Helper function to create a sample proposal request
 */
export function createSampleRequest(templateType: string, customizations?: Partial<ProposalGenerationRequest>): ProposalGenerationRequest {
  const baseRequest: ProposalGenerationRequest = {
    projectData: {
      title: 'Sample Project',
      clientName: 'Sample Client',
      description: 'This is a sample project description for demonstration purposes.',
      estimatedBudget: 10000,
      timeline: 8,
      industry: 'Technology'
    },
    userPreferences: {
      tone: 'professional',
      language: 'en'
    },
    templateType: templateType as any
  };

  return {
    ...baseRequest,
    ...customizations,
    projectData: {
      ...baseRequest.projectData,
      ...customizations?.projectData
    },
    userPreferences: {
      ...baseRequest.userPreferences,
      ...customizations?.userPreferences
    }
  };
}

// Export the main generator for easy access
export { aiProposalGenerator };