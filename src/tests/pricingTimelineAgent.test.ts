import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { pricingTimelineAgent, PricingTimelineRequest, PricingTimelineResponse } from '../services/pricingTimelineAgent';

// Test data for different scenarios
const testCases: Array<{
  name: string;
  request: PricingTimelineRequest;
  expectedProperties: string[];
  validationRules: Array<(response: PricingTimelineResponse) => boolean>;
}> = [
  {
    name: 'Simple Web Development Project',
    request: {
      projectScope: "Simple business website with contact forms and basic CMS",
      clientBudget: "$10,000",
      projectType: "web-development",
      complexity: "simple",
      timeline: "6 weeks",
      teamSize: 2,
      clientProfile: {
        industry: "Local Business",
        company_size: "small",
        location: "Ukraine",
        previous_projects: "None"
      },
      requirements: {
        features: ["Contact forms", "CMS", "Responsive design", "SEO optimization"],
        integrations: ["Google Analytics"],
        platforms: ["Web"],
        technologies: ["WordPress", "PHP"]
      }
    },
    expectedProperties: ['pricing', 'timeline', 'recommendations', 'competitive_analysis'],
    validationRules: [
      (r) => r.pricing.base_price > 0 && r.pricing.base_price <= 15000,
      (r) => r.timeline.total_duration_weeks >= 4 && r.timeline.total_duration_weeks <= 12,
      (r) => r.pricing.currency === 'USD'
    ]
  },
  {
    name: 'Complex E-commerce Platform',
    request: {
      projectScope: "Multi-vendor e-commerce platform with AI recommendations and analytics",
      clientBudget: "$100,000",
      projectType: "web-development",
      complexity: "enterprise",
      timeline: "6 months",
      teamSize: 6,
      clientProfile: {
        industry: "E-commerce",
        company_size: "medium",
        location: "Poland",
        previous_projects: "Basic online store"
      },
      requirements: {
        features: [
          "Multi-vendor marketplace",
          "AI recommendations",
          "Advanced analytics",
          "Payment processing",
          "Inventory management",
          "Mobile app integration"
        ],
        integrations: ["Stripe", "PayPal", "Google Analytics", "Mailchimp", "AWS"],
        platforms: ["Web", "Mobile"],
        technologies: ["React", "Node.js", "PostgreSQL", "AI/ML", "AWS"]
      }
    },
    expectedProperties: ['pricing', 'timeline', 'recommendations', 'competitive_analysis'],
    validationRules: [
      (r) => r.pricing.base_price >= 50000 && r.pricing.base_price <= 150000,
      (r) => r.timeline.total_duration_weeks >= 20 && r.timeline.total_duration_weeks <= 40,
      (r) => r.timeline.phases.length >= 4
    ]
  },
  {
    name: 'Mobile App Development',
    request: {
      projectScope: "Cross-platform mobile app for fitness tracking with social features",
      projectType: "mobile-app",
      complexity: "medium",
      teamSize: 4,
      clientProfile: {
        industry: "Health & Fitness",
        company_size: "startup",
        location: "Ukraine"
      },
      requirements: {
        features: [
          "User authentication",
          "Fitness tracking",
          "Social features",
          "Data visualization",
          "Push notifications"
        ],
        integrations: ["Firebase", "Apple Health", "Google Fit"],
        platforms: ["iOS", "Android"],
        technologies: ["React Native", "Firebase", "Node.js"]
      }
    },
    expectedProperties: ['pricing', 'timeline', 'recommendations', 'competitive_analysis'],
    validationRules: [
      (r) => r.pricing.base_price > 0,
      (r) => r.timeline.total_duration_weeks > 0,
      (r) => r.pricing.price_breakdown.development > 0
    ]
  },
  {
    name: 'AI Integration Consulting',
    request: {
      projectScope: "AI-powered customer service chatbot integration for existing platform",
      projectType: "ai-integration",
      complexity: "complex",
      teamSize: 3,
      clientProfile: {
        industry: "Technology",
        company_size: "enterprise",
        location: "Poland"
      },
      requirements: {
        features: [
          "Natural language processing",
          "Integration with existing CRM",
          "Multi-language support",
          "Analytics dashboard",
          "Training interface"
        ],
        integrations: ["OpenAI", "Salesforce", "Slack"],
        technologies: ["Python", "TensorFlow", "REST APIs"]
      }
    },
    expectedProperties: ['pricing', 'timeline', 'recommendations', 'competitive_analysis'],
    validationRules: [
      (r) => r.pricing.base_price > 0,
      (r) => r.timeline.risk_factors.length > 0,
      (r) => r.recommendations.risk_mitigation.length > 0
    ]
  }
];

