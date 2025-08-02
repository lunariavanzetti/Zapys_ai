// AI Proposal Generator Examples and Test Cases
// Demonstrates various usage scenarios and provides test data

import { aiService } from '../services/aiService';
import { ProposalGenerationRequest } from '../services/aiProposalGenerator';

/**
 * Example 1: Web Design Project
 */
export const webDesignExample: ProposalGenerationRequest = {
  projectData: {
    title: 'Modern E-commerce Website',
    clientName: 'Sarah Johnson',
    clientEmail: 'sarah@fashionboutique.com',
    clientCompany: 'Fashion Boutique Co.',
    description: 'We need a modern, mobile-responsive e-commerce website to sell our fashion products online. The site should include product catalog, shopping cart, secure checkout, user accounts, and inventory management. We want a clean, elegant design that reflects our brand aesthetic.',
    estimatedBudget: 12000,
    timeline: 8,
    industry: 'Fashion & Retail',
    deliverables: [
      'Custom e-commerce website design',
      'Mobile-responsive layout',
      'Shopping cart and checkout system',
      'User account management',
      'Product catalog with search and filters',
      'Payment gateway integration',
      'Inventory management system',
      'SEO optimization',
      'Content management system'
    ]
  },
  userPreferences: {
    tone: 'professional',
    language: 'en',
    brandVoice: 'Elegant, sophisticated, and customer-focused. We value quality craftsmanship and personalized service.',
    customInstructions: 'Please emphasize our experience with fashion e-commerce and include mobile-first approach.'
  },
  templateType: 'web_design'
};

/**
 * Example 2: Software Development Project
 */
export const softwareDevelopmentExample: ProposalGenerationRequest = {
  projectData: {
    title: 'Restaurant Management System',
    clientName: 'Marco Rodriguez',
    clientEmail: 'marco@bistroitalia.com',
    clientCompany: 'Bistro Italia',
    description: 'We need a comprehensive restaurant management system that handles reservations, table management, order processing, inventory tracking, staff scheduling, and financial reporting. The system should integrate with our existing POS system and provide real-time analytics.',
    estimatedBudget: 25000,
    timeline: 12,
    industry: 'Restaurant & Hospitality',
    deliverables: [
      'Custom restaurant management software',
      'Reservation and table management',
      'Order processing system',
      'Inventory tracking and alerts',
      'Staff scheduling module',
      'Financial reporting dashboard',
      'POS system integration',
      'Real-time analytics',
      'Mobile app for staff',
      'Customer notification system'
    ]
  },
  userPreferences: {
    tone: 'friendly',
    language: 'en',
    brandVoice: 'Warm, family-oriented, and passionate about authentic Italian cuisine and hospitality.',
    customInstructions: 'Please highlight our understanding of restaurant operations and include scalability for multiple locations.'
  },
  templateType: 'development'
};

/**
 * Example 3: Branding Project
 */
export const brandingExample: ProposalGenerationRequest = {
  projectData: {
    title: 'Complete Brand Identity Package',
    clientName: 'Dr. Emily Chen',
    clientEmail: 'emily@wellnesscenter.com',
    clientCompany: 'Harmony Wellness Center',
    description: 'We are opening a new wellness center focused on holistic health, yoga, meditation, and natural healing. We need a complete brand identity that conveys peace, healing, and natural wellness. This includes logo design, color palette, typography, brand guidelines, and marketing materials.',
    estimatedBudget: 8000,
    timeline: 6,
    industry: 'Health & Wellness',
    deliverables: [
      'Logo design and variations',
      'Brand color palette',
      'Typography system',
      'Brand guidelines document',
      'Business card design',
      'Letterhead and envelope design',
      'Social media templates',
      'Website header graphics',
      'Signage design concepts',
      'Marketing brochure template'
    ]
  },
  userPreferences: {
    tone: 'premium',
    language: 'en',
    brandVoice: 'Calming, trustworthy, and focused on natural wellness and holistic healing approaches.',
    customInstructions: 'Please emphasize our experience with wellness brands and understanding of the holistic health market.'
  },
  templateType: 'branding'
};

