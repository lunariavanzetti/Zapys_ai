# 🤖 Cursor Background Agents Setup Guide

## 🎯 Overview
You need to run **3 background agents simultaneously** in Cursor for Zapys AI to work properly.

## 📋 Prerequisites
1. ✅ Cursor IDE installed
2. ✅ Project opened in Cursor
3. ✅ GitHub repository connected
4. ✅ Anthropic API key available

## 🚀 Step-by-Step Setup

### 1. Open Cursor Settings
- Press `Cmd/Ctrl + ,` to open settings
- Navigate to **"AI"** → **"Background Agents"**
- Enable **"Background Agents"** feature

### 2. Load Agent Configurations

In Cursor terminal, run these commands one by one:

```bash
# Agent 1: AI Proposal Generator
cursor agent create --name "ai-proposal-generator" --config "./cursor-agents/agent-ai-proposal-generator.md"

# Agent 2: Notion & CRM Parser  
cursor agent create --name "notion-parser" --config "./cursor-agents/agent-notion-parser.md"

# Agent 3: Analytics Engine
cursor agent create --name "analytics-engine" --config "./cursor-agents/agent-analytics-engine.md"
```

### 3. Verify Agents Are Running

Check agent status:
```bash
cursor agent list
```

You should see:
```
✅ ai-proposal-generator (ACTIVE)
✅ notion-parser (ACTIVE)  
✅ analytics-engine (ACTIVE)
```

### 4. Configure API Keys

Create `.env` file with your keys:
```bash
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 5. Test Agents

Open the Cursor AI chat and try these commands:

**Test Proposal Generator:**
```
@ai-proposal-generator Generate a proposal for:
- Client: Coffee Shop Inc.
- Project: Website redesign
- Budget: $5000
- Language: English
- Tone: Professional
```

**Test Notion Parser:**
```
@notion-parser Parse this project data:
"Project: Mobile App for Restaurant
Client: John's Bistro  
Budget: $10,000
Deadline: 8 weeks
Features: Online ordering, loyalty program"
```

**Test Analytics Engine:**
```
@analytics-engine Analyze this engagement data:
- Total views: 127
- Scroll depth: 73%
- Time on page: 4:32
- Conversion: 23%
```

## 🔧 Alternative Setup (Manual)

If automatic setup doesn't work:

1. **Open Cursor AI Panel** (Cmd/Ctrl + L)
2. **Click "+" to add new agent**
3. **Copy and paste** each agent configuration:
   - `agent-ai-proposal-generator.md`
   - `agent-notion-parser.md` 
   - `agent-analytics-engine.md`
4. **Save and activate** each agent

## ⚡ Agent Functionality

### 🎨 AI Proposal Generator
- **Input**: Project details, client info, preferences
- **Output**: Complete proposal with all sections
- **Use**: Called when user clicks "Generate with AI"

### 📊 Notion Parser
- **Input**: Notion URLs, CSV data, CRM webhooks
- **Output**: Structured project data
- **Use**: When importing external project data

### 📈 Analytics Engine  
- **Input**: User engagement events, proposal metrics
- **Output**: Insights and optimization recommendations
- **Use**: Processing analytics and generating reports

## 🐛 Troubleshooting

### Agents Not Responding
```bash
# Restart agents
cursor agent restart ai-proposal-generator
cursor agent restart notion-parser
cursor agent restart analytics-engine
```

### API Key Issues
- Verify Anthropic API key is valid
- Check environment variables are loaded
- Restart Cursor completely

### Performance Issues
- Close unused agents temporarily
- Check system resources (RAM/CPU)
- Restart Cursor if agents become slow

## 🎯 Usage in Application

Once agents are running, the React app will automatically:

1. **Proposal Creation**: `aiService.generateProposal()` → calls `ai-proposal-generator`
2. **Data Import**: `aiService.parseExternalData()` → calls `notion-parser`  
3. **Analytics**: `aiService.processAnalytics()` → calls `analytics-engine`

## ✅ Success Checklist

- [ ] Cursor installed and project opened
- [ ] All 3 agents created and active
- [ ] API keys configured in .env
- [ ] Test commands work in Cursor chat
- [ ] React app can call AI services
- [ ] No console errors in browser

## 🚨 Important Notes

1. **Keep Cursor Open**: Agents only work while Cursor is running
2. **Resource Usage**: 3 agents use significant RAM/CPU
3. **API Costs**: Monitor Anthropic usage and costs
4. **Rate Limits**: Agents respect API rate limits automatically

## 🎉 Ready to Use!

Once all agents are active, your Zapys AI platform will have full AI functionality:
- ⚡ 60-second proposal generation
- 🔄 Automatic data parsing from Notion/CRMs
- 📊 Real-time analytics and insights

**Your SaaS is now fully operational! 🚀**