// Proposal Export Service
// Handles exporting proposals to various formats (PDF, Word, Text, etc.)

import jsPDF from 'jspdf';
import { ProposalGenerationResponse } from './aiProposalGenerator';

export interface ExportOptions {
  format: 'pdf' | 'docx' | 'txt' | 'html' | 'json';
  includeMetadata?: boolean;
  includePricing?: boolean;
  customStyling?: {
    primaryColor?: string;
    fontFamily?: string;
    fontSize?: number;
  };
  companyInfo?: {
    name?: string;
    logo?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
}

export class ProposalExportService {
  /**
   * Export proposal to specified format
   */
  async exportProposal(
    proposal: ProposalGenerationResponse,
    options: ExportOptions,
    clientName: string = 'Client'
  ): Promise<void> {
    if (!proposal.success) {
      throw new Error('Cannot export failed proposal');
    }

    switch (options.format) {
      case 'pdf':
        return this.exportToPDF(proposal, options, clientName);
      case 'txt':
        return this.exportToText(proposal, options, clientName);
      case 'html':
        return this.exportToHTML(proposal, options, clientName);
      case 'json':
        return this.exportToJSON(proposal, options, clientName);
      case 'docx':
        return this.exportToDocx(proposal, options, clientName);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export proposal to PDF format
   */
  private async exportToPDF(
    proposal: ProposalGenerationResponse,
    options: ExportOptions,
    clientName: string
  ): Promise<void> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, fontSize: number = 11, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      const textLines = doc.splitTextToSize(text, pageWidth - (margin * 2));
      
      // Check if we need a new page
      if (yPosition + (textLines.length * lineHeight) > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      
      doc.text(textLines, margin, yPosition);
      yPosition += textLines.length * lineHeight + 5;
    };

    // Add company header if provided
    if (options.companyInfo?.name) {
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(options.companyInfo.name, margin, yPosition);
      yPosition += 15;

      if (options.companyInfo.address || options.companyInfo.phone || options.companyInfo.email) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const contactInfo = [
          options.companyInfo.address,
          options.companyInfo.phone,
          options.companyInfo.email,
          options.companyInfo.website
        ].filter(Boolean).join(' • ');
        
        doc.text(contactInfo, margin, yPosition);
        yPosition += 15;
      }
    }

    // Add proposal title
    addWrappedText(proposal.content.title, 18, true);
    yPosition += 5;

    // Add metadata if requested
    if (options.includeMetadata) {
      const metadata = [
        `Word Count: ${proposal.content.metadata.wordCount}`,
        `Reading Time: ${proposal.content.metadata.estimatedReadingTime} minutes`,
        `Tone: ${proposal.content.metadata.tone}`,
        `Language: ${proposal.content.metadata.language}`
      ].join(' • ');
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text(metadata, margin, yPosition);
      yPosition += 10;
    }

    // Add pricing summary if included and available
    if (options.includePricing && proposal.pricing) {
      doc.setFillColor(240, 248, 255);
      doc.rect(margin, yPosition, pageWidth - (margin * 2), 25, 'F');
      
      yPosition += 8;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 100, 200);
      doc.text('Investment Summary', margin + 5, yPosition);
      
      yPosition += 8;
      doc.setFontSize(16);
      doc.setTextColor(0, 150, 0);
      doc.text(`$${proposal.pricing.total.toLocaleString()} ${proposal.pricing.currency}`, margin + 5, yPosition);
      
      yPosition += 15;
      doc.setTextColor(0, 0, 0);
    }

    // Add proposal sections
    const sectionTitles = {
      executive_summary: 'Executive Summary',
      project_understanding: 'Project Understanding',
      proposed_solution: 'Proposed Solution',
      deliverables: 'Deliverables',
      timeline: 'Timeline',
      investment: 'Investment',
      why_choose_us: 'Why Choose Us',
      next_steps: 'Next Steps'
    };

