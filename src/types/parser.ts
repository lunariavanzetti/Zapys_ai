/**
 * Types for the Notion & CRM Parser Agent
 */

export interface ParseRequest {
  source: 'notion' | 'airtable' | 'csv' | 'trello' | 'manual' | 'webhook'
  data: {
    url?: string           // For Notion pages/databases
    content?: string       // For raw text/CSV data
    apiResponse?: any      // For webhook/API data
    files?: File[]         // For file uploads
  }
  options?: {
    language?: 'en' | 'uk' | 'ru' | 'pl'
    includeAttachments?: boolean
    maxItems?: number
  }
}

export interface ParsedProject {
  title: string
  clientName?: string
  clientEmail?: string
  clientCompany?: string
  description: string
  deliverables: string[]
  estimatedBudget?: number
  timeline?: number
  industry?: string
  priority?: 'low' | 'medium' | 'high'
  status?: 'discovery' | 'proposal' | 'active' | 'completed'
  tags?: string[]
  customFields?: Record<string, any>
  attachments?: Array<{
    name: string
    url: string
    type: string
  }>
}

export interface ParseResponse {
  success: boolean
  projects: ParsedProject[]
  metadata: {
    source: string
    parsedAt: string
    itemCount: number
    language: string
    confidence: number
  }
  errors?: string[]
  warnings?: string[]
}

export interface FieldMapping {
  [key: string]: string[]
}

export interface LanguageTerms {
  [language: string]: {
    [field: string]: string[]
  }
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  confidence: number
}

export interface ParsingContext {
  source: string
  language: string
  fieldMappings: FieldMapping
  customPatterns?: RegExp[]
}

export interface ExtractedEntity {
  type: 'email' | 'phone' | 'currency' | 'date' | 'url' | 'name' | 'company'
  value: string
  confidence: number
  context?: string
}