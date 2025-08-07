import Footer from '../components/layout/Footer'

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk py-16 px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="brutal-card p-8 mb-8 hover-lift">
          <h1 className="text-6xl font-black text-brutalist-black dark:text-brutalist-white mb-4 uppercase tracking-tight">
            REFUND POLICY
          </h1>
          <p className="text-xl text-brutalist-black dark:text-brutalist-white font-bold uppercase tracking-wider">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="brutal-card p-8 hover-lift">
          <div className="space-y-8 text-brutalist-black dark:text-brutalist-white">
            
            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">1. REFUND ELIGIBILITY</h2>
              <div className="space-y-4 text-lg font-medium leading-relaxed">
                <p>
                  We offer refunds under specific circumstances to ensure customer satisfaction while maintaining 
                  the sustainability of our Service.
                </p>
                
                <div>
                  <h3 className="text-xl font-black mb-2 uppercase">1.1 ELIGIBLE REFUNDS</h3>
                  <ul className="list-disc list-inside ml-6 space-y-2">
                    <li><strong>Service Unavailability:</strong> Extended service outages lasting more than 24 consecutive hours</li>
                    <li><strong>Billing Errors:</strong> Incorrect charges or duplicate payments</li>
                    <li><strong>Account Issues:</strong> Technical problems preventing service access for more than 48 hours</li>
                    <li><strong>Dissatisfaction:</strong> Within 7 days of initial subscription for new customers only</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-black mb-2 uppercase">1.2 NON-ELIGIBLE REFUNDS</h3>
                  <ul className="list-disc list-inside ml-6 space-y-2">
                    <li>Refunds requested after the 7-day initial trial period</li>
                    <li>Partial month refunds for early cancellation</li>
                    <li>Refunds due to changes in business needs or requirements</li>
                    <li>Refunds for accounts suspended due to Terms of Service violations</li>
                    <li>Refunds for add-on services or one-time purchases after 24 hours</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">2. REFUND TIMEFRAMES</h2>
              <div className="space-y-4 text-lg font-medium leading-relaxed">
                <div>
                  <h3 className="text-xl font-black mb-2 uppercase">2.1 NEW CUSTOMER TRIAL</h3>
                  <p>
                    New customers can request a full refund within <strong>7 days</strong> of their initial subscription. 
                    This applies only to first-time subscribers who have not previously used our Service.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-black mb-2 uppercase">2.2 BILLING ERROR REFUNDS</h3>
                  <p>
                    Refunds for billing errors or technical issues can be requested within <strong>30 days</strong> 
                    of the billing date. We will investigate and process eligible refunds within 5-7 business days.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-black mb-2 uppercase">2.3 SERVICE ISSUE REFUNDS</h3>
                  <p>
                    For service unavailability or technical problems, refunds must be requested within <strong>14 days</strong> 
                    of the incident. We may provide account credits as an alternative to cash refunds.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">3. REFUND PROCESS</h2>
              <div className="space-y-4 text-lg font-medium leading-relaxed">
                <div>
                  <h3 className="text-xl font-black mb-2 uppercase">3.1 HOW TO REQUEST</h3>
                  <p>To request a refund:</p>
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-2">
                    <li>Email us at <strong>support@zapysai.com</strong> with "Refund Request" in the subject line</li>
                    <li>Include your account email address and subscription details</li>
                    <li>Provide a clear reason for the refund request</li>
                    <li>Include any relevant documentation or screenshots</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-black mb-2 uppercase">3.2 REVIEW PROCESS</h3>
                  <ul className="list-disc list-inside ml-6 space-y-2">
                    <li>We will acknowledge your request within 24 hours</li>
                    <li>Our team will review your case within 3-5 business days</li>
                    <li>We may request additional information or documentation</li>
                    <li>You will receive a decision via email with next steps</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-black mb-2 uppercase">3.3 PROCESSING TIME</h3>
                  <p>Approved refunds will be processed as follows:</p>
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-2">
                    <li><strong>Credit Card:</strong> 5-10 business days</li>
                    <li><strong>PayPal:</strong> 3-5 business days</li>
                    <li><strong>Bank Transfer:</strong> 7-14 business days</li>
                    <li><strong>Other Payment Methods:</strong> Varies by provider</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">4. PARTIAL REFUNDS</h2>
              <div className="space-y-4 text-lg font-medium leading-relaxed">
                <p>
                  In certain circumstances, we may offer partial refunds:
                </p>
                <ul className="list-disc list-inside ml-6 space-y-2">
                  <li><strong>Service Interruptions:</strong> Pro-rated refunds for documented service outages</li>
                  <li><strong>Feature Issues:</strong> Credits for specific features that were unavailable</li>
                  <li><strong>Upgrade/Downgrade:</strong> Pro-rated adjustments for plan changes mid-cycle</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">5. ALTERNATIVE REMEDIES</h2>
              <div className="space-y-4 text-lg font-medium leading-relaxed">
                <p>
                  Instead of monetary refunds, we may offer:
                </p>
                <ul className="list-disc list-inside ml-6 space-y-2">
                  <li><strong>Account Credits:</strong> Credits applied to future billing cycles</li>
                  <li><strong>Extended Service:</strong> Additional months of service at no charge</li>
                  <li><strong>Plan Upgrades:</strong> Temporary access to higher-tier features</li>
                  <li><strong>Technical Support:</strong> Priority assistance to resolve issues</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">6. CANCELLATION VS. REFUNDS</h2>
              <div className="space-y-4 text-lg font-medium leading-relaxed">
                <div>
                  <h3 className="text-xl font-black mb-2 uppercase">6.1 CANCELLATION</h3>
                  <p>
                    You can cancel your subscription at any time. Cancellation stops future billing but does not 
                    provide a refund for the current billing period unless eligible under this policy.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-black mb-2 uppercase">6.2 SERVICE ACCESS</h3>
                  <p>
                    After cancellation, you retain access to the Service until the end of your current billing period. 
                    Your account will then be downgraded to the free tier (if available).
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">7. CHARGEBACKS AND DISPUTES</h2>
              <div className="space-y-4 text-lg font-medium leading-relaxed">
                <p>
                  Before initiating a chargeback with your bank or credit card company, please contact us directly 
                  to resolve the issue. Chargebacks may result in:
                </p>
                <ul className="list-disc list-inside ml-6 space-y-2">
                  <li>Immediate suspension of your account</li>
                  <li>Loss of access to all data and content</li>
                  <li>Additional fees charged by payment processors</li>
                  <li>Permanent ban from our Service</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">8. FREE TRIAL AND PROMOTIONAL OFFERS</h2>
              <div className="space-y-4 text-lg font-medium leading-relaxed">
                <p>
                  Special terms apply to free trials and promotional offers:
                </p>
                <ul className="list-disc list-inside ml-6 space-y-2">
                  <li>Free trials can be cancelled before the trial period ends to avoid charges</li>
                  <li>Promotional discounts are non-refundable once applied</li>
                  <li>Credits from promotional offers expire according to their terms</li>
                  <li>One-time promotional offers cannot be reinstated after cancellation</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">9. CHANGES TO THIS POLICY</h2>
              <p className="text-lg font-medium leading-relaxed">
                We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately 
                upon posting to our website. Material changes will be communicated via email to active subscribers. 
                Continued use of our Service constitutes acceptance of any changes.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">10. CONTACT INFORMATION</h2>
              <div className="text-lg font-medium leading-relaxed">
                <p>For questions about refunds or to request a refund, contact us:</p>
                <div className="mt-4 space-y-2">
                  <p><strong>Email:</strong> support@zapysai.com</p>
                  <p><strong>Subject Line:</strong> Refund Request</p>
                  <p><strong>Website:</strong> https://zapys-ai.vercel.app</p>
                  <p><strong>Response Time:</strong> 24-48 hours</p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}