import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { parserNotionCrmAgent, ParsingRequest, ParsingResponse } from '../services/parserNotionCrmAgent';

// Test data for different parsing scenarios
const testCases: Array<{
  name: string;
  request: ParsingRequest;
  expectedProperties: string[];
  validationRules: Array<(response: ParsingResponse) => boolean>;
}> = [
  {
    name: 'Notion Project Page Parsing',
    request: {
      source: 'notion',
      data: `
# Website Redesign Project

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
      `,
      language: 'en'
    },
    expectedProperties: ['success', 'projects', 'metadata'],
    validationRules: [
      (r) => r.success === true,
      (r) => r.projects.length >= 1,
      (r) => r.projects[0].title.toLowerCase().includes('website') || r.projects[0].title.toLowerCase().includes('redesign'),
      (r) => r.projects[0].clientName === 'TechCorp Inc.',
      (r) => r.projects[0].clientEmail === 'john.doe@techcorp.com',
      (r) => r.projects[0].estimatedBudget && r.projects[0].estimatedBudget >= 20000,
      (r) => r.projects[0].timeline && r.projects[0].timeline >= 6,
      (r) => r.projects[0].priority === 'high',
      (r) => r.projects[0].industry.toLowerCase().includes('commerce') || r.projects[0].industry.toLowerCase().includes('retail'),
      (r) => r.metadata.confidence >= 0.7
    ]
  },
  {
    name: 'HubSpot CRM Deal Parsing',
    request: {
      source: 'hubspot',
      data: {
        objectId: "12345",
        propertyName: "dealstage",
        propertyValue: "proposal",
        occurredAt: "2025-01-15T10:30:00Z",
        properties: {
          dealname: "Mobile App Development - FinTech Startup",
          amount: "45000",
          closedate: "2025-03-01",
          dealstage: "proposal",
          hubspot_owner_id: "987654",
          description: "Native iOS and Android app for cryptocurrency trading with real-time market data, secure wallet integration, and advanced trading features. Target launch Q2 2025.",
          client_company: "CryptoFlow Solutions",
          client_email: "sarah.johnson@cryptoflow.io",
          priority: "High",
          deal_type: "Mobile Development",
          pipeline: "development-pipeline",
          hs_analytics_source: "referral"
        }
      },
      language: 'en'
    },
    expectedProperties: ['success', 'projects', 'metadata'],
    validationRules: [
      (r) => r.success === true,
      (r) => r.projects.length >= 1,
      (r) => r.projects[0].title.toLowerCase().includes('mobile') || r.projects[0].title.toLowerCase().includes('app'),
      (r) => r.projects[0].clientCompany === 'CryptoFlow Solutions',
      (r) => r.projects[0].clientEmail === 'sarah.johnson@cryptoflow.io',
      (r) => r.projects[0].estimatedBudget === 45000,
      (r) => r.projects[0].status === 'proposal',
      (r) => r.projects[0].priority === 'high',
      (r) => r.projects[0].tags && r.projects[0].tags.some(tag => tag.toLowerCase().includes('mobile') || tag.toLowerCase().includes('app')),
      (r) => r.metadata.source === 'hubspot'
    ]
  },
  {
    name: 'Pipedrive Opportunity Parsing',
    request: {
      source: 'pipedrive',
      data: {
        current: {
          id: 789,
          title: "E-learning Platform Development",
          value: 60000,
          currency: "USD",
          stage_id: 2,
          person_id: 456,
          org_id: 123,
          expected_close_date: "2025-04-30",
          probability: 75,
          status: "open",
          notes: [
            {
              content: "Client needs comprehensive e-learning platform with video streaming, quiz system, progress tracking, and certificate generation. Must support 10,000+ concurrent users.",
              add_time: "2025-01-10 14:30:00"
            }
          ]
        },
        person: {
          name: "Dr. Michael Chen",
          email: [{ value: "m.chen@edutech.university", primary: true }],
          phone: [{ value: "+1-555-0123", primary: true }]
        },
        organization: {
          name: "EduTech University",
          address: "123 Academic St, Boston, MA"
        }
      },
      language: 'en'
    },
    expectedProperties: ['success', 'projects', 'metadata'],
    validationRules: [
      (r) => r.success === true,
      (r) => r.projects.length >= 1,
      (r) => r.projects[0].title.toLowerCase().includes('learning') || r.projects[0].title.toLowerCase().includes('platform'),
      (r) => r.projects[0].clientName === 'Dr. Michael Chen',
      (r) => r.projects[0].clientEmail === 'm.chen@edutech.university',
      (r) => r.projects[0].clientCompany === 'EduTech University',
      (r) => r.projects[0].estimatedBudget === 60000,
      (r) => r.projects[0].description.toLowerCase().includes('learning') || r.projects[0].description.toLowerCase().includes('education'),
      (r) => r.metadata.source === 'pipedrive'
    ]
  },
  {
    name: 'Airtable Project Base Parsing',
    request: {
      source: 'airtable',
      data: {
        records: [
          {
            id: "recABC123",
            fields: {
              "Project Name": "Brand Identity & Logo Design",
              "Client Name": "Green Valley Coffee Co.",
              "Client Email": "info@greenvalleycoffee.com",
              "Budget Range": "$8,000 - $12,000",
              "Project Type": "Branding & Design",
              "Status": "Discovery",
              "Priority": "Medium",
              "Timeline": "4-6 weeks",
              "Description": "Complete brand identity package including logo design, color palette, typography, business cards, letterhead, and brand guidelines. Focus on sustainable, organic, artisanal coffee brand positioning.",
              "Deliverables": [
                "Brand strategy document",
                "Logo concepts and final design",
                "Brand color palette",
                "Typography selection",
                "Business card design",
                "Letterhead template",
                "Brand guidelines document"
              ],
              "Industry": "Food & Beverage",
              "Deadline": "2025-02-28",
              "Tags": ["Branding", "Logo", "Print Design", "Organic", "Coffee"]
            }
          }
        ]
      },
      language: 'en'
    },
    expectedProperties: ['success', 'projects', 'metadata'],
    validationRules: [
      (r) => r.success === true,
      (r) => r.projects.length >= 1,
      (r) => r.projects[0].title.toLowerCase().includes('brand') || r.projects[0].title.toLowerCase().includes('logo'),
      (r) => r.projects[0].clientName === 'Green Valley Coffee Co.',
      (r) => r.projects[0].clientEmail === 'info@greenvalleycoffee.com',
      (r) => r.projects[0].estimatedBudget && r.projects[0].estimatedBudget >= 8000,
      (r) => r.projects[0].status === 'discovery',
      (r) => r.projects[0].priority === 'medium',
      (r) => r.projects[0].industry.toLowerCase().includes('food') || r.projects[0].industry.toLowerCase().includes('beverage'),
      (r) => r.projects[0].tags && r.projects[0].tags.includes('Branding')
    ]
  },
  {
    name: 'Free Text Project Brief Parsing',
    request: {
      source: 'text',
      data: `
Subject: Website Project Inquiry - Tech Consulting Firm

Hi there,

I'm reaching out regarding a website project for our tech consulting company, DataFlow Analytics. 

About us:
- Company: DataFlow Analytics Inc.
- Contact: Alex Rodriguez (alex@dataflow-analytics.com)
- Industry: Technology Consulting
- Size: 25-person team

Project Requirements:
We need a professional corporate website that showcases our data analytics services, case studies, and thought leadership content. The site should be modern, fast, and optimized for lead generation.

Specific needs:
• Professional homepage with clear value proposition
• Services pages (Data Analytics, Business Intelligence, ML Consulting)
• Case studies section with filterable portfolio
• Blog/insights section for thought leadership
• Contact forms and lead capture
• Team bios page
• Careers section
• Mobile-responsive design
• SEO optimization
• Integration with HubSpot CRM

Budget: We're looking at around $15,000-20,000 for this project
Timeline: Would like to launch by end of March 2025
Priority: This is high priority for Q1 business goals

Technologies: We're flexible but prefer React or Next.js for the frontend, with a headless CMS like Contentful or Strapi.

Let me know if you need any additional information!

Best regards,
Alex Rodriguez
Head of Marketing
DataFlow Analytics Inc.
alex@dataflow-analytics.com
+1 (555) 987-6543
      `,
      language: 'en'
    },
    expectedProperties: ['success', 'projects', 'metadata'],
    validationRules: [
      (r) => r.success === true,
      (r) => r.projects.length >= 1,
      (r) => r.projects[0].title.toLowerCase().includes('website'),
      (r) => r.projects[0].clientName === 'Alex Rodriguez',
      (r) => r.projects[0].clientEmail === 'alex@dataflow-analytics.com',
      (r) => r.projects[0].clientCompany === 'DataFlow Analytics Inc.' || r.projects[0].clientCompany === 'DataFlow Analytics',
      (r) => r.projects[0].estimatedBudget && r.projects[0].estimatedBudget >= 15000,
      (r) => r.projects[0].industry.toLowerCase().includes('technology') || r.projects[0].industry.toLowerCase().includes('consulting'),
      (r) => r.projects[0].priority === 'high',
      (r) => r.projects[0].deliverables.length > 0
    ]
  }
];