/**
 * Example 4: Marketing Campaign
 */
export const marketingExample: ProposalGenerationRequest = {
  projectData: {
    title: 'Digital Marketing Campaign Launch',
    clientName: 'James Wilson',
    clientEmail: 'james@techstartup.io',
    clientCompany: 'InnovateTech Solutions',
    description: 'We are launching a new SaaS product for small businesses and need a comprehensive digital marketing campaign. This includes social media marketing, content creation, email campaigns, PPC advertising, SEO optimization, and lead generation strategies to reach our target audience of small business owners.',
    estimatedBudget: 15000,
    timeline: 10,
    industry: 'Technology & SaaS',
    deliverables: [
      'Marketing strategy and campaign plan',
      'Social media content calendar',
      'Blog post and article creation',
      'Email marketing sequences',
      'PPC advertising campaigns',
      'Landing page optimization',
      'Lead magnet creation',
      'SEO content optimization',
      'Performance tracking dashboard',
      'Monthly performance reports'
    ]
  },
  userPreferences: {
    tone: 'casual',
    language: 'en',
    brandVoice: 'Innovative, approachable, and focused on helping small businesses succeed through technology.',
    customInstructions: 'Please highlight our experience with SaaS marketing and B2B lead generation.'
  },
  templateType: 'marketing'
};

/**
 * Example 5: Multilingual Project (Ukrainian)
 */
export const ukrainianExample: ProposalGenerationRequest = {
  projectData: {
    title: 'Інтернет-магазин ручної роботи',
    clientName: 'Олена Петренко',
    clientEmail: 'olena@handmade.ua',
    clientCompany: 'Майстерня Традицій',
    description: 'Нам потрібен сучасний інтернет-магазин для продажу виробів ручної роботи - вишиванок, керамічних виробів, дерев\'яних іграшок та інших традиційних українських виробів. Сайт повинен мати каталог товарів, кошик, систему оплати, особисті кабінети покупців.',
    estimatedBudget: 8000,
    timeline: 6,
    industry: 'Ремесла та рукоділля',
    deliverables: [
      'Дизайн інтернет-магазину',
      'Каталог товарів з фільтрами',
      'Система оплати',
      'Особисті кабінети',
      'Адмін-панель',
      'Мобільна версія',
      'SEO оптимізація'
    ]
  },
  userPreferences: {
    tone: 'friendly',
    language: 'uk',
    brandVoice: 'Традиційний, теплий, орієнтований на збереження українських традицій та підтримку місцевих майстрів.',
    customInstructions: 'Будь ласка, підкресліть наш досвід роботи з українськими брендами та розуміння місцевого ринку.'
  },
  templateType: 'web_design'
};

/**
 * Test Cases for Validation
 */
export const testCases = {
  // Valid minimal request
  validMinimal: {
    projectData: {
      title: 'Test Project',
      clientName: 'Test Client',
      description: 'This is a test project description with sufficient length.'
    },
    userPreferences: {
      tone: 'professional' as const,
      language: 'en' as const
    }
  },

  // Invalid - missing required fields
  invalidMissingTitle: {
    projectData: {
      clientName: 'Test Client',
      description: 'This is a test project description.'
    },
    userPreferences: {
      tone: 'professional' as const,
      language: 'en' as const
    }
  },

  // Invalid - description too short
  invalidShortDescription: {
    projectData: {
      title: 'Test Project',
      clientName: 'Test Client',
      description: 'Short'
    },
    userPreferences: {
      tone: 'professional' as const,
      language: 'en' as const
    }
  },

  // Invalid - wrong tone
  invalidTone: {
    projectData: {
      title: 'Test Project',
      clientName: 'Test Client',
      description: 'This is a test project description.'
    },
    userPreferences: {
      tone: 'invalid_tone' as any,
      language: 'en' as const
    }
  }
};

/**
 * Demo function to test all examples
 */
