/**
 * Validation utilities for data quality and format checking
 */

import { ParsedProject, ValidationResult } from '../types/parser'

export class ValidationUtils {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  /**
   * Validate phone number format (international)
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Validate budget amount
   */
  static isValidBudget(budget: number): { isValid: boolean; message?: string } {
    if (budget <= 0) {
      return { isValid: false, message: 'Budget must be positive' }
    }
    if (budget > 10000000) {
      return { isValid: false, message: 'Budget seems unrealistically high' }
    }
    return { isValid: true }
  }

  /**
   * Validate timeline in days
   */
  static isValidTimeline(timeline: number): { isValid: boolean; message?: string } {
    if (timeline <= 0) {
      return { isValid: false, message: 'Timeline must be positive' }
    }
    if (timeline > 1095) { // 3 years
      return { isValid: false, message: 'Timeline seems unrealistically long' }
    }
    return { isValid: true }
  }

  /**
   * Validate project title
   */
  static isValidTitle(title: string): { isValid: boolean; message?: string } {
    const trimmed = title.trim()
    if (trimmed.length === 0) {
      return { isValid: false, message: 'Title is required' }
    }
    if (trimmed.length < 3) {
      return { isValid: false, message: 'Title is too short' }
    }
    if (trimmed.length > 200) {
      return { isValid: false, message: 'Title is too long' }
    }
    return { isValid: true }
  }

  /**
   * Validate description
   */
  static isValidDescription(description: string): { isValid: boolean; message?: string } {
    const trimmed = description.trim()
    if (trimmed.length === 0) {
      return { isValid: false, message: 'Description is required' }
    }
    if (trimmed.length < 10) {
      return { isValid: false, message: 'Description is too short' }
    }
    if (trimmed.length > 5000) {
      return { isValid: false, message: 'Description is too long' }
    }
    return { isValid: true }
  }

  /**
   * Validate client name
   */
  static isValidClientName(name: string): { isValid: boolean; message?: string } {
    const trimmed = name.trim()
    if (trimmed.length === 0) {
      return { isValid: false, message: 'Client name is required' }
    }
    if (trimmed.length < 2) {
      return { isValid: false, message: 'Client name is too short' }
    }
    if (trimmed.length > 100) {
      return { isValid: false, message: 'Client name is too long' }
    }
    // Check for suspicious patterns
    if (/^\d+$/.test(trimmed)) {
      return { isValid: false, message: 'Client name cannot be only numbers' }
    }
    return { isValid: true }
  }

  /**
   * Comprehensive project validation
   */
  static validateProject(project: ParsedProject): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    let confidence = 1.0

    // Validate required fields
    const titleValidation = this.isValidTitle(project.title)
    if (!titleValidation.isValid) {
      errors.push(titleValidation.message!)
      confidence -= 0.3
    }

    const descriptionValidation = this.isValidDescription(project.description)
    if (!descriptionValidation.isValid) {
      if (project.description.trim().length === 0) {
        errors.push(descriptionValidation.message!)
        confidence -= 0.2
      } else {
        warnings.push(descriptionValidation.message!)
        confidence -= 0.1
      }
    }

    // Validate optional fields if present
    if (project.clientName) {
      const clientNameValidation = this.isValidClientName(project.clientName)
      if (!clientNameValidation.isValid) {
        warnings.push(clientNameValidation.message!)
        confidence -= 0.1
      }
    }

    if (project.clientEmail) {
      if (!this.isValidEmail(project.clientEmail)) {
        errors.push('Invalid client email format')
        confidence -= 0.2
      }
    }

    if (project.estimatedBudget) {
      const budgetValidation = this.isValidBudget(project.estimatedBudget)
      if (!budgetValidation.isValid) {
        warnings.push(budgetValidation.message!)
        confidence -= 0.1
      }
    }

    if (project.timeline) {
      const timelineValidation = this.isValidTimeline(project.timeline)
      if (!timelineValidation.isValid) {
        warnings.push(timelineValidation.message!)
        confidence -= 0.1
      }
    }

    // Validate deliverables
    if (project.deliverables.length === 0) {
      warnings.push('No deliverables specified')
      confidence -= 0.05
    } else {
      const emptyDeliverables = project.deliverables.filter(d => !d || d.trim().length === 0)
      if (emptyDeliverables.length > 0) {
        warnings.push('Some deliverables are empty')
        confidence -= 0.05
      }
    }

