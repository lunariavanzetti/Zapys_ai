# Notion & CRM Parser Agent

A comprehensive data extraction and standardization service that parses project data from various external sources including Notion pages, databases, CRM systems, and manual uploads.

## 🎯 Overview

The Notion & CRM Parser Agent is designed to extract structured project information from unstructured or semi-structured data sources. It intelligently identifies project details, client information, budgets, timelines, and deliverables while providing confidence scores and data quality metrics.

## 🚀 Features

### Multi-Source Support
- **Notion**: Database records and page content
- **CSV/Spreadsheet**: Header detection and data mapping
- **CRM Webhooks**: Pipedrive, HubSpot, and other CRM systems
- **Manual Input**: Natural language processing for freeform text
- **Airtable**: Record parsing and field mapping
- **Trello**: Card content extraction

### Multi-Language Support
- **English**: Full support with comprehensive field mapping
- **Ukrainian**: Cyrillic character support with localized terms
- **Russian**: Advanced language detection and field recognition
- **Polish**: Diacritic handling and Polish-specific patterns

### Intelligent Processing
- **Language Detection**: Automatic language identification
- **Field Mapping**: Smart mapping of headers to standardized fields
- **Data Validation**: Comprehensive validation with confidence scoring
- **Entity Extraction**: Email, currency, date, and company name extraction
- **Data Enhancement**: Normalization and quality improvements

## 📋 API Reference

### ParseRequest Interface

```typescript
interface ParseRequest {
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
```

### ParseResponse Interface

```typescript
interface ParseResponse {
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
```

### ParsedProject Interface

```typescript
interface ParsedProject {
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
```

## 🔧 Usage Examples

### Basic Usage

```typescript
import { notionCRMParser } from './services/notionCRMParser'

// Parse manual text input
const request = {
  source: 'manual' as const,
  data: {
    content: `
      Project: E-commerce Website
      Client: John Smith (john@example.com)
      Budget: $15,000
      Timeline: 8 weeks
      Description: Modern e-commerce platform with payment integration
    `
  },
  options: {
    language: 'en' as const
  }
}

const result = await notionCRMParser.parse(request)
console.log(result.projects[0])
```

### CSV Parsing

```typescript
const csvRequest = {
  source: 'csv' as const,
  data: {
    content: `Project Name,Client Name,Client Email,Budget,Timeline
Website Redesign,Jane Doe,jane@example.com,8000,6 weeks
Mobile App,Mike Johnson,mike@startup.io,25000,12 weeks`
  }
}

const csvResult = await notionCRMParser.parse(csvRequest)
```

### Notion API Integration

```typescript
const notionRequest = {
  source: 'notion' as const,
  data: {
    apiResponse: {
      results: [{
        properties: {
          Name: { title: [{ plain_text: "CRM Integration" }] },
          Client: { rich_text: [{ plain_text: "Alex Rodriguez" }] },
          Budget: { number: 30000 },
          Timeline: { number: 10 }
        }
      }]
    }
  }
}

const notionResult = await notionCRMParser.parse(notionRequest)
```

### CRM Webhook Processing

```typescript
const webhookRequest = {
  source: 'webhook' as const,
  data: {
    apiResponse: {
      data: {
        title: "Marketing Campaign Website",
        person_name: "Lisa Chen",
        person_email: "lisa@agency.com",
        value: 12000,
        notes: "Landing page with analytics integration"
      }
    }
  }
}

const webhookResult = await notionCRMParser.parse(webhookRequest)
```

## 🌍 Multi-Language Support

### Automatic Language Detection

The parser automatically detects the language of input content:

```typescript
// Ukrainian text will be automatically detected
const ukrainianRequest = {
  source: 'manual' as const,
  data: {
    content: `
      Проект: Розробка веб-сайту
      Клієнт: Іван Петренко
      Бюджет: ₴50,000
      Термін: 6 тижнів
    `
  }
  // language will be auto-detected as 'uk'
}
```

### Language-Specific Field Mapping

Each language has its own field mapping terms:

- **English**: "client", "budget", "timeline", "project"
- **Ukrainian**: "клієнт", "бюджет", "термін", "проект"
- **Russian**: "клиент", "бюджет", "срок", "проект"
- **Polish**: "klient", "budżet", "termin", "projekt"

## 📊 Data Quality & Validation

### Confidence Scoring

The parser provides confidence scores based on:
- Data completeness (0-1 scale)
- Field validation results
- Language detection accuracy
- Entity extraction confidence

### Quality Metrics

Each parsed project includes quality metrics:

```typescript
project.customFields.validation = {
  isValid: boolean,
  confidence: number,
  errors: string[],
  warnings: string[],
  completenessScore: number,
  qualityScore: number
}
```

### Validation Rules

- **Email**: RFC-compliant format validation
- **Budget**: Positive numbers, realistic ranges
- **Timeline**: Reasonable duration (1-1095 days)
- **Client Name**: Non-empty, proper formatting
- **Description**: Minimum length requirements

## 🔍 Entity Extraction

### Supported Entities

