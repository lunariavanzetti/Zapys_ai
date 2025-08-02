import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Settings, Languages, Palette, FileText, Loader2, Check, AlertCircle } from 'lucide-react';
import { openaiService } from '../services/openaiService';
import { OpenAIProposalResponse } from '../services/openaiService';

interface AIProposalGeneratorProps {
  onProposalGenerated?: (proposal: OpenAIProposalResponse) => void;
  initialData?: {
    title?: string;
    clientName?: string;
    clientEmail?: string;
    clientCompany?: string;
    description?: string;
    estimatedBudget?: number;
    timeline?: number;
    industry?: string;
    deliverables?: string[];
  };
}

export default function AIProposalGenerator({ onProposalGenerated, initialData }: AIProposalGeneratorProps) {
  // Form state
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    clientName: initialData?.clientName || '',
    clientEmail: initialData?.clientEmail || '',
    clientCompany: initialData?.clientCompany || '',
    description: initialData?.description || '',
    estimatedBudget: initialData?.estimatedBudget || '',
    timeline: initialData?.timeline || '',
    industry: initialData?.industry || '',
    deliverables: initialData?.deliverables?.join('\n') || ''
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    tone: 'professional' as const,
    language: 'en' as const,
    templateType: 'custom' as const,
    brandVoice: '',
    customInstructions: ''
  });

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [generatedProposal, setGeneratedProposal] = useState<ProposalGenerationResponse | null>(null);
  const [currentStep, setCurrentStep] = useState<'form' | 'generating' | 'result'>('form');

  // Service data
  const [templates, setTemplates] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [tones, setTones] = useState<any[]>([]);

  useEffect(() => {
    // Load service data
    setTemplates(aiService.getAvailableTemplates());
    setLanguages(aiService.getSupportedLanguages());
    setTones(aiService.getAvailableTones());
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handlePreferenceChange = (field: string, value: string) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const validation = aiService.validateProposalRequest({
      projectData: {
        title: formData.title,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientCompany: formData.clientCompany,
        description: formData.description,
        estimatedBudget: formData.estimatedBudget ? Number(formData.estimatedBudget) : undefined,
        timeline: formData.timeline ? Number(formData.timeline) : undefined,
        industry: formData.industry,
        deliverables: formData.deliverables ? formData.deliverables.split('\n').filter(d => d.trim()) : undefined
      },
      userPreferences: preferences,
      templateType: preferences.templateType as any
    });

    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleGenerate = async () => {
    if (!validateForm()) {
      return;
    }

    setIsGenerating(true);
    setCurrentStep('generating');

    try {
      const response = await aiService.generateProposalFromProject(
        {
          title: formData.title,
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientCompany: formData.clientCompany,
          description: formData.description,
          estimatedBudget: formData.estimatedBudget ? Number(formData.estimatedBudget) : undefined,
          timeline: formData.timeline ? Number(formData.timeline) : undefined,
          industry: formData.industry,
          deliverables: formData.deliverables ? formData.deliverables.split('\n').filter(d => d.trim()) : undefined
        },
        preferences
      );

      setGeneratedProposal(response);
      setCurrentStep('result');
      onProposalGenerated?.(response);

    } catch (error) {
      console.error('Error generating proposal:', error);
      setErrors(['Failed to generate proposal. Please try again.']);
      setCurrentStep('form');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartOver = () => {
    setCurrentStep('form');
    setGeneratedProposal(null);
    setErrors([]);
  };

  if (currentStep === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center"
        >
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 border-2 border-purple-200 border-t-purple-600 rounded-full"
              />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Generating Your Proposal
          </h3>
          <p className="text-gray-600 mb-4">
            Our AI is crafting a personalized proposal tailored to your project requirements...
          </p>
          
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Analyzing project requirements</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Selecting optimal template</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span>Generating proposal content</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (currentStep === 'result' && generatedProposal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Proposal Generated Successfully!</h2>
                  <p className="opacity-90">
                    {generatedProposal.content.metadata.wordCount} words • 
                    {generatedProposal.content.metadata.estimatedReadingTime} min read • 
                    {generatedProposal.content.metadata.tone} tone
                  </p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <Check className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {generatedProposal.content.title}
                </h3>
                
                {generatedProposal.pricing && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-green-800 mb-2">Investment Breakdown</h4>
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      ${generatedProposal.pricing.total.toLocaleString()} {generatedProposal.pricing.currency}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(generatedProposal.pricing.breakdown).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">{key}:</span>
                          <span className="font-medium">${value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Proposal Sections */}
              <div className="space-y-6">
                {Object.entries(generatedProposal.content.sections).map(([key, content]) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="font-semibold text-gray-900 mb-3 capitalize">
                      {key.replace(/_/g, ' ')}
                    </h4>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {content}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    // Copy to clipboard or download functionality would go here
                    navigator.clipboard.writeText(JSON.stringify(generatedProposal.content.sections, null, 2));
                  }}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <FileText className="w-5 h-5" />
                  <span>Copy Proposal</span>
                </button>
                <button
                  onClick={handleStartOver}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Generate New
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-lg p-2">
                <Wand2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI Proposal Generator</h2>
                <p className="opacity-90">Generate professional proposals in 60 seconds</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Error Display */}
            {errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h4 className="font-medium text-red-800">Please fix the following errors:</h4>
                </div>
                <ul className="list-disc list-inside text-red-700 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Project Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="e.g., Website Redesign Project"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Name *
                      </label>
                      <input
                        type="text"
                        value={formData.clientName}
                        onChange={(e) => handleInputChange('clientName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="e.g., John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Email
                      </label>
                      <input
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="client@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={formData.clientCompany}
                        onChange={(e) => handleInputChange('clientCompany', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="e.g., Acme Corporation"
                      />
                    </div>
                  </div>
                </div>

                {/* Project Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Describe the project requirements, goals, and expected outcomes..."
                  />
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget ($)
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedBudget}
                      onChange={(e) => handleInputChange('estimatedBudget', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeline (weeks)
                    </label>
                    <input
                      type="number"
                      value={formData.timeline}
                      onChange={(e) => handleInputChange('timeline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="8"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., E-commerce"
                    />
                  </div>
                </div>

                {/* Deliverables */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Deliverables (one per line)
                  </label>
                  <textarea
                    value={formData.deliverables}
                    onChange={(e) => handleInputChange('deliverables', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Custom website design&#10;Mobile responsive layout&#10;Content management system&#10;SEO optimization"
                  />
                </div>
              </div>

              {/* Preferences Sidebar */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Preferences</span>
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Template Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Template Type
                      </label>
                      <select
                        value={preferences.templateType}
                        onChange={(e) => handlePreferenceChange('templateType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                        <Palette className="w-4 h-4" />
                        <span>Tone</span>
                      </label>
                      <select
                        value={preferences.tone}
                        onChange={(e) => handlePreferenceChange('tone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        {tones.map((tone) => (
                          <option key={tone.id} value={tone.id}>
                            {tone.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Language */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                        <Languages className="w-4 h-4" />
                        <span>Language</span>
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) => handlePreferenceChange('language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        {languages.map((language) => (
                          <option key={language.code} value={language.code}>
                            {language.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Advanced Options Toggle */}
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-4"
                  >
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                  </button>

                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 mt-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Brand Voice
                        </label>
                        <textarea
                          value={preferences.brandVoice}
                          onChange={(e) => handlePreferenceChange('brandVoice', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Describe your brand personality..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Custom Instructions
                        </label>
                        <textarea
                          value={preferences.customInstructions}
                          onChange={(e) => handlePreferenceChange('customInstructions', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Any specific requirements..."
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      <span>Generate Proposal</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}