    // Check for completeness bonus
    const completenessScore = this.calculateCompletenessScore(project)
    confidence = Math.min(1.0, confidence + (completenessScore - 0.5) * 0.2)

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      confidence: Math.max(0, Math.min(1, confidence))
    }
  }

  /**
   * Calculate project completeness score (0-1)
   */
  static calculateCompletenessScore(project: ParsedProject): number {
    let score = 0
    const weights = {
      title: 0.2,
      description: 0.2,
      clientName: 0.1,
      clientEmail: 0.1,
      clientCompany: 0.05,
      estimatedBudget: 0.15,
      timeline: 0.1,
      deliverables: 0.1
    }

    // Required fields
    if (project.title?.trim()) score += weights.title
    if (project.description?.trim()) score += weights.description

    // Optional but important fields
    if (project.clientName?.trim()) score += weights.clientName
    if (project.clientEmail?.trim() && this.isValidEmail(project.clientEmail)) {
      score += weights.clientEmail
    }
    if (project.clientCompany?.trim()) score += weights.clientCompany
    if (project.estimatedBudget && project.estimatedBudget > 0) {
      score += weights.estimatedBudget
    }
    if (project.timeline && project.timeline > 0) score += weights.timeline
    if (project.deliverables.length > 0) score += weights.deliverables

    return Math.min(1, score)
  }

  /**
   * Sanitize and clean text input
   */
  static sanitizeText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s\-.,!?@()]/g, '') // Remove special characters except common punctuation
  }

  /**
   * Normalize client name format
   */
  static normalizeClientName(name: string): string {
    return name
      .trim()
      .split(' ')
      .map(word => {
        // Handle common prefixes and suffixes
        const lowerWord = word.toLowerCase()
        if (['llc', 'inc', 'ltd', 'corp', 'co'].includes(lowerWord)) {
          return word.toUpperCase()
        }
        if (['and', 'of', 'the', 'for'].includes(lowerWord) && word.length > 2) {
          return lowerWord
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      })
      .join(' ')
  }

  /**
   * Extract and validate currency amounts from text
   */
  static extractCurrencyAmount(text: string): { amount: number; currency: string } | null {
    const patterns = [
      /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, // USD
      /€(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,  // EUR
      /£(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,  // GBP
      /₴(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,  // UAH
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|EUR|GBP|UAH)/gi
    ]

    // Currency symbol mapping for reference
    // const currencySymbols: { [key: string]: string } = {
    //   '$': 'USD',
    //   '€': 'EUR',
    //   '£': 'GBP',
    //   '₴': 'UAH'
    // }

    for (const pattern of patterns) {
      const match = pattern.exec(text)
      if (match) {
        const amountStr = match[1].replace(/,/g, '')
        const amount = parseFloat(amountStr)
        
        if (!isNaN(amount)) {
          const currency = text.includes('$') ? 'USD' :
                          text.includes('€') ? 'EUR' :
                          text.includes('£') ? 'GBP' :
                          text.includes('₴') ? 'UAH' : 'USD'
          
          return { amount, currency }
        }
      }
    }

    return null
  }

  /**
   * Detect and validate date formats
   */
  static parseDate(dateStr: string): Date | null {
    const formats = [
      /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
      /(\d{2})\/(\d{2})\/(\d{4})/, // MM/DD/YYYY
      /(\d{2})\.(\d{2})\.(\d{4})/, // DD.MM.YYYY
      /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i
    ]

    for (const format of formats) {
      const match = dateStr.match(format)
      if (match) {
        try {
          const date = new Date(dateStr)
          if (!isNaN(date.getTime())) {
            return date
          }
        } catch {
          continue
        }
      }
    }

    return null
  }

  /**
   * Calculate confidence score based on data quality
   */
  static calculateDataQualityScore(project: ParsedProject): number {
    let score = 0
    let maxScore = 0

    // Title quality (20 points)
    maxScore += 20
    if (project.title?.trim()) {
      const titleLength = project.title.trim().length
      if (titleLength >= 10 && titleLength <= 100) {
        score += 20
      } else if (titleLength >= 5) {
        score += 15
      } else {
        score += 5
      }
    }

    // Description quality (25 points)
    maxScore += 25
    if (project.description?.trim()) {
      const descLength = project.description.trim().length
      if (descLength >= 50 && descLength <= 1000) {
        score += 25
      } else if (descLength >= 20) {
        score += 20
      } else if (descLength >= 10) {
        score += 10
      } else {
        score += 5
      }
    }

    // Client information (20 points)
    maxScore += 20
    if (project.clientName?.trim()) score += 7
    if (project.clientEmail && this.isValidEmail(project.clientEmail)) score += 8
    if (project.clientCompany?.trim()) score += 5

    // Project details (20 points)
    maxScore += 20
    if (project.estimatedBudget && project.estimatedBudget > 0) score += 10
    if (project.timeline && project.timeline > 0) score += 10

    // Deliverables (15 points)
    maxScore += 15
    if (project.deliverables.length > 0) {
      const validDeliverables = project.deliverables.filter(d => d?.trim().length > 0)
      if (validDeliverables.length >= 3) {
        score += 15
      } else if (validDeliverables.length >= 1) {
        score += 10
      }
    }

    return Math.round((score / maxScore) * 100) / 100
  }
}