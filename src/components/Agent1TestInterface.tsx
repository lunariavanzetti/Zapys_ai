import React, { useState } from 'react';
import { parserNotionCrmAgent, ParsingRequest, ParsingResponse } from '../services/parserNotionCrmAgent';

interface TestResult {
  request: ParsingRequest;
  response: ParsingResponse;
  processingTime: number;
  timestamp: Date;
}

export const Agent1TestInterface: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>('notion-page');
  const [customData, setCustomData] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<'notion' | 'hubspot' | 'pipedrive' | 'airtable' | 'text'>('text');
  const [notionUrl, setNotionUrl] = useState('https://notion.so/example-project-page');

  const predefinedTests: Record<string, ParsingRequest> = {
    'notion-page': {
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
    'hubspot-deal': {
      source: 'hubspot',
      data: {
        objectId: "12345",
        propertyName: "dealstage",
        propertyValue: "proposal",
        properties: {
          dealname: "Mobile App Development - FinTech Startup",
          amount: "45000",
          closedate: "2025-03-01",
          dealstage: "proposal",
          description: "Native iOS and Android app for cryptocurrency trading with real-time market data, secure wallet integration, and advanced trading features.",
          client_company: "CryptoFlow Solutions",
          client_email: "sarah.johnson@cryptoflow.io",
          priority: "High",
          deal_type: "Mobile Development"
        }
      },
      language: 'en'
    },
    'text-brief': {
      source: 'text',
      data: `
Subject: Website Project Inquiry - Tech Consulting Firm

Hi there,

I'm reaching out regarding a website project for our tech consulting company, DataFlow Analytics. 

About us:
- Company: DataFlow Analytics Inc.
- Contact: Alex Rodriguez (alex@dataflow-analytics.com)
- Industry: Technology Consulting

Project Requirements:
We need a professional corporate website that showcases our data analytics services, case studies, and thought leadership content.

Budget: $15,000-20,000
Timeline: End of March 2025
Priority: High priority for Q1 business goals

Best regards,
Alex Rodriguez
Head of Marketing
DataFlow Analytics Inc.
      `,
      language: 'en'
    },
    'ukrainian-content': {
      source: 'text',
      data: `
Проект: Розробка веб-сайту для ресторану
Клієнт: Борщ і Сало
Email: info@borsch.ua
Бюджет: $8,000
Терміни: 6 тижнів
Пріоритет: Високий

Опис проекту:
Потрібен сучасний сайт для українського ресторану з онлайн замовленням їжі, меню, бронюванням столиків та системою лояльності клієнтів.

Функціонал:
- Онлайн меню з фото страв
- Система замовлень
- Бронювання столиків
- Інтеграція з соцмережами
- Мобільна версія
- Система знижок

Індустрія: Ресторанний бізнес
Статус: Обговорення проекту
      `,
      language: 'uk'
    }
  };

  const runPredefinedTest = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const request = predefinedTests[selectedTest];
      const response = await parserNotionCrmAgent.parseProjectData(request);
      const processingTime = Date.now() - startTime;
      
      const result: TestResult = {
        request,
        response,
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
    if (!customData.trim()) {
      alert('Please enter some data to parse');
      return;
    }
    
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const request: ParsingRequest = {
        source: selectedSource,
        data: selectedSource === 'hubspot' || selectedSource === 'pipedrive' || selectedSource === 'airtable'
          ? JSON.parse(customData)
          : customData
      };
      
      const response = await parserNotionCrmAgent.parseProjectData(request);
      const processingTime = Date.now() - startTime;
      
      const result: TestResult = {
        request,
        response,
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

  const testNotionUrl = async () => {
    if (!notionUrl.trim()) {
      alert('Please enter a Notion URL');
      return;
    }
    
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await parserNotionCrmAgent.parseNotionUrl(notionUrl, { language: 'en' });
      const processingTime = Date.now() - startTime;
      
      const result: TestResult = {
        request: { source: 'notion', data: notionUrl, sourceUrl: notionUrl },
        response,
        processingTime,
        timestamp: new Date()
      };
      
      setTestResults(prev => [result, ...prev.slice(0, 4)]);
    } catch (error) {
      console.error('Notion URL test failed:', error);
      alert(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testBatchProcessing = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const batchRequests = [
        predefinedTests['text-brief'],
        predefinedTests['notion-page']
      ];
      
      const responses = await parserNotionCrmAgent.batchParseProjects(batchRequests);
      const processingTime = Date.now() - startTime;
      
      responses.forEach((response, index) => {
        const result: TestResult = {
          request: batchRequests[index],
          response,
          processingTime: processingTime / responses.length,
          timestamp: new Date()
        };
        setTestResults(prev => [result, ...prev.slice(0, 3)]);
      });
      
      alert(`Batch processing completed: ${responses.length} requests processed in ${processingTime}ms`);
    } catch (error) {
      console.error('Batch test failed:', error);
      alert(`Batch test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 p-8 font-mono">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-4 border-green-400 p-6">
          <h1 className="text-4xl font-black mb-2">AGENT 1: PARSER NOTION CRM</h1>
          <p className="text-xl text-green-300">DATA EXTRACTION & PARSING VALIDATION INTERFACE</p>
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
                  <option value="notion-page">Notion Project Page</option>
                  <option value="hubspot-deal">HubSpot CRM Deal</option>
                  <option value="text-brief">Text Project Brief</option>
                  <option value="ukrainian-content">Ukrainian Content</option>
                </select>
                
                <button
                  onClick={runPredefinedTest}
                  disabled={isLoading}
                  className="w-full bg-green-400 text-black p-3 font-black text-lg hover:bg-green-300 disabled:opacity-50"
                >
                  {isLoading ? 'PARSING...' : 'RUN TEST'}
                </button>
              </div>
            </div>

            {/* Notion URL Test */}
            <div className="border-2 border-green-400 p-6">
              <h2 className="text-2xl font-black mb-4">NOTION URL TEST</h2>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="https://notion.so/your-project-page"
                  value={notionUrl}
                  onChange={(e) => setNotionUrl(e.target.value)}
                  className="w-full bg-black border-2 border-green-400 text-green-400 p-3 font-mono"
                />
                
                <button
                  onClick={testNotionUrl}
                  disabled={isLoading}
                  className="w-full bg-green-600 text-black p-3 font-black text-lg hover:bg-green-500 disabled:opacity-50"
                >
                  PARSE NOTION URL
                </button>
              </div>
            </div>

            {/* Custom Data Test */}
            <div className="border-2 border-green-400 p-6">
              <h2 className="text-2xl font-black mb-4">CUSTOM DATA TEST</h2>
              
              <div className="space-y-4">
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value as any)}
                  className="w-full bg-black border-2 border-green-400 text-green-400 p-3 font-mono"
                >
                  <option value="text">Plain Text</option>
                  <option value="notion">Notion Content</option>
                  <option value="hubspot">HubSpot JSON</option>
                  <option value="pipedrive">Pipedrive JSON</option>
                  <option value="airtable">Airtable JSON</option>
                </select>
                
                <textarea
                  placeholder={selectedSource === 'text' 
                    ? "Enter project description, client info, etc..." 
                    : "Enter JSON data from CRM/Notion..."}
                  value={customData}
                  onChange={(e) => setCustomData(e.target.value)}
                  className="w-full bg-black border-2 border-green-400 text-green-400 p-3 font-mono h-32"
                />
                
                <button
                  onClick={runCustomTest}
                  disabled={isLoading}
                  className="w-full bg-green-400 text-black p-3 font-black text-lg hover:bg-green-300 disabled:opacity-50"
                >
                  PARSE CUSTOM DATA
                </button>
              </div>
            </div>

            {/* Batch Processing Test */}
            <div className="border-2 border-green-400 p-6">
              <h2 className="text-2xl font-black mb-4">BATCH PROCESSING</h2>
              
              <button
                onClick={testBatchProcessing}
                disabled={isLoading}
                className="w-full bg-green-600 text-black p-3 font-black text-lg hover:bg-green-500 disabled:opacity-50"
              >
                TEST BATCH PARSING
              </button>
              
              <p className="text-green-300 text-sm mt-2">
                Tests parsing multiple projects simultaneously
              </p>
            </div>
          </div>

          {/* Right Panel: Results */}
          <div className="space-y-6">
            <div className="border-2 border-green-400 p-6">
              <h2 className="text-2xl font-black mb-4">PARSING RESULTS</h2>
              
              {testResults.length === 0 ? (
                <p className="text-green-300">No tests run yet. Run a test to see results.</p>
              ) : (
                <div className="space-y-6">
                  {testResults.map((result, index) => (
                    <div key={index} className="border border-green-600 p-4 space-y-3">
                      {/* Header */}
                      <div className="flex justify-between items-center">
                        <h3 className="font-black text-lg">RESULT #{testResults.length - index}</h3>
                        <span className="text-green-300 text-sm">
                          {result.processingTime}ms | {result.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      
                      {/* Source and Status */}
                      <div className="text-sm">
                        <p><span className="text-green-300">Source:</span> {result.request.source}</p>
                        <p><span className="text-green-300">Success:</span> {result.response.success ? '✅ YES' : '❌ NO'}</p>
                        <p><span className="text-green-300">Confidence:</span> {(result.response.metadata.confidence * 100).toFixed(1)}%</p>
                      </div>
                      
                      {/* Key Results */}
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="border border-green-600 p-3">
                          <div className="text-2xl font-black text-green-400">
                            {result.response.projects.length}
                          </div>
                          <div className="text-green-300 text-sm">PROJECTS</div>
                        </div>
                        
                        <div className="border border-green-600 p-3">
                          <div className="text-2xl font-black text-green-400">
                            {result.response.metadata.language.toUpperCase()}
                          </div>
                          <div className="text-green-300 text-sm">LANGUAGE</div>
                        </div>
                      </div>
                      
                      {/* Project Details */}
                      {result.response.success && result.response.projects.length > 0 && (
                        <div className="text-xs space-y-2">
                          {result.response.projects.slice(0, 2).map((project, i) => (
                            <div key={i} className="border-l-2 border-green-600 pl-3">
                              <div className="font-bold text-green-400">{project.title}</div>
                              <div><span className="text-green-300">Client:</span> {project.clientName}</div>
                              {project.clientEmail && (
                                <div><span className="text-green-300">Email:</span> {project.clientEmail}</div>
                              )}
                              {project.estimatedBudget && (
                                <div><span className="text-green-300">Budget:</span> ${project.estimatedBudget.toLocaleString()}</div>
                              )}
                              {project.timeline && (
                                <div><span className="text-green-300">Timeline:</span> {project.timeline} weeks</div>
                              )}
                              <div><span className="text-green-300">Status:</span> {project.status}</div>
                              <div><span className="text-green-300">Priority:</span> {project.priority}</div>
                              {project.tags.length > 0 && (
                                <div><span className="text-green-300">Tags:</span> {project.tags.slice(0, 3).join(', ')}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Errors/Warnings */}
                      {result.response.metadata.errors && result.response.metadata.errors.length > 0 && (
                        <div className="text-xs">
                          <div className="text-red-400 mb-1">ERRORS:</div>
                          {result.response.metadata.errors.map((error, i) => (
                            <div key={i} className="text-red-400">{error}</div>
                          ))}
                        </div>
                      )}
                      
                      {result.response.metadata.warnings && result.response.metadata.warnings.length > 0 && (
                        <div className="text-xs">
                          <div className="text-yellow-400 mb-1">WARNINGS:</div>
                          {result.response.metadata.warnings.map((warning, i) => (
                            <div key={i} className="text-yellow-400">{warning}</div>
                          ))}
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
            SUCCESS RATE: {testResults.length > 0 ? Math.round((testResults.filter(r => r.response.success).length / testResults.length) * 100) : 0}% |
            AVG PROCESSING TIME: {testResults.length > 0 ? Math.round(testResults.reduce((sum, r) => sum + r.processingTime, 0) / testResults.length) : 0}ms
          </div>
        </div>
      </div>
    </div>
  );
};