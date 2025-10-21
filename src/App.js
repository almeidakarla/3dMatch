import React, { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import './App.css';
import { useAuth } from './AuthContext';

// Artist Dashboard (placeholder for now)
const ArtistDashboard = () => {
  const { profile, signOut } = useAuth();
  
  return (
    <div className="page">
      <div className="container">
        <div style={{ paddingTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h1 className="page-title">Dashboard do Artista</h1>
            <button onClick={signOut} className="nav-button">Sair</button>
          </div>
          <p>Bem-vindo, {profile?.full_name}!</p>
          <p>Em construção... Aqui você verá seu portfólio e projetos.</p>
        </div>
      </div>
    </div>
  );
};

// Architect Dashboard (placeholder for now)
const ArchitectDashboard = () => {
  const { profile, signOut } = useAuth();
  
  return (
    <div className="page">
      <div className="container">
        <div style={{ paddingTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h1 className="page-title">Dashboard do Arquiteto</h1>
            <button onClick={signOut} className="nav-button">Sair</button>
          </div>
          <p>Bem-vindo, {profile?.full_name}!</p>
          <p>Em construção... Aqui você verá artistas disponíveis e seus projetos.</p>
        </div>
      </div>
    </div>
  );
};

// User Type Selection Page
const UserTypeSelection = ({ onSelect }) => (
  <div className="page user-type-selection">
    <div className="container">
      <h2 className="page-title">Como você gostaria de usar o 3dMatch?</h2>
      <p className="page-subtitle">Escolha a opção que melhor descreve você</p>

      <div className="user-type-grid">
        {/* Architect Option */}
        <button onClick={() => onSelect('arquiteto')} className="user-type-card arquiteto">
          <div className="card-decoration"></div>
          <div className="card-content">
            <div className="card-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="card-title">Sou arquiteto em busca de renderização de alta qualidade</h3>
            <p className="card-text">
              Encontre artistas 3D talentosos para criar visualizações impressionantes dos seus projetos
            </p>
            <div className="card-action">
              Continuar como Arquiteto
              <ArrowRight size={20} />
            </div>
          </div>
        </button>

        {/* Artist Option */}
        <button onClick={() => onSelect('artista')} className="user-type-card artista">
          <div className="card-decoration"></div>
          <div className="card-content">
            <div className="card-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="card-title">Sou artista 3D</h3>
            <p className="card-text">
              Conecte-se com arquitetos, mostre seu portfólio e trabalhe em projetos incríveis
            </p>
            <div className="card-action">
              Continuar como Artista 3D
              <ArrowRight size={20} />
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
);

// Home Page
const HomePage = ({ onNavigate }) => (
  <div className="page homepage">
    <div className="container">
      <div className="hero">
        <div className="logo">
          <h1>
            <span className="logo-3d">3d</span>
            <span className="logo-match">Match</span>
          </h1>
        </div>

        <h2 className="hero-title">
          Conectamos os melhores<br />
          <span className="highlight">artistas 3D do Brasil</span><br />
          a arquitetos que precisam de<br />
          renderizações ultra-realistas
        </h2>

        <p className="hero-subtitle">
          A plataforma que une talento criativo e excelência arquitetônica
        </p>

        {/* Value Propositions */}
        <div className="value-props">
          <div className="value-card artista">
            <h3>🎨 Para Artistas 3D</h3>
            <p>
              Coloque seu trabalho em uma vitrine profissional e seja encontrado por arquitetos 
              que valorizam e precisam do seu talento.
            </p>
          </div>
          <div className="value-card arquiteto">
            <h3>🏗️ Para Arquitetos</h3>
            <p>
              Encontre os artistas 3D mais talentosos do mercado que facilitam 
              e valorizam seu fluxo de trabalho com renderizações excepcionais.
            </p>
          </div>
        </div>

        {/* Image Showcase */}
        <div className="showcase">
          <div className="showcase-grid">
            <div className="showcase-image img-1">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="showcase-image img-2">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <button onClick={() => onNavigate('select-type')} className="cta-button">
          INICIAR
        </button>
      </div>
    </div>
  </div>
);

// About Page
const SobrePage = () => (
  <div className="page sobre-page">
    <div className="container">
      <h1 className="page-title">
        Sobre o <span className="highlight">3dMatch</span>
      </h1>
      <p className="page-subtitle">
        A ponte entre visualização 3D de alta qualidade e projetos arquitetônicos excepcionais
      </p>

      <div className="mission">
        <p>
          O 3dMatch é a plataforma que conecta os melhores artistas 3D do Brasil com arquitetos 
          que buscam renderizações ultra-realistas para seus projetos.
        </p>
        <p>
          Nossa missão é facilitar a colaboração entre profissionais, garantindo qualidade, 
          agilidade e transparência em cada projeto.
        </p>
      </div>

      <h2 className="section-title">Benefícios</h2>
      <div className="benefits-grid">
        <div className="benefit-card">
          <div className="benefit-icon purple">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3>Qualidade Garantida</h3>
          <p>Artistas verificados com portfólios comprovados de renderizações ultra-realistas</p>
        </div>

        <div className="benefit-card">
          <div className="benefit-icon blue">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3>Pagamento Seguro</h3>
          <p>Sistema de pagamento protegido com liberação gradual de valores conforme entrega</p>
        </div>

        <div className="benefit-card">
          <div className="benefit-icon indigo">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3>Rapidez na Entrega</h3>
          <p>Prazos claros e comunicação direta para projetos entregues no tempo certo</p>
        </div>
      </div>

      <h2 className="section-title">Como Funciona</h2>
      <div className="steps">
        <div className="step">
          <div className="step-number">1</div>
          <div className="step-content">
            <h4>Cadastre-se na plataforma</h4>
            <p>Como arquiteto ou artista 3D, crie seu perfil em minutos</p>
          </div>
        </div>
        <div className="step">
          <div className="step-number">2</div>
          <div className="step-content">
            <h4>Conecte-se</h4>
            <p>Arquitetos navegam por portfólios e escolhem o artista ideal</p>
          </div>
        </div>
        <div className="step">
          <div className="step-number">3</div>
          <div className="step-content">
            <h4>Colabore e crie</h4>
            <p>Trabalhem juntos com comunicação direta e transparente</p>
          </div>
        </div>
        <div className="step">
          <div className="step-number">4</div>
          <div className="step-content">
            <h4>Pague com segurança</h4>
            <p>Pagamentos protegidos pela plataforma para garantir a segurança de todos</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Artist Info Page
const ArtistPage = () => (
  <div className="page info-page artista-page">
    <div className="container">
      <h1 className="page-title">
        Para <span className="highlight blue">Artistas 3D</span>
      </h1>
      <p className="page-subtitle">
        Expanda seu negócio e trabalhe em projetos incríveis com os melhores arquitetos do Brasil
      </p>

      <div className="info-grid">
        <div className="info-card artista">
          <h3>📈 Mais Projetos</h3>
          <p>
            Conecte-se com arquitetos que precisam do seu talento. 
            Mostre seu portfólio e receba solicitações de projeto diretamente na plataforma.
          </p>
        </div>
        <div className="info-card artista">
          <h3>💰 Pagamentos Garantidos</h3>
          <p>
            Receba seus pagamentos de forma rápida e segura através da plataforma. 
            Sistema confiável e transparente.
          </p>
        </div>
        <div className="info-card artista">
          <h3>🎨 Seu Portfólio em Destaque</h3>
          <p>
            Crie um perfil profissional com seu melhor trabalho. 
            Arquitetos procuram ativamente por artistas com seu estilo.
          </p>
        </div>
        <div className="info-card artista">
          <h3>⚡ Gestão Simplificada</h3>
          <p>
            Dashboard intuitivo para gerenciar todos seus projetos, 
            prazos e comunicação em um só lugar.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Architect Info Page
const ArquitetoPage = () => (
  <div className="page info-page arquiteto-page">
    <div className="container">
      <h1 className="page-title">
        Para <span className="highlight purple">Arquitetos</span>
      </h1>
      <p className="page-subtitle">
        Encontre os melhores artistas 3D para dar vida aos seus projetos com renderizações ultra-realistas
      </p>

      <div className="info-grid">
        <div className="info-card arquiteto">
          <h3>🔍 Encontre o Match Perfeito</h3>
          <p>
            Navegue por portfólios de artistas 3D talentosos e escolha o profissional 
            que melhor se encaixa no estilo do seu projeto.
          </p>
        </div>
        <div className="info-card arquiteto">
          <h3>✨ Qualidade Excepcional</h3>
          <p>
            Renderizações ultra-realistas que impressionam seus clientes e 
            elevam a apresentação dos seus projetos.
          </p>
        </div>
        <div className="info-card arquiteto">
          <h3>💬 Comunicação Direta</h3>
          <p>
            Converse diretamente com os artistas, compartilhe briefings 
            e acompanhe o progresso em tempo real.
          </p>
        </div>
        <div className="info-card arquiteto">
          <h3>🛡️ Proteção Total</h3>
          <p>
            Pagamento protegido pela plataforma. O valor só é liberado 
            quando você aprovar o trabalho final.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Login Page
const LoginPage = ({ userType, onNavigate }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="page login-page">
      <div className="container">
        <div className="login-card">
          <h2 className="login-title">Bem-vindo!</h2>
          <p className="login-subtitle">
            {userType === 'arquiteto' ? 'Login para Arquitetos' : 'Login para Artistas 3D'}
          </p>

          {error && (
            <div style={{ 
              background: '#fee', 
              color: '#c00', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div className="login-form">
            <input
              type="email"
              placeholder="Email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Senha"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              onClick={handleSubmit} 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          <p className="signup-link">
            Não tem conta? <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('signup'); }}>Cadastre-se</a>
          </p>
        </div>
      </div>
    </div>
  );
};

// Signup Page
const SignupPage = ({ userType, onNavigate }) => {
  const { signUp } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password || !fullName) {
      setError('Por favor, preencha todos os campos');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    const { data, error } = await signUp(email, password, userType, fullName);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page login-page">
        <div className="container">
          <div className="login-card">
            <h2 className="login-title">Cadastro realizado!</h2>
            <p style={{ textAlign: 'center', marginBottom: '24px' }}>
              Sua conta foi criada com sucesso. Você pode fazer login agora.
            </p>
            <button 
              onClick={() => onNavigate('login')} 
              className="submit-button"
            >
              Ir para Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page login-page">
      <div className="container">
        <div className="login-card">
          <h2 className="login-title">Criar Conta</h2>
          <p className="login-subtitle">
            {userType === 'arquiteto' ? 'Cadastro para Arquitetos' : 'Cadastro para Artistas 3D'}
          </p>

          {error && (
            <div style={{ 
              background: '#fee', 
              color: '#c00', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div className="login-form">
            <input
              type="text"
              placeholder="Nome completo"
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Senha (mínimo 6 caracteres)"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              onClick={handleSubmit} 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </div>

          <p className="signup-link">
            Já tem conta? <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('login'); }}>Faça login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [userType, setUserType] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Início', id: 'home' },
    { name: 'Sobre', id: 'sobre' },
    { name: 'Artista 3D', id: 'artista' },
    { name: 'Arquiteto', id: 'arquiteto' },
  ];

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setCurrentPage('signup');
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="app" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Carregando...</h2>
        </div>
      </div>
    );
  }

  // If user is logged in, show their dashboard
  if (user && profile) {
    if (profile.user_type === 'artista') {
      return <ArtistDashboard />;
    } else if (profile.user_type === 'arquiteto') {
      return <ArchitectDashboard />;
    }
  }

  const renderPage = () => {
    switch(currentPage) {
      case 'home': return <HomePage onNavigate={setCurrentPage} />;
      case 'select-type': return <UserTypeSelection onSelect={handleUserTypeSelect} />;
      case 'sobre': return <SobrePage />;
      case 'artista': return <ArtistPage />;
      case 'arquiteto': return <ArquitetoPage />;
      case 'login': return <LoginPage userType={userType} onNavigate={setCurrentPage} />;
      case 'signup': return <SignupPage userType={userType} onNavigate={setCurrentPage} />;
      default: return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <button onClick={() => setCurrentPage('home')} className="nav-logo">
            <span className="logo-3d">3d</span>
            <span className="logo-match">Match</span>
          </button>

          {/* Desktop Navigation */}
          <div className="nav-links">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
              >
                {item.name}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage('select-type')}
              className="nav-button"
            >
              Login
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-button"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`mobile-menu-link ${currentPage === item.id ? 'active' : ''}`}
              >
                {item.name}
              </button>
            ))}
            <button
              onClick={() => {
                setCurrentPage('select-type');
                setMobileMenuOpen(false);
              }}
              className="mobile-menu-button"
            >
              Login
            </button>
          </div>
        )}
      </nav>

      {/* Page Content */}
      {renderPage()}
    </div>
  );
}