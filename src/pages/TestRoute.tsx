import React from 'react'

export default function TestRoute() {
  return (
    <div className="min-h-screen bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk p-8">
      <div className="brutal-card p-8">
        <h1 className="text-4xl font-black text-brutalist-black dark:text-brutalist-white uppercase mb-4">
          🚀 TEST ROUTE WORKING!
        </h1>
        <p className="text-lg text-brutalist-gray">
          If you can see this, the routing system is working correctly.
        </p>
        <div className="mt-8 space-y-4">
          <p><strong>Expected Agent 3 URL:</strong> /test/agent3</p>
          <p><strong>Expected Agent 1 URL:</strong> /test/agent1</p>
        </div>
      </div>
    </div>
  )
}