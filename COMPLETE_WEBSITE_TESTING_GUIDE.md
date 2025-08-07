# 🧪 **COMPLETE ZAPYS AI WEBSITE TESTING GUIDE**

## **CURRENT IMPLEMENTATION STATUS**

**❌ NOT YET IMPLEMENTED:**
- Notion/CRM data import
- File upload for client emails/briefs
- HubSpot integration
- Advanced import functionality

**✅ CURRENTLY AVAILABLE:**
- Manual form-based proposal creation
- AI-powered proposal generation
- Basic dashboard functionality
- User authentication
- 6 background AI agents (API testing only)

---

## **1. 🏠 LANDING PAGE TESTING**

### **URL:** https://zapys-ai.vercel.app

### **What to Test:**
1. **Page Load:** Does it load completely with brutal design?
2. **Navigation:** Click "SIGN IN" button
3. **Hero Section:** Verify "60 SECONDS" messaging is prominent
4. **Features:** Check 4 feature cards display correctly
5. **Testimonials:** Verify Ukrainian/Polish testimonials show
6. **Pricing:** Check 3 pricing tiers ($19/$49/$99)
7. **CTA Buttons:** All "START FREE TRIAL" buttons should work

### **Expected Results:**
- ✅ Brutal design with electric green (#00ff00) accents
- ✅ Space Grotesk font throughout
- ✅ Animated geometric background elements
- ✅ All CTAs redirect to /auth page
- ✅ Mobile responsive design

---

## **2. 🔐 AUTHENTICATION TESTING**

### **URL:** https://zapys-ai.vercel.app/auth

### **Test Data to Use:**
- **Method:** Google OAuth (recommended)
- **Alternative:** Any valid email/password

### **What to Test:**
1. Click "Continue with Google"
2. Complete Google OAuth flow
3. Should redirect to /auth/callback
4. Should finally land on /dashboard

### **Expected Results:**
- ✅ Smooth OAuth flow
- ✅ No infinite loading loops
- ✅ Successful redirect to dashboard
- ✅ User profile appears in top-right corner

### **⚠️ Known Issues:**
- Sometimes takes 10-15 seconds to complete
- May show "COMPLETING SIGN IN..." briefly

---

## **3. 📊 DASHBOARD TESTING**

### **URL:** https://zapys-ai.vercel.app/dashboard

### **What to Test:**
1. **Stats Cards:** Should show 0 values for new users
2. **Quick Actions:** "CREATE NEW PROPOSAL" button
3. **Recent Proposals:** Empty state for new users
4. **Navigation:** Top menu functionality

### **Expected Results:**
- ✅ Dashboard loads within 2 seconds
- ✅ Shows default stats (all zeros)
- ✅ Brutal loading animation
- ✅ "CREATE NEW PROPOSAL" leads to /create

### **Sample Data You Should See:**
```
Total Proposals: 0
This Month: 0
Total Views: 0
Conversion Rate: 0%
Revenue: $0
Active: 0
```

---

## **4. 📝 PROPOSAL BUILDER TESTING**

### **URL:** https://zapys-ai.vercel.app/create

### **REQUIRED FIELDS (marked with *):**
- **PROJECT TITLE:** E-commerce Platform Development
- **CLIENT NAME:** John Smith
- **PROJECT DESCRIPTION:** Modern e-commerce website with payment integration, user authentication, admin dashboard, product catalog, and inventory management

### **OPTIONAL FIELDS:**
- **CLIENT EMAIL:** john.smith@example.com
- **COMPANY:** TechCorp Ukraine
- **ESTIMATED BUDGET ($):** 25000
- **TIMELINE (WEEKS):** 12
- **TONE:** Professional
- **LANGUAGE:** English
- **TEMPLATE:** Web Development

### **Step-by-Step Testing:**

#### **Step 1: Fill Form**
```
PROJECT TITLE: "E-commerce Platform Development"
CLIENT NAME: "John Smith"
CLIENT EMAIL: "john.smith@techcorp.ua"
COMPANY: "TechCorp Ukraine"
PROJECT DESCRIPTION: "We need a modern e-commerce platform built with React and Node.js. The platform should include user authentication, product catalog, shopping cart, payment integration with Stripe, admin dashboard for inventory management, order tracking system, and responsive design for mobile devices. The target audience is small to medium Ukrainian businesses."
ESTIMATED BUDGET ($): 25000
TIMELINE (WEEKS): 12
TONE: "Professional"
LANGUAGE: "English"
TEMPLATE: "Web Development"
```

#### **Step 2: Generate Proposal**
- Click "GENERATE PROPOSAL WITH AI"
- Wait 5-15 seconds for generation
- Should see success toast notification

#### **Step 3: Review Results**
**Expected Proposal Sections:**
1. **Executive Summary:** Personalized for TechCorp Ukraine
2. **Project Understanding:** Reflects e-commerce requirements
3. **Technical Approach:** React/Node.js architecture details
4. **Timeline & Milestones:** 12-week breakdown
5. **Investment Breakdown:** ~$25K pricing structure
6. **Why Choose Us:** Competitive advantages
7. **Next Steps:** Clear action items

#### **Step 4: Save Proposal**
- Click "SAVE DRAFT" button
- Should see success message
- Should redirect to dashboard
- New proposal should appear in "Recent Proposals"

### **Expected AI Generation Results:**
```json
{
  "title": "E-commerce Platform Development Proposal for TechCorp Ukraine",
  "sections": {
    "executive_summary": "Professional summary mentioning client by name",
    "project_understanding": "Detailed understanding of e-commerce needs",
    "technical_approach": "React, Node.js, Stripe integration details",
    "timeline": "12-week project breakdown with milestones",
    "investment": "Pricing around $25,000 with breakdown",
    "why_choose_us": "Competitive advantages and expertise",
    "next_steps": "Clear call-to-action and contact information"
  }
}
```

---

## **5. 🧪 AI AGENTS TESTING (API ONLY)**

### **Access:** https://zapys-ai.vercel.app/test

### **Agent 1 - Parser Test:**
```bash
curl -X POST https://zapys-ai.vercel.app/api/test/agent1 \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Client: John Smith from TechCorp Ukraine, Email: john.smith@techcorp.ua, Project: E-commerce platform, Budget: $25,000, Timeline: 3 months",
    "source_type": "text"
  }'
```

**Expected Result:**
- Parsed client data (name, email, company)
- Project details extraction
- Budget and timeline identification
- Confidence score 85%+

### **Agent 2 - Proposal Generator Test:**
```bash
curl -X POST https://zapys-ai.vercel.app/api/test/agent2 \
  -H "Content-Type: application/json" \
  -d '{
    "client_data": {"name": "John Smith", "company": "TechCorp Ukraine"},
    "project_data": {"title": "E-commerce Platform", "description": "Modern online store"},
    "market_context": {"target_market": "ukraine", "language": "en"}
  }'
```

**Expected Result:**
- Complete proposal with 6-8 sections
- Personalized content for TechCorp Ukraine
- Professional business tone
- Market-appropriate language

### **Agent 3 - Pricing Test:**
```bash
curl -X POST https://zapys-ai.vercel.app/api/test/agent3 \
  -H "Content-Type: application/json" \
  -d '{
    "content": "E-commerce platform with React, Node.js, Stripe payments, admin dashboard",
    "market": "ukraine",
    "language": "en"
  }'
```

**Expected Result:**
- Pricing range: $20K-$30K
- Ukrainian market adjustments
- Feature-by-feature breakdown
- Timeline: 10-14 weeks

---

## **6. 🚨 ERROR TESTING**

### **Invalid Inputs to Test:**

#### **Proposal Builder Errors:**
1. **Empty Required Fields:** Leave PROJECT TITLE blank
2. **Invalid Budget:** Enter "abc" in budget field
3. **Invalid Timeline:** Enter negative numbers

#### **Expected Error Messages:**
- "Please fill in title, client name, and description"
- "Budget must be a positive number"
- "Timeline must be between 1-52 weeks"

### **Network Errors:**
- **Disconnect internet** during proposal generation
- **Expected:** "Failed to generate proposal" error toast

---

## **7. 📱 MOBILE TESTING**

### **Breakpoints to Test:**
- **Mobile:** 375px width
- **Tablet:** 768px width
- **Desktop:** 1024px+ width

### **What Should Work:**
- ✅ Navigation collapses properly
- ✅ Form fields stack vertically
- ✅ Buttons remain accessible
- ✅ Text remains readable
- ✅ No horizontal scrolling

---

## **8. 🎯 PERFORMANCE TESTING**

### **Expected Load Times:**
- **Landing Page:** < 3 seconds
- **Dashboard:** < 2 seconds  
- **Proposal Generation:** 5-15 seconds
- **Save Operation:** < 3 seconds

### **Browser Compatibility:**
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## **9. 📋 COMPLETE TESTING CHECKLIST**

### **Basic Functionality:**
- [ ] Landing page loads completely
- [ ] Google OAuth authentication works
- [ ] Dashboard displays correctly
- [ ] Can create new proposal
- [ ] AI generation completes successfully
- [ ] Can save proposal as draft
- [ ] Saved proposal appears in dashboard

### **Form Validation:**
- [ ] Required fields show validation errors
- [ ] Invalid data types are rejected
- [ ] Success messages appear correctly
- [ ] Error messages are clear and helpful

### **UI/UX:**
- [ ] Brutal design theme is consistent
- [ ] Electric green accents work properly
- [ ] Animations and transitions are smooth
- [ ] Responsive design works on mobile
- [ ] Dark/light theme toggle functions

### **API Integration:**
- [ ] OpenAI API calls succeed
- [ ] Database saves work correctly
- [ ] Error handling is appropriate
- [ ] Response times are acceptable

---

## **10. 🐛 KNOWN ISSUES TO EXPECT**

### **Current Limitations:**
1. **No File Upload:** Cannot upload client briefs/emails
2. **No CRM Integration:** Notion/HubSpot not connected
3. **Basic Preview:** Proposal preview is limited
4. **No Email Sending:** Cannot send proposals directly
5. **Limited Templates:** Only basic template options

### **Workarounds:**
- **For Client Data:** Copy/paste manually into form fields
- **For Complex Projects:** Use detailed project description
- **For Multi-language:** Generate in English, translate manually

---

## **📊 SUCCESS CRITERIA**

After completing all tests, you should have:
- ✅ Successfully created user account
- ✅ Generated at least one complete proposal
- ✅ Saved proposal to dashboard
- ✅ Verified all core functionality works
- ✅ Confirmed brutal design loads properly
- ✅ Tested API agents via curl commands

**If any of these fail, report the specific error message and steps to reproduce.**

---

## **📧 CONTACT FOR ISSUES**

If you encounter problems during testing:
1. **Screenshot the error**
2. **Note the exact steps taken**
3. **Include browser and OS information**
4. **Copy any console error messages**

This will help diagnose and fix any issues quickly.