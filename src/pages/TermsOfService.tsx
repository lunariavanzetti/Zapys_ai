export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk py-16 px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="brutal-card p-8 mb-8 hover-lift">
          <h1 className="text-6xl font-black text-brutalist-black dark:text-brutalist-white mb-4 uppercase tracking-tight">
            TERMS OF SERVICE
          </h1>
          <p className="text-xl text-brutalist-black dark:text-brutalist-white font-bold uppercase tracking-wider">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="brutal-card p-8 hover-lift">
          <div className="space-y-8 text-brutalist-black dark:text-brutalist-white">
            
            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">1. ACCEPTANCE OF TERMS</h2>
              <p className="text-lg font-medium leading-relaxed">
                By accessing and using Zapys AI ("Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">2. DESCRIPTION OF SERVICE</h2>
              <p className="text-lg font-medium leading-relaxed mb-4">
                Zapys AI is an AI-powered Software as a Service (SaaS) platform that provides:
              </p>
              <ul className="list-disc list-inside text-lg font-medium leading-relaxed ml-6">
                <li>AI-powered proposal generation tools</li>
                <li>Customizable proposal templates</li>
                <li>Client engagement tracking and analytics</li>
                <li>Proposal optimization recommendations</li>
                <li>Integration capabilities with third-party services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">3. USER ACCOUNTS</h2>
              <p className="text-lg font-medium leading-relaxed">
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility 
                for all activities that occur under your account or password. You must notify us immediately of any unauthorized use 
                of your account or any other breach of security.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">4. SUBSCRIPTION AND BILLING</h2>
              <div className="space-y-4 text-lg font-medium leading-relaxed">
                <p>
                  <strong>4.1 Subscription Plans:</strong> We offer various subscription tiers with different features and usage limits.
                </p>
                <p>
                  <strong>4.2 Billing:</strong> Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable 
                  except as expressly stated in our Refund Policy.
                </p>
                <p>
                  <strong>4.3 Auto-Renewal:</strong> Subscriptions automatically renew unless cancelled before the renewal date.
                </p>
                <p>
                  <strong>4.4 Price Changes:</strong> We reserve the right to modify subscription prices with 30 days advance notice.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">5. ACCEPTABLE USE</h2>
              <div className="space-y-4 text-lg font-medium leading-relaxed">
                <p>You agree not to use the Service to:</p>
                <ul className="list-disc list-inside ml-6 space-y-2">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Distribute spam, malware, or harmful content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use the service for competitive analysis or reverse engineering</li>
                  <li>Generate content that is defamatory, obscene, or offensive</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">6. INTELLECTUAL PROPERTY</h2>
              <div className="space-y-4 text-lg font-medium leading-relaxed">
                <p>
                  <strong>6.1 Our Rights:</strong> Zapys AI and all related technology, content, and intellectual property rights remain our property.
                </p>
                <p>
                  <strong>6.2 Your Content:</strong> You retain ownership of content you create using our Service. You grant us a license 
                  to host, store, and process your content solely to provide the Service.
                </p>
                <p>
                  <strong>6.3 Generated Content:</strong> Content generated by our AI tools may be used by you for your business purposes. 
                  We do not claim ownership of AI-generated content created through your use of the Service.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">7. DATA AND PRIVACY</h2>
              <p className="text-lg font-medium leading-relaxed">
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, 
                which is incorporated into these Terms by reference.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">8. LIMITATION OF LIABILITY</h2>
              <p className="text-lg font-medium leading-relaxed">
                Zapys AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">9. TERMINATION</h2>
              <div className="space-y-4 text-lg font-medium leading-relaxed">
                <p>
                  <strong>9.1 By You:</strong> You may terminate your account at any time by contacting our support team.
                </p>
                <p>
                  <strong>9.2 By Us:</strong> We may terminate or suspend your account immediately for violations of these Terms.
                </p>
                <p>
                  <strong>9.3 Effect of Termination:</strong> Upon termination, your right to use the Service ceases immediately. 
                  We will retain your data for 30 days to allow for account recovery.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">10. MODIFICATIONS TO TERMS</h2>
              <p className="text-lg font-medium leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of significant changes via email 
                or through our Service. Continued use of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">11. GOVERNING LAW</h2>
              <p className="text-lg font-medium leading-relaxed">
                These Terms shall be interpreted and governed by the laws of [Your Jurisdiction]. Any disputes shall be resolved 
                in the courts of [Your Jurisdiction].
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">12. CONTACT INFORMATION</h2>
              <div className="text-lg font-medium leading-relaxed">
                <p>For questions about these Terms, please contact us at:</p>
                <p className="mt-2">
                  <strong>Email:</strong> legal@zapysai.com<br/>
                  <strong>Website:</strong> https://zapys-ai.vercel.app
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}