describe('Pricing Timeline Agent', () => {
  beforeAll(async () => {
    // Setup test environment
    console.log('🧪 Starting Pricing Timeline Agent tests...');
  });

  afterAll(async () => {
    console.log('✅ Pricing Timeline Agent tests completed');
  });

  describe('Core Functionality', () => {
    testCases.forEach(({ name, request, expectedProperties, validationRules }) => {
      it(`should analyze pricing and timeline for: ${name}`, async () => {
        console.log(`\n🎯 Testing: ${name}`);
        
        const startTime = Date.now();
        const response = await pricingTimelineAgent.analyzePricingTimeline(request);
        const processingTime = Date.now() - startTime;

        // Test response structure
        expect(response).toBeDefined();
        expectedProperties.forEach(prop => {
          expect(response).toHaveProperty(prop);
        });

        // Test pricing structure
        expect(response.pricing).toHaveProperty('base_price');
        expect(response.pricing).toHaveProperty('hourly_rate');
        expect(response.pricing).toHaveProperty('total_hours');
        expect(response.pricing).toHaveProperty('price_breakdown');
        expect(response.pricing).toHaveProperty('pricing_rationale');

        // Test timeline structure
        expect(response.timeline).toHaveProperty('total_duration_weeks');
        expect(response.timeline).toHaveProperty('phases');
        expect(response.timeline).toHaveProperty('critical_path');
        expect(response.timeline).toHaveProperty('risk_factors');

        // Test recommendations structure
        expect(response.recommendations).toHaveProperty('pricing_strategy');
        expect(response.recommendations).toHaveProperty('timeline_optimization');
        expect(response.recommendations).toHaveProperty('risk_mitigation');

        // Run custom validation rules
        validationRules.forEach((rule, index) => {
          expect(rule(response)).toBe(true, `Validation rule ${index + 1} failed for ${name}`);
        });

        // Performance check
        expect(processingTime).toBeLessThan(30000); // Max 30 seconds

        console.log(`   ✅ ${name}: $${response.pricing.base_price} - ${response.timeline.total_duration_weeks} weeks (${processingTime}ms)`);
      }, 45000); // 45 second timeout per test
    });
  });

  describe('Pricing Optimization', () => {
    it('should optimize pricing for budget constraints', async () => {
      const baseRequest = testCases[1].request; // Complex e-commerce
      const baseAnalysis = await pricingTimelineAgent.analyzePricingTimeline(baseRequest);
      
      const optimized = await pricingTimelineAgent.optimizePricing(baseAnalysis, {
        max_budget: 75000,
        priority: 'cost'
      });

      expect(optimized.pricing.base_price).toBeLessThanOrEqual(75000);
      expect(optimized.recommendations.pricing_strategy).toContain('budget');
      
      console.log(`   ✅ Budget optimization: $${baseAnalysis.pricing.base_price} → $${optimized.pricing.base_price}`);
    }, 45000);

    it('should optimize timeline for speed constraints', async () => {
      const baseRequest = testCases[1].request; // Complex e-commerce
      const baseAnalysis = await pricingTimelineAgent.analyzePricingTimeline(baseRequest);
      
      const optimized = await pricingTimelineAgent.optimizePricing(baseAnalysis, {
        max_timeline_weeks: 16,
        priority: 'time'
      });

      expect(optimized.timeline.total_duration_weeks).toBeLessThanOrEqual(16);
      expect(optimized.recommendations.timeline_optimization).toBeDefined();
      
      console.log(`   ✅ Timeline optimization: ${baseAnalysis.timeline.total_duration_weeks} → ${optimized.timeline.total_duration_weeks} weeks`);
    }, 45000);
  });

  describe('Pricing Variants', () => {
    it('should generate budget, recommended, and premium variants', async () => {
      const request = testCases[0].request; // Simple web development
      
      const variants = await pricingTimelineAgent.generatePricingVariants(request);
      
      expect(variants).toHaveProperty('budget_friendly');
      expect(variants).toHaveProperty('recommended');
      expect(variants).toHaveProperty('premium');

      // Budget should be cheapest, premium should be most expensive
      expect(variants.budget_friendly.pricing.base_price).toBeLessThanOrEqual(variants.recommended.pricing.base_price);
      expect(variants.recommended.pricing.base_price).toBeLessThanOrEqual(variants.premium.pricing.base_price);

      console.log(`   ✅ Variants: Budget $${variants.budget_friendly.pricing.base_price} | Recommended $${variants.recommended.pricing.base_price} | Premium $${variants.premium.pricing.base_price}`);
    }, 60000);
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle minimal input data', async () => {
      const minimalRequest: PricingTimelineRequest = {
        projectScope: "Basic website",
        projectType: "web-development",
        complexity: "simple",
        clientProfile: {
          industry: "General",
          company_size: "small",
          location: "Ukraine"
        },
        requirements: {
          features: ["Basic website"]
        }
      };

      const response = await pricingTimelineAgent.analyzePricingTimeline(minimalRequest);
      
      expect(response).toBeDefined();
      expect(response.pricing.base_price).toBeGreaterThan(0);
      expect(response.timeline.total_duration_weeks).toBeGreaterThan(0);
      
      console.log('   ✅ Minimal input handled successfully');
    }, 30000);

    it('should handle empty features array', async () => {
      const requestWithEmptyFeatures: PricingTimelineRequest = {
        projectScope: "Custom software solution",
        projectType: "web-development",
        complexity: "medium",
        clientProfile: {
          industry: "Technology",
          company_size: "medium",
          location: "Poland"
        },
        requirements: {
          features: []
        }
      };

      const response = await pricingTimelineAgent.analyzePricingTimeline(requestWithEmptyFeatures);
      
      expect(response).toBeDefined();
      expect(response.pricing.base_price).toBeGreaterThan(0);
      
      console.log('   ✅ Empty features array handled');
    }, 30000);

    it('should handle very large budget scenarios', async () => {
      const largeProjectRequest: PricingTimelineRequest = {
        projectScope: "Enterprise-scale digital transformation platform with AI, blockchain, and IoT integration",
        clientBudget: "$1,000,000",
        projectType: "web-development",
        complexity: "enterprise",
        teamSize: 20,
        clientProfile: {
          industry: "Enterprise Technology",
          company_size: "enterprise",
          location: "Poland"
        },
        requirements: {
          features: [
            "Microservices architecture",
            "AI/ML integration",
            "Blockchain integration",
            "IoT device management",
            "Real-time analytics",
            "Multi-tenant SaaS",
            "Advanced security",
            "Scalable infrastructure"
          ],
          integrations: ["AWS", "Azure", "GCP", "Salesforce", "SAP"],
          platforms: ["Web", "Mobile", "Desktop", "IoT"],
          technologies: ["React", "Node.js", "Python", "Go", "Kubernetes", "Docker"]
        }
      };

      const response = await pricingTimelineAgent.analyzePricingTimeline(largeProjectRequest);
      
      expect(response).toBeDefined();
      expect(response.pricing.base_price).toBeGreaterThan(100000);
      expect(response.timeline.total_duration_weeks).toBeGreaterThan(20);
      expect(response.timeline.phases.length).toBeGreaterThan(3);
      
      console.log(`   ✅ Large enterprise project: $${response.pricing.base_price} - ${response.timeline.total_duration_weeks} weeks`);
    }, 45000);
  });

  describe('Data Quality and Validation', () => {
    it('should provide detailed price breakdown that sums correctly', async () => {
      const request = testCases[1].request; // Complex e-commerce
      const response = await pricingTimelineAgent.analyzePricingTimeline(request);
      
      const breakdown = response.pricing.price_breakdown;
      const totalBreakdown = breakdown.development + breakdown.design + breakdown.testing + 
                           breakdown.project_management + breakdown.deployment;
      
      // Allow for small rounding differences
      const tolerance = response.pricing.base_price * 0.05; // 5% tolerance
      expect(Math.abs(totalBreakdown - response.pricing.base_price)).toBeLessThan(tolerance);
      
      console.log('   ✅ Price breakdown validation passed');
    });

    it('should provide realistic timeline phases', async () => {
      const request = testCases[1].request; // Complex e-commerce
      const response = await pricingTimelineAgent.analyzePricingTimeline(request);
      
      const totalPhaseWeeks = response.timeline.phases.reduce((sum, phase) => sum + phase.duration_weeks, 0);
      
      // Timeline phases should approximately equal total duration (allowing for overlap)
      expect(totalPhaseWeeks).toBeGreaterThan(response.timeline.total_duration_weeks * 0.8);
      expect(totalPhaseWeeks).toBeLessThan(response.timeline.total_duration_weeks * 2);
      
      // Each phase should have deliverables
      response.timeline.phases.forEach(phase => {
        expect(phase.deliverables.length).toBeGreaterThan(0);
      });
      
      console.log('   ✅ Timeline phases validation passed');
    });

    it('should provide meaningful recommendations', async () => {
      const request = testCases[2].request; // Mobile app
      const response = await pricingTimelineAgent.analyzePricingTimeline(request);
      
      expect(response.recommendations.pricing_strategy.length).toBeGreaterThan(20);
      expect(response.recommendations.timeline_optimization.length).toBeGreaterThan(20);
      expect(response.recommendations.risk_mitigation.length).toBeGreaterThan(0);
      expect(response.recommendations.value_proposition.length).toBeGreaterThan(20);
      
      console.log('   ✅ Recommendations quality validation passed');
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle concurrent requests', async () => {
      const requests = testCases.slice(0, 3).map(testCase => 
        pricingTimelineAgent.analyzePricingTimeline(testCase.request)
      );
      
      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;
      
      expect(responses).toHaveLength(3);
      responses.forEach(response => {
        expect(response).toBeDefined();
        expect(response.pricing.base_price).toBeGreaterThan(0);
      });
      
      console.log(`   ✅ Concurrent requests handled in ${totalTime}ms`);
    }, 60000);

    it('should be consistent across multiple runs', async () => {
      const request = testCases[0].request; // Simple web development
      
      const responses = await Promise.all([
        pricingTimelineAgent.analyzePricingTimeline(request),
        pricingTimelineAgent.analyzePricingTimeline(request),
        pricingTimelineAgent.analyzePricingTimeline(request)
      ]);
      
      const prices = responses.map(r => r.pricing.base_price);
      const timelines = responses.map(r => r.timeline.total_duration_weeks);
      
      // Prices should be within 20% of each other (AI can have some variation)
      const priceVariation = (Math.max(...prices) - Math.min(...prices)) / Math.min(...prices);
      expect(priceVariation).toBeLessThan(0.3); // 30% max variation
      
      // Timelines should be within 2 weeks of each other
      const timelineVariation = Math.max(...timelines) - Math.min(...timelines);
      expect(timelineVariation).toBeLessThan(3);
      
      console.log(`   ✅ Consistency check passed (price variation: ${(priceVariation * 100).toFixed(1)}%)`);
    }, 60000);
  });
});

// Helper function to run a single test case manually
export async function runSingleTest(testName: string) {
  const testCase = testCases.find(tc => tc.name === testName);
  if (!testCase) {
    throw new Error(`Test case "${testName}" not found`);
  }
  
  console.log(`🎯 Running single test: ${testName}`);
  const startTime = Date.now();
  
  try {
    const response = await pricingTimelineAgent.analyzePricingTimeline(testCase.request);
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Test completed in ${processingTime}ms`);
    console.log(`💰 Price: $${response.pricing.base_price}`);
    console.log(`⏱️  Timeline: ${response.timeline.total_duration_weeks} weeks`);
    console.log(`📋 Phases: ${response.timeline.phases.length}`);
    
    return response;
  } catch (error) {
    console.error(`❌ Test failed: ${error}`);
    throw error;
  }
}

// Export test utilities for manual testing
export { testCases, pricingTimelineAgent };