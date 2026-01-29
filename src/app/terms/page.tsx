'use client'

import PublicLayout from '@/components/layout/PublicLayout'

export default function TermsAndConditions() {
  return (
    <PublicLayout>
      <div className="legal-container">
        <h1 className="legal-title">Terms and Conditions</h1>
        <p className="legal-updated">Last updated: December 29, 2024</p>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing and using 3dMatch (&quot;the Platform&quot;), you agree to be bound by these
              Terms and Conditions. If you disagree with any part of these terms, you may not
              access the Platform.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Platform Description</h2>
            <p>
              3dMatch is a platform that connects property &amp; design professionals with approved
              3D artists for architectural rendering services. The Platform facilitates project
              posting, artist applications, secure payments, and project delivery management.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. User Accounts</h2>
            <h3>3.1 Registration</h3>
            <p>
              To use the Platform, you must create an account and provide accurate, complete
              information. You are responsible for maintaining the confidentiality of your
              account credentials.
            </p>
            <h3>3.2 User Types</h3>
            <p>
              The Platform has two types of users: (1) Property &amp; Design Professionals who post
              projects, and (2) 3D Artists who apply to and complete rendering projects.
            </p>
            <h3>3.3 Artist Approval</h3>
            <p>
              All 3D Artists must be approved by 3dMatch before accessing project opportunities.
              Approval is based on portfolio review and quality assessment.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Platform Fees</h2>
            <p>
              3dMatch charges a platform fee of 10% on all project payments. This fee covers
              payment processing, escrow services, platform maintenance, and customer support.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Payment Terms</h2>
            <h3>5.1 Payment Processing</h3>
            <p>
              All payments are processed securely through Stripe. Payments are held in escrow
              and released to artists only upon client approval of deliveries.
            </p>
            <h3>5.2 Refunds</h3>
            <p>
              Refunds are handled on a case-by-case basis and subject to review by 3dMatch
              administration. Generally, payments are non-refundable once work has been
              approved and delivered.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Intellectual Property</h2>
            <h3>6.1 Ownership</h3>
            <p>
              Upon full payment, clients receive full ownership and commercial rights to the
              final rendered images. Artists retain the right to showcase work in their
              portfolios unless otherwise agreed.
            </p>
            <h3>6.2 Platform Content</h3>
            <p>
              All content, features, and functionality of the Platform are owned by 3dMatch
              and protected by copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. User Conduct</h2>
            <p>Users agree not to:</p>
            <ul>
              <li>Share contact information or attempt to circumvent the Platform</li>
              <li>Submit false, misleading, or fraudulent information</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Upload malicious content or attempt to compromise Platform security</li>
              <li>Use the Platform for any illegal or unauthorized purpose</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. Termination</h2>
            <p>
              3dMatch reserves the right to suspend or terminate accounts that violate these
              Terms and Conditions or engage in fraudulent, abusive, or illegal behavior.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Limitation of Liability</h2>
            <p>
              3dMatch acts as a platform facilitating connections between clients and artists.
              We are not responsible for the quality of work, project delays, or disputes
              between users. Our liability is limited to the platform fee paid.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Changes to Terms</h2>
            <p>
              3dMatch reserves the right to modify these Terms and Conditions at any time.
              Continued use of the Platform after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Contact</h2>
            <p>
              For questions about these Terms and Conditions, please contact us at:
              <br />
              <strong>support@3dmatch.com</strong>
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  )
}
