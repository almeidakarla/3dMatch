'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface PlatformFeature {
  icon: React.ReactNode
  title: string
  description: string
  image: string
  alt: string
}

const ArtistsLandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  const platformFeatures: PlatformFeature[] = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      ),
      title: 'Your workspace for architectural visualization',
      description: 'Manage everything in one place. Browse projects, collaborate with clients in real-time, track project milestones, and deliver files.',
      image: '/platform-demo.gif',
      alt: '3dMatch Platform Dashboard'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      ),
      title: 'Work with vetted clients',
      description: 'Every client on 3dMatch is a professional in the property & design industry. Build relationships with serious clients who value quality work.',
      image: '/benefit-approved-talent.png',
      alt: 'Vetted Clients'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      ),
      title: 'Get paid securely',
      description: 'Payments are held securely and released when clients approve your deliveries. No chasing payments, no surprises.',
      image: '/benefit-secure-payment.png',
      alt: 'Secure Payment System'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      ),
      title: 'Full control over your work',
      description: 'Define your scope, set milestones, deliver at your pace, and maintain complete control over your creative process.',
      image: '/benefit-project-control.png',
      alt: 'Project Control'
    }
  ]

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsScrolled(scrollY > 50)

      const heroSection = document.querySelector('.hero-section') as HTMLElement | null
      const finalCtaSection = document.querySelector('.final-cta-section') as HTMLElement | null
      const footer = document.querySelector('.landing-footer') as HTMLElement | null

      if (!heroSection || !finalCtaSection || !footer) return

      const heroBottom = heroSection.offsetTop + heroSection.offsetHeight
      const finalCtaTop = finalCtaSection.offsetTop
      const finalCtaBottom = finalCtaSection.offsetTop + finalCtaSection.offsetHeight
      const footerTop = footer.offsetTop

      const navbarHeight = 80
      const isOverHero = scrollY + navbarHeight < heroBottom
      const isOverFinalCta = scrollY >= finalCtaTop && scrollY + navbarHeight < finalCtaBottom
      const isOverFooter = scrollY + navbarHeight >= footerTop

      const shouldBeWhite = isOverHero || isOverFinalCta || isOverFooter

      const header = document.querySelector('.landing-header')
      if (header) {
        if (shouldBeWhite) {
          header.classList.add('white-text')
          header.classList.remove('dark-text')
        } else {
          header.classList.add('dark-text')
          header.classList.remove('white-text')
        }
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <div className="landing-page">
      {/* Header */}
      <header className={`landing-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          <a href="/" className="logo-section">
            <img src="/icon-logo.svg" alt="3dMatch" className="header-logo" />
          </a>
          <nav className="header-nav">
            <a href="#benefits">Benefits</a>
            <Link href="/">For Clients</Link>
            <Link href="/login/artist" className="btn-login">
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="section-wrapper">
          <div className="hero-content">
            <h1 className="hero-title">
              Work with International Clients.<br />
              <span className="highlight">Build Your 3D Career.</span>
            </h1>
            <p className="hero-subtitle">
              Join 3dMatch to connect with property & design professionals worldwide.
              Get paid for quality work, build your portfolio, and grow your business.
            </p>
            <div className="hero-buttons">
              <Link href="/apply-artist" className="btn-hero-primary">
                Apply as an Artist
              </Link>
              <Link href="/login/artist" className="btn-hero-secondary">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section" id="benefits">
        <div className="section-wrapper">
          <h2 className="section-title">Why Join 3dMatch?</h2>

          <div className="benefits-grid">
            <div className="benefit-card benefit-purple">
              <div className="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3>Join an Elite Network</h3>
              <p>Gain authority and credibility as part of a carefully vetted, high-end community of professional 3D artists.</p>
            </div>

            <div className="benefit-card benefit-blue">
              <div className="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
              </div>
              <h3>Predictable Income</h3>
              <p>Secure consistent projects with reliable payments. Build a stable freelance career with steady work flow.</p>
            </div>

            <div className="benefit-card benefit-blue-light">
              <div className="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <h3>International Exposure</h3>
              <p>Work with property & design professionals from around the globe. Build an international portfolio that stands out.</p>
            </div>

            <div className="benefit-card benefit-purple">
              <div className="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <h3>Build a Strong Portfolio</h3>
              <p>Showcase diverse, high-quality international projects. Attract better clients and command higher rates with your work.</p>
            </div>

            <div className="benefit-card benefit-blue">
              <div className="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v6m0 0L8 4m4 4l4-4M12 22v-6m0 0l4 4m-4-4l-4 4"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <h3>Work on Your Schedule</h3>
              <p>Enjoy complete autonomy over your timeline and workflow. Choose projects that fit your availability and style.</p>
            </div>

            <div className="benefit-card benefit-blue-light">
              <div className="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                </svg>
              </div>
              <h3>Full Control & Quality</h3>
              <p>Maintain complete control over your deliveries, revisions, and work routine. Set your own standards of excellence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works-section">
        <div className="section-wrapper">
          <h2 className="section-title">How It Works</h2>

          <div className="steps-list">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Apply</h3>
                <p>Submit your portfolio and tell us about your experience.</p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Get Approved</h3>
                <p>We review your application and approve qualified artists.</p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Browse Projects</h3>
                <p>View and apply to projects that match your skills.</p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Deliver & Get Paid</h3>
                <p>Complete the work, deliver files, and receive payment.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Tabbed Section */}
      <section className="platform-features-section">
        <div className="section-wrapper">
          <div className="platform-features-container">
            <div className="platform-tabs">
              {platformFeatures.map((feature, index) => (
                <button
                  key={index}
                  className={`platform-tab ${activeTab === index ? 'active' : ''}`}
                  onClick={() => setActiveTab(index)}
                >
                  <div className="platform-tab-icon">{feature.icon}</div>
                  <div className="platform-tab-content">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="platform-visual">
              <img
                src={platformFeatures[activeTab].image}
                alt={platformFeatures[activeTab].alt}
                key={activeTab}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Render Types Section */}
      <section className="project-types-section">
        <div className="section-wrapper">
          <h2 className="section-title">Render Types You Can Create</h2>
          <p className="section-subtitle">
            From still images to immersive experiences, showcase your skills across all visualization types.
          </p>

          <div className="project-types-grid">
            <div className="project-type-card">
              <div className="project-type-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              </div>
              <h3>Residential</h3>
              <p>Houses, apartments, condos, and luxury estates.</p>
            </div>
            <div className="project-type-card">
              <div className="project-type-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              </div>
              <h3>Commercial</h3>
              <p>Office buildings, retail spaces, hotels, and restaurants.</p>
            </div>
            <div className="project-type-card">
              <div className="project-type-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              </div>
              <h3>Interior Design</h3>
              <p>Living rooms, kitchens, bedrooms, and complete interiors.</p>
            </div>
            <div className="project-type-card">
              <div className="project-type-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
              </div>
              <h3>Exterior Views</h3>
              <p>Facades, landscaping, and contextual surroundings.</p>
            </div>
            <div className="project-type-card">
              <div className="project-type-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
              </div>
              <h3>Day & Night Renders</h3>
              <p>Showcase projects in different lighting conditions.</p>
            </div>
            <div className="project-type-card">
              <div className="project-type-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
              </div>
              <h3>Animations & Videos</h3>
              <p>Walkthroughs, flythroughs, and motion graphics.</p>
            </div>
            <div className="project-type-card">
              <div className="project-type-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              </div>
              <h3>360 Virtual Tours</h3>
              <p>Immersive panoramic views for interactive experiences.</p>
            </div>
            <div className="project-type-card">
              <div className="project-type-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <h3>Aerial & Site Plans</h3>
              <p>Bird&apos;s eye views, master plans, and context renders.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <div className="section-wrapper">
          <h2 className="final-cta-title">Ready to Join 3dMatch?</h2>
          <p className="final-cta-subtitle">
            Apply now and start working with international clients. Build your portfolio and grow your 3D career.
          </p>
          <Link href="/apply-artist" className="btn-cta-primary btn-cta-large">
            Apply as a 3D Artist
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-column footer-logo-column">
              <a href="/">
                <img src="/logo.svg" alt="3dMatch" className="footer-logo" />
              </a>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">Platform</h3>
              <ul className="footer-links">
                <li><Link href="/apply-artist">Apply as Artist</Link></li>
                <li><Link href="/login/artist">Artist Login</Link></li>
                <li><a href="#benefits">How It Works</a></li>
                <li><Link href="/">For Clients</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">Resources</h3>
              <ul className="footer-links">
                <li><Link href="/blog">Blog</Link></li>
                <li><a href="#benefits">FAQ</a></li>
                <li><Link href="/portfolios">3D Artist Portfolios</Link></li>
                <li><a href="#support">Support</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">Company</h3>
              <ul className="footer-links">
                <li><a href="#benefits">About</a></li>
                <li><a href="mailto:contact@3dmatch.app">Contact</a></li>
                <li><Link href="/">For Property Professionals</Link></li>
              </ul>
            </div>

            <div className="footer-column footer-subscribe">
              <h3 className="footer-heading">Stay Updated</h3>
              <p className="footer-subscribe-text">
                Get the latest news, tips, and updates delivered to your inbox.
              </p>
              <form className="footer-subscribe-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="footer-email-input"
                />
                <button type="submit" className="footer-subscribe-btn">
                  Subscribe
                </button>
              </form>
              <div className="footer-social">
                <a href="https://twitter.com/3dmatch" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
                </a>
                <a href="https://instagram.com/3dmatch" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"></path></svg>
                </a>
                <a href="https://linkedin.com/company/3dmatch" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright">
              &copy; 2024 3dMatch. Global architectural rendering, managed.
            </p>
            <div className="footer-legal">
              <Link href="/terms">Terms and Conditions</Link>
              <span className="footer-separator">&bull;</span>
              <Link href="/privacy">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ArtistsLandingPage
