import React, { useState } from 'react';
import { pricingTimelineAgent, PricingTimelineRequest, PricingTimelineResponse } from '../services/pricingTimelineAgent';

interface TestResult {
  request: PricingTimelineRequest;
  analysis: PricingTimelineResponse;
  processingTime: number;
  timestamp: Date;
}

export const Agent3TestInterface: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>('simple-web');
  const [customRequest, setCustomRequest] = useState<Partial<PricingTimelineRequest>>({
    projectScope: '',
    projectType: 'web-development',
    complexity: 'medium',
    clientProfile: {
      industry: '',
      company_size: 'medium',
      location: 'Ukraine'
    },
    requirements: {
      features: []
    }
  });

  const predefinedTests: Record<string, PricingTimelineRequest> = {
    'simple-web': {
      projectScope: "Simple business website with contact forms and basic CMS",
      clientBudget: "$10,000",
      projectType: "web-development",
      complexity: "simple",
      timeline: "6 weeks",
      teamSize: 2,
      clientProfile: {
        industry: "Local Business",
        company_size: "small",
        location: "Ukraine"
      },
      requirements: {
        features: ["Contact forms", "CMS", "Responsive design", "SEO optimization"],
        integrations: ["Google Analytics"],
        platforms: ["Web"],
        technologies: ["WordPress"]
      }
    },
    'complex-ecommerce': {
      projectScope: "Multi-vendor e-commerce platform with AI recommendations",
      clientBudget: "$100,000",
      projectType: "web-development",
      complexity: "enterprise",
      timeline: "6 months",
      teamSize: 6,
      clientProfile: {
        industry: "E-commerce",
        company_size: "medium",
        location: "Poland"
      },
      requirements: {
        features: [
          "Multi-vendor marketplace",
          "AI recommendations",
          "Payment processing",
          "Inventory management",
          "Analytics dashboard"
        ],
        integrations: ["Stripe", "PayPal", "AWS"],
        platforms: ["Web", "Mobile"],
        technologies: ["React", "Node.js", "PostgreSQL"]
      }
    },
    'mobile-app': {
      projectScope: "Cross-platform fitness tracking app with social features",
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
          "Push notifications"
        ],
        integrations: ["Firebase", "Apple Health"],
        platforms: ["iOS", "Android"],
        technologies: ["React Native"]
      }
    }
  };

  const runPredefinedTest = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const request = predefinedTests[selectedTest];
      const analysis = await pricingTimelineAgent.analyzePricingTimeline(request);
      const processingTime = Date.now() - startTime;
      
      const result: TestResult = {
        request,
        analysis,
        processingTime,
        timestamp: new Date()
      };
      
      setTestResults(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 results
    } catch (error) {
      console.error('Test failed:', error);
      alert(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runCustomTest = async () => {
    if (!customRequest.projectScope || !customRequest.clientProfile?.industry) {
      alert('Please fill in project scope and industry');
      return;
    }
    
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const request: PricingTimelineRequest = {
        projectScope: customRequest.projectScope!,
        projectType: customRequest.projectType!,
        complexity: customRequest.complexity!,
        clientProfile: customRequest.clientProfile!,
        requirements: customRequest.requirements!
      };
      
      const analysis = await pricingTimelineAgent.analyzePricingTimeline(request);
      const processingTime = Date.now() - startTime;
      
      const result: TestResult = {
        request,
        analysis,
        processingTime,
        timestamp: new Date()
      };
      
      setTestResults(prev => [result, ...prev.slice(0, 4)]);
    } catch (error) {
      console.error('Custom test failed:', error);
      alert(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testVariants = async (testKey: string) => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const request = predefinedTests[testKey];
      const variants = await pricingTimelineAgent.generatePricingVariants(request);
      const processingTime = Date.now() - startTime;
      
      // Show variants in a formatted way
      const variantsDisplay = {
        budget: variants.budget_friendly,
        recommended: variants.recommended,
        premium: variants.premium
      };
      
      console.log('Pricing Variants:', variantsDisplay);
      alert(`Variants generated in ${processingTime}ms. Check console for details.`);
    } catch (error) {
      console.error('Variants test failed:', error);
      alert(`Variants test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 p-8 font-mono">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-4 border-green-400 p-6">
          <h1 className="text-4xl font-black mb-2">AGENT 3: AI PRICING TIMELINE</h1>
          <p className="text-xl text-green-300">QUALITY ASSURANCE TESTING INTERFACE</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel: Test Controls */}
          <div className="space-y-6">
            {/* Predefined Tests */}
            <div className="border-2 border-green-400 p-6">
              <h2 className="text-2xl font-black mb-4">PREDEFINED TESTS</h2>
              
              <div className="space-y-4">
                <select
                  value={selectedTest}
                  onChange={(e) => setSelectedTest(e.target.value)}
                  className="w-full bg-black border-2 border-green-400 text-green-400 p-3 font-mono text-lg"
                >
                  <option value="simple-web">Simple Web Development</option>
                  <option value="complex-ecommerce">Complex E-commerce</option>
                  <option value="mobile-app">Mobile App</option>
                </select>
                
                <div className="flex gap-4">
                  <button
                    onClick={runPredefinedTest}
                    disabled={isLoading}
                    className="flex-1 bg-green-400 text-black p-3 font-black text-lg hover:bg-green-300 disabled:opacity-50"
                  >
                    {isLoading ? 'ANALYZING...' : 'RUN TEST'}
                  </button>
                  
                  <button
                    onClick={() => testVariants(selectedTest)}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 text-black p-3 font-black text-lg hover:bg-green-500 disabled:opacity-50"
                  >
                    TEST VARIANTS
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Test */}
            <div className="border-2 border-green-400 p-6">
              <h2 className="text-2xl font-black mb-4">CUSTOM TEST</h2>
              
              <div className="space-y-4">
                <textarea
                  placeholder="Project scope description..."
                  value={customRequest.projectScope || ''}
                  onChange={(e) => setCustomRequest(prev => ({ ...prev, projectScope: e.target.value }))}
                  className="w-full bg-black border-2 border-green-400 text-green-400 p-3 font-mono h-24"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={customRequest.projectType}
                    onChange={(e) => setCustomRequest(prev => ({ ...prev, projectType: e.target.value as any }))}
                    className="bg-black border-2 border-green-400 text-green-400 p-3 font-mono"
                  >
                    <option value="web-development">Web Development</option>
                    <option value="mobile-app">Mobile App</option>
                    <option value="ai-integration">AI Integration</option>
                    <option value="consulting">Consulting</option>
                  </select>
                  
                  <select
                    value={customRequest.complexity}
                    onChange={(e) => setCustomRequest(prev => ({ ...prev, complexity: e.target.value as any }))}
                    className="bg-black border-2 border-green-400 text-green-400 p-3 font-mono"
                  >
                    <option value="simple">Simple</option>
                    <option value="medium">Medium</option>
                    <option value="complex">Complex</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                
                <input
                  type="text"
                  placeholder="Industry"
                  value={customRequest.clientProfile?.industry || ''}
                  onChange={(e) => setCustomRequest(prev => ({ 
                    ...prev, 
                    clientProfile: { ...prev.clientProfile!, industry: e.target.value }
                  }))}
                  className="w-full bg-black border-2 border-green-400 text-green-400 p-3 font-mono"
                />
                
                <button
                  onClick={runCustomTest}
                  disabled={isLoading}
                  className="w-full bg-green-400 text-black p-3 font-black text-lg hover:bg-green-300 disabled:opacity-50"
                >
                  RUN CUSTOM TEST
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Results */}
          <div className="space-y-6">
            <div className="border-2 border-green-400 p-6">
              <h2 className="text-2xl font-black mb-4">TEST RESULTS</h2>
              
              {testResults.length === 0 ? (
                <p className="text-green-300">No tests run yet. Run a test to see results.</p>
              ) : (
                <div className="space-y-6">
                  {testResults.map((result, index) => (
                    <div key={index} className="border border-green-600 p-4 space-y-3">
                      {/* Header */}
                      <div className="flex justify-between items-center">
                        <h3 className="font-black text-lg">TEST #{testResults.length - index}</h3>
                        <span className="text-green-300 text-sm">
                          {result.processingTime}ms | {result.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      
                      {/* Project Info */}
                      <div className="text-sm">
                        <p><span className="text-green-300">Scope:</span> {result.request.projectScope.substring(0, 100)}...</p>
                        <p><span className="text-green-300">Type:</span> {result.request.projectType} | <span className="text-green-300">Complexity:</span> {result.request.complexity}</p>
                      </div>
                      
                      {/* Key Results */}
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="border border-green-600 p-3">
                          <div className="text-2xl font-black text-green-400">
                            ${result.analysis.pricing.base_price.toLocaleString()}
                          </div>
                          <div className="text-green-300 text-sm">BASE PRICE</div>
                        </div>
                        
                        <div className="border border-green-600 p-3">
                          <div className="text-2xl font-black text-green-400">
                            {result.analysis.timeline.total_duration_weeks}
                          </div>
                          <div className="text-green-300 text-sm">WEEKS</div>
                        </div>
                      </div>
                      
                      {/* Price Breakdown */}
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>Development:</span>
                          <span>${result.analysis.pricing.price_breakdown.development.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Design:</span>
                          <span>${result.analysis.pricing.price_breakdown.design.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Testing:</span>
                          <span>${result.analysis.pricing.price_breakdown.testing.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {/* Timeline Phases */}
                      <div className="text-xs">
                        <div className="text-green-300 mb-1">PHASES ({result.analysis.timeline.phases.length}):</div>
                        {result.analysis.timeline.phases.slice(0, 3).map((phase, i) => (
                          <div key={i} className="flex justify-between">
                            <span>{phase.phase_name}:</span>
                            <span>{phase.duration_weeks}w</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Risk Factors */}
                      {result.analysis.timeline.risk_factors.length > 0 && (
                        <div className="text-xs">
                          <div className="text-green-300 mb-1">RISKS:</div>
                          <div className="text-red-400">
                            {result.analysis.timeline.risk_factors.slice(0, 2).join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-8 border-2 border-green-400 p-4 text-center">
          <div className="text-green-300 text-lg">
            AGENT STATUS: {isLoading ? '🔄 PROCESSING...' : '✅ READY'} | 
            TESTS RUN: {testResults.length} | 
            AVG PROCESSING TIME: {testResults.length > 0 ? Math.round(testResults.reduce((sum, r) => sum + r.processingTime, 0) / testResults.length) : 0}ms
          </div>
        </div>
      </div>
    </div>
  );
};