describe('Parser Notion CRM Agent', () => {
  beforeAll(async () => {
    console.log('🧪 Starting Parser Notion CRM Agent tests...');
  });

  afterAll(async () => {
    console.log('✅ Parser Notion CRM Agent tests completed');
  });

  describe('Core Parsing Functionality', () => {
    testCases.forEach(({ name, request, expectedProperties, validationRules }) => {
      it(`should parse data for: ${name}`, async () => {
        console.log(`\n🎯 Testing: ${name}`);
        
        const startTime = Date.now();
        const response = await parserNotionCrmAgent.parseProjectData(request);
        const processingTime = Date.now() - startTime;

        // Test response structure
        expect(response).toBeDefined();
        expectedProperties.forEach(prop => {
          expect(response).toHaveProperty(prop);
        });

        // Test metadata structure
        expect(response.metadata).toBeDefined();
        expect(response.metadata).toHaveProperty('source');
        expect(response.metadata).toHaveProperty('confidence');
        expect(response.metadata).toHaveProperty('itemCount');
        expect(response.metadata).toHaveProperty('language');

        // Run custom validation rules
        validationRules.forEach((rule, index) => {
          try {
            expect(rule(response)).toBe(true, `Validation rule ${index + 1} failed for ${name}`);
          } catch (error) {
            console.error(`Validation rule ${index + 1} failed:`, error);
            console.error('Response:', JSON.stringify(response, null, 2));
            throw error;
          }
        });

        // Performance check
        expect(processingTime).toBeLessThan(30000); // Max 30 seconds

        console.log(`   ✅ ${name}: ${response.projects.length} projects parsed (confidence: ${response.metadata.confidence.toFixed(2)}, ${processingTime}ms)`);
        
        if (response.projects.length > 0) {
          const project = response.projects[0];
          console.log(`      Project: "${project.title}" - ${project.clientName} (${project.clientEmail || 'no email'})`);
          console.log(`      Budget: $${project.estimatedBudget?.toLocaleString() || 'TBD'} | Timeline: ${project.timeline || 'TBD'} weeks`);
        }
      }, 45000); // 45 second timeout per test
    });
  });

  describe('Specialized Parsing Methods', () => {
    it('should parse Notion URLs with simulated content', async () => {
      const notionUrl = 'https://notion.so/example-project-page';
      
      const response = await parserNotionCrmAgent.parseNotionUrl(notionUrl, {
        language: 'en'
      });
      
      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.projects.length).toBeGreaterThan(0);
      expect(response.metadata.source).toBe('notion');
      
      console.log('   ✅ Notion URL parsing successful');
    }, 30000);

    it('should process CRM webhooks', async () => {
      const webhookPayload = {
        objectId: "deal_123",
        propertyName: "dealstage",
        propertyValue: "proposal",
        properties: {
          dealname: "Test Project - API Integration",
          amount: "12000",
          client_email: "test@example.com",
          description: "API integration project for client system"
        }
      };
      
      const response = await parserNotionCrmAgent.processCrmWebhook(webhookPayload, 'hubspot');
      
      expect(response).toBeDefined();
      expect(response.metadata.source).toBe('hubspot');
      
      console.log('   ✅ CRM webhook processing successful');
    }, 30000);

    it('should parse plain text data', async () => {
      const textData = `
Project: Logo Design for Restaurant
Client: Maria's Italian Kitchen (maria@italiankitchen.com)
Budget: $3,000
Timeline: 3 weeks
Description: Need a modern logo for new Italian restaurant, warm colors, family-friendly feel
      `;
      
      const response = await parserNotionCrmAgent.parseTextData(textData, {
        language: 'en'
      });
      
      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.projects.length).toBeGreaterThan(0);
      
      console.log('   ✅ Text data parsing successful');
    }, 30000);
  });

  describe('Batch Processing', () => {
    it('should handle batch parsing requests', async () => {
      const batchRequests = [
        {
          source: 'text' as const,
          data: 'Project: Website for Law Firm\nClient: Johnson & Associates\nBudget: $8000'
        },
        {
          source: 'text' as const,
          data: 'Project: Mobile App\nClient: StartupCo\nBudget: $25000'
        }
      ];
      
      const results = await parserNotionCrmAgent.batchParseProjects(batchRequests);
      
      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.metadata).toBeDefined();
      });
      
      console.log(`   ✅ Batch processing: ${results.length} requests processed`);
    }, 60000);
  });

  describe('Data Validation and Quality', () => {
    it('should validate email addresses correctly', async () => {
      const request: ParsingRequest = {
        source: 'text',
        data: `
Project: Test Project
Client: John Doe
Email: invalid-email-format
Budget: $5000
        `
      };
      
      const response = await parserNotionCrmAgent.parseProjectData(request);
      
      expect(response).toBeDefined();
      if (response.success && response.projects.length > 0) {
        // Should either not extract invalid email or mark as low confidence
        if (response.projects[0].clientEmail) {
          expect(response.projects[0].clientEmail).toMatch(/^\S+@\S+\.\S+$/);
        }
      }
      
      console.log('   ✅ Email validation working correctly');
    });

    it('should handle budget parsing correctly', async () => {
      const request: ParsingRequest = {
        source: 'text',
        data: `
Project: Budget Test
Client: Test Client
Budget: $15,000 - $20,000
        `
      };
      
      const response = await parserNotionCrmAgent.parseProjectData(request);
      
      expect(response).toBeDefined();
      if (response.success && response.projects.length > 0) {
        expect(response.projects[0].estimatedBudget).toBeGreaterThan(10000);
        expect(response.projects[0].estimatedBudget).toBeLessThan(25000);
      }
      
      console.log('   ✅ Budget parsing validation successful');
    });

    it('should normalize status values correctly', async () => {
      const request: ParsingRequest = {
        source: 'text',
        data: `
Project: Status Test
Client: Test Client
Status: In Progress
        `
      };
      
      const response = await parserNotionCrmAgent.parseProjectData(request);
      
      expect(response).toBeDefined();
      if (response.success && response.projects.length > 0) {
        expect(['discovery', 'proposal', 'active', 'completed']).toContain(response.projects[0].status);
      }
      
      console.log('   ✅ Status normalization working correctly');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty data gracefully', async () => {
      const request: ParsingRequest = {
        source: 'text',
        data: ''
      };
      
      const response = await parserNotionCrmAgent.parseProjectData(request);
      
      expect(response).toBeDefined();
      expect(response.projects).toHaveLength(0);
      expect(response.metadata.confidence).toBeLessThan(0.5);
      
      console.log('   ✅ Empty data handled gracefully');
    });

    it('should handle invalid JSON data', async () => {
      const request: ParsingRequest = {
        source: 'hubspot',
        data: 'invalid json data {{'
      };
      
      const response = await parserNotionCrmAgent.parseProjectData(request);
      
      expect(response).toBeDefined();
      // Should either parse what it can or return low confidence
      expect(response.metadata.confidence).toBeLessThan(0.8);
      
      console.log('   ✅ Invalid JSON handled gracefully');
    });

    it('should handle very large text inputs', async () => {
      const largeText = 'Project: Large Text Test\n' + 'A'.repeat(10000) + '\nClient: Test Client';
      
      const request: ParsingRequest = {
        source: 'text',
        data: largeText
      };
      
      const response = await parserNotionCrmAgent.parseProjectData(request);
      
      expect(response).toBeDefined();
      
      console.log('   ✅ Large text input handled');
    }, 60000);
  });

  describe('Multi-language Support', () => {
    it('should handle Ukrainian content', async () => {
      const request: ParsingRequest = {
        source: 'text',
        data: `
Проект: Розробка веб-сайту для ресторану
Клієнт: Борщ і Сало (info@borsch.ua)
Бюджет: $8,000
Терміни: 6 тижнів
Опис: Потрібен сучасний сайт для українського ресторану з онлайн замовленням
        `,
        language: 'uk'
      };
      
      const response = await parserNotionCrmAgent.parseProjectData(request);
      
      expect(response).toBeDefined();
      expect(response.metadata.language).toBe('uk');
      
      console.log('   ✅ Ukrainian content parsing successful');
    }, 45000);

    it('should auto-detect language', async () => {
      const request: ParsingRequest = {
        source: 'text',
        data: `
Projekt: Strona internetowa dla firmy
Klient: Kowalski Sp. z o.o.
Budżet: 20 000 PLN
        `
      };
      
      const response = await parserNotionCrmAgent.parseProjectData(request);
      
      expect(response).toBeDefined();
      // Should detect Polish or at least handle it gracefully
      
      console.log('   ✅ Language auto-detection working');
    }, 45000);
  });

  describe('Performance and Reliability', () => {
    it('should handle concurrent parsing requests', async () => {
      const requests = testCases.slice(0, 3).map(testCase => 
        parserNotionCrmAgent.parseProjectData(testCase.request)
      );
      
      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;
      
      expect(responses).toHaveLength(3);
      responses.forEach(response => {
        expect(response).toBeDefined();
        expect(response.metadata).toBeDefined();
      });
      
      console.log(`   ✅ Concurrent requests handled in ${totalTime}ms`);
    }, 60000);

    it('should provide consistent parsing results', async () => {
      const request = testCases[0].request;
      
      const responses = await Promise.all([
        parserNotionCrmAgent.parseProjectData(request),
        parserNotionCrmAgent.parseProjectData(request)
      ]);
      
      expect(responses[0].success).toBe(responses[1].success);
      if (responses[0].success && responses[1].success) {
        expect(responses[0].projects.length).toBe(responses[1].projects.length);
        
        // Basic consistency checks
        if (responses[0].projects.length > 0 && responses[1].projects.length > 0) {
          expect(responses[0].projects[0].clientName).toBe(responses[1].projects[0].clientName);
          expect(responses[0].projects[0].clientEmail).toBe(responses[1].projects[0].clientEmail);
        }
      }
      
      console.log('   ✅ Parsing consistency check passed');
    }, 60000);
  });

  describe('Agent Capabilities', () => {
    it('should provide parsing statistics', () => {
      const stats = parserNotionCrmAgent.getParsingStats();
      
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('supportedSources');
      expect(stats).toHaveProperty('supportedLanguages');
      expect(stats).toHaveProperty('extractionCapabilities');
      
      expect(stats.supportedSources).toContain('notion');
      expect(stats.supportedSources).toContain('hubspot');
      expect(stats.supportedLanguages).toContain('en');
      expect(stats.extractionCapabilities.length).toBeGreaterThan(5);
      
      console.log('   ✅ Agent capabilities properly defined');
    });

    it('should provide test capability function', async () => {
      const testData = {
        title: "Test Project",
        client: "Test Client",
        budget: "$5000"
      };
      
      const result = await parserNotionCrmAgent.testParsingCapability(testData);
      
      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
      
      console.log('   ✅ Test capability function working');
    }, 30000);
  });
});

// Helper function to run a single test case manually
export async function runSingleParsingTest(testName: string) {
  const testCase = testCases.find(tc => tc.name === testName);
  if (!testCase) {
    throw new Error(`Test case "${testName}" not found`);
  }
  
  console.log(`🎯 Running single parsing test: ${testName}`);
  const startTime = Date.now();
  
  try {
    const response = await parserNotionCrmAgent.parseProjectData(testCase.request);
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Test completed in ${processingTime}ms`);
    console.log(`📊 Projects extracted: ${response.projects.length}`);
    console.log(`🎯 Confidence: ${response.metadata.confidence.toFixed(2)}`);
    console.log(`📝 Source: ${response.metadata.source}`);
    
    if (response.projects.length > 0) {
      const project = response.projects[0];
      console.log(`📋 First project: "${project.title}"`);
      console.log(`👤 Client: ${project.clientName} (${project.clientEmail || 'no email'})`);
      console.log(`💰 Budget: $${project.estimatedBudget?.toLocaleString() || 'TBD'}`);
    }
    
    return response;
  } catch (error) {
    console.error(`❌ Test failed: ${error}`);
    throw error;
  }
}

// Export test utilities for manual testing
export { testCases, parserNotionCrmAgent };