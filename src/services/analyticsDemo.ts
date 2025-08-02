/**
 * Analytics Engine Demo
 * Demonstrates the capabilities of the comprehensive analytics engine
 */

import { analyticsService } from './analyticsService'
import { AnalyticsEvent, AnalyticsRequest } from './analyticsTypes'

/**
 * Demo function showcasing the analytics engine capabilities
 */
export async function runAnalyticsDemo() {
  console.log('🚀 Analytics Engine Demo Starting...')

  // Sample events data
  const sampleEvents: AnalyticsEvent[] = [
    {
      type: 'view',
      timestamp: '2024-01-15T09:30:00Z',
      sessionId: 'session_001',
      visitorId: 'visitor_001',
      metadata: {
        proposalId: 'proposal_123',
        device: { mobile: false, tablet: false, desktop: true },
        userAgent: 'Mozilla/5.0...',
        referrer: 'https://google.com'
      }
    },
    {
      type: 'scroll',
      timestamp: '2024-01-15T09:30:15Z',
      sessionId: 'session_001',
      visitorId: 'visitor_001',
      metadata: {
        proposalId: 'proposal_123',
        scrollDepth: 25,
        section: 'executive_summary'
      }
    },
    {
      type: 'scroll',
      timestamp: '2024-01-15T09:31:30Z',
      sessionId: 'session_001',
      visitorId: 'visitor_001',
      metadata: {
        proposalId: 'proposal_123',
        scrollDepth: 65,
        section: 'deliverables'
      }
    },
    {
      type: 'click',
      timestamp: '2024-01-15T09:32:00Z',
      sessionId: 'session_001',
      visitorId: 'visitor_001',
      metadata: {
        proposalId: 'proposal_123',
        element: 'download_pdf_button',
        position: { x: 450, y: 300 }
      }
    },
    {
      type: 'download',
      timestamp: '2024-01-15T09:32:05Z',
      sessionId: 'session_001',
      visitorId: 'visitor_001',
      metadata: {
        proposalId: 'proposal_123',
        fileType: 'pdf',
        fileName: 'proposal_123.pdf'
      }
    },
    {
      type: 'signature',
      timestamp: '2024-01-15T14:45:00Z',
      sessionId: 'session_002',
      visitorId: 'visitor_001',
      metadata: {
        proposalId: 'proposal_123',
        signatureMethod: 'electronic',
        contractValue: 15000
      }
    }
  ]

  try {
    // Demo 1: Process Events
    console.log('\n📊 Demo 1: Processing Raw Events')
    const eventsRequest: AnalyticsRequest = {
      type: 'event',
      data: {
        proposalId: 'proposal_123',
        events: sampleEvents
      }
    }

    const eventsResult = await analyticsService.processAnalytics(eventsRequest)
    console.log('Events Processing Result:', JSON.stringify(eventsResult, null, 2))

    // Demo 2: Generate Summary
    console.log('\n📈 Demo 2: Generating Analytics Summary')
    const summaryRequest: AnalyticsRequest = {
      type: 'summary',
      data: {
        timeframe: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-31T23:59:59Z'
        },
        filters: {
          status: ['active', 'pending'],
          clientType: ['enterprise', 'sme']
        }
      }
    }

    const summaryResult = await analyticsService.processAnalytics(summaryRequest)
    console.log('Summary Result:', JSON.stringify(summaryResult, null, 2))

    // Demo 3: Generate Insights
    console.log('\n💡 Demo 3: Generating Insights')
    const insightsRequest: AnalyticsRequest = {
      type: 'insight',
      data: {
        proposalId: 'proposal_123',
        timeframe: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-31T23:59:59Z'
        }
      }
    }

    const insightsResult = await analyticsService.processAnalytics(insightsRequest)
    console.log('Insights Result:', JSON.stringify(insightsResult, null, 2))

    // Demo 4: Generate Optimizations
    console.log('\n🎯 Demo 4: Generating Optimization Recommendations')
    const optimizationRequest: AnalyticsRequest = {
      type: 'optimization',
      data: {
        proposalId: 'proposal_123',
        userId: 'user_456'
      }
    }

    const optimizationResult = await analyticsService.processAnalytics(optimizationRequest)
    console.log('Optimization Result:', JSON.stringify(optimizationResult, null, 2))

    console.log('\n✅ Analytics Engine Demo Completed Successfully!')

    return {
      events: eventsResult,
      summary: summaryResult,
      insights: insightsResult,
      optimizations: optimizationResult
    }

  } catch (error) {
    console.error('❌ Demo failed:', error)
    throw error
  }
}

