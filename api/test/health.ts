import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  return res.status(200).json({
    status: 'healthy',
    message: 'Agent API endpoints are working',
    timestamp: new Date().toISOString(),
    environment: {
      openai_key_set: !!process.env.OPENAI_API_KEY,
      node_env: process.env.NODE_ENV || 'development'
    }
  })
}