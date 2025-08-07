export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk py-16 px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="brutal-card p-8 mb-8 hover-lift">
          <h1 className="text-6xl font-black text-brutalist-black dark:text-brutalist-white mb-4 uppercase tracking-tight">
            PRIVACY POLICY
          </h1>
          <p className="text-xl text-brutalist-black dark:text-brutalist-white font-bold uppercase tracking-wider">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="brutal-card p-8 hover-lift">
          <div className="space-y-8 text-brutalist-black dark:text-brutalist-white">
            
            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">1. INFORMATION WE COLLECT</h2>
              <div className="space-y-4 text-lg font-medium leading-relaxed">
                <div>
                  <h3 className="text-xl font-black mb-2 uppercase">1.1 ACCOUNT INFORMATION</h3>
                  <p>When you create an account, we collect:</p>
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>Email address</li>
                    <li>Full name</li>
                    <li>Password (encrypted)</li>
                    <li>Company name (optional)</li>
                    <li>Profile preferences</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-black mb-2 uppercase">1.2 USAGE DATA</h3>
                  <p>We automatically collect information about how you use our Service:</p>
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>Proposals created and their performance metrics</li>
                    <li>Feature usage and interaction patterns</li>
                    <li>Login times and session duration</li>
                    <li>Device and browser information</li>
                    <li>IP address and location data</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-black mb-2 uppercase">1.3 CONTENT DATA</h3>
                  <p>Content you create through our Service:</p>
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>Proposal text and templates</li>
                    <li>Client information and contact details</li>
                    <li>Project descriptions and requirements</li>
                    <li>Custom settings and preferences</li>
                    <li>Files and attachments you upload</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">2. HOW WE USE YOUR INFORMATION</h2>
              <div className="text-lg font-medium leading-relaxed">
                <p className="mb-4">We use the information we collect to:</p>
                <ul className="list-disc list-inside ml-6 space-y-2">
                  <li><strong>Provide our Service:</strong> Process your requests, generate proposals, and deliver features</li>
                  <li><strong>Improve our Service:</strong> Analyze usage patterns to enhance functionality and user experience</li>
                  <li><strong>Communicate with you:</strong> Send service updates, security alerts, and support messages</li>
                  <li><strong>Process payments:</strong> Handle billing, subscriptions, and financial transactions</li>
                  <li><strong>Ensure security:</strong> Detect fraud, prevent abuse, and protect our systems</li>
                  <li><strong>Legal compliance:</strong> Meet legal obligations and respond to legal requests</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">3. AI AND DATA PROCESSING</h2>
              <div className="space-y-4 text-lg font-medium leading-relaxed">
                <div>
                  <h3 className="text-xl font-black mb-2 uppercase">3.1 AI-GENERATED CONTENT</h3>
                  <p>
                    Our AI algorithms process your input data to generate proposals and recommendations. 
                    This processing happens on secure servers and your content is not used to train our models 
                    or shared with other users.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-black mb-2 uppercase">3.2 DATA ANONYMIZATION</h3>
                  <p>
                    We may use anonymized and aggregated data for analytics, research, and service improvement. 
                    This data cannot be linked back to individual users.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">4. INFORMATION SHARING</h2>
              <div className="space-y-4 text-lg font-medium leading-relaxed">
                <p>We do not sell, trade, or rent your personal information. We may share information only in these situations:</p>
                <ul className="list-disc list-inside ml-6 space-y-2">
                  <li><strong>Service Providers:</strong> Third-party services that help us operate our platform (payment processing, hosting, analytics)</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                  <li><strong>Business Transfer:</strong> In case of merger, acquisition, or sale of business assets</li>
                  <li><strong>Safety and Security:</strong> To protect the rights, property, or safety of our users or others</li>
                  <li><strong>With Your Consent:</strong> When you explicitly authorize us to share specific information</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">5. DATA SECURITY</h2>
              <div className="space-y-4 text-lg font-medium leading-relaxed">
                <p>We implement industry-standard security measures:</p>
                <ul className="list-disc list-inside ml-6 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Access controls and authentication requirements</li>
                  <li>Employee training on data protection practices</li>
                  <li>Incident response procedures for security breaches</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">6. YOUR RIGHTS AND CHOICES</h2>
              <div className="space-y-4 text-lg font-medium leading-relaxed">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc list-inside ml-6 space-y-2">
                  <li><strong>Access:</strong> Request copies of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                  <li><strong>Restriction:</strong> Limit how we process your data</li>
                  <li><strong>Objection:</strong> Object to certain types of data processing</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, contact us at privacy@zapysai.com. We will respond within 30 days.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">7. COOKIES AND TRACKING</h2>
              <div className="space-y-4 text-lg font-medium leading-relaxed">
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc list-inside ml-6 space-y-2">
                  <li>Remember your login status and preferences</li>
                  <li>Analyze website traffic and user behavior</li>
                  <li>Provide personalized content and features</li>
                  <li>Measure the effectiveness of our marketing</li>
                </ul>
                <p className="mt-4">
                  You can control cookies through your browser settings. Note that disabling cookies may affect Service functionality.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">8. DATA RETENTION</h2>
              <div className="space-y-4 text-lg font-medium leading-relaxed">
                <p>We retain your information for as long as:</p>
                <ul className="list-disc list-inside ml-6 space-y-2">
                  <li>Your account is active</li>
                  <li>Needed to provide our services</li>
                  <li>Required for legal, tax, or accounting purposes</li>
                  <li>Necessary to resolve disputes or enforce agreements</li>
                </ul>
                <p className="mt-4">
                  After account deletion, we retain data for 30 days to allow account recovery, then permanently delete personal data while retaining anonymized analytics data.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">9. INTERNATIONAL DATA TRANSFERS</h2>
              <p className="text-lg font-medium leading-relaxed">
                Your data may be transferred to and processed in countries other than your residence. We ensure appropriate 
                safeguards are in place to protect your data in accordance with applicable privacy laws.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">10. CHILDREN'S PRIVACY</h2>
              <p className="text-lg font-medium leading-relaxed">
                Our Service is not intended for children under 13. We do not knowingly collect personal information from children under 13. 
                If we discover we have collected such information, we will delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">11. CHANGES TO THIS POLICY</h2>
              <p className="text-lg font-medium leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes via email 
                or through our Service. Your continued use of the Service after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">12. CONTACT US</h2>
              <div className="text-lg font-medium leading-relaxed">
                <p>For questions about this Privacy Policy or our data practices, contact us at:</p>
                <div className="mt-4 space-y-2">
                  <p><strong>Email:</strong> privacy@zapysai.com</p>
                  <p><strong>Data Protection Officer:</strong> dpo@zapysai.com</p>
                  <p><strong>Website:</strong> https://zapys-ai.vercel.app</p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}