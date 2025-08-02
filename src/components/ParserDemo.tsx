/**
 * Demo component for the Notion & CRM Parser
 */

import React, { useState } from 'react'
import { ParseRequest, ParseResponse } from '../types/parser'
import { notionCRMParser } from '../services/notionCRMParser'

interface ParserDemoProps {
  className?: string
}

export const ParserDemo: React.FC<ParserDemoProps> = ({ className = '' }) => {
  const [selectedSource, setSelectedSource] = useState<ParseRequest['source']>('manual')
  const [inputData, setInputData] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'uk' | 'ru' | 'pl'>('en')
  const [parseResult, setParseResult] = useState<ParseResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const sampleData: Record<ParseRequest['source'], string> = {
    manual: `Project: E-commerce Website Development
Client: John Smith (john@techstore.com)
Company: TechStore LLC
Budget: $15,000 - $20,000
Timeline: 8 weeks
Description: Modern e-commerce platform with payment integration, inventory management, and mobile-responsive design.

Deliverables:
• Custom website design
• Shopping cart functionality
• Payment gateway integration
• Admin dashboard
• Mobile optimization
• SEO setup`,

    csv: `Project Name,Client Name,Client Email,Company,Budget,Timeline,Description
Website Redesign,Jane Doe,jane@coffeeshop.com,Coffee Shop Inc,8000,6 weeks,Modern website with online ordering
Mobile App,Mike Johnson,mike@startup.io,Startup Solutions,25000,12 weeks,iOS and Android app development
Brand Identity,Sarah Wilson,sarah@design.com,Design Studio,5000,4 weeks,Logo and brand guidelines`,

    notion: `{
  "results": [
    {
      "properties": {
        "Name": {
          "title": [{"plain_text": "CRM Integration Project"}]
        },
        "Client": {
          "rich_text": [{"plain_text": "Alex Rodriguez"}]
        },
        "Client Email": {
          "email": "alex@salesforce.com"
        },
        "Company": {
          "rich_text": [{"plain_text": "Salesforce Inc"}]
        },
        "Budget": {
          "number": 30000
        },
        "Timeline": {
          "number": 10
        },
        "Description": {
          "rich_text": [{"plain_text": "Integration with existing CRM system, data migration, and custom reporting dashboard."}]
        },
        "Deliverables": {
          "multi_select": [
            {"name": "API Integration"},
            {"name": "Data Migration"},
            {"name": "Custom Dashboard"},
            {"name": "User Training"}
          ]
        }
      }
    }
  ]
}`,

    airtable: `{
  "records": [
    {
      "fields": {
        "Name": "Website Redesign Project",
        "Client": "Sarah Johnson",
        "Email": "sarah@company.com",
        "Company": "Tech Solutions Inc",
        "Budget": 12000,
        "Timeline": 45,
        "Description": "Complete website redesign with modern UI/UX"
      }
    }
  ]
}`,

    trello: `{
  "cards": [
    {
      "name": "Mobile App Development",
      "desc": "Native iOS and Android app with user authentication and real-time features",
      "due": "2024-04-15"
    }
  ]
}`,

    webhook: `{
  "data": {
    "title": "Marketing Campaign Website",
    "person_name": "Lisa Chen",
    "person_email": "lisa@marketing.agency",
    "org_name": "Digital Marketing Agency",
    "value": 12000,
    "notes": "Landing page for new marketing campaign with analytics integration and A/B testing capabilities.",
    "expected_close_date": "2024-03-15"
  }
}`
  }

  const handleParse = async () => {
    setIsLoading(true)
    setParseResult(null)

    try {
      let data: any = {}

      if (selectedSource === 'manual') {
        data = { content: inputData }
      } else if (selectedSource === 'csv') {
        data = { content: inputData }
      } else if (selectedSource === 'notion' || selectedSource === 'webhook') {
        try {
          data = { apiResponse: JSON.parse(inputData) }
        } catch (error) {
          throw new Error('Invalid JSON format')
        }
      }

      const request: ParseRequest = {
        source: selectedSource,
        data,
        options: {
          language: selectedLanguage,
          includeAttachments: false,
          maxItems: 10
        }
      }

      const result = await notionCRMParser.parse(request)
      setParseResult(result)
    } catch (error) {
      setParseResult({
        success: false,
        projects: [],
        metadata: {
          source: selectedSource,
          parsedAt: new Date().toISOString(),
          itemCount: 0,
          language: selectedLanguage,
          confidence: 0
        },
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadSampleData = () => {
    setInputData(sampleData[selectedSource] || '')
  }

  return (
    <div className={`max-w-6xl mx-auto p-6 space-y-6 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Notion & CRM Parser Demo
        </h2>

        {/* Source Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {(['manual', 'csv', 'notion', 'webhook'] as const).map((source) => (
            <button
              key={source}
              onClick={() => setSelectedSource(source)}
              className={`p-3 rounded-lg border-2 transition-colors ${
                selectedSource === source
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium capitalize">{source}</div>
              <div className="text-sm text-gray-500">
                {source === 'manual' && 'Text Input'}
                {source === 'csv' && 'CSV Data'}
                {source === 'notion' && 'Notion API'}
                {source === 'webhook' && 'CRM Webhook'}
              </div>
            </button>
          ))}
        </div>

        {/* Language Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="en">English</option>
            <option value="uk">Ukrainian</option>
            <option value="ru">Russian</option>
            <option value="pl">Polish</option>
          </select>
        </div>

        {/* Input Area */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Input Data ({selectedSource})
            </label>
            <button
              onClick={loadSampleData}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Load Sample Data
            </button>
          </div>
          <textarea
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder={`Enter ${selectedSource} data here...`}
            className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm"
          />
        </div>

        {/* Parse Button */}
        <button
          onClick={handleParse}
          disabled={!inputData.trim() || isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Parsing...' : 'Parse Data'}
        </button>
      </div>

      {/* Results */}
      {parseResult && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Parse Results</h3>

          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-700 mb-2">Metadata</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Source:</span> {parseResult.metadata.source}
              </div>
              <div>
                <span className="font-medium">Language:</span> {parseResult.metadata.language}
              </div>
              <div>
                <span className="font-medium">Items:</span> {parseResult.metadata.itemCount}
              </div>
              <div>
                <span className="font-medium">Confidence:</span>{' '}
                <span className={`font-medium ${
                  parseResult.metadata.confidence >= 0.8 ? 'text-green-600' :
                  parseResult.metadata.confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {Math.round(parseResult.metadata.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Errors */}
          {parseResult.errors && parseResult.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-red-800 mb-2">Errors</h4>
              <ul className="list-disc list-inside text-red-700 text-sm">
                {parseResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {parseResult.warnings && parseResult.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-yellow-800 mb-2">Warnings</h4>
              <ul className="list-disc list-inside text-yellow-700 text-sm">
                {parseResult.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Projects */}
          {parseResult.projects.length > 0 ? (
            <div className="space-y-6">
              <h4 className="font-medium text-gray-700">Extracted Projects</h4>
              {parseResult.projects.map((project, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">{project.title}</h5>
                      <div className="space-y-1 text-sm">
                        {project.clientName && (
                          <div><span className="font-medium">Client:</span> {project.clientName}</div>
                        )}
                        {project.clientEmail && (
                          <div><span className="font-medium">Email:</span> {project.clientEmail}</div>
                        )}
                        {project.clientCompany && (
                          <div><span className="font-medium">Company:</span> {project.clientCompany}</div>
                        )}
                        {project.estimatedBudget && (
                          <div><span className="font-medium">Budget:</span> ${project.estimatedBudget.toLocaleString()}</div>
                        )}
                        {project.timeline && (
                          <div><span className="font-medium">Timeline:</span> {project.timeline} days</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="mb-2">
                        <span className="font-medium text-sm">Description:</span>
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      </div>
                      {project.deliverables.length > 0 && (
                        <div>
                          <span className="font-medium text-sm">Deliverables:</span>
                          <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                            {project.deliverables.map((deliverable, idx) => (
                              <li key={idx}>{deliverable}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Validation Info */}
                  {project.customFields?.validation && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Data Quality:</span>
                        <div className="flex space-x-4">
                          <span className={`font-medium ${
                            project.customFields.validation.isValid ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {project.customFields.validation.isValid ? 'Valid' : 'Invalid'}
                          </span>
                          <span>
                            Confidence: {Math.round(project.customFields.validation.confidence * 100)}%
                          </span>
                          <span>
                            Quality: {Math.round(project.customFields.validation.qualityScore * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No projects found in the provided data.
            </div>
          )}
        </div>
      )}
    </div>
  )
}