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