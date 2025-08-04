#!/usr/bin/env python3
"""
API Wrapper for Parser Notion CRM Agent

Provides easy-to-use methods for extracting project data from various sources.
"""

from parser_notion_crm_simple import NotionCRMParserSimple
import json
from typing import Dict, List, Any, Optional

class ParserAPI:
    """API wrapper for the Notion CRM Parser with simplified methods."""
    
    def __init__(self):
        self.parser = NotionCRMParserSimple()
    
    def parse_notion_page(self, notion_url: str) -> Dict[str, Any]:
        """
        Parse a Notion page URL and extract project data.
        
        Args:
            notion_url (str): URL of the Notion page
            
        Returns:
            Dict containing extracted project data
        """
        return self.parser.extract_from_notion_url(notion_url)
    
    def parse_crm_data(self, crm_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse CRM webhook data and extract project information.
        
        Args:
            crm_data (dict): CRM webhook payload
            
        Returns:
            Dict containing extracted project data
        """
        return self.parser.extract_from_crm_webhook(crm_data)
    
    def parse_text(self, text: str, source: str = "manual") -> Dict[str, Any]:
        """
        Parse raw text content and extract project information.
        
        Args:
            text (str): Raw text content
            source (str): Source identifier
            
        Returns:
            Dict containing extracted project data
        """
        return self.parser.extract_from_text(text, source)
    
    def parse_email(self, email_content: str) -> Dict[str, Any]:
        """
        Parse email content for project information.
        
        Args:
            email_content (str): Email body content
            
        Returns:
            Dict containing extracted project data
        """
        return self.parser.extract_from_text(email_content, source="email")
    
    def parse_multiple_sources(self, sources: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Parse multiple data sources and combine results.
        
        Args:
            sources (list): List of source dictionaries with 'type' and 'data' keys
            
        Returns:
            Dict containing combined project data
        """
        all_projects = []
        total_confidence = 0.0
        languages = set()
        source_types = set()
        
        for source in sources:
            source_type = source.get('type', 'unknown')
            source_data = source.get('data')
            
            if source_type == 'notion':
                result = self.parse_notion_page(source_data)
            elif source_type == 'crm':
                result = self.parse_crm_data(source_data)
            elif source_type == 'text':
                result = self.parse_text(source_data)
            elif source_type == 'email':
                result = self.parse_email(source_data)
            else:
                continue
            
            if result.get('success'):
                all_projects.extend(result['projects'])
                total_confidence += result['metadata']['confidence']
                languages.add(result['metadata']['language'])
                source_types.add(result['metadata']['source'])
        
        avg_confidence = total_confidence / len(sources) if sources else 0.0
        
        return {
            "success": True,
            "projects": all_projects,
            "metadata": {
                "sources": list(source_types),
                "confidence": avg_confidence,
                "itemCount": len(all_projects),
                "languages": list(languages)
            }
        }
    
    def validate_extraction(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate extraction results and provide quality metrics.
        
        Args:
            result (dict): Extraction result from parser
            
        Returns:
            Dict containing validation results
        """
        if not result.get('success'):
            return {
                "valid": False,
                "errors": ["Extraction failed"],
                "quality_score": 0.0
            }
        
        projects = result.get('projects', [])
        if not projects:
            return {
                "valid": False,
                "errors": ["No projects extracted"],
                "quality_score": 0.0
            }
        
        validation_results = []
        
        for i, project in enumerate(projects):
            project_validation = {
                "project_index": i,
                "errors": [],
                "warnings": [],
                "quality_score": 0.0
            }
            
            # Required fields validation
            if not project.get('title') or project['title'] == "Untitled Project":
                project_validation['errors'].append("Missing or invalid title")
            else:
                project_validation['quality_score'] += 0.2
            
            # Client information validation
            if not project.get('clientName') and not project.get('clientEmail'):
                project_validation['warnings'].append("No client information found")
            else:
                project_validation['quality_score'] += 0.2
            
            # Description validation
            if not project.get('description'):
                project_validation['warnings'].append("No description found")
            elif len(project['description']) < 20:
                project_validation['warnings'].append("Description is very short")
            else:
                project_validation['quality_score'] += 0.2
            
            # Budget validation
            if project.get('estimatedBudget') is None:
                project_validation['warnings'].append("No budget information found")
            else:
                project_validation['quality_score'] += 0.1
            
            # Timeline validation
            if project.get('timeline') is None:
                project_validation['warnings'].append("No timeline information found")
            else:
                project_validation['quality_score'] += 0.1
            
            # Deliverables validation
            if not project.get('deliverables'):
                project_validation['warnings'].append("No deliverables found")
            else:
                project_validation['quality_score'] += 0.2
            
            validation_results.append(project_validation)
        
        overall_quality = sum(p['quality_score'] for p in validation_results) / len(validation_results)
        total_errors = sum(len(p['errors']) for p in validation_results)
        
        return {
            "valid": total_errors == 0,
            "overall_quality_score": overall_quality,
            "project_validations": validation_results,
            "summary": {
                "total_projects": len(projects),
                "total_errors": total_errors,
                "total_warnings": sum(len(p['warnings']) for p in validation_results)
            }
        }
    
    def export_to_csv(self, result: Dict[str, Any], filename: str = "projects.csv") -> bool:
        """
        Export extraction results to CSV format.
        
        Args:
            result (dict): Extraction result from parser
            filename (str): Output CSV filename
            
        Returns:
            bool: Success status
        """
        try:
            import csv
            
            if not result.get('success') or not result.get('projects'):
                return False
            
            projects = result['projects']
            
            with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = [
                    'title', 'clientName', 'clientEmail', 'clientCompany', 'description',
                    'estimatedBudget', 'timeline', 'industry', 'priority', 'status',
                    'platform', 'deadline', 'deliverables', 'tags'
                ]
                
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                
                for project in projects:
                    # Convert lists to strings for CSV
                    csv_project = project.copy()
                    csv_project['deliverables'] = '; '.join(project.get('deliverables', []))
                    csv_project['tags'] = '; '.join(project.get('tags', []))
                    
                    writer.writerow(csv_project)
            
            return True
            
        except Exception as e:
            print(f"Error exporting to CSV: {e}")
            return False
    
    def get_extraction_stats(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get statistics about the extraction results.
        
        Args:
            result (dict): Extraction result from parser
            
        Returns:
            Dict containing extraction statistics
        """
        if not result.get('success'):
            return {"error": "Invalid result"}
        
        projects = result.get('projects', [])
        metadata = result.get('metadata', {})
        
        stats = {
            "total_projects": len(projects),
            "source": metadata.get('source', 'unknown'),
            "confidence": metadata.get('confidence', 0.0),
            "language": metadata.get('language', 'unknown'),
            "fields_extracted": {},
            "industry_distribution": {},
            "priority_distribution": {},
            "status_distribution": {}
        }
        
        # Count field extraction success
        fields = ['title', 'clientName', 'clientEmail', 'clientCompany', 'description',
                 'estimatedBudget', 'timeline', 'industry', 'priority', 'status',
                 'platform', 'deadline', 'deliverables', 'tags']
        
        for field in fields:
            count = sum(1 for p in projects if p.get(field))
            stats['fields_extracted'][field] = {
                'count': count,
                'percentage': (count / len(projects) * 100) if projects else 0
            }
        
        # Distribution statistics
        for project in projects:
            industry = project.get('industry', 'unknown')
            priority = project.get('priority', 'unknown')
            status = project.get('status', 'unknown')
            
            stats['industry_distribution'][industry] = stats['industry_distribution'].get(industry, 0) + 1
            stats['priority_distribution'][priority] = stats['priority_distribution'].get(priority, 0) + 1
            stats['status_distribution'][status] = stats['status_distribution'].get(status, 0) + 1
        
        return stats


def demo_api():
    """Demonstrate the API wrapper functionality."""
    api = ParserAPI()
    
    print("=== PARSER API DEMO ===\n")
    
    # Demo 1: Parse text content
    sample_text = """
    Project: Healthcare Mobile App
    
    Client: Dr. Sarah Williams
    Company: MedTech Solutions
    Email: sarah.williams@medtech.com
    
    Description: Develop a mobile application for patient management and appointment scheduling.
    The app should include secure messaging, prescription tracking, and integration with existing EHR systems.
    
    Deliverables:
    - iOS and Android mobile applications
    - Backend API development
    - EHR system integration
    - Security compliance (HIPAA)
    - User training materials
    
    Budget: $45,000
    Timeline: 16 weeks
    Priority: High
    Status: Discovery
    Platform: React Native
    Deadline: 2025-08-15
    
    #healthcare #mobile #hipaa #react-native
    """
    
    result = api.parse_text(sample_text)
    print("1. TEXT PARSING RESULT:")
    print(json.dumps(result, indent=2))
    
    # Demo 2: Validation
    validation = api.validate_extraction(result)
    print("\n2. VALIDATION RESULT:")
    print(json.dumps(validation, indent=2))
    
    # Demo 3: Statistics
    stats = api.get_extraction_stats(result)
    print("\n3. EXTRACTION STATISTICS:")
    print(json.dumps(stats, indent=2))
    
    # Demo 4: Export to CSV
    csv_success = api.export_to_csv(result, "demo_projects.csv")
    print(f"\n4. CSV EXPORT: {'Success' if csv_success else 'Failed'}")


if __name__ == "__main__":
    demo_api()