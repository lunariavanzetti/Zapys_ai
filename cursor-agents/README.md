# Zapys AI - Cursor Background Agents

This directory contains the configuration and prompts for Cursor background agents that power the AI features of Zapys AI.

## 🤖 Agents Overview

Run these 3 agents simultaneously in Cursor for optimal development:

### 1. `agent-ai-proposal-generator`
**Purpose**: Generates complete proposal content using AI
**Input**: Project data, client info, tone preferences
**Output**: Structured proposal with all sections

### 2. `agent-notion-parser` 
**Purpose**: Extracts and structures data from Notion and CRM sources
**Input**: Notion URLs, CSV files, CRM webhooks
**Output**: Standardized project JSON

### 3. `agent-analytics-engine`
**Purpose**: Processes and analyzes user engagement data
**Input**: User interaction events, view data
**Output**: Analytics insights and recommendations

## 🚀 How to Use

1. Start Cursor with this project open
2. Enable background agents in Cursor settings
3. Load each agent configuration file
4. Agents will automatically process requests from the frontend

## 📊 Agent Performance

Each agent maintains its own performance metrics and can be monitored through the Cursor AI dashboard.

## 🔧 Configuration

All agents use Claude 3.5 Sonnet for maximum quality and speed. Configurations are optimized for:
- Fast response times (<3 seconds)
- High-quality outputs
- Consistent formatting
- Error handling