    Object.entries(proposal.content.sections).forEach(([key, content]) => {
      if (content.trim()) {
        const title = sectionTitles[key as keyof typeof sectionTitles] || 
                     key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        addWrappedText(title, 14, true);
        addWrappedText(content, 11, false);
        yPosition += 5;
      }
    });

    // Add pricing breakdown if included
    if (options.includePricing && proposal.pricing) {
      addWrappedText('Investment Breakdown', 14, true);
      
      Object.entries(proposal.pricing.breakdown).forEach(([item, amount]) => {
        addWrappedText(`${item}: $${amount.toLocaleString()}`, 11, false);
      });
    }

    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} • Page ${i} of ${pageCount}`,
        margin,
        pageHeight - 10
      );
    }

    // Save the PDF
    const fileName = `${clientName.replace(/[^a-z0-9]/gi, '_')}_proposal.pdf`;
    doc.save(fileName);
  }

  /**
   * Export proposal to plain text format
   */
  private async exportToText(
    proposal: ProposalGenerationResponse,
    options: ExportOptions,
    clientName: string
  ): Promise<void> {
    let content = '';

    // Add company header
    if (options.companyInfo?.name) {
      content += `${options.companyInfo.name}\n`;
      if (options.companyInfo.address) content += `${options.companyInfo.address}\n`;
      if (options.companyInfo.phone) content += `${options.companyInfo.phone}\n`;
      if (options.companyInfo.email) content += `${options.companyInfo.email}\n`;
      if (options.companyInfo.website) content += `${options.companyInfo.website}\n`;
      content += '\n' + '='.repeat(60) + '\n\n';
    }

    // Add title
    content += `${proposal.content.title}\n`;
    content += '='.repeat(proposal.content.title.length) + '\n\n';

    // Add metadata
    if (options.includeMetadata) {
      content += `Generated on: ${new Date().toLocaleDateString()}\n`;
      content += `Word Count: ${proposal.content.metadata.wordCount}\n`;
      content += `Reading Time: ${proposal.content.metadata.estimatedReadingTime} minutes\n`;
      content += `Tone: ${proposal.content.metadata.tone}\n`;
      content += `Language: ${proposal.content.metadata.language}\n\n`;
    }

    // Add pricing summary
    if (options.includePricing && proposal.pricing) {
      content += 'INVESTMENT SUMMARY\n';
      content += '-'.repeat(20) + '\n';
      content += `Total: $${proposal.pricing.total.toLocaleString()} ${proposal.pricing.currency}\n\n`;
    }

    // Add sections
    const sectionTitles = {
      executive_summary: 'EXECUTIVE SUMMARY',
      project_understanding: 'PROJECT UNDERSTANDING',
      proposed_solution: 'PROPOSED SOLUTION',
      deliverables: 'DELIVERABLES',
      timeline: 'TIMELINE',
      investment: 'INVESTMENT',
      why_choose_us: 'WHY CHOOSE US',
      next_steps: 'NEXT STEPS'
    };

    Object.entries(proposal.content.sections).forEach(([key, sectionContent]) => {
      if (sectionContent.trim()) {
        const title = sectionTitles[key as keyof typeof sectionTitles] || 
                     key.replace(/_/g, ' ').toUpperCase();
        
        content += `${title}\n`;
        content += '-'.repeat(title.length) + '\n';
        content += `${sectionContent}\n\n`;
      }
    });

    // Add pricing breakdown
    if (options.includePricing && proposal.pricing) {
      content += 'INVESTMENT BREAKDOWN\n';
      content += '-'.repeat(20) + '\n';
      Object.entries(proposal.pricing.breakdown).forEach(([item, amount]) => {
        content += `${item}: $${amount.toLocaleString()}\n`;
      });
      content += '\n';
    }

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clientName.replace(/[^a-z0-9]/gi, '_')}_proposal.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Export proposal to HTML format
   */
  private async exportToHTML(
    proposal: ProposalGenerationResponse,
    options: ExportOptions,
    clientName: string
  ): Promise<void> {
    const primaryColor = options.customStyling?.primaryColor || '#7C3AED';
    const fontFamily = options.customStyling?.fontFamily || 'Arial, sans-serif';

    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${proposal.content.title}</title>
    <style>
        body {
            font-family: ${fontFamily};
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            border-bottom: 3px solid ${primaryColor};
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-info {
            color: #666;
            margin-bottom: 20px;
        }
        .title {
            color: ${primaryColor};
            font-size: 2.5em;
            margin: 0;
            font-weight: bold;
        }
        .metadata {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            font-size: 0.9em;
            color: #666;
        }
        .pricing-summary {
            background: linear-gradient(135deg, #e8f5e8, #f0f8f0);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 5px solid #28a745;
        }
        .pricing-total {
            font-size: 2em;
            font-weight: bold;
            color: #28a745;
            margin: 10px 0;
        }
        .section {
            margin: 30px 0;
            padding: 20px 0;
            border-bottom: 1px solid #eee;
        }
        .section:last-child {
            border-bottom: none;
        }
        .section-title {
            color: ${primaryColor};
            font-size: 1.5em;
            font-weight: bold;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .section-content {
            white-space: pre-wrap;
            line-height: 1.8;
        }
        .pricing-breakdown {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 10px;
            margin-top: 15px;
        }
        .pricing-item {
            padding: 8px 0;
            border-bottom: 1px dotted #ccc;
        }
        .pricing-amount {
            font-weight: bold;
            color: #28a745;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">`;

