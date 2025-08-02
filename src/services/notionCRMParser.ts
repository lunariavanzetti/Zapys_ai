/**
 * Notion & CRM Parser Service
 * Extracts and standardizes project data from various external sources
 */

import { 
  ParseRequest, 
  ParseResponse, 
  ParsedProject, 
  ValidationResult, 
  ParsingContext, 
  ExtractedEntity 
} from '../types/parser'
import { ValidationUtils } from '../lib/validationUtils'
import { LanguageDetection, SupportedLanguage } from '../lib/languageDetection'

export class NotionCRMParser {
  constructor() {
    // Language detection and field mappings are now handled by utility classes
  }

  /**
   * Main parsing method - routes to appropriate parser based on source
   */
  async parse(request: ParseRequest): Promise<ParseResponse> {
    try {
      // Auto-detect language if not specified
      let detectedLanguage: SupportedLanguage = request.options?.language || 'en'
      
      if (!request.options?.language && request.data.content) {
        const detection = LanguageDetection.detectLanguage(request.data.content)
        detectedLanguage = detection.language
      }

      const context: ParsingContext = {
        source: request.source,
        language: detectedLanguage,
        fieldMappings: LanguageDetection.getFieldMappings(detectedLanguage)
      }

      let projects: ParsedProject[] = []

      switch (request.source) {
        case 'notion':
          projects = await this.parseNotion(request.data, context)
          break
        case 'csv':
          projects = await this.parseCSV(request.data, context)
          break
        case 'webhook':
          projects = await this.parseWebhook(request.data, context)
          break
        case 'manual':
          projects = await this.parseManualInput(request.data, context)
          break
        case 'airtable':
          projects = await this.parseAirtable(request.data, context)
          break
        case 'trello':
          projects = await this.parseTrello(request.data, context)
          break
        default:
          throw new Error(`Unsupported source: ${request.source}`)
      }

      // Apply post-processing and validation
      const processedProjects = projects.map(project => {
        const processed = this.postProcessProject(project, context)
        return this.validateAndEnhanceProject(processed, context)
      })
      
      // Calculate overall confidence
      const confidence = this.calculateOverallConfidence(processedProjects)

      return {
        success: true,
        projects: processedProjects,
        metadata: {
          source: request.source,
          parsedAt: new Date().toISOString(),
          itemCount: processedProjects.length,
          language: context.language,
          confidence
        }
      }
    } catch (error) {
      return {
        success: false,
        projects: [],
        metadata: {
          source: request.source,
          parsedAt: new Date().toISOString(),
          itemCount: 0,
          language: request.options?.language || 'en',
          confidence: 0
        },
        errors: [error instanceof Error ? error.message : 'Unknown parsing error']
      }
    }
  }

  /**
   * Parse Notion data (databases and pages)
   */
  private async parseNotion(data: any, context: ParsingContext): Promise<ParsedProject[]> {
    const projects: ParsedProject[] = []

    if (data.url) {
      // Handle Notion URL - would integrate with Notion API
      const mockProject = this.createMockProject('Notion URL Project', context)
      projects.push(mockProject)
    }

    if (data.apiResponse) {
      // Handle Notion API response
      const notionData = data.apiResponse
      
      if (notionData.results) {
        // Database query results
        for (const page of notionData.results) {
          const project = this.parseNotionPage(page, context)
          if (project) projects.push(project)
        }
      } else if (notionData.properties) {
        // Single page
        const project = this.parseNotionPage(notionData, context)
        if (project) projects.push(project)
      }
    }

    return projects
  }

  /**
   * Parse individual Notion page
   */
  private parseNotionPage(page: any, _context: ParsingContext): ParsedProject | null {
    try {
      const properties = page.properties || {}
      const project: ParsedProject = {
        title: this.extractNotionText(properties.Name || properties.Title) || 'Untitled Project',
        description: this.extractNotionText(properties.Description) || '',
        deliverables: []
      }

      // Extract client information
      project.clientName = this.extractNotionText(properties.Client || properties['Client Name'])
      project.clientEmail = this.extractNotionEmail(properties['Client Email'] || properties.Email)
      project.clientCompany = this.extractNotionText(properties.Company || properties.Organization)

      // Extract project details
      project.estimatedBudget = this.extractNotionNumber(properties.Budget || properties.Price)
      project.timeline = this.extractNotionNumber(properties.Timeline || properties.Duration)
      project.industry = this.extractNotionText(properties.Industry || properties.Category)
      project.priority = this.extractNotionSelect(properties.Priority) as 'low' | 'medium' | 'high'
      project.status = this.extractNotionSelect(properties.Status) as any

      // Extract deliverables from multi-select or rich text
      const deliverables = this.extractNotionMultiSelect(properties.Deliverables || properties.Scope)
      if (deliverables.length > 0) {
        project.deliverables = deliverables
      }

      // Extract tags
      project.tags = this.extractNotionMultiSelect(properties.Tags)

      return project
    } catch (error) {
      console.error('Error parsing Notion page:', error)
      return null
    }
  }

