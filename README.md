# 🚀 Zapys AI - AI Proposal Generator

> Generate winning proposals in 60 seconds with AI. Built for freelancers and agencies worldwide.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)]()

## ✨ Features

- 🤖 **AI-Powered Generation** - Create complete proposals in under 60 seconds
- 🌍 **Multi-Language Support** - Ukrainian 🇺🇦, Russian 🇷🇺, Polish 🇵🇱, English
- 📊 **Real-time Analytics** - Track client engagement and optimize performance
- 🎨 **Glassmorphic UI** - Modern, beautiful design with dark/light mode
- 🔗 **Notion Integration** - Import project data seamlessly
- 💰 **Subscription Billing** - Paddle integration for recurring revenue

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Anthropic API key
- Paddle account (for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/lunariavanzetti/Zapys_ai.git
cd Zapys_ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

### Database Setup

1. Create a new Supabase project
2. Run the SQL schema:
   ```bash
   # Copy content from database/schema.sql to Supabase SQL editor
   # Copy content from database/queries.sql to Supabase SQL editor
   ```

### Cursor Background Agents

1. Open project in Cursor
2. Load agent configurations:
   - `cursor-agents/agent-ai-proposal-generator.md`
   - `cursor-agents/agent-notion-parser.md`
   - `cursor-agents/agent-analytics-engine.md`

## 🏗️ Tech Stack

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **AI**: Claude 3.5 Sonnet via Cursor Background Agents
- **Payments**: Paddle
- **Deployment**: Vercel

## 📊 Revenue Model

- **Starter**: $19/month (50 proposals)
- **Pro**: $49/month (unlimited proposals + analytics)
- **Agency**: $99/month (white-label + team features)

## 🤖 AI Agents

### agent-ai-proposal-generator
Generates complete, personalized proposals with:
- Executive summary and project understanding
- Detailed scope and timeline
- Pricing recommendations
- Persuasive content optimized for conversion

### agent-notion-parser
Extracts and normalizes data from:
- Notion databases and pages
- CSV files and spreadsheets
- CRM webhooks (Pipedrive, HubSpot)
- Manual text input

### agent-analytics-engine
Processes engagement data to provide:
- Scroll depth and reading patterns
- Conversion funnel analysis
- Content optimization recommendations
- Behavioral insights

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/            # Glass design system
│   ├── auth/          # Authentication
│   └── layout/        # Navigation & layout
├── contexts/          # React contexts
├── pages/             # Application pages
├── services/          # API integrations
└── lib/               # Utilities

database/              # SQL schema & queries
cursor-agents/         # AI agent configurations
```

## 🌐 Deployment

### Environment Variables
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ANTHROPIC_API_KEY=your_anthropic_key
VITE_PADDLE_VENDOR_ID=your_paddle_id
```

### Deploy to Vercel
```bash
npm run build
vercel --prod
```

## 🎯 Target Markets

- **Ukraine** 🇺🇦: 50k+ freelancers
- **Poland** 🇵🇱: 100k+ digital agencies
- **Russia** 🇷🇺: 200k+ freelancers
- **Global**: English-speaking market

## 🏆 Competitive Advantages

1. **AI-First Approach** vs template-based competitors
2. **Multi-Language Support** for underserved markets
3. **Modern UI/UX** vs outdated interfaces
4. **60-Second Generation** vs 2+ hour manual process
5. **Affordable Pricing** starting at $19/month

## 📈 Revenue Projections

- **Month 1-3**: 100 users → $3k MRR
- **Month 4-6**: 500 users → $15k MRR
- **Year 1**: 2000+ users → $60k MRR
- **Year 2**: 5000+ users → $150k+ MRR

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- 📧 Email: support@zapysai.com
- 💬 Discord: [Join our community](https://discord.gg/zapysai)
- 📖 Docs: [Documentation](https://docs.zapysai.com)

---

<div align="center">
  <p>Built with ❤️ by the Zapys AI team</p>
  <p>Empowering freelancers and agencies worldwide</p>
</div>

# Parser Notion CRM Agent

A data extraction expert specializing in parsing project information from Notion pages and CRM data sources.

## 🎯 Overview

This agent extracts structured project data from various sources including:
- Notion public URLs
- CRM webhooks (HubSpot, Pipedrive, Salesforce, etc.)
- Raw text content
- Email content

## 📋 Output Format

The agent returns structured JSON data in the following format:

```json
{
  "success": true,
  "projects": [{
    "title": "Project title",
    "clientName": "Client name",
    "clientEmail": "email@domain.com",
    "clientCompany": "Company name",
    "description": "Detailed project description",
    "deliverables": ["deliverable 1", "deliverable 2"],
    "estimatedBudget": 5000,
    "timeline": 4,
    "industry": "technology/healthcare/retail/etc",
    "priority": "high/medium/low",
    "status": "discovery/proposal/active/completed",
    "tags": ["web", "mobile", "design"],
    "deadline": "2025-12-31",
    "platform": "WordPress/Shopify/React/etc"
  }],
  "metadata": {
    "source": "notion/hubspot/pipedrive/etc",
    "confidence": 0.95,
    "itemCount": 1,
    "language": "en/uk/ru/pl"
  }
}
```

## 🚀 Quick Start

### Basic Usage

```python
from parser_notion_crm_simple import NotionCRMParserSimple

# Initialize parser
parser = NotionCRMParserSimple()

# Parse text content
text_content = """
# Website Redesign Project

Client: John Smith
Company: TechStart Inc.
Email: john.smith@techstart.com

Description: Complete redesign of company website with modern UI/UX.

Budget: $15,000
Timeline: 8 weeks
"""

result = parser.extract_from_text(text_content)
print(result)
```

### Using the API Wrapper

```python
from api_wrapper import ParserAPI

# Initialize API
api = ParserAPI()

# Parse and validate
result = api.parse_text(text_content)
validation = api.validate_extraction(result)
stats = api.get_extraction_stats(result)

# Export to CSV
api.export_to_csv(result, "projects.csv")
```

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd parser-notion-crm
```

2. Install dependencies (optional - for full version):
```bash
pip install -r requirements.txt
```

3. Run the parser:
```bash
python3 parser_notion_crm_simple.py
```

## 🔧 Features

### Data Extraction Capabilities

- **Title Extraction**: Identifies project titles from headers, markdown, and explicit labels
- **Client Information**: Extracts names, emails, and company information
- **Project Description**: Finds and extracts detailed project descriptions
- **Deliverables**: Parses bullet points and numbered lists
- **Budget Analysis**: Identifies monetary amounts in various formats
- **Timeline Detection**: Extracts duration in weeks/months
- **Industry Classification**: Categorizes projects based on keywords
- **Priority Assessment**: Determines urgency levels
- **Status Detection**: Identifies project phases
- **Platform Recognition**: Detects technology platforms
- **Tag Extraction**: Finds hashtags and relevant keywords
- **Deadline Parsing**: Extracts due dates in multiple formats

### Supported Sources

1. **Notion Pages**: Public URLs and exported content
2. **CRM Webhooks**: HubSpot, Pipedrive, Salesforce, Zoho
3. **Text Content**: Markdown, plain text, structured documents
4. **Email Content**: Project inquiries and communications

### Quality Features

- **Confidence Scoring**: Measures extraction reliability
- **Language Detection**: Supports EN, PL, RU, UK
- **Validation System**: Comprehensive quality checks
- **Statistics Generation**: Detailed extraction metrics
- **CSV Export**: Easy data export functionality

## 📊 API Reference

### Core Parser Class

#### `NotionCRMParserSimple`

Main parser class for extracting project data.

**Methods:**

- `extract_from_notion_url(notion_url: str)` - Parse Notion page
- `extract_from_crm_webhook(webhook_data: dict)` - Parse CRM data
- `extract_from_text(text_content: str, source: str)` - Parse text content

### API Wrapper Class

#### `ParserAPI`

High-level API wrapper with additional functionality.

**Methods:**

- `parse_notion_page(notion_url: str)` - Parse Notion URL
- `parse_crm_data(crm_data: dict)` - Parse CRM webhook
- `parse_text(text: str, source: str)` - Parse text content
- `parse_email(email_content: str)` - Parse email content
- `parse_multiple_sources(sources: list)` - Batch processing
- `validate_extraction(result: dict)` - Validate results
- `export_to_csv(result: dict, filename: str)` - Export to CSV
- `get_extraction_stats(result: dict)` - Get statistics

## 🎨 Usage Examples

### Example 1: Notion Page Parsing

```python
parser = NotionCRMParserSimple()
result = parser.extract_from_notion_url("https://notion.so/project-page")
```

### Example 2: CRM Webhook Processing

```python
webhook_data = {
    "source": "hubspot",
    "deal": {
        "name": "Mobile App Development",
        "company": "StartupXYZ",
        "contact_email": "ceo@startupxyz.com",
        "amount": 35000,
        "description": "Develop iOS and Android app",
        "stage": "proposal"
    }
}

result = parser.extract_from_crm_webhook(webhook_data)
```

### Example 3: Multiple Source Processing

```python
api = ParserAPI()

sources = [
    {"type": "notion", "data": "https://notion.so/project-1"},
    {"type": "text", "data": "Project description text..."},
    {"type": "crm", "data": webhook_data}
]

result = api.parse_multiple_sources(sources)
```

### Example 4: Validation and Export

```python
# Parse content
result = api.parse_text(project_text)

# Validate extraction
validation = api.validate_extraction(result)
print(f"Quality Score: {validation['overall_quality_score']}")

# Get statistics
stats = api.get_extraction_stats(result)
print(f"Fields Extracted: {stats['fields_extracted']}")

# Export to CSV
api.export_to_csv(result, "extracted_projects.csv")
```

## 🔍 Extraction Rules

The parser follows these rules for data extraction:

### Client Information
- Searches for patterns like "Client:", "Contact:", "Customer:"
- Extracts email addresses using regex patterns
- Identifies company names from "Company:", "Organization:" labels

### Project Requirements
- Finds descriptions in dedicated sections
- Extracts deliverables from bullet points and numbered lists
- Identifies budget from currency symbols and keywords

### Timeline and Scheduling
- Parses timeline from "weeks", "months" indicators
- Extracts deadlines from date patterns
- Converts months to weeks for standardization

### Classification
- **Industry**: Based on keyword matching across content
- **Priority**: Determined by urgency indicators
- **Status**: Identified from project phase keywords
- **Platform**: Detected from technology mentions

## 📈 Quality Metrics

### Confidence Scoring

The parser calculates confidence based on:
- Title quality (30%)
- Client information completeness (40%)
- Description length and quality (20%)
- Deliverables presence (10%)

### Validation Checks

- **Required Fields**: Title, client info validation
- **Data Quality**: Description length, budget format
- **Completeness**: Deliverables, timeline presence
- **Format Validation**: Email, date format checks

## 🌍 Language Support

- **English (en)**: Full support
- **Polish (pl)**: Basic keyword detection
- **Russian (ru)**: Basic keyword detection
- **Ukrainian (uk)**: Basic keyword detection

## 🔧 Configuration

### Industry Keywords

Customize industry classification by modifying:

```python
self.industry_keywords = {
    'technology': ['software', 'app', 'web', 'mobile'],
    'healthcare': ['medical', 'health', 'hospital'],
    'retail': ['ecommerce', 'shop', 'store'],
    # Add more industries...
}
```

### Priority Indicators

Adjust priority detection:

```python
self.priority_indicators = {
    'high': ['urgent', 'asap', 'critical'],
    'medium': ['important', 'standard'],
    'low': ['low priority', 'nice to have']
}
```

## 🚨 Error Handling

The parser includes comprehensive error handling:

```python
{
  "success": false,
  "error": "Failed to process content: detailed error message",
  "projects": [],
  "metadata": {
    "source": "unknown",
    "confidence": 0.0,
    "itemCount": 0,
    "language": "en"
  }
}
```

## 🧪 Testing

Run the demo scripts to test functionality:

```bash
# Test core parser
python3 parser_notion_crm_simple.py

# Test API wrapper
python3 api_wrapper.py
```

## 📝 File Structure

```
parser-notion-crm/
├── parser_notion_crm.py          # Full version with dependencies
├── parser_notion_crm_simple.py   # Simplified version (no deps)
├── api_wrapper.py                # High-level API wrapper
├── requirements.txt              # Python dependencies
└── README.md                     # This documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues:
1. Check the examples in this README
2. Run the demo scripts for reference
3. Review the API documentation above

## 🔮 Future Enhancements

- [ ] Real Notion API integration
- [ ] Advanced language detection
- [ ] Machine learning classification
- [ ] Web scraping capabilities
- [ ] Database integration
- [ ] REST API endpoints
- [ ] Batch processing optimization