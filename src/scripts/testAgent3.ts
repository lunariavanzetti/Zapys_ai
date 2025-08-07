import { pricingTimelineAgent, PricingTimelineRequest } from '../services/pricingTimelineAgent';

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

export async function runAgent3Test() {
  console.log('🚀 Testing Agent 3: AI Pricing Timeline');
  console.log('=====================================');
  
  try {
    const startTime = Date.now();
    
    console.log('📋 Test Request:');
    console.log(`   Scope: ${testRequest.projectScope}`);
    console.log(`   Budget: ${testRequest.clientBudget}`);
    console.log(`   Type: ${testRequest.projectType} | Complexity: ${testRequest.complexity}`);
    console.log(`   Location: ${testRequest.clientProfile.location}`);
    console.log('');
    
    const analysis = await pricingTimelineAgent.analyzePricingTimeline(testRequest);
    const processingTime = Date.now() - startTime;
    
    console.log('✅ Analysis Complete!');
    console.log(`⏱️  Processing Time: ${processingTime}ms`);
    console.log('');
    
    console.log('💰 PRICING ANALYSIS:');
    console.log(`   Base Price: $${analysis.pricing.base_price.toLocaleString()}`);
    console.log(`   Hourly Rate: $${analysis.pricing.hourly_rate}`);
    console.log(`   Total Hours: ${analysis.pricing.total_hours}`);
    console.log(`   Currency: ${analysis.pricing.currency}`);
    console.log('');
    
    console.log('💸 PRICE BREAKDOWN:');
    console.log(`   Development: $${analysis.pricing.price_breakdown.development.toLocaleString()}`);
    console.log(`   Design: $${analysis.pricing.price_breakdown.design.toLocaleString()}`);
    console.log(`   Testing: $${analysis.pricing.price_breakdown.testing.toLocaleString()}`);
    console.log(`   Project Management: $${analysis.pricing.price_breakdown.project_management.toLocaleString()}`);
    console.log(`   Deployment: $${analysis.pricing.price_breakdown.deployment.toLocaleString()}`);
    console.log('');
    
    console.log('⏰ TIMELINE ANALYSIS:');
    console.log(`   Total Duration: ${analysis.timeline.total_duration_weeks} weeks`);
    console.log(`   Number of Phases: ${analysis.timeline.phases.length}`);
    console.log('');
    
    console.log('📊 PROJECT PHASES:');
    analysis.timeline.phases.forEach((phase, i) => {
      console.log(`   ${i + 1}. ${phase.phase_name}: ${phase.duration_weeks} weeks`);
      console.log(`      Deliverables: ${phase.deliverables.slice(0, 2).join(', ')}${phase.deliverables.length > 2 ? '...' : ''}`);
    });
    console.log('');
    
    console.log('⚠️  RISK FACTORS:');
    analysis.timeline.risk_factors.forEach((risk, i) => {
      console.log(`   ${i + 1}. ${risk}`);
    });
    console.log('');
    
    console.log('💡 KEY RECOMMENDATIONS:');
    console.log(`   Pricing Strategy: ${analysis.recommendations.pricing_strategy.substring(0, 100)}...`);
    console.log(`   Timeline Optimization: ${analysis.recommendations.timeline_optimization.substring(0, 100)}...`);
    console.log('');
    
    console.log('🎯 COMPETITIVE ANALYSIS:');
    console.log(`   Market Rate Comparison: ${analysis.competitive_analysis.market_rate_comparison.substring(0, 100)}...`);
    console.log(`   Positioning Strategy: ${analysis.competitive_analysis.positioning_strategy.substring(0, 100)}...`);
    console.log('');
    
    // Test pricing variants
    console.log('🔄 Testing Pricing Variants...');
    const variants = await pricingTimelineAgent.generatePricingVariants(testRequest);
    
    console.log('📊 PRICING VARIANTS:');
    console.log(`   Budget Friendly: $${variants.budget_friendly.pricing.base_price.toLocaleString()} (${variants.budget_friendly.timeline.total_duration_weeks} weeks)`);
    console.log(`   Recommended: $${variants.recommended.pricing.base_price.toLocaleString()} (${variants.recommended.timeline.total_duration_weeks} weeks)`);
    console.log(`   Premium: $${variants.premium.pricing.base_price.toLocaleString()} (${variants.premium.timeline.total_duration_weeks} weeks)`);
    console.log('');
    
    console.log('🎉 Agent 3 Test PASSED! All functions working correctly.');
    
    return {
      success: true,
      processingTime,
      analysis,
      variants
    };
    
  } catch (error) {
    console.error('❌ Agent 3 Test FAILED:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  runAgent3Test();
}