  /**
   * Parse CSV data
   */
  private async parseCSV(data: any, context: ParsingContext): Promise<ParsedProject[]> {
    const projects: ParsedProject[] = []
    
    if (!data.content) return projects

    const lines = data.content.split('\n').filter((line: string) => line.trim())
    if (lines.length < 2) return projects

    const headers = lines[0].split(',').map((h: string) => h.trim().replace(/"/g, ''))
    const headerMap = this.createHeaderMapping(headers, context)

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i])
      if (values.length === 0) continue

      const project = this.mapCSVRowToProject(headers, values, headerMap, context)
      if (project) projects.push(project)
    }

    return projects
  }

  /**
   * Parse webhook data (CRM systems)
   */
  private async parseWebhook(data: any, context: ParsingContext): Promise<ParsedProject[]> {
    const projects: ParsedProject[] = []
    
    if (!data.apiResponse) return projects

    const webhookData = data.apiResponse

    // Handle different CRM formats
    if (webhookData.data) {
      // Pipedrive format
      const deals = Array.isArray(webhookData.data) ? webhookData.data : [webhookData.data]
      
      for (const deal of deals) {
        const project = this.parseCRMDeal(deal, context)
        if (project) projects.push(project)
      }
    } else if (webhookData.properties) {
      // HubSpot format
      const project = this.parseHubSpotDeal(webhookData, context)
      if (project) projects.push(project)
    }

    return projects
  }

  /**
   * Parse manual text input
   */
  private async parseManualInput(data: any, context: ParsingContext): Promise<ParsedProject[]> {
    if (!data.content) return []

    const text = data.content
    const entities = this.extractEntitiesFromText(text, context)
    
    const project: ParsedProject = {
      title: this.extractProjectTitle(text, entities) || 'Manual Project',
      description: this.cleanDescription(text),
      deliverables: this.extractDeliverables(text, context)
    }

    // Extract entities into project fields
    entities.forEach(entity => {
      switch (entity.type) {
        case 'email':
          if (!project.clientEmail) project.clientEmail = entity.value
          break
        case 'currency':
          if (!project.estimatedBudget) {
            project.estimatedBudget = this.parseBudgetFromText(entity.value)
          }
          break
        case 'name':
          if (!project.clientName && entity.confidence > 0.7) {
            project.clientName = entity.value
          }
          break
        case 'company':
          if (!project.clientCompany) project.clientCompany = entity.value
          break
      }
    })

    return [project]
  }

  /**
   * Parse Airtable data
   */
  private async parseAirtable(data: any, context: ParsingContext): Promise<ParsedProject[]> {
    const projects: ParsedProject[] = []
    
    if (data.apiResponse?.records) {
      for (const record of data.apiResponse.records) {
        const project = this.parseAirtableRecord(record, context)
        if (project) projects.push(project)
      }
    }

    return projects
  }

  /**
   * Parse Trello data
   */
  private async parseTrello(data: any, context: ParsingContext): Promise<ParsedProject[]> {
    const projects: ParsedProject[] = []
    
    if (data.apiResponse?.cards) {
      for (const card of data.apiResponse.cards) {
        const project = this.parseTrelloCard(card, context)
        if (project) projects.push(project)
      }
    }

    return projects
  }

  /**
   * Extract entities from text using pattern matching
   */
  private extractEntitiesFromText(text: string, _context: ParsingContext): ExtractedEntity[] {
    const entities: ExtractedEntity[] = []

    // Email extraction
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    const emails = text.match(emailRegex) || []
    emails.forEach(email => {
      entities.push({
        type: 'email',
        value: email,
        confidence: 0.95
      })
    })

    // Currency extraction
    const currencyRegex = /\$[\d,]+(?:\.\d{2})?|\$[\d,]+-[\d,]+/g
    const currencies = text.match(currencyRegex) || []
    currencies.forEach(currency => {
      entities.push({
        type: 'currency',
        value: currency,
        confidence: 0.9
      })
    })

    // Company name extraction (basic heuristics)
    const companyPatterns = [
      /\b(\w+(?:\s+\w+)*)\s+(?:LLC|Inc|Ltd|Corp|Company|Co\.)\b/gi,
      /\b(\w+(?:\s+\w+)*)\s+(?:Limited|Corporation|Incorporated)\b/gi
    ]
    
    companyPatterns.forEach(pattern => {
      const matches = text.match(pattern) || []
      matches.forEach(match => {
        entities.push({
          type: 'company',
          value: match.trim(),
          confidence: 0.8
        })
      })
    })

    return entities
  }

  /**
   * Post-process project data for quality and consistency
   */
  private postProcessProject(project: ParsedProject, _context: ParsingContext): ParsedProject {
    const processed = { ...project }

    // Standardize client name
    if (processed.clientName) {
      processed.clientName = this.standardizeClientName(processed.clientName)
    }

    // Clean and enhance description
    if (processed.description) {
      processed.description = this.cleanDescription(processed.description)
    }

    // Normalize budget
    if (processed.estimatedBudget) {
      processed.estimatedBudget = Math.round(processed.estimatedBudget)
    }

    // Validate and clean deliverables
    processed.deliverables = processed.deliverables
      .filter(d => d && d.trim().length > 0)
      .map(d => d.trim())

    return processed
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(projects: ParsedProject[]): number {
    if (projects.length === 0) return 0

    let totalScore = 0
    let totalFields = 0

    projects.forEach(project => {
      const validation = this.validateProject(project)
      totalScore += validation.confidence
      totalFields += 1
    })

    return Math.round((totalScore / totalFields) * 100) / 100
  }

  /**
   * Validate and enhance project using ValidationUtils
   */
  private validateAndEnhanceProject(project: ParsedProject, _context: ParsingContext): ParsedProject {
    // Use ValidationUtils for comprehensive validation
    const validation = ValidationUtils.validateProject(project)
    
    // Enhance project with normalized data
    const enhanced = { ...project }
    
    if (enhanced.clientName) {
      enhanced.clientName = ValidationUtils.normalizeClientName(enhanced.clientName)
    }
    
    if (enhanced.description) {
      enhanced.description = ValidationUtils.sanitizeText(enhanced.description)
    }
    
    // Store validation results in custom fields for debugging
    enhanced.customFields = {
      ...enhanced.customFields,
      validation: {
        isValid: validation.isValid,
        confidence: validation.confidence,
        errors: validation.errors,
        warnings: validation.warnings,
        completenessScore: ValidationUtils.calculateCompletenessScore(project),
        qualityScore: ValidationUtils.calculateDataQualityScore(project)
      }
    }
    
    return enhanced
  }

  /**
   * Legacy validation method - now uses ValidationUtils
   */
  private validateProject(project: ParsedProject): ValidationResult {
    return ValidationUtils.validateProject(project)
  }

  // Helper methods for data extraction and processing
  private extractNotionText(property: any): string | undefined {
    if (!property) return undefined
    
    if (property.title) return property.title.map((t: any) => t.plain_text).join('')
    if (property.rich_text) return property.rich_text.map((t: any) => t.plain_text).join('')
    if (property.plain_text) return property.plain_text
    
    return undefined
  }

  private extractNotionEmail(property: any): string | undefined {
    if (!property) return undefined
    return property.email || this.extractNotionText(property)
  }

  private extractNotionNumber(property: any): number | undefined {
    if (!property) return undefined
    return property.number || parseFloat(this.extractNotionText(property) || '0') || undefined
  }

  private extractNotionSelect(property: any): string | undefined {
    if (!property) return undefined
    return property.select?.name || property.status?.name
  }

  private extractNotionMultiSelect(property: any): string[] {
    if (!property) return []
    if (property.multi_select) return property.multi_select.map((s: any) => s.name)
    
    const text = this.extractNotionText(property)
    if (text) {
      return text.split(/[,\n•-]/).map(s => s.trim()).filter(s => s.length > 0)
    }
    
    return []
  }

  private createHeaderMapping(headers: string[], context: ParsingContext): Record<string, string> {
    const mapping: Record<string, string> = {}

    headers.forEach(header => {
      const field = LanguageDetection.mapHeaderToField(header, context.language as SupportedLanguage)
      if (field) {
        mapping[header] = field
      }
    })

    return mapping
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result.filter(v => v.length > 0)
  }

  private mapCSVRowToProject(headers: string[], values: string[], headerMap: Record<string, string>, _context: ParsingContext): ParsedProject | null {
    if (values.length === 0) return null

    const project: ParsedProject = {
      title: 'Untitled Project',
      description: '',
      deliverables: []
    }

    headers.forEach((header, index) => {
      const value = values[index]?.replace(/"/g, '').trim()
      if (!value) return

      const field = headerMap[header]
      
      switch (field) {
        case 'title':
          project.title = value
          break
        case 'clientName':
          project.clientName = value
          break
        case 'clientEmail':
          if (this.isValidEmail(value)) project.clientEmail = value
          break
        case 'clientCompany':
          project.clientCompany = value
          break
        case 'description':
          project.description = value
          break
        case 'estimatedBudget':
          project.estimatedBudget = this.parseBudgetFromText(value)
          break
        case 'timeline':
          project.timeline = this.parseTimelineFromText(value)
          break
      }
    })

    return project.title !== 'Untitled Project' ? project : null
  }

  private parseCRMDeal(deal: any, _context: ParsingContext): ParsedProject | null {
    return {
      title: deal.title || deal.name || 'CRM Deal',
      clientName: deal.person_name || deal.contact_name,
      clientEmail: deal.person_email || deal.contact_email,
      clientCompany: deal.org_name || deal.company_name,
      description: deal.notes || deal.description || '',
      deliverables: [],
      estimatedBudget: deal.value || deal.amount,
      timeline: deal.expected_close_date ? this.calculateDaysFromDate(deal.expected_close_date) : undefined
    }
  }

  private parseHubSpotDeal(deal: any, _context: ParsingContext): ParsedProject | null {
    const props = deal.properties || {}
    
    return {
      title: props.dealname || 'HubSpot Deal',
      description: props.description || '',
      deliverables: [],
      estimatedBudget: props.amount ? parseFloat(props.amount) : undefined,
      timeline: props.closedate ? this.calculateDaysFromDate(props.closedate) : undefined
    }
  }

  private parseAirtableRecord(record: any, _context: ParsingContext): ParsedProject | null {
    const fields = record.fields || {}
    
    return {
      title: fields.Name || fields.Title || 'Airtable Record',
      clientName: fields.Client || fields['Client Name'],
      clientEmail: fields.Email || fields['Client Email'],
      clientCompany: fields.Company,
      description: fields.Description || fields.Notes || '',
      deliverables: Array.isArray(fields.Deliverables) ? fields.Deliverables : [],
      estimatedBudget: fields.Budget || fields.Price,
      timeline: fields.Timeline || fields.Duration
    }
  }

  private parseTrelloCard(card: any, _context: ParsingContext): ParsedProject | null {
    return {
      title: card.name || 'Trello Card',
      description: card.desc || '',
      deliverables: [],
      timeline: card.due ? this.calculateDaysFromDate(card.due) : undefined
    }
  }

  // Utility methods
  private standardizeClientName(name: string): string {
    return ValidationUtils.normalizeClientName(name)
  }

  private cleanDescription(description: string): string {
    return ValidationUtils.sanitizeText(description)
  }

  private isValidEmail(email: string): boolean {
    return ValidationUtils.isValidEmail(email)
  }

  private parseBudgetFromText(text: string): number | undefined {
    const currency = ValidationUtils.extractCurrencyAmount(text)
    return currency?.amount
  }

  private parseTimelineFromText(text: string): number | undefined {
    const match = text.match(/(\d+)\s*(days?|weeks?|months?)/i)
    if (match) {
      const value = parseInt(match[1])
      const unit = match[2].toLowerCase()
      
      if (unit.startsWith('week')) return value * 7
      if (unit.startsWith('month')) return value * 30
      return value
    }
    return undefined
  }

  private calculateDaysFromDate(dateString: string): number {
    const date = ValidationUtils.parseDate(dateString)
    if (!date) return 0
    
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  private extractProjectTitle(text: string, _entities: ExtractedEntity[]): string | undefined {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    // Look for lines that start with "Project:", "Title:", etc.
    const titlePrefixes = ['project:', 'title:', 'name:']
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase()
      for (const prefix of titlePrefixes) {
        if (lowerLine.startsWith(prefix)) {
          return line.substring(prefix.length).trim()
        }
      }
    }
    
    // If no explicit title found, use the first substantial line
    return lines.find(line => line.length > 10 && line.length < 100)
  }

  private extractDeliverables(text: string, _context: ParsingContext): string[] {
    const deliverables: string[] = []
    const lines = text.split('\n')
    
    // Look for bullet points, numbered lists, or deliverable sections
    const deliverableKeywords = ['deliverable', 'scope', 'feature', 'requirement']
    let inDeliverableSection = false
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      // Check if we're entering a deliverable section
      if (deliverableKeywords.some(keyword => 
        trimmed.toLowerCase().includes(keyword))) {
        inDeliverableSection = true
        continue
      }
      
      // Extract bullet points or numbered items
      if (trimmed.match(/^[-•*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        const deliverable = trimmed.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, '').trim()
        if (deliverable.length > 0) {
          deliverables.push(deliverable)
        }
      } else if (inDeliverableSection && trimmed.length === 0) {
        inDeliverableSection = false
      }
    }
    
    return deliverables
  }

  private createMockProject(title: string, _context: ParsingContext): ParsedProject {
    return {
      title,
              description: `Mock project created from ${_context.source} source`,
      deliverables: ['Mock deliverable 1', 'Mock deliverable 2'],
      estimatedBudget: 5000,
      timeline: 30
    }
  }

  // Field mappings and language terms are now handled by utility classes
}

export const notionCRMParser = new NotionCRMParser()