export async function runExamples() {
  console.log('🚀 Running AI Proposal Generator Examples...\n');

  const examples = [
    { name: 'Web Design Project', data: webDesignExample },
    { name: 'Software Development Project', data: softwareDevelopmentExample },
    { name: 'Branding Project', data: brandingExample },
    { name: 'Marketing Campaign', data: marketingExample },
    { name: 'Ukrainian Project', data: ukrainianExample }
  ];

  for (const example of examples) {
    console.log(`📋 Testing: ${example.name}`);
    
    try {
      const result = await aiService.generateProposal(example.data);
      
      if (result.success) {
        console.log(`✅ Success! Generated ${result.content.metadata.wordCount} words`);
        console.log(`   Title: ${result.content.title}`);
        console.log(`   Tone: ${result.content.metadata.tone}`);
        console.log(`   Language: ${result.content.metadata.language}`);
        if (result.pricing) {
          console.log(`   Budget: $${result.pricing.total.toLocaleString()}`);
        }
      } else {
        console.log(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error}`);
    }
    
    console.log(''); // Empty line for spacing
  }

  console.log('🧪 Testing Validation...\n');

  // Test validation cases
  const validationTests = [
    { name: 'Valid Minimal', data: testCases.validMinimal, shouldPass: true },
    { name: 'Missing Title', data: testCases.invalidMissingTitle, shouldPass: false },
    { name: 'Short Description', data: testCases.invalidShortDescription, shouldPass: false },
    { name: 'Invalid Tone', data: testCases.invalidTone, shouldPass: false }
  ];

  for (const test of validationTests) {
    const validation = aiService.validateProposalRequest(test.data as any);
    const passed = validation.isValid === test.shouldPass;
    
    console.log(`${passed ? '✅' : '❌'} ${test.name}: ${validation.isValid ? 'Valid' : `Invalid - ${validation.errors.join(', ')}`}`);
  }

  console.log('\n🎉 All examples completed!');
}

/**
 * Quick test function for development
 */
export async function quickTest() {
  console.log('🔥 Quick Test: Generating web design proposal...');
  
  try {
    const result = await aiService.generateQuickProposal(
      'Modern Portfolio Website',
      'Alex Designer',
      'I need a modern, creative portfolio website to showcase my graphic design work. The site should be visually stunning, mobile-friendly, and include a gallery, about page, contact form, and blog.',
      {
        budget: 5000,
        timeline: 4,
        tone: 'premium',
        templateType: 'web_design'
      }
    );

    if (result.success) {
      console.log('✅ Quick test successful!');
      console.log(`Generated proposal: ${result.content.title}`);
      console.log(`Word count: ${result.content.metadata.wordCount}`);
      console.log('Executive Summary:');
      console.log(result.content.sections.executive_summary);
    } else {
      console.log('❌ Quick test failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Quick test error:', error);
  }
}

/**
 * Service status check
 */
export function checkServiceStatus() {
  const status = aiService.getStatus();
  
  console.log('🔍 AI Service Status:');
  console.log(`   Configured: ${status.configured ? '✅' : '❌'}`);
  console.log(`   Default Tone: ${status.defaultTone}`);
  console.log(`   Default Language: ${status.defaultLanguage}`);
  console.log(`   Available Templates: ${status.availableTemplates}`);
  
  const templates = aiService.getAvailableTemplates();
  console.log('\n📋 Available Templates:');
  templates.forEach(template => {
    console.log(`   • ${template.name} - ${template.description}`);
  });
  
  const languages = aiService.getSupportedLanguages();
  console.log('\n🌍 Supported Languages:');
  languages.forEach(lang => {
    console.log(`   • ${lang.name} (${lang.nativeName})`);
  });
  
  const tones = aiService.getAvailableTones();
  console.log('\n🎨 Available Tones:');
  tones.forEach(tone => {
    console.log(`   • ${tone.name} - ${tone.description}`);
  });
}

// Export for easy testing in console
if (typeof window !== 'undefined') {
  (window as any).aiExamples = {
    runExamples,
    quickTest,
    checkServiceStatus,
    webDesignExample,
    softwareDevelopmentExample,
    brandingExample,
    marketingExample,
    ukrainianExample
  };
}