    // Add company info
    if (options.companyInfo?.name) {
      html += `
            <div class="company-info">
                <strong>${options.companyInfo.name}</strong><br>`;
      
      if (options.companyInfo.address) html += `${options.companyInfo.address}<br>`;
      if (options.companyInfo.phone) html += `${options.companyInfo.phone}<br>`;
      if (options.companyInfo.email) html += `${options.companyInfo.email}<br>`;
      if (options.companyInfo.website) html += `${options.companyInfo.website}`;
      
      html += `
            </div>`;
    }

    html += `
            <h1 class="title">${proposal.content.title}</h1>
        </div>`;

    // Add metadata
    if (options.includeMetadata) {
      html += `
        <div class="metadata">
            <strong>Proposal Details:</strong> 
            ${proposal.content.metadata.wordCount} words • 
            ${proposal.content.metadata.estimatedReadingTime} min read • 
            ${proposal.content.metadata.tone} tone • 
            Generated on ${new Date().toLocaleDateString()}
        </div>`;
    }

    // Add pricing summary
    if (options.includePricing && proposal.pricing) {
      html += `
        <div class="pricing-summary">
            <h3>Investment Summary</h3>
            <div class="pricing-total">$${proposal.pricing.total.toLocaleString()} ${proposal.pricing.currency}</div>
        </div>`;
    }

    // Add sections
    const sectionTitles = {
      executive_summary: 'Executive Summary',
      project_understanding: 'Project Understanding',
      proposed_solution: 'Proposed Solution',
      deliverables: 'Deliverables',
      timeline: 'Timeline',
      investment: 'Investment',
      why_choose_us: 'Why Choose Us',
      next_steps: 'Next Steps'
    };

    Object.entries(proposal.content.sections).forEach(([key, content]) => {
      if (content.trim()) {
        const title = sectionTitles[key as keyof typeof sectionTitles] || 
                     key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        html += `
        <div class="section">
            <h2 class="section-title">${title}</h2>
            <div class="section-content">${content}</div>
        </div>`;
      }
    });

    // Add pricing breakdown
    if (options.includePricing && proposal.pricing) {
      html += `
        <div class="section">
            <h2 class="section-title">Investment Breakdown</h2>
            <div class="pricing-breakdown">`;
      
      Object.entries(proposal.pricing.breakdown).forEach(([item, amount]) => {
        html += `
                <div class="pricing-item">${item}</div>
                <div class="pricing-amount">$${amount.toLocaleString()}</div>`;
      });
      
      html += `
            </div>
        </div>`;
    }

    html += `
        <div class="footer">
            <p>This proposal was generated on ${new Date().toLocaleDateString()} using AI-powered proposal generation.</p>
        </div>
    </div>
</body>
</html>`;

    // Create and download file
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clientName.replace(/[^a-z0-9]/gi, '_')}_proposal.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Export proposal to JSON format
   */
  private async exportToJSON(
    proposal: ProposalGenerationResponse,
    options: ExportOptions,
    clientName: string
  ): Promise<void> {
    const exportData = {
      success: true,
      exportedAt: new Date().toISOString(),
      clientName,
      content: proposal.content,
      ...(options.includePricing && proposal.pricing && { pricing: proposal.pricing }),
      ...(options.companyInfo && { companyInfo: options.companyInfo })
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clientName.replace(/[^a-z0-9]/gi, '_')}_proposal.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Export proposal to DOCX-like format (HTML with Word-compatible styling)
   */
  private async exportToDocx(
    proposal: ProposalGenerationResponse,
    options: ExportOptions,
    clientName: string
  ): Promise<void> {
    // For now, we'll create a Word-compatible HTML file
    // In a real implementation, you might use a library like docx or mammoth.js
    
    let content = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="utf-8">
    <title>${proposal.content.title}</title>
    <style>
        @page {
            margin: 1in;
        }
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
        }
        h1 {
            font-size: 18pt;
            font-weight: bold;
            color: #1f4e79;
            margin-bottom: 12pt;
        }
        h2 {
            font-size: 14pt;
            font-weight: bold;
            color: #1f4e79;
            margin-top: 18pt;
            margin-bottom: 6pt;
        }
        p {
            margin-bottom: 6pt;
            text-align: justify;
        }
        .header {
            text-align: center;
            margin-bottom: 24pt;
        }
        .pricing {
            background-color: #f2f2f2;
            padding: 12pt;
            border: 1pt solid #cccccc;
            margin: 12pt 0;
        }
    </style>
</head>
<body>`;

    // Add company header
    if (options.companyInfo?.name) {
      content += `
    <div class="header">
        <h1>${options.companyInfo.name}</h1>`;
      
      if (options.companyInfo.address) content += `<p>${options.companyInfo.address}</p>`;
      if (options.companyInfo.phone || options.companyInfo.email) {
        content += `<p>`;
        if (options.companyInfo.phone) content += options.companyInfo.phone;
        if (options.companyInfo.phone && options.companyInfo.email) content += ' • ';
        if (options.companyInfo.email) content += options.companyInfo.email;
        content += `</p>`;
      }
      
      content += `
    </div>`;
    }

    // Add title
    content += `
    <h1>${proposal.content.title}</h1>`;

    // Add pricing summary
    if (options.includePricing && proposal.pricing) {
      content += `
    <div class="pricing">
        <h2>Investment Summary</h2>
        <p><strong>Total: $${proposal.pricing.total.toLocaleString()} ${proposal.pricing.currency}</strong></p>
    </div>`;
    }

    // Add sections
    const sectionTitles = {
      executive_summary: 'Executive Summary',
      project_understanding: 'Project Understanding',
      proposed_solution: 'Proposed Solution',
      deliverables: 'Deliverables',
      timeline: 'Timeline',
      investment: 'Investment',
      why_choose_us: 'Why Choose Us',
      next_steps: 'Next Steps'
    };

    Object.entries(proposal.content.sections).forEach(([key, sectionContent]) => {
      if (sectionContent.trim()) {
        const title = sectionTitles[key as keyof typeof sectionTitles] || 
                     key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        content += `
    <h2>${title}</h2>
    <p>${sectionContent.replace(/\n/g, '</p><p>')}</p>`;
      }
    });

    content += `
</body>
</html>`;

    // Create and download file
    const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clientName.replace(/[^a-z0-9]/gi, '_')}_proposal.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const proposalExportService = new ProposalExportService();
export default ProposalExportService;