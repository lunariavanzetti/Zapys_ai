import { Link } from 'react-router-dom'
import { Zap, Mail, Twitter, Linkedin, Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-brutalist-black dark:bg-brutalist-dark-gray border-t-4 border-electric-500 mt-16">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="flex items-center justify-center w-12 h-12 bg-electric-500 border-2 border-brutalist-white shadow-brutal group-hover:shadow-brutal-lg group-hover:-translate-x-1 group-hover:-translate-y-1 transition-all duration-200">
                <Zap className="h-7 w-7 text-brutalist-black" />
              </div>
              <span className="text-2xl font-black text-brutalist-white uppercase tracking-tight">ZAPYS AI</span>
            </Link>
            <p className="text-brutalist-white font-bold uppercase tracking-wider text-sm leading-relaxed">
              AI-POWERED PROPOSAL GENERATION FOR THE FUTURE OF BUSINESS
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-electric-500 border-2 border-brutalist-white shadow-brutal hover-lift flex items-center justify-center group">
                <Twitter className="h-5 w-5 text-brutalist-black group-hover:animate-bounce" />
              </a>
              <a href="#" className="w-10 h-10 bg-electric-500 border-2 border-brutalist-white shadow-brutal hover-lift flex items-center justify-center group">
                <Linkedin className="h-5 w-5 text-brutalist-black group-hover:animate-bounce" />
              </a>
              <a href="#" className="w-10 h-10 bg-electric-500 border-2 border-brutalist-white shadow-brutal hover-lift flex items-center justify-center group">
                <Github className="h-5 w-5 text-brutalist-black group-hover:animate-bounce" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="text-xl font-black text-electric-500 uppercase tracking-wider mb-4">
              PRODUCT
            </h3>
            <div className="space-y-3">
              <Link to="/pricing" className="block text-brutalist-white font-bold uppercase tracking-wider text-sm hover:text-electric-500 transition-colors">
                PRICING
              </Link>
              <Link to="/auth" className="block text-brutalist-white font-bold uppercase tracking-wider text-sm hover:text-electric-500 transition-colors">
                GET STARTED
              </Link>
              <Link to="/dashboard" className="block text-brutalist-white font-bold uppercase tracking-wider text-sm hover:text-electric-500 transition-colors">
                DASHBOARD
              </Link>
              <Link to="/analytics" className="block text-brutalist-white font-bold uppercase tracking-wider text-sm hover:text-electric-500 transition-colors">
                ANALYTICS
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-xl font-black text-electric-500 uppercase tracking-wider mb-4">
              LEGAL
            </h3>
            <div className="space-y-3">
              <Link to="/terms" className="block text-brutalist-white font-bold uppercase tracking-wider text-sm hover:text-electric-500 transition-colors">
                TERMS OF SERVICE
              </Link>
              <Link to="/privacy" className="block text-brutalist-white font-bold uppercase tracking-wider text-sm hover:text-electric-500 transition-colors">
                PRIVACY POLICY
              </Link>
              <Link to="/refund-policy" className="block text-brutalist-white font-bold uppercase tracking-wider text-sm hover:text-electric-500 transition-colors">
                REFUND POLICY
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-xl font-black text-electric-500 uppercase tracking-wider mb-4">
              CONTACT
            </h3>
            <div className="space-y-3">
              <a href="mailto:zapysaiproduction@gmail.com" className="flex items-center text-brutalist-white font-bold uppercase tracking-wider text-sm hover:text-electric-500 transition-colors">
                <Mail className="h-4 w-4 mr-2" />
                ZAPYSAIPRODUCTION@GMAIL.COM
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t-2 border-electric-500">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-brutalist-white font-bold uppercase tracking-wider text-sm">
              © {new Date().getFullYear()} ZAPYS AI. ALL RIGHTS RESERVED.
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/terms" className="text-brutalist-white font-bold uppercase tracking-wider text-sm hover:text-electric-500 transition-colors">
                TERMS
              </Link>
              <Link to="/privacy" className="text-brutalist-white font-bold uppercase tracking-wider text-sm hover:text-electric-500 transition-colors">
                PRIVACY
              </Link>
              <Link to="/refund-policy" className="text-brutalist-white font-bold uppercase tracking-wider text-sm hover:text-electric-500 transition-colors">
                REFUND
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}