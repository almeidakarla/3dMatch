'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface PublicLayoutProps {
  children: ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="public-layout">
      <header className="landing-header">
        <div className="header-content">
          <Link href="/" className="logo-section">
            <img src="/icon-logo.svg" alt="3dMatch" className="header-logo" />
          </Link>
          <nav className="header-nav">
            <Link href="/#sobre">About</Link>
            <Link href="/for-artists">For 3D Artists</Link>
            <Link href="/#arquiteto">For Property & Design Professionals</Link>
            <Link href="/login" className="btn-login">Login</Link>
          </nav>
        </div>
      </header>

      <main className="public-main">{children}</main>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-column footer-logo-column">
              <Link href="/"><img src="/logo.svg" alt="3dMatch" className="footer-logo" /></Link>
            </div>
            <div className="footer-column">
              <h3 className="footer-heading">Platform</h3>
              <ul className="footer-links">
                <li><Link href="/login">Browse Artists</Link></li>
                <li><Link href="/login">Browse Projects</Link></li>
                <li><Link href="/#inicio">How It Works</Link></li>
                <li><Link href="/login">Post a Project</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3 className="footer-heading">Resources</h3>
              <ul className="footer-links">
                <li><Link href="/blog">Blog</Link></li>
                <li><a href="#faq">FAQ</a></li>
                <li><Link href="/portfolios">3D Artist Portfolios</Link></li>
                <li><a href="#support">Support</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3 className="footer-heading">Company</h3>
              <ul className="footer-links">
                <li><Link href="/#sobre">About</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/for-artists">Become an Artist</Link></li>
              </ul>
            </div>
            <div className="footer-column footer-subscribe">
              <h3 className="footer-heading">Stay Updated</h3>
              <p className="footer-subscribe-text">Get the latest news, tips, and updates delivered to your inbox.</p>
              <form className="footer-subscribe-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Enter your email" className="footer-email-input" />
                <button type="submit" className="footer-subscribe-btn">Subscribe</button>
              </form>
              <div className="footer-social">
                <a href="https://www.instagram.com/3d.match" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"></path></svg>
                </a>
                <a href="https://www.linkedin.com/company/3d-match/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <a href="https://www.tiktok.com/@3d.match" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copyright">© 2024 3dMatch. Global architectural rendering, managed.</p>
            <div className="footer-legal">
              <Link href="/terms">Terms and Conditions</Link>
              <span className="footer-separator">•</span>
              <Link href="/privacy">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
