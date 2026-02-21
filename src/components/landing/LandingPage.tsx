'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PortfolioProject {
  image: string;
  title: string;
}

interface PortfolioCategory {
  name: string;
  projects: PortfolioProject[];
}

interface FeaturedArtist {
  name: string;
  title: string;
  location: string;
  description: string;
  skills: string[];
  portfolio: string[];
}

interface PlatformFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
  alt: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface LandingPageProps {
  // Props can be added here when CMS is integrated
}

// Icon components for platform features
const getFeatureIcon = (iconType: string) => {
  switch (iconType) {
    case 'dashboard':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      );
    case 'checkmark':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      );
    case 'lock':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      );
    case 'lightning':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      );
    default:
      return null;
  }
};

const LandingPage = ({}: LandingPageProps) => {
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  // Static hero images
  const backgroundImages: string[] = [
    '/bg-img-1.png',
    '/bg-img-2.png',
    '/bg-img-3.png',
    '/bg-img-4.png',
    '/bg-img-5.png',
  ];

  // Hero attribution
  const heroAttribution = 'Render created by a 3dMatch artist.';

  // Header scroll state
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Platform features tabs state
  const [activeTab, setActiveTab] = useState<number>(0);

  // Portfolio showcase tabs state
  const [activePortfolioTab, setActivePortfolioTab] = useState<number>(0);

  // Artist carousel state
  const [currentArtistSlide, setCurrentArtistSlide] = useState<number>(0);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Portfolio data
  const portfolioCategories: PortfolioCategory[] = [
        {
          name: 'Exterior Residential',
          projects: [
            { image: '/portfolio/exterior-1.jpg', title: 'Modern Villa' },
            { image: '/portfolio/exterior-2.jpg', title: 'Luxury Apartment' },
            { image: '/portfolio/exterior-3.jpg', title: 'Contemporary Home' },
            { image: '/portfolio/exterior-4.jpg', title: 'Beach House' },
            { image: '/portfolio/exterior-5.jpg', title: 'Urban Residence' },
            { image: '/portfolio/exterior-6.jpg', title: 'Suburban Estate' }
          ]
        },
        {
          name: 'Interior Design',
          projects: [
            { image: '/portfolio/interior-1.jpg', title: 'Living Room' },
            { image: '/portfolio/interior-2.jpg', title: 'Modern Kitchen' },
            { image: '/portfolio/interior-3.jpg', title: 'Master Bedroom' },
            { image: '/portfolio/interior-4.jpg', title: 'Open Concept' },
            { image: '/portfolio/interior-5.jpg', title: 'Dining Area' },
            { image: '/portfolio/interior-6.jpg', title: 'Home Office' }
          ]
        },
        {
          name: 'Commercial',
          projects: [
            { image: '/portfolio/commercial-1.jpg', title: 'Office Building' },
            { image: '/portfolio/commercial-2.jpg', title: 'Retail Space' },
            { image: '/portfolio/commercial-3.jpg', title: 'Hotel Lobby' },
            { image: '/portfolio/commercial-4.jpg', title: 'Restaurant' },
            { image: '/portfolio/commercial-5.jpg', title: 'Coworking Space' },
            { image: '/portfolio/commercial-6.jpg', title: 'Shopping Center' }
          ]
        },
        {
          name: 'Aerial Views',
          projects: [
            { image: '/portfolio/aerial-1.jpg', title: 'Development Overview' },
            { image: '/portfolio/aerial-2.jpg', title: 'Master Plan' },
            { image: '/portfolio/aerial-3.jpg', title: 'Site Context' },
            { image: '/portfolio/aerial-4.jpg', title: 'Bird\'s Eye View' },
            { image: '/portfolio/aerial-5.jpg', title: 'Urban Layout' },
            { image: '/portfolio/aerial-6.jpg', title: 'Landscape Design' }
          ]
        }
      ];

  // Featured artists data
  const featuredArtists: FeaturedArtist[] = [
        {
          name: 'Lucas M.',
          title: '3D Architectural Visualizer',
          location: 'São Paulo, Brazil',
          description: 'Specialized in photorealistic exterior renders and luxury residential projects. 8+ years creating stunning visualizations that help clients sell properties faster.',
          skills: ['3ds Max', 'V-Ray', 'Corona Renderer'],
          portfolio: [
            '/portfolio/exterior-1.jpg',
            '/portfolio/exterior-2.jpg',
            '/portfolio/exterior-3.jpg',
            '/portfolio/interior-1.jpg',
            '/portfolio/interior-2.jpg',
            '/portfolio/aerial-1.jpg'
          ]
        },
        {
          name: 'Sofia R.',
          title: 'Interior Design Visualizer',
          location: 'Barcelona, Spain',
          description: 'Expert in creating warm, inviting interior renders that capture emotion. Specializing in residential interiors, hospitality design, and commercial spaces with attention to lighting and materials.',
          skills: ['Blender', 'Lumion', 'Photoshop'],
          portfolio: [
            '/portfolio/interior-3.jpg',
            '/portfolio/interior-4.jpg',
            '/portfolio/interior-5.jpg',
            '/portfolio/interior-6.jpg',
            '/portfolio/commercial-4.jpg',
            '/portfolio/exterior-4.jpg'
          ]
        },
        {
          name: 'Marco T.',
          title: 'Commercial & Aerial Specialist',
          location: 'Milan, Italy',
          description: 'Focused on large-scale commercial projects and master planning. Creating comprehensive aerial views, site context renders, and development visualizations for architects and developers.',
          skills: ['SketchUp', 'Enscape', 'Twinmotion'],
          portfolio: [
            '/portfolio/aerial-2.jpg',
            '/portfolio/aerial-3.jpg',
            '/portfolio/commercial-1.jpg',
            '/portfolio/commercial-2.jpg',
            '/portfolio/commercial-3.jpg',
            '/portfolio/aerial-4.jpg'
          ]
        },
        {
          name: 'Ana K.',
          title: 'Animation & Walkthrough Artist',
          location: 'London, UK',
          description: 'Bringing projects to life through cinematic animations and virtual tours. Expert in creating compelling walkthroughs that let clients experience spaces before construction begins.',
          skills: ['Unreal Engine', 'Cinema 4D', 'After Effects'],
          portfolio: [
            '/portfolio/exterior-5.jpg',
            '/portfolio/interior-1.jpg',
            '/portfolio/commercial-5.jpg',
            '/portfolio/exterior-6.jpg',
            '/portfolio/interior-3.jpg',
            '/portfolio/aerial-5.jpg'
          ]
        }
      ];

  const nextArtist = () => {
    setCurrentArtistSlide((prev) => (prev + 1) % featuredArtists.length);
  };

  const prevArtist = () => {
    setCurrentArtistSlide((prev) => (prev - 1 + featuredArtists.length) % featuredArtists.length);
  };

  // Platform features data
  const platformFeatures: PlatformFeature[] = [
        {
          icon: getFeatureIcon('dashboard'),
          title: 'Your workspace for architectural visualization',
          description: 'Manage everything in one place. Browse vetted 3d artists, collaborate in real-time, track project milestones, and approve deliveries.',
          image: '/platform-demo.gif',
          alt: '3dMatch Platform Dashboard'
        },
        {
          icon: getFeatureIcon('checkmark'),
          title: 'Only work with approved talent',
          description: 'Every 3D artist on 3dMatch is manually reviewed and approved. We verify portfolios, check references, and test architectural accuracy before any artist can join the platform.',
          image: '/benefit-approved-talent.png',
          alt: 'Approved Artist Verification'
        },
        {
          icon: getFeatureIcon('lock'),
          title: 'Pay with confidence',
          description: 'Your payment is held securely until you approve each delivery. No surprises, no unexpected charges. Release funds only when you are completely satisfied with the work.',
          image: '/benefit-secure-payment.png',
          alt: 'Secure Payment System'
        },
        {
          icon: getFeatureIcon('lightning'),
          title: 'Stay in control at every stage',
          description: 'Define project scopes, set clear milestones, review progress at each step, and approve deliveries before moving forward. Your project, your timeline, your standards.',
          image: '/benefit-project-control.png',
          alt: 'Project Control Dashboard'
        }
      ];

  // Handle scroll to change header background and text color based on section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);

      // Get sections that should have white navbar text
      const heroSection = document.querySelector('.hero-section') as HTMLElement | null;
      const finalCtaSection = document.querySelector('.final-cta-section') as HTMLElement | null;
      const footer = document.querySelector('.landing-footer') as HTMLElement | null;

      if (!heroSection || !finalCtaSection || !footer) return;

      // Check if navbar (top of viewport) is within white sections
      const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
      const finalCtaTop = finalCtaSection.offsetTop;
      const finalCtaBottom = finalCtaSection.offsetTop + finalCtaSection.offsetHeight;
      const footerTop = footer.offsetTop;

      const navbarHeight = 80; // Approximate navbar height
      const isOverHero = scrollY + navbarHeight < heroBottom;
      const isOverFinalCta = scrollY >= finalCtaTop && scrollY + navbarHeight < finalCtaBottom;
      const isOverFooter = scrollY + navbarHeight >= footerTop;

      const shouldBeWhite = isOverHero || isOverFinalCta || isOverFooter;

      // Update navbar class
      const header = document.querySelector('.landing-header');
      if (header) {
        if (shouldBeWhite) {
          header.classList.add('white-text');
          header.classList.remove('dark-text');
        } else {
          header.classList.add('dark-text');
          header.classList.remove('white-text');
        }
      }
    };

    handleScroll(); // Initial check
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll); // Re-check on resize

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className={`landing-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          <a href="https://3dmatch.app" className="logo-section">
            <img src="/icon-logo.svg" alt="3dMatch" className="header-logo" />
          </a>
          <nav className="header-nav">
            <a href="#sobre">About</a>
            <Link href="/for-artists">For 3D Artists</Link>
            <Link href="/login/property" className="btn-login">
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section" id="inicio">
        {/* Background Carousel */}
        <div className="hero-background-carousel">
          {backgroundImages.map((image, index) => (
            <div
              key={index}
              className={`hero-background-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}

          {/* Black gradient overlay on the left */}
          <div className="hero-gradient-overlay" />
        </div>

        {/* Content */}
        <div className="hero-content-wrapper">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="hero-line-1">High end</span>
              <span className="hero-line-2">architectural renders</span>
              <span className="hero-line-3">that sell your project.</span>
            </h1>

            <p className="hero-subtitle">
              Work with the world's best 3D artists. From images to videos that let clients experience the project before it's built.
            </p>

            <div className="hero-cta-group">
              <Link href="/login/property" className="btn-hero-primary">
                Get Started
              </Link>
              <a href="#sobre" className="btn-hero-secondary">
                Learn More
              </a>
            </div>
          </div>

          {/* Navigation Arrow (only show if more than one image) */}
          {backgroundImages.length > 1 && (
            <button onClick={nextSlide} className="hero-carousel-arrow" aria-label="Next slide">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          )}

          {/* Attribution */}
          <p className="hero-attribution">{heroAttribution}</p>
        </div>
      </section>

      {/* Results You'll Get Section */}
      <section className="results-section" id="sobre">
        <div className="section-wrapper">
          <h2 className="section-title">What if your clients could experience the project before it's built?</h2>

          <div className="results-intro">
            <p className="results-intro-text">
              3dMatch is a global platform connecting property & design professionals with approved 3D artists specialized in architectural visualization.
              We review every artist, manage delivery-based payments, and give both sides full control over scope, timelines, and approvals.
            </p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card benefit-purple">
              <div className="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <h3>Clients Who Feel the Space</h3>
              <p>
                Photorealistic renders let your clients experience the project emotionally before it's built. They see themselves living there, which drives faster commitments.
              </p>
            </div>

            <div className="benefit-card benefit-blue">
              <div className="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
              </div>
              <h3>Sell Projects Faster</h3>
              <p>
                Stunning visuals create instant confidence. Your clients make buying decisions on emotion—give them renders that showcase your vision and close deals.
              </p>
            </div>

            <div className="benefit-card benefit-blue-light">
              <div className="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3>Fewer Revisions, Better Accuracy</h3>
              <p>
                Accurate, detailed renders mean clients understand exactly what they're getting. Clear visualization upfront reduces costly changes during construction.
              </p>
            </div>
          </div>

          {/* Video Showcase */}
          <div className="results-video-showcase">
            <h3 className="results-video-title">See It In Action</h3>
            <div className="results-video-container">
              <video
                className="results-video"
                controls
                poster="/video-render-thumbnail.jpg"
                preload="metadata"
              >
                <source src="/render-demo.mp4" type="video/mp4" />
                <source src="/render-demo.webm" type="video/webm" />
                Your browser does not support the video tag.
              </video>
            </div>
            <p className="results-video-caption">
              Experience how our 3D artists bring architectural visions to life with stunning, photorealistic animations.
            </p>
          </div>

          {/* CTA */}
          <div className="section-cta">
            <Link href="/login/property" className="btn-cta-primary">
              Turn Blueprints Into Experiences
            </Link>
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
                <h3>Create an account</h3>
                <p>
                  Property & design professionals sign up in seconds.
                </p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Post your project</h3>
                <p>
                  Define scope, references, deadlines, and delivery milestones.
                </p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Collaborate with approved artists</h3>
                <p>
                  Work with vetted 3D artists from around the world in one
                  workspace.
                </p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Approve each delivery</h3>
                <p>
                  Payments are released only when work meets expectations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="section-wrapper">
          <h2 className="section-title">Why 3dMatch</h2>

          <div className="benefits-grid">
            <div className="benefit-card benefit-purple">
              <div className="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3>Approved Global Talent</h3>
              <p>
                Every 3D artist is reviewed and approved for quality,
                reliability, and architectural accuracy.
              </p>
            </div>

            <div className="benefit-card benefit-blue">
              <div className="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3>Secure, Delivery-Based Payments</h3>
              <p>
                Payments are held securely and released only after each delivery
                is approved.
              </p>
            </div>

            <div className="benefit-card benefit-blue-light">
              <div className="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <h3>Full Control Over Delivery</h3>
              <p>
                Clear scopes, defined milestones, and approvals at every stage.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="section-cta">
            <Link href="/login/property" className="btn-cta-primary">
              Find Your Perfect Artist Today
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Features Tabbed Section */}
      <section className="platform-features-section">
        <div className="section-wrapper">
          <div className="platform-features-container">
            {/* Tabs on the left */}
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

            {/* Visual on the right */}
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

      {/* Portfolio Showcase Section */}
      <section className="portfolio-section">
        <div className="section-wrapper">
          <h2 className="section-title">Portfolio Showcase</h2>
          <p className="section-subtitle">
            See the quality of work our 3D artists deliver across different project types.
          </p>

          {/* Portfolio Category Tabs */}
          <div className="portfolio-tabs">
            {portfolioCategories.map((category, index) => (
              <button
                key={index}
                className={`portfolio-tab-btn ${activePortfolioTab === index ? 'active' : ''}`}
                onClick={() => setActivePortfolioTab(index)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Portfolio Grid */}
          <div className="portfolio-grid">
            {portfolioCategories[activePortfolioTab].projects.map((project, index) => (
              <div key={index} className="portfolio-item">
                <div className="portfolio-image-wrapper">
                  <img src={project.image} alt={project.title} />
                  <div className="portfolio-overlay">
                    <p className="portfolio-title">{project.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artists Carousel */}
      <section className="featured-artists-section">
        <div className="section-wrapper">
          <h2 className="section-title">Meet Our 3D Artists</h2>
          <p className="section-subtitle">
            Discover the talented professionals behind the stunning renders. Every artist is vetted, approved, and ready to bring your vision to life.
          </p>

          <div className="artists-carousel-container">
            {/* Navigation Arrows */}
            <button
              onClick={prevArtist}
              className="artist-carousel-arrow artist-carousel-arrow-left"
              aria-label="Previous artist"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            {/* Artists Cards */}
            <div className="artists-carousel-track">
              {featuredArtists.map((artist, index) => {
                const isActive = index === currentArtistSlide;
                const isPrev = index === (currentArtistSlide - 1 + featuredArtists.length) % featuredArtists.length;
                const isNext = index === (currentArtistSlide + 1) % featuredArtists.length;

                let positionClass = '';
                if (isActive) positionClass = 'active';
                else if (isPrev) positionClass = 'prev';
                else if (isNext) positionClass = 'next';
                else positionClass = 'hidden';

                return (
                  <div
                    key={index}
                    className={`artist-card ${positionClass}`}
                  >
                    <div className="artist-card-header">
                      <div className="artist-avatar">
                        <img
                          src={`/artists/artist-${index + 1}.jpg`}
                          alt={artist.name}
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(artist.name) + '&size=100&background=667eea&color=fff';
                          }}
                        />
                        <div className="artist-verified-badge">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      </div>
                      <div className="artist-info">
                        <h3 className="artist-name">{artist.name}</h3>
                        <p className="artist-title">{artist.title}</p>
                        <p className="artist-location">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          {artist.location}
                        </p>
                      </div>
                      <Link href="/login/property" className="artist-meet-btn">
                        Meet
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </Link>
                    </div>

                    <p className="artist-description">{artist.description}</p>

                    <div className="artist-skills">
                      {artist.skills.map((skill, skillIndex) => (
                        <span key={skillIndex} className="artist-skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Artist Portfolio Grid */}
                    <div className="artist-portfolio-grid">
                      {artist.portfolio.map((image, imgIndex) => (
                        <div key={imgIndex} className="artist-portfolio-item">
                          <img src={image} alt={`${artist.name} work ${imgIndex + 1}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={nextArtist}
              className="artist-carousel-arrow artist-carousel-arrow-right"
              aria-label="Next artist"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

          {/* Carousel Indicators */}
          <div className="artist-carousel-indicators">
            {featuredArtists.map((_, index) => (
              <button
                key={index}
                className={`artist-carousel-indicator ${index === currentArtistSlide ? 'active' : ''}`}
                onClick={() => setCurrentArtistSlide(index)}
                aria-label={`View artist ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="section-wrapper">
          <h2 className="section-title">Frequently Asked Questions</h2>

          <div className="faq-container">
            {([
                  {
                    question: "How many render rounds can I get?",
                    answer: "You decide with your artist! Most projects include 3 revision rounds as a starting point. If you need more revisions, you can purchase additional rounds directly through the platform with a simple payment. This gives you complete flexibility to get the perfect result."
                  },
                  {
                    question: "What if I don't love the render result?",
                    answer: "You only release payment when you approve each delivery. If a render doesn't meet your expectations, request revisions until it's right. Your payment is held securely until you're completely satisfied with the work. Need more rounds? Simply purchase additional revisions anytime."
                  },
                  {
                    question: "How do I know the artists are qualified?",
                    answer: "Every 3D artist on 3dMatch is manually reviewed and approved by our team. We verify portfolios, check references, and test architectural accuracy before any artist can join. You can browse each artist's complete portfolio, view their previous renders, check their style, and compare timelines and budgets to choose the perfect match for your project."
                  },
                  {
                    question: "Can I see the artist's previous work before hiring?",
                    answer: "Absolutely! Each artist has a detailed portfolio showcasing their previous renders. You can browse their work, see their specialties, and read reviews from other clients before making your decision."
                  },
                  {
                    question: "How long does it take to get renders?",
                    answer: "Timeline depends on project complexity and scope. Artists provide delivery estimates in their proposals. Typical timelines range from a few days for simple renders to several weeks for complex animations or large projects."
                  },
                  {
                    question: "What types of renders can I request?",
                    answer: "Everything from still images to animations, 360° virtual tours, exterior and interior views, aerial perspectives, day and night renders, and more. If you can envision it, our artists can create it."
                  }
                ]
            ).map((faq, index) => (
              <div key={index} className={`faq-item ${openFaqIndex === index ? 'open' : ''}`}>
                <button className="faq-question" onClick={() => toggleFaq(index)}>
                  <span>{faq.question}</span>
                  <svg
                    className="faq-arrow"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {openFaqIndex === index && (
                  <p className="faq-answer">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <div className="section-wrapper">
          <h2 className="final-cta-title">
            Ready to Bring Your Vision to Life?
          </h2>
          <p className="final-cta-subtitle">
            Join property and design professionals worldwide who trust 3dMatch for high-end architectural visualization.
          </p>
          <Link href="/login/property" className="btn-cta-primary btn-cta-large">
            Start Selling With Stunning Renders
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-grid">
            {/* Column 1: Logo */}
            <div className="footer-column footer-logo-column">
              <a href="https://3dmatch.app">
                <img src="/logo.svg" alt="3dMatch" className="footer-logo" />
              </a>
            </div>

            {/* Column 2: Platform */}
            <div className="footer-column">
              <h3 className="footer-heading">Platform</h3>
              <ul className="footer-links">
                <li><Link href="/login/property">Browse Artists</Link></li>
                <li><Link href="/login/property">Browse Projects</Link></li>
                <li><a href="#inicio">How It Works</a></li>
                <li><Link href="/login/property">Post a Project</Link></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="footer-column">
              <h3 className="footer-heading">Resources</h3>
              <ul className="footer-links">
                <li><Link href="/blog">Blog</Link></li>
                <li><a href="#faq">FAQ</a></li>
                <li><Link href="/portfolios">3D Artist Portfolios</Link></li>
                <li><a href="#support">Support</a></li>
              </ul>
            </div>

            {/* Column 4: Company */}
            <div className="footer-column">
              <h3 className="footer-heading">Company</h3>
              <ul className="footer-links">
                <li><a href="#sobre">About</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><Link href="/apply-artist">Become an Artist</Link></li>
              </ul>
            </div>

            {/* Column 5: Subscribe */}
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
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                  </svg>
                </a>
                <a href="https://instagram.com/3dmatch" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"></path>
                  </svg>
                </a>
                <a href="https://linkedin.com/company/3dmatch" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom">
            <p className="footer-copyright">
              © 2024 3dMatch. Global architectural rendering, managed.
            </p>
            <div className="footer-legal">
              <Link href="/terms">Terms and Conditions</Link>
              <span className="footer-separator">•</span>
              <Link href="/privacy">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