- **Emails**: RFC-compliant email addresses
- **Currencies**: Multi-currency support ($, €, £, ₴)
- **Dates**: Various formats (MM/DD/YYYY, DD.MM.YYYY, etc.)
- **Phone Numbers**: International format support
- **Company Names**: Common suffixes (LLC, Inc, Ltd, Corp)
- **URLs**: Valid web addresses

### Currency Detection

```typescript
// Supports multiple currency formats
"$15,000"     // USD
"€12,500"     // EUR  
"£8,000"      // GBP
"₴50,000"     // UAH
"15000 USD"   // Text format
```

### Date Pattern Recognition

```typescript
// English formats
"12/25/2024"
"Dec 25, 2024"
"December 25, 2024"

// European formats  
"25.12.2024"
"25/12/2024"

// Localized formats
"25 грудня 2024"  // Ukrainian
"25 декабря 2024" // Russian
"25 grudnia 2024" // Polish
```

## 🛠️ Advanced Features

### Custom Field Mappings

You can extend field mappings for specific use cases:

```typescript
import { LanguageDetection } from './lib/languageDetection'

// Add custom terms
const customMappings = LanguageDetection.getFieldMappings('en')
customMappings.priority.push('urgent', 'critical', 'asap')
```

### Error Handling

The parser provides comprehensive error handling:

```typescript
const result = await notionCRMParser.parse(request)

if (!result.success) {
  console.log('Errors:', result.errors)
  console.log('Warnings:', result.warnings)
}

// Check individual project validation
result.projects.forEach(project => {
  const validation = project.customFields?.validation
  if (!validation?.isValid) {
    console.log('Project issues:', validation?.errors)
  }
})
```

### Performance Optimization

- **Lazy Loading**: Services are loaded on-demand
- **Caching**: Language detection results are cached
- **Batch Processing**: Multiple projects processed efficiently
- **Memory Management**: Large datasets handled appropriately

## 🧪 Testing & Demo

### Demo Component

Use the included demo component to test parser functionality:

```tsx
import { ParserDemo } from './components/ParserDemo'

function App() {
  return <ParserDemo />
}
```

### Sample Data

The demo includes sample data for all supported sources:
- Manual text input examples
- CSV data with headers
- Notion API response format
- CRM webhook payloads

## 🔧 Integration

### With AI Service

The parser integrates seamlessly with the existing AI service:

```typescript
import { aiService } from './services/aiService'

const parseRequest = {
  source: 'manual' as const,
  data: { content: userInput }
}

const parseResult = await aiService.parseExternalData(parseRequest)
```

### With Proposal Generator

Parsed projects can be directly used for proposal generation:

```typescript
const proposalRequest = {
  projectData: parseResult.projects[0],
  userPreferences: {
    tone: 'professional',
    language: parseResult.metadata.language
  }
}

const proposal = await aiService.generateProposal(proposalRequest)
```

## 📈 Best Practices

### Input Data Quality

1. **Structured Data**: Use consistent field names and formats
2. **Complete Information**: Include all available project details
3. **Clean Text**: Remove unnecessary formatting and special characters
4. **Consistent Language**: Use single language per request when possible

### Error Handling

1. **Validate Input**: Check data format before parsing
2. **Handle Failures**: Always check `success` flag in response
3. **Review Warnings**: Address data quality warnings
4. **Confidence Thresholds**: Set minimum confidence levels for acceptance

### Performance

1. **Batch Requests**: Process multiple items together when possible
2. **Language Hints**: Specify language when known to skip detection
3. **Limit Items**: Use `maxItems` option for large datasets
4. **Cache Results**: Store parsed results to avoid re-processing

## 🐛 Troubleshooting

### Common Issues

**Low Confidence Scores**
- Check input data quality and completeness
- Ensure consistent field naming
- Verify language detection accuracy

**Missing Fields**
- Review field mapping terms for your language
- Check input data structure
- Validate required field presence

**Parsing Errors**
- Verify JSON format for API responses
- Check CSV header formatting
- Ensure text encoding is correct

### Debug Information

Enable debug mode by checking `customFields.validation` in parsed projects:

```typescript
const project = result.projects[0]
const debug = project.customFields?.validation

console.log('Validation Details:', {
  isValid: debug?.isValid,
  confidence: debug?.confidence,
  completeness: debug?.completenessScore,
  quality: debug?.qualityScore,
  errors: debug?.errors,
  warnings: debug?.warnings
})
```

## 📚 Additional Resources

- [TypeScript Types](./src/types/parser.ts)
- [Validation Utils](./src/lib/validationUtils.ts)
- [Language Detection](./src/lib/languageDetection.ts)
- [Parser Service](./src/services/notionCRMParser.ts)
- [Demo Component](./src/components/ParserDemo.tsx)

## 🤝 Contributing

When extending the parser:

1. Add new source types to `ParseRequest['source']`
2. Implement parsing method in `NotionCRMParser`
3. Add validation rules in `ValidationUtils`
4. Update language mappings in `LanguageDetection`
5. Add test cases and documentation

## 📄 License

This parser agent is part of the Zapys AI project and follows the same licensing terms.