/**
 * Demo of real-time analytics tracking
 */
export function simulateRealTimeTracking() {
  console.log('\n🔄 Simulating Real-Time Analytics Tracking...')

  const trackingInterval = setInterval(async () => {
    const randomEvent: AnalyticsEvent = {
      type: ['view', 'scroll', 'click'][Math.floor(Math.random() * 3)] as any,
      timestamp: new Date().toISOString(),
      sessionId: `session_${Math.random().toString(36).substr(2, 9)}`,
      visitorId: `visitor_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        proposalId: `proposal_${Math.floor(Math.random() * 100)}`,
        scrollDepth: Math.floor(Math.random() * 100),
        device: { mobile: Math.random() > 0.7, tablet: false, desktop: true }
      }
    }

    const request: AnalyticsRequest = {
      type: 'event',
      data: {
        events: [randomEvent]
      }
    }

    try {
      const result = await analyticsService.processAnalytics(request)
      console.log(`📨 Event processed: ${randomEvent.type} - Success: ${result.success}`)
    } catch (error) {
      console.error('❌ Event processing failed:', error)
    }
  }, 2000) // Process an event every 2 seconds

  // Stop simulation after 10 seconds
  setTimeout(() => {
    clearInterval(trackingInterval)
    console.log('🛑 Real-time tracking simulation stopped')
  }, 10000)
}

/**
 * Demo showing A/B testing analytics
 */
export async function demoABTesting() {
  console.log('\n🧪 Demo: A/B Testing Analytics')

  // Simulate A/B test data
  const testAEvents = generateTestEvents('template_A', 50, 0.15) // 15% conversion
  const testBEvents = generateTestEvents('template_B', 50, 0.22) // 22% conversion

  const testARequest: AnalyticsRequest = {
    type: 'event',
    data: {
      events: testAEvents,
      proposalId: 'ab_test_template_A'
    }
  }

  const testBRequest: AnalyticsRequest = {
    type: 'event', 
    data: {
      events: testBEvents,
      proposalId: 'ab_test_template_B'
    }
  }

  const [resultA, resultB] = await Promise.all([
    analyticsService.processAnalytics(testARequest),
    analyticsService.processAnalytics(testBRequest)
  ])

  console.log('Template A Results:', {
    conversionRate: resultA.analytics.summary?.conversionRate,
    avgScrollDepth: resultA.analytics.summary?.avgScrollDepth
  })

  console.log('Template B Results:', {
    conversionRate: resultB.analytics.summary?.conversionRate,
    avgScrollDepth: resultB.analytics.summary?.avgScrollDepth
  })

  const winner = (resultB.analytics.summary?.conversionRate || 0) > (resultA.analytics.summary?.conversionRate || 0) ? 'B' : 'A'
  console.log(`🏆 Winner: Template ${winner}`)

  return { resultA, resultB, winner }
}

/**
 * Helper function to generate test events
 */
function generateTestEvents(templateId: string, sessionCount: number, conversionRate: number): AnalyticsEvent[] {
  const events: AnalyticsEvent[] = []
  
  for (let i = 0; i < sessionCount; i++) {
    const sessionId = `${templateId}_session_${i}`
    const visitorId = `visitor_${i}`
    const shouldConvert = Math.random() < conversionRate

    // View event
    events.push({
      type: 'view',
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      sessionId,
      visitorId,
      metadata: { proposalId: templateId }
    })

    // Scroll events
    for (let j = 0; j < Math.floor(Math.random() * 5) + 1; j++) {
      events.push({
        type: 'scroll',
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        sessionId,
        visitorId,
        metadata: {
          proposalId: templateId,
          scrollDepth: Math.min(100, (j + 1) * 20 + Math.random() * 20)
        }
      })
    }

    // Conversion event
    if (shouldConvert) {
      events.push({
        type: 'signature',
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        sessionId,
        visitorId,
        metadata: { proposalId: templateId }
      })
    }
  }

  return events
}

// Export demo functions for easy usage
export default {
  runAnalyticsDemo,
  simulateRealTimeTracking,
  demoABTesting
}