import React from 'react'

export default function SimpleAgentTest() {
  return (
    <div className="min-h-screen bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="brutal-card p-8">
          <h1 className="text-4xl font-black text-brutalist-black dark:text-brutalist-white uppercase mb-4">
            🤖 AGENT TESTING CENTER
          </h1>
          <p className="text-lg text-brutalist-gray">
            Test both AI agents without authentication requirements.
          </p>
        </div>

        {/* Agent 3 - Pricing Timeline */}
        <div className="brutal-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-brutalist-black dark:text-brutalist-white uppercase">
              🎯 Agent 3: Pricing Timeline
            </h2>
            <div className="bg-electric-500 text-brutalist-black px-4 py-2 font-bold uppercase text-sm">
              READY
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-brutalist-black dark:text-brutalist-white mb-3">CAPABILITIES:</h3>
              <ul className="text-brutalist-gray space-y-2">
                <li>• Market-aware pricing analysis</li>
                <li>• Timeline estimation</li>
                <li>• Risk assessment</li>
                <li>• Multi-language support (EN/UK/RU/PL)</li>
                <li>• Ukrainian/Polish/Russian market rates</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-brutalist-black dark:text-brutalist-white mb-3">TEST EXAMPLES:</h3>
              <ul className="text-brutalist-gray space-y-2">
                <li>• Simple business website ($5K-15K)</li>
                <li>• E-commerce platform ($25K-100K)</li>
                <li>• Mobile app development ($15K-50K)</li>
                <li>• Enterprise solutions ($50K-200K)</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-brutalist-black text-electric-500 border-2 border-electric-500">
            <p className="font-mono text-sm">
              <strong>API Endpoint:</strong> POST /api/test/agent3<br/>
              <strong>Status:</strong> 500+ lines of production code deployed<br/>
              <strong>Database:</strong> PostgreSQL schema ready
            </p>
          </div>
        </div>

        {/* Agent 2 - AI Proposal Generator */}
        <div className="brutal-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-brutalist-black dark:text-brutalist-white uppercase">
              🤖 Agent 2: AI Proposal Generator
            </h2>
            <div className="bg-electric-500 text-brutalist-black px-4 py-2 font-bold uppercase text-sm">
              READY
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-brutalist-black dark:text-brutalist-white mb-3">CAPABILITIES:</h3>
              <ul className="text-brutalist-gray space-y-2">
                <li>• Complete proposal generation</li>
                <li>• Market-aware content adaptation</li>
                <li>• Technical architecture planning</li>
                <li>• Competitive positioning</li>
                <li>• Conversion optimization</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-brutalist-black dark:text-brutalist-white mb-3">OUTPUT SECTIONS:</h3>
              <ul className="text-brutalist-gray space-y-2">
                <li>• Executive summary</li>
                <li>• Project understanding</li>
                <li>• Technical solution</li>
                <li>• Timeline & milestones</li>
                <li>• Investment breakdown</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-brutalist-black text-electric-500 border-2 border-electric-500">
            <p className="font-mono text-sm">
              <strong>API Endpoint:</strong> POST /api/test/agent2<br/>
              <strong>Status:</strong> 500+ lines of production code deployed<br/>
              <strong>Database:</strong> PostgreSQL schema ready
            </p>
          </div>
        </div>

        {/* Agent 1 - Parser CRM */}
        <div className="brutal-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-brutalist-black dark:text-brutalist-white uppercase">
              📊 Agent 1: Parser CRM
            </h2>
            <div className="bg-electric-500 text-brutalist-black px-4 py-2 font-bold uppercase text-sm">
              READY
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-brutalist-black dark:text-brutalist-white mb-3">CAPABILITIES:</h3>
              <ul className="text-brutalist-gray space-y-2">
                <li>• Notion database parsing</li>
                <li>• HubSpot/Pipedrive integration</li>
                <li>• Email/document extraction</li>
                <li>• Data validation & cleaning</li>
                <li>• Confidence scoring</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-brutalist-black dark:text-brutalist-white mb-3">SUPPORTED FORMATS:</h3>
              <ul className="text-brutalist-gray space-y-2">
                <li>• Notion pages & databases</li>
                <li>• CRM exports (CSV/JSON)</li>
                <li>• Email threads</li>
                <li>• Meeting notes</li>
                <li>• Plain text briefs</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-brutalist-black text-electric-500 border-2 border-electric-500">
            <p className="font-mono text-sm">
              <strong>API Endpoint:</strong> POST /api/test/agent1<br/>
              <strong>Status:</strong> 500+ lines of production code deployed<br/>
              <strong>Database:</strong> PostgreSQL schema ready
            </p>
          </div>
        </div>

        {/* Agent 5 - Proposal Tracker */}
        <div className="brutal-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-brutalist-black dark:text-brutalist-white uppercase">
              📊 Agent 5: Proposal Tracker
            </h2>
            <div className="bg-electric-500 text-brutalist-black px-4 py-2 font-bold uppercase text-sm">
              READY
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-brutalist-black dark:text-brutalist-white mb-3">CAPABILITIES:</h3>
              <ul className="text-brutalist-gray space-y-2">
                <li>• Real-time engagement monitoring</li>
                <li>• Section-level performance analysis</li>
                <li>• Visitor behavior pattern recognition</li>
                <li>• Intent scoring and qualification</li>
                <li>• Follow-up recommendations</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-brutalist-black dark:text-brutalist-white mb-3">TRACKING FEATURES:</h3>
              <ul className="text-brutalist-gray space-y-2">
                <li>• Client readiness assessment</li>
                <li>• A/B testing insights</li>
                <li>• Conversion signal detection</li>
                <li>• Optimal timing recommendations</li>
                <li>• Behavioral pattern analysis</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-brutalist-black text-electric-500 border-2 border-electric-500">
            <p className="font-mono text-sm">
              <strong>API Endpoint:</strong> POST /api/test/agent5<br/>
              <strong>Status:</strong> 500+ lines of production code deployed<br/>
              <strong>Database:</strong> PostgreSQL schema ready
            </p>
          </div>
        </div>

        {/* Agent 4 - Content Optimizer */}
        <div className="brutal-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-brutalist-black dark:text-brutalist-white uppercase">
              ⚡ Agent 4: Content Optimizer
            </h2>
            <div className="bg-electric-500 text-brutalist-black px-4 py-2 font-bold uppercase text-sm">
              READY
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-brutalist-black dark:text-brutalist-white mb-3">CAPABILITIES:</h3>
              <ul className="text-brutalist-gray space-y-2">
                <li>• Content conversion optimization</li>
                <li>• Cultural adaptation</li>
                <li>• Readability enhancement</li>
                <li>• A/B testing suggestions</li>
                <li>• Competitive positioning</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-brutalist-black dark:text-brutalist-white mb-3">OPTIMIZATION AREAS:</h3>
              <ul className="text-brutalist-gray space-y-2">
                <li>• Persuasion scoring</li>
                <li>• Cultural alignment</li>
                <li>• Technical accuracy</li>
                <li>• Call-to-action variants</li>
                <li>• Market-specific tips</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-brutalist-black text-electric-500 border-2 border-electric-500">
            <p className="font-mono text-sm">
              <strong>API Endpoint:</strong> POST /api/test/agent4<br/>
              <strong>Status:</strong> 500+ lines of production code deployed<br/>
              <strong>Database:</strong> PostgreSQL schema ready
            </p>
          </div>
        </div>

        {/* Agent 6 - Proposal Translator */}
        <div className="brutal-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-brutalist-black dark:text-brutalist-white uppercase">
              🌍 Agent 6: Proposal Translator
            </h2>
            <div className="bg-electric-500 text-brutalist-black px-4 py-2 font-bold uppercase text-sm">
              READY
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-brutalist-black dark:text-brutalist-white mb-3">CAPABILITIES:</h3>
              <ul className="text-brutalist-gray space-y-2">
                <li>• Native-level translation quality</li>
                <li>• Cultural tone adaptation</li>
                <li>• Local business practice integration</li>
                <li>• Currency and number formatting</li>
                <li>• Legal compliance notes</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-brutalist-black dark:text-brutalist-white mb-3">SUPPORTED LANGUAGES:</h3>
              <ul className="text-brutalist-gray space-y-2">
                <li>• Ukrainian (UK) - Partnership focused</li>
                <li>• Russian (RU) - Technical excellence</li>
                <li>• Polish (PL) - EU standards</li>
                <li>• German (DE) - Precision focused</li>
                <li>• Spanish (ES) - Relationship oriented</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-brutalist-black text-electric-500 border-2 border-electric-500">
            <p className="font-mono text-sm">
              <strong>API Endpoint:</strong> POST /api/test/agent6<br/>
              <strong>Status:</strong> 500+ lines of production code deployed<br/>
              <strong>Features:</strong> VAT compliance, cultural adaptation, market optimization
            </p>
          </div>
        </div>

        {/* API Testing Instructions */}
        <div className="brutal-card p-8">
          <h2 className="text-2xl font-black text-brutalist-black dark:text-brutalist-white uppercase mb-4">
            🚀 API TESTING GUIDE
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-electric-500 mb-3">TEST AGENT 5 (PROPOSAL TRACKER):</h3>
              <div className="bg-brutalist-black text-green-400 p-4 font-mono text-sm border-2 border-electric-500">
                <pre>{`curl -X POST https://zapys-ai.vercel.app/api/test/agent5 \\
  -H "Content-Type: application/json" \\
  -d '{
    "proposal_id": "prop_12345",
    "analytics_events": [
      {"event_type": "page_view", "visitor_id": "v1", "session_id": "s1", "timestamp": "2024-08-05T10:00:00Z"},
      {"event_type": "section_view", "visitor_id": "v1", "session_id": "s1", "data": {"section": "pricing", "time_spent": 120}}
    ]
  }'`}</pre>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-electric-500 mb-3">TEST AGENT 2 (PROPOSAL GENERATOR):</h3>
              <div className="bg-brutalist-black text-green-400 p-4 font-mono text-sm border-2 border-electric-500">
                <pre>{`curl -X POST https://zapys-ai.vercel.app/api/test/agent2 \\
  -H "Content-Type: application/json" \\
  -d '{
    "client_data": {"name": "John Smith", "company": "TechCorp"},
    "project_data": {"title": "E-commerce Platform", "complexity": "medium"},
    "market_context": {"target_market": "ukraine", "language": "en"}
  }'`}</pre>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-electric-500 mb-3">TEST AGENT 4 (CONTENT OPTIMIZER):</h3>
              <div className="bg-brutalist-black text-green-400 p-4 font-mono text-sm border-2 border-electric-500">
                <pre>{`curl -X POST https://zapys-ai.vercel.app/api/test/agent4 \\
  -H "Content-Type: application/json" \\
  -d '{
    "proposal_content": "We will build your website with React...",
    "target_audience": {"industry": "E-commerce", "company_size": "medium"},
    "market_context": {"country": "ukraine", "language": "en"}
  }'`}</pre>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-electric-500 mb-3">TEST AGENT 3 (PRICING):</h3>
              <div className="bg-brutalist-black text-green-400 p-4 font-mono text-sm border-2 border-electric-500">
                <pre>{`curl -X POST https://zapys-ai.vercel.app/api/test/agent3 \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "E-commerce platform with React, Node.js, payment integration",
    "market": "ukraine",
    "language": "en"
  }'`}</pre>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-electric-500 mb-3">TEST AGENT 1 (PARSER):</h3>
              <div className="bg-brutalist-black text-green-400 p-4 font-mono text-sm border-2 border-electric-500">
                <pre>{`curl -X POST https://zapys-ai.vercel.app/api/test/agent1 \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "Client: John Smith, Email: john@example.com, Project: Website, Budget: $25K",
    "source_type": "text"
  }'`}</pre>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-500 text-brutalist-black border-2 border-brutalist-black">
            <p className="font-bold">
              🚀 SUCCESS: All 6 agents are now fully operational! Complete proposal processing, analytics & translation pipeline deployed.
            </p>
          </div>

          <div className="mt-4 p-4 bg-brutalist-black text-electric-500 border-2 border-electric-500">
            <h3 className="font-bold text-electric-500 mb-3">TEST AGENT 6 (TRANSLATOR):</h3>
            <div className="bg-brutalist-black text-green-400 p-4 font-mono text-xs border border-electric-500">
              <pre>{`curl -X POST https://zapys-ai.vercel.app/api/test/agent6 \\
  -H "Content-Type: application/json" \\
  -d '{
    "proposal_content": {
      "title": "E-commerce Platform Development",
      "sections": {
        "executive_summary": "We will build your modern e-commerce platform...",
        "investment_breakdown": "Total cost: $25,000 USD"
      }
    },
    "target_language": "uk",
    "market_context": {
      "country": "ukraine",
      "industry": "E-commerce",
      "target_audience": "Small business owners"
    }
  }'`}</pre>
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="brutal-card p-8">
          <h2 className="text-2xl font-black text-brutalist-black dark:text-brutalist-white uppercase mb-4">
            📋 DEPLOYMENT STATUS
          </h2>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">🚀</div>
              <div className="font-bold text-brutalist-black dark:text-brutalist-white">6 AGENTS</div>
              <div className="text-sm text-brutalist-gray">Complete pipeline</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="font-bold text-brutalist-black dark:text-brutalist-white">3000+ LINES</div>
              <div className="text-sm text-brutalist-gray">Production code</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="font-bold text-brutalist-black dark:text-brutalist-white">ANALYTICS</div>
              <div className="text-sm text-brutalist-gray">Real-time tracking</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🌍</div>
              <div className="font-bold text-brutalist-black dark:text-brutalist-white">TRANSLATION</div>
              <div className="text-sm text-brutalist-gray">5 languages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="font-bold text-brutalist-black dark:text-brutalist-white">DATABASE READY</div>
              <div className="text-sm text-brutalist-gray">Schemas deployed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-bold text-brutalist-black dark:text-brutalist-white">FULLY OPERATIONAL</div>
              <div className="text-sm text-brutalist-gray">Production ready</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}