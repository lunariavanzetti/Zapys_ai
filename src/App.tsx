import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Navbar from './components/layout/Navbar'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import ProposalBuilder from './pages/ProposalBuilder'
import ProposalView from './pages/ProposalView'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import AuthPage from './pages/AuthPage'
import AuthCallback from './pages/AuthCallback'
import { Agent3Test } from './pages/Agent3Test'
import { Agent1Test } from './pages/Agent1Test'
import TestRoute from './pages/TestRoute'
import SimpleAgentTest from './pages/SimpleAgentTest'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/proposal/:slug" element={<ProposalView />} />
              
              {/* Agent test routes (simplified auth) */}
              <Route path="/test/route" element={<AppLayout><TestRoute /></AppLayout>} />
              <Route path="/test/agents" element={<AppLayout><SimpleAgentTest /></AppLayout>} />
              <Route path="/test/agent3" element={<AppLayout><Agent3Test /></AppLayout>} />
              <Route path="/test/agent1" element={<AppLayout><Agent1Test /></AppLayout>} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
                <Route path="/create" element={<AppLayout><ProposalBuilder /></AppLayout>} />
                <Route path="/proposal/:id/edit" element={<AppLayout><ProposalBuilder /></AppLayout>} />
                <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
                <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
              </Route>
            </Routes>
            
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#000000',
                  color: '#ffffff',
                  border: '2px solid #00ff00',
                  borderRadius: '0px',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  boxShadow: '4px 4px 0px #00ff00',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

// Layout component for protected routes
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
    </>
  )
}

export default App