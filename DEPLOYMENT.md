# 🚀 Zapys AI - Deployment Guide

## 📋 Prerequisites Setup

### 1. Create External Services

#### Supabase Setup
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key
3. Run the database schema:
   ```sql
   -- Copy and paste the content from database/schema.sql
   -- Copy and paste the content from database/queries.sql
   ```
4. Enable Google and Apple OAuth in Authentication settings

#### Paddle Setup
1. Create account at [paddle.com](https://paddle.com)
2. Set up subscription products:
   - Starter: $19/month
   - Pro: $49/month  
   - Agency: $99/month
3. Copy your Vendor ID and configure webhooks

#### Vercel Setup
1. Install Vercel CLI: `npm i -g vercel`
2. Link your GitHub repository
3. Configure environment variables in Vercel dashboard

#### Anthropic API Setup
1. Get API key from [console.anthropic.com](https://console.anthropic.com)
2. Add to environment variables

### 2. Environment Variables

Create `.env` file:
```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Anthropic API
VITE_ANTHROPIC_API_KEY=your_anthropic_key

# Paddle
VITE_PADDLE_VENDOR_ID=your_vendor_id
VITE_PADDLE_ENVIRONMENT=sandbox

# App
VITE_APP_ENV=development
VITE_APP_URL=http://localhost:3000
```

## 🤖 Cursor Agents Setup

### 1. Install Cursor
Download from [cursor.sh](https://cursor.sh)

### 2. Configure Background Agents
1. Open Cursor settings
2. Enable "Background Agents" feature
3. Load agent configurations from `cursor-agents/` directory:
   - `agent-ai-proposal-generator.md`
   - `agent-notion-parser.md`
   - `agent-analytics-engine.md`

### 3. Start Agents
Run all 3 agents simultaneously:
```bash
# In Cursor terminal
cursor --agent load ./cursor-agents/agent-ai-proposal-generator.md
cursor --agent load ./cursor-agents/agent-notion-parser.md  
cursor --agent load ./cursor-agents/agent-analytics-engine.md
```

## 🛠️ Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Setup Database
1. Run schema.sql in Supabase SQL editor
2. Run queries.sql for functions
3. Test authentication flow

### 4. Test AI Features
1. Create a test proposal
2. Verify Cursor agents are responding
3. Check database insertions

## 🌐 Production Deployment

### 1. Build Project
```bash
npm run build
```

### 2. Deploy to Vercel
```bash
vercel --prod
```

### 3. Configure Production Environment
1. Update environment variables in Vercel
2. Set Paddle to production mode
3. Configure custom domain
4. Enable Vercel Analytics

### 4. Database Migration
1. Run production schema on Supabase
2. Enable RLS policies
3. Set up backup schedule
4. Configure monitoring

## 📊 Monitoring & Analytics

### 1. Error Tracking
- Supabase Dashboard for database errors
- Vercel Analytics for frontend metrics
- Cursor Agent monitoring for AI performance

### 2. Performance Monitoring
- Core Web Vitals via Vercel
- Database query performance in Supabase
- API response times

### 3. Business Metrics
- User signups and conversions
- Proposal generation volume
- Subscription revenue (Paddle dashboard)

## 🔐 Security Checklist

- ✅ Environment variables secured
- ✅ RLS policies enabled on all tables
- ✅ API keys rotated regularly
- ✅ HTTPS enforced
- ✅ Input validation on all forms
- ✅ Rate limiting on AI endpoints

## 📈 Scaling Considerations

### Database
- Enable connection pooling in Supabase
- Set up read replicas for analytics
- Monitor query performance

### AI Services
- Implement request queuing for high volume
- Add fallback providers (OpenAI, etc.)
- Cache common responses

### Frontend
- Enable Vercel Edge Functions
- Implement service worker caching
- Optimize bundle sizes

## 🚨 Troubleshooting

### Common Issues

**Cursor Agents Not Responding**
- Check API key configuration
- Verify agent prompt loading
- Restart Cursor with --verbose flag

**Supabase Connection Issues**
- Verify environment variables
- Check RLS policies
- Monitor connection pool usage

**Build Failures**
- Clear node_modules and reinstall
- Check TypeScript errors
- Verify all environment variables

### Debug Commands
```bash
# Check build locally
npm run build && npm run preview

# Test database connection
npm run test:db

# Validate environment
npm run test:env

# Check agent status
cursor --agent status
```

## 📞 Support

- Technical issues: Check console logs and network requests
- Database issues: Supabase dashboard logs
- AI issues: Cursor agent monitoring dashboard
- Payment issues: Paddle dashboard and webhooks