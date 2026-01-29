'use client'

import PublicLayout from '@/components/layout/PublicLayout'

export default function PrivacyPolicy() {
  return (
    <PublicLayout>
      <div className="legal-container">
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-updated">Last updated: December 29, 2024</p>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Information We Collect</h2>
            <h3>1.1 Account Information</h3>
            <p>
              When you create an account, we collect your name, email address, and user type
              (Property &amp; Design Professional or 3D Artist). Artists additionally provide
              portfolio information and professional details.
            </p>
            <h3>1.2 Project Information</h3>
            <p>
              We collect information about projects posted, applications submitted, messages
              sent, and files uploaded through the Platform.
            </p>
            <h3>1.3 Payment Information</h3>
            <p>
              Payment information is processed securely through Stripe. We do not store full
              credit card details on our servers.
            </p>
            <h3>1.4 Usage Data</h3>
            <p>
              We automatically collect information about how you use the Platform, including
              IP address, browser type, pages visited, and time spent on pages.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul>
              <li>Provide and maintain the Platform services</li>
              <li>Process transactions and send transaction notifications</li>
              <li>Communicate with you about your account and projects</li>
              <li>Improve and optimize the Platform</li>
              <li>Detect and prevent fraud and security issues</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Information Sharing</h2>
            <h3>3.1 Between Users</h3>
            <p>
              Project information and professional profiles are visible to relevant users.
              Clients can see artist portfolios; artists can see project details.
            </p>
            <h3>3.2 Service Providers</h3>
            <p>
              We share information with third-party service providers who help us operate the
              Platform, including:
            </p>
            <ul>
              <li>Supabase (database and authentication)</li>
              <li>Stripe (payment processing)</li>
              <li>Vercel (hosting)</li>
            </ul>
            <h3>3.3 Legal Requirements</h3>
            <p>
              We may disclose your information if required by law, court order, or to protect
              the rights, property, or safety of 3dMatch and our users.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your information,
              including encryption, secure servers, and regular security audits. However, no
              method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Data Retention</h2>
            <p>
              We retain your information for as long as your account is active and as needed
              to provide services. After account deletion, we may retain certain information
              for legal compliance and dispute resolution.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access and download your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt-out of marketing communications</li>
              <li>Object to certain data processing activities</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze
              usage, and provide personalized content. You can control cookies through your
              browser settings.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. International Data Transfers</h2>
            <p>
              As a global platform, your information may be transferred to and processed in
              countries outside your residence. We ensure appropriate safeguards are in place
              for international transfers.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Children&apos;s Privacy</h2>
            <p>
              The Platform is not intended for users under 18 years of age. We do not
              knowingly collect information from children.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of
              significant changes via email or Platform notification.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Contact Us</h2>
            <p>
              For questions about this Privacy Policy or to exercise your rights, contact us at:
              <br />
              <strong>privacy@3dmatch.com</strong>
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  )
}
