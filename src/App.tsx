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
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />} />
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
function AppLayout() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<ProposalBuilder />} />
          <Route path="/proposal/:id/edit" element={<ProposalBuilder />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </>
  )
}

export default App