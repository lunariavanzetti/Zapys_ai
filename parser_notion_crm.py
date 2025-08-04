#!/usr/bin/env python3
"""
Parser Notion CRM Agent

A data extraction expert specializing in parsing project information 
from Notion pages and CRM data sources.
"""

import json
import re
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union
from urllib.parse import urlparse
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NotionCRMParser:
    """Main parser class for extracting project data from various sources."""
    
    def __init__(self):
        self.industry_keywords = {
            'technology': ['software', 'app', 'web', 'mobile', 'tech', 'digital', 'platform', 'api', 'saas'],
            'healthcare': ['medical', 'health', 'hospital', 'clinic', 'patient', 'healthcare', 'pharma'],
            'retail': ['ecommerce', 'shop', 'store', 'retail', 'product', 'inventory', 'sales'],
            'finance': ['bank', 'financial', 'payment', 'fintech', 'trading', 'investment'],
            'education': ['school', 'university', 'learning', 'course', 'student', 'education'],
            'marketing': ['marketing', 'advertising', 'campaign', 'brand', 'social media'],
            'real estate': ['property', 'real estate', 'housing', 'rental', 'mortgage']
        }
        
        self.priority_indicators = {
            'high': ['urgent', 'asap', 'critical', 'high priority', 'rush', 'immediate'],
            'medium': ['important', 'medium priority', 'standard', 'normal'],
            'low': ['low priority', 'when possible', 'nice to have', 'future']
        }
        
        self.status_indicators = {
            'discovery': ['discovery', 'research', 'planning', 'initial', 'exploration'],
            'proposal': ['proposal', 'quote', 'estimate', 'bidding', 'pitch'],
            'active': ['active', 'in progress', 'development', 'working', 'ongoing'],
            'completed': ['completed', 'finished', 'done', 'delivered', 'closed']
        }
        
        self.platform_keywords = [
            'wordpress', 'shopify', 'react', 'vue', 'angular', 'django', 'flask',
            'laravel', 'rails', 'node.js', 'next.js', 'gatsby', 'squarespace',
            'webflow', 'wix', 'magento', 'prestashop'
        ]

    def extract_from_notion_url(self, notion_url: str) -> Dict[str, Any]:
        """Extract project data from a Notion public URL."""
        try:
            # For demonstration, we'll simulate fetching Notion content
            # In practice, you'd need Notion API credentials or web scraping
            logger.info(f"Processing Notion URL: {notion_url}")
            
            # Simulate notion content (in practice, fetch via API or scraping)
            sample_content = self._get_notion_sample_content()
            
            return self._parse_content(sample_content, source="notion")
            
        except Exception as e:
            logger.error(f"Error processing Notion URL: {e}")
            return self._create_error_response(f"Failed to process Notion URL: {e}")

    def extract_from_crm_webhook(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract project data from CRM webhook payload."""
        try:
            logger.info("Processing CRM webhook data")
            
            # Determine CRM source
            source = self._identify_crm_source(webhook_data)
            
            # Convert webhook data to text for parsing
            content = self._webhook_to_text(webhook_data)
            
            return self._parse_content(content, source=source)
            
        except Exception as e:
            logger.error(f"Error processing CRM webhook: {e}")
            return self._create_error_response(f"Failed to process CRM webhook: {e}")

    def extract_from_text(self, text_content: str, source: str = "text") -> Dict[str, Any]:
        """Extract project data from raw text content."""
        try:
            logger.info("Processing text content")
            return self._parse_content(text_content, source=source)
            
        except Exception as e:
            logger.error(f"Error processing text content: {e}")
            return self._create_error_response(f"Failed to process text: {e}")

    def _parse_content(self, content: str, source: str) -> Dict[str, Any]:
        """Main content parsing logic."""
        try:
            # Extract basic project information
            title = self._extract_title(content)
            client_info = self._extract_client_info(content)
            description = self._extract_description(content)
            deliverables = self._extract_deliverables(content)
            budget = self._extract_budget(content)
            timeline = self._extract_timeline(content)
            industry = self._classify_industry(content)
            priority = self._determine_priority(content)
            status = self._determine_status(content)
            tags = self._extract_tags(content)
            deadline = self._extract_deadline(content)
            platform = self._extract_platform(content)
            language = self._detect_language(content)
            
            # Calculate confidence score
            confidence = self._calculate_confidence({
                'title': title,
                'client_info': client_info,
                'description': description,
                'deliverables': deliverables
            })
            
            project = {
                "title": title,
                "clientName": client_info.get('name', ''),
                "clientEmail": client_info.get('email', ''),
                "clientCompany": client_info.get('company', ''),
                "description": description,
                "deliverables": deliverables,
                "estimatedBudget": budget,
                "timeline": timeline,
                "industry": industry,
                "priority": priority,
                "status": status,
                "tags": tags,
                "deadline": deadline,
                "platform": platform
            }
            
            return {
                "success": True,
                "projects": [project],
                "metadata": {
                    "source": source,
                    "confidence": confidence,
                    "itemCount": 1,
                    "language": language
                }
            }
            
        except Exception as e:
            logger.error(f"Error parsing content: {e}")
            return self._create_error_response(f"Failed to parse content: {e}")

    def _extract_title(self, content: str) -> str:
        """Extract project title from content."""
        # Look for common title patterns
        patterns = [
            r'^#\s+(.+)$',  # Markdown h1
            r'^\*\*(.+)\*\*$',  # Bold text
            r'Title:\s*(.+)$',  # Explicit title
            r'Project:\s*(.+)$',  # Project label
            r'^(.+)\n[=-]{3,}',  # Underlined title
        ]
        
        for pattern in patterns:
            match = re.search(pattern, content, re.MULTILINE | re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        # Fallback: use first line if it looks like a title
        first_line = content.split('\n')[0].strip()
        if first_line and len(first_line) < 100:
            return first_line
        
        return "Untitled Project"

    def _extract_client_info(self, content: str) -> Dict[str, str]:
        """Extract client information from content."""
        client_info = {'name': '', 'email': '', 'company': ''}
        
        # Email extraction
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, content)
        if emails:
            client_info['email'] = emails[0]
        
        # Client name patterns
        name_patterns = [
            r'Client:\s*(.+)$',
            r'Contact:\s*(.+)$',
            r'Customer:\s*(.+)$',
            r'Point of Contact:\s*(.+)$'
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, content, re.MULTILINE | re.IGNORECASE)
            if match:
                client_info['name'] = match.group(1).strip()
                break
        
        # Company patterns
        company_patterns = [
            r'Company:\s*(.+)$',
            r'Organization:\s*(.+)$',
            r'Business:\s*(.+)$'
        ]
        
        for pattern in company_patterns:
            match = re.search(pattern, content, re.MULTILINE | re.IGNORECASE)
            if match:
                client_info['company'] = match.group(1).strip()
                break
        
        return client_info

    def _extract_description(self, content: str) -> str:
        """Extract project description from content."""
        # Look for description sections
        desc_patterns = [
            r'Description:\s*(.+?)(?=\n\n|\n[A-Z]|\Z)',
            r'Overview:\s*(.+?)(?=\n\n|\n[A-Z]|\Z)',
            r'Summary:\s*(.+?)(?=\n\n|\n[A-Z]|\Z)',
            r'Details:\s*(.+?)(?=\n\n|\n[A-Z]|\Z)'
        ]
        
        for pattern in desc_patterns:
            match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        # Fallback: extract meaningful paragraphs
        paragraphs = [p.strip() for p in content.split('\n\n') if len(p.strip()) > 50]
        if paragraphs:
            return paragraphs[0]
        
        return ""

    def _extract_deliverables(self, content: str) -> List[str]:
        """Extract deliverables from content."""
        deliverables = []
        
        # Look for bullet points and numbered lists
        bullet_patterns = [
            r'^\s*[-*•]\s+(.+)$',  # Bullet points
            r'^\s*\d+\.\s+(.+)$',  # Numbered lists
            r'^\s*[▪▫]\s+(.+)$'    # Alternative bullets
        ]
        
        for line in content.split('\n'):
            for pattern in bullet_patterns:
                match = re.match(pattern, line)
                if match:
                    deliverable = match.group(1).strip()
                    if deliverable and deliverable not in deliverables:
                        deliverables.append(deliverable)
        
        # Look for deliverables section
        deliverables_section = re.search(
            r'Deliverables?:\s*(.+?)(?=\n\n|\n[A-Z]|\Z)', 
            content, 
            re.DOTALL | re.IGNORECASE
        )
        
        if deliverables_section:
            section_text = deliverables_section.group(1)
            for line in section_text.split('\n'):
                line = line.strip()
                if line and not line.startswith(('Deliverable', 'deliverable')):
                    deliverables.append(line)
        
        return deliverables[:10]  # Limit to 10 deliverables

    def _extract_budget(self, content: str) -> Optional[int]:
        """Extract estimated budget from content."""
        # Look for currency amounts
        currency_patterns = [
            r'[\$€£¥]\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',
            r'(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|EUR|GBP|dollars?|euros?)',
            r'Budget:\s*[\$€£¥]?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',
            r'Price:\s*[\$€£¥]?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',
            r'Cost:\s*[\$€£¥]?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)'
        ]
        
        for pattern in currency_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                # Convert to integer (remove commas and decimals)
                amount_str = matches[0].replace(',', '').split('.')[0]
                try:
                    return int(amount_str)
                except ValueError:
                    continue
        
        return None

    def _extract_timeline(self, content: str) -> Optional[int]:
        """Extract timeline in weeks from content."""
        timeline_patterns = [
            r'(\d+)\s*weeks?',
            r'(\d+)\s*months?\s*(?:timeline|duration|period)',
            r'Timeline:\s*(\d+)\s*(?:weeks?|months?)',
            r'Duration:\s*(\d+)\s*(?:weeks?|months?)',
            r'(\d+)\s*week\s*project'
        ]
        
        for pattern in timeline_patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                number = int(match.group(1))
                # Convert months to weeks if needed
                if 'month' in match.group(0).lower():
                    number *= 4
                return number
        
        return None

    def _classify_industry(self, content: str) -> str:
        """Classify industry based on content keywords."""
        content_lower = content.lower()
        
        industry_scores = {}
        for industry, keywords in self.industry_keywords.items():
            score = sum(1 for keyword in keywords if keyword in content_lower)
            if score > 0:
                industry_scores[industry] = score
        
        if industry_scores:
            return max(industry_scores, key=industry_scores.get)
        
        return "general"

    def _determine_priority(self, content: str) -> str:
        """Determine project priority based on content."""
        content_lower = content.lower()
        
        for priority, indicators in self.priority_indicators.items():
            if any(indicator in content_lower for indicator in indicators):
                return priority
        
        return "medium"  # Default priority

    def _determine_status(self, content: str) -> str:
        """Determine project status based on content."""
        content_lower = content.lower()
        
        for status, indicators in self.status_indicators.items():
            if any(indicator in content_lower for indicator in indicators):
                return status
        
        return "discovery"  # Default status

    def _extract_tags(self, content: str) -> List[str]:
        """Extract relevant tags from content."""
        tags = []
        content_lower = content.lower()
        
        # Technology tags
        tech_tags = ['web', 'mobile', 'design', 'backend', 'frontend', 'api', 'database']
        for tag in tech_tags:
            if tag in content_lower:
                tags.append(tag)
        
        # Platform tags
        for platform in self.platform_keywords:
            if platform.lower() in content_lower:
                tags.append(platform.lower())
        
        # Custom hashtags
        hashtags = re.findall(r'#(\w+)', content)
        tags.extend(hashtags)
        
        return list(set(tags))[:10]  # Remove duplicates and limit

    def _extract_deadline(self, content: str) -> Optional[str]:
        """Extract deadline from content."""
        # Look for date patterns
        date_patterns = [
            r'Deadline:\s*(\d{4}-\d{2}-\d{2})',
            r'Due:\s*(\d{4}-\d{2}-\d{2})',
            r'(\d{1,2}/\d{1,2}/\d{4})',
            r'(\d{1,2}-\d{1,2}-\d{4})',
            r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                date_str = match.group(1)
                try:
                    # Try to parse and standardize the date
                    if '/' in date_str:
                        parts = date_str.split('/')
                        return f"{parts[2]}-{parts[0].zfill(2)}-{parts[1].zfill(2)}"
                    elif '-' in date_str and len(date_str.split('-')[0]) <= 2:
                        parts = date_str.split('-')
                        return f"{parts[2]}-{parts[0].zfill(2)}-{parts[1].zfill(2)}"
                    else:
                        return date_str
                except:
                    continue
        
        return None

    def _extract_platform(self, content: str) -> str:
        """Extract platform/technology from content."""
        content_lower = content.lower()
        
        for platform in self.platform_keywords:
            if platform.lower() in content_lower:
                return platform.title()
        
        return ""

    def _detect_language(self, content: str) -> str:
        """Detect content language (simplified)."""
        # Simple language detection based on common words
        content_lower = content.lower()
        
        if any(word in content_lower for word in ['the', 'and', 'project', 'client']):
            return 'en'
        elif any(word in content_lower for word in ['projekt', 'klient', 'opis']):
            return 'pl'
        elif any(word in content_lower for word in ['проект', 'клиент', 'описание']):
            return 'ru'
        elif any(word in content_lower for word in ['project', 'client', 'description']):
            return 'uk'
        
        return 'en'  # Default to English

    def _calculate_confidence(self, extracted_data: Dict[str, Any]) -> float:
        """Calculate confidence score based on extracted data quality."""
        score = 0.0
        max_score = 1.0
        
        # Title presence and quality
        if extracted_data.get('title') and extracted_data['title'] != "Untitled Project":
            score += 0.3
        
        # Client information
        client_info = extracted_data.get('client_info', {})
        if client_info.get('name'):
            score += 0.2
        if client_info.get('email'):
            score += 0.2
        
        # Description quality
        description = extracted_data.get('description', '')
        if description and len(description) > 50:
            score += 0.2
        
        # Deliverables
        deliverables = extracted_data.get('deliverables', [])
        if deliverables:
            score += 0.1
        
        return min(score, max_score)

    def _identify_crm_source(self, webhook_data: Dict[str, Any]) -> str:
        """Identify CRM source from webhook data."""
        # Check for common CRM identifiers
        if 'hubspot' in str(webhook_data).lower():
            return 'hubspot'
        elif 'pipedrive' in str(webhook_data).lower():
            return 'pipedrive'
        elif 'salesforce' in str(webhook_data).lower():
            return 'salesforce'
        elif 'zoho' in str(webhook_data).lower():
            return 'zoho'
        
        return 'crm'

    def _webhook_to_text(self, webhook_data: Dict[str, Any]) -> str:
        """Convert webhook data to parseable text."""
        # Extract relevant fields and convert to text
        text_parts = []
        
        def extract_values(obj, prefix=""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    if isinstance(value, (dict, list)):
                        extract_values(value, f"{prefix}{key}: ")
                    else:
                        text_parts.append(f"{prefix}{key}: {value}")
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    extract_values(item, f"{prefix}[{i}] ")
            else:
                text_parts.append(f"{prefix}{obj}")
        
        extract_values(webhook_data)
        return '\n'.join(text_parts)

    def _get_notion_sample_content(self) -> str:
        """Get sample Notion content for demonstration."""
        return """# Website Redesign Project

**Client:** John Smith
**Company:** TechStart Inc.
**Email:** john.smith@techstart.com

## Project Description
Complete redesign of company website with modern UI/UX, improved performance, and mobile responsiveness. The current site is outdated and not converting visitors effectively.

## Deliverables
- New website design mockups
- Responsive frontend development
- CMS integration
- SEO optimization
- Performance optimization
- Testing and deployment

**Budget:** $15,000
**Timeline:** 8 weeks
**Priority:** High
**Status:** Active
**Deadline:** 2025-03-15
**Platform:** WordPress

#web #design #wordpress #responsive
"""

    def _create_error_response(self, error_message: str) -> Dict[str, Any]:
        """Create standardized error response."""
        return {
            "success": False,
            "error": error_message,
            "projects": [],
            "metadata": {
                "source": "unknown",
                "confidence": 0.0,
                "itemCount": 0,
                "language": "en"
            }
        }


def main():
    """Example usage of the NotionCRMParser."""
    parser = NotionCRMParser()
    
    # Example 1: Parse from Notion URL
    notion_url = "https://www.notion.so/sample-project-page"
    result1 = parser.extract_from_notion_url(notion_url)
    print("Notion extraction result:")
    print(json.dumps(result1, indent=2))
    
    # Example 2: Parse from text content
    sample_text = """
    # E-commerce Platform Development
    
    Client: Sarah Johnson
    Company: Fashion Forward LLC
    Email: sarah@fashionforward.com
    
    Description: Build a complete e-commerce platform for selling fashion items online. 
    Need shopping cart, payment integration, inventory management, and admin dashboard.
    
    Deliverables:
    - Product catalog system
    - Shopping cart functionality  
    - Payment gateway integration
    - User authentication
    - Admin dashboard
    - Mobile app (iOS/Android)
    
    Budget: $25,000
    Timeline: 12 weeks
    Priority: High
    Platform: Shopify
    Deadline: 2025-06-30
    
    #ecommerce #mobile #shopify
    """
    
    result2 = parser.extract_from_text(sample_text)
    print("\nText extraction result:")
    print(json.dumps(result2, indent=2))


if __name__ == "__main__":
    main()