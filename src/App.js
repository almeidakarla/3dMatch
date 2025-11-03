import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css';
import { 
  User, Image, Briefcase, FileText, PlusCircle, Users, LogOut, 
  Moon, Sun, Home, FolderOpen, Send, X, Check, Upload, Eye
} from 'lucide-react';

// ==================== COLLAPSIBLE SIDEBAR ====================
const CollapsibleSidebar = ({ userType, activeTab, setActiveTab, onSignOut, darkMode, toggleDarkMode }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const artistMenuItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'portfolio', label: 'Portfólio', icon: Image },
    { id: 'browse-projects', label: 'Projetos Disponíveis', icon: Briefcase },
    { id: 'my-applications', label: 'Minhas Candidaturas', icon: Send },
    { id: 'active-projects', label: 'Projetos Ativos', icon: FolderOpen },
  ];

  const architectMenuItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'browse-artists', label: 'Explorar Artistas', icon: Users },
    { id: 'post-project', label: 'Publicar Projeto', icon: PlusCircle },
    { id: 'my-projects', label: 'Meus Projetos', icon: Briefcase },
    { id: 'applications', label: 'Candidaturas Recebidas', icon: FileText },
  ];

  const menuItems = userType === 'artista' ? artistMenuItems : architectMenuItems;

  return (
    <div 
      className={`sidebar ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="sidebar-logo">
        <span className="logo-icon">3D</span>
        {isExpanded && <span className="logo-text">3dMatch</span>}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={!isExpanded ? item.label : ''}
            >
              <Icon size={20} />
              {isExpanded && <span className="sidebar-label">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button
          className="sidebar-item"
          onClick={toggleDarkMode}
          title={!isExpanded ? (darkMode ? 'Modo Claro' : 'Modo Escuro') : ''}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          {isExpanded && <span className="sidebar-label">{darkMode ? 'Modo Claro' : 'Modo Escuro'}</span>}
        </button>
        
        <button
          className="sidebar-item"
          onClick={onSignOut}
          title={!isExpanded ? 'Sair' : ''}
        >
          <LogOut size={20} />
          {isExpanded && <span className="sidebar-label">Sair</span>}
        </button>
      </div>
    </div>
  );
};

// ==================== LANDING PAGE ====================
const LandingPage = ({ onNavigate }) => {
  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo-3d">3d</span>
            <span className="logo-match">Match</span>
          </div>
          <nav className="header-nav">
            <a href="#inicio">Início</a>
            <a href="#sobre">Sobre</a>
            <a href="#artista">Artista 3D</a>
            <a href="#arquiteto">Arquiteto</a>
            <button className="btn-login" onClick={() => onNavigate('select-type')}>
              Login
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section" id="inicio">
        <div className="hero-wrapper">
          <h1 className="hero-title">
            <span className="hero-line-1">Conectamos os melhores</span>
            <span className="hero-line-2">artistas 3D do Brasil</span>
            <span className="hero-line-3">a arquitetos que precisam de renderizações ultra-realistas</span>
          </h1>
          <p className="hero-subtitle">
            A plataforma que une talento criativo e excelência arquitetônica
          </p>

          <div className="hero-cards">
            <div className="hero-card hero-card-artist">
              <span className="hero-card-emoji">🎨</span>
              <h3>Para Artistas 3D</h3>
              <p>Coloque seu trabalho em uma vitrine profissional e seja encontrado por arquitetos que valorizam e precisam do seu talento.</p>
            </div>

            <div className="hero-card hero-card-architect">
              <span className="hero-card-emoji">🏛️</span>
              <h3>Para Arquitetos</h3>
              <p>Encontre os artistas 3D mais talentosos do mercado que facilitam e valorizam seu fluxo de trabalho com renderizações excepcionais.</p>
            </div>
          </div>

          <button className="btn-hero" onClick={() => onNavigate('select-type')}>
            INICIAR
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section" id="sobre">
        <div className="section-wrapper">
          <h2 className="section-title">
            Sobre o <span className="highlight">3dMatch</span>
          </h2>
          <p className="section-subtitle">
            A ponte entre visualização 3D de alta qualidade e projetos arquitetônicos excepcionais
          </p>
          <p className="about-text">
            O 3dMatch é a plataforma que conecta os melhores artistas 3D do Brasil com arquitetos que buscam renderizações ultra-realistas para seus projetos.
          </p>
          <p className="about-text">
            Nossa missão é facilitar a colaboração entre profissionais, garantindo qualidade, agilidade e transparência em cada projeto.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="section-wrapper">
          <h2 className="section-title">Benefícios</h2>
          
          <div className="benefits-grid">
            <div className="benefit-card benefit-purple">
              <div className="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3>Qualidade Garantida</h3>
              <p>Artistas verificados com portfólios comprovados de renderizações ultra-realistas</p>
            </div>

            <div className="benefit-card benefit-blue">
              <div className="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3>Pagamento Seguro</h3>
              <p>Sistema de pagamento protegido com liberação gradual de valores conforme entrega</p>
            </div>

            <div className="benefit-card benefit-blue-light">
              <div className="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <h3>Rapidez na Entrega</h3>
              <p>Prazos claros e comunicação direta para projetos entregues no tempo certo</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works-section">
        <div className="section-wrapper">
          <h2 className="section-title">Como Funciona</h2>
          
          <div className="steps-list">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Cadastre-se na plataforma</h3>
                <p>Como arquiteto ou artista 3D, crie seu perfil em minutos</p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Conecte-se</h3>
                <p>Arquitetos navegam por portfólios e escolhem o artista ideal</p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Colabore e crie</h3>
                <p>Trabalhem juntos com comunicação direta e transparente</p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Pague com segurança</h3>
                <p>Pagamentos protegidos pela plataforma para garantir a segurança de todos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Artists Section */}
      <section className="for-artists-section" id="artista">
        <div className="section-wrapper">
          <h2 className="section-title">
            Para <span className="highlight-blue">Artistas 3D</span>
          </h2>
          <p className="section-subtitle">
            Expanda seu negócio e trabalhe em projetos incríveis com os melhores arquitetos do Brasil
          </p>

          <div className="feature-grid">
            <div className="feature-item">
              <span className="feature-emoji">📈</span>
              <h3>Mais Projetos</h3>
              <p>Conecte-se com arquitetos que precisam do seu talento. Mostre seu portfólio e receba solicitações de projeto diretamente na plataforma.</p>
            </div>

            <div className="feature-item">
              <span className="feature-emoji">💰</span>
              <h3>Pagamentos Garantidos</h3>
              <p>Receba seus pagamentos de forma rápida e segura através da plataforma. Sistema confiável e transparente.</p>
            </div>

            <div className="feature-item">
              <span className="feature-emoji">🎨</span>
              <h3>Seu Portfólio em Destaque</h3>
              <p>Crie um perfil profissional com seu melhor trabalho. Arquitetos procuram ativamente por artistas com seu estilo.</p>
            </div>

            <div className="feature-item">
              <span className="feature-emoji">⚡</span>
              <h3>Gestão Simplificada</h3>
              <p>Dashboard intuitivo para gerenciar todos seus projetos, prazos e comunicação em um só lugar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Architects Section */}
      <section className="for-architects-section" id="arquiteto">
        <div className="section-wrapper">
          <h2 className="section-title">
            Para <span className="highlight-purple">Arquitetos</span>
          </h2>
          <p className="section-subtitle">
            Encontre os melhores artistas 3D para dar vida aos seus projetos com renderizações ultra-realistas
          </p>

          <div className="feature-grid">
            <div className="feature-item">
              <span className="feature-emoji">🔍</span>
              <h3>Encontre o Match Perfeito</h3>
              <p>Navegue por portfólios de artistas 3D talentosos e escolha o profissional que melhor se encaixa no estilo do seu projeto.</p>
            </div>

            <div className="feature-item">
              <span className="feature-emoji">✨</span>
              <h3>Qualidade Excepcional</h3>
              <p>Renderizações ultra-realistas que impressionam seus clientes e elevam a apresentação dos seus projetos.</p>
            </div>

            <div className="feature-item">
              <span className="feature-emoji">💬</span>
              <h3>Comunicação Direta</h3>
              <p>Converse diretamente com os artistas, compartilhe briefings e acompanhe o progresso em tempo real.</p>
            </div>

            <div className="feature-item">
              <span className="feature-emoji">🛡️</span>
              <h3>Proteção Total</h3>
              <p>Pagamento protegido pela plataforma. O valor só é liberado quando você aprovar o trabalho final.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2024 3dMatch. Conectando artistas 3D com arquitetos.</p>
      </footer>
    </div>
  );
};

// ==================== USER TYPE SELECTION ====================
const UserTypeSelection = ({ onSelect }) => {
  return (
    <div className="user-type-selection">
      <h2>Você é...</h2>
      <div className="type-cards">
        <div className="type-card" onClick={() => onSelect('artista')}>
          <Image size={48} />
          <h3>Artista 3D</h3>
          <p>Crio renderizações e quero encontrar projetos</p>
        </div>
        <div className="type-card" onClick={() => onSelect('arquiteto')}>
          <Users size={48} />
          <h3>Arquiteto</h3>
          <p>Preciso de artistas 3D para meus projetos</p>
        </div>
      </div>
    </div>
  );
};

// ==================== LOGIN PAGE ====================
const LoginPage = ({ userType, onBack, onLoginSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              user_type: userType,
              full_name: fullName,
            });

          if (profileError) throw profileError;

          setMessage('Conta criada com sucesso! Verifique seu email.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        onLoginSuccess();
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <button className="btn-back" onClick={onBack}>← Voltar</button>
      
      <div className="login-card">
        <h2>{isSignup ? 'Criar Conta' : 'Entrar'}</h2>
        <p className="login-subtitle">
          Como {userType === 'artista' ? 'Artista 3D' : 'Arquiteto'}
        </p>

        <form onSubmit={handleAuth}>
          {isSignup && (
            <div className="form-group">
              <label>Nome Completo</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {message && (
            <div className={`message ${message.includes('sucesso') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Processando...' : (isSignup ? 'Criar Conta' : 'Entrar')}
          </button>
        </form>

        <p className="login-toggle">
          {isSignup ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
          <button onClick={() => setIsSignup(!isSignup)} className="link-button">
            {isSignup ? 'Entrar' : 'Criar conta'}
          </button>
        </p>
      </div>
    </div>
  );
};

// ==================== ARTIST PROFILE ====================
const ArtistProfile = ({ profile, onUpdate }) => {
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    website: profile?.website || ''
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(profile?.profile_photo || null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Foto deve ter menos de 5MB');
        return;
      }
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      let photoUrl = profile?.profile_photo;

      if (profilePhoto) {
        const fileExt = profilePhoto.name.split('.').pop();
        const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, profilePhoto);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);
        
        photoUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          profile_photo: photoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      setMessage('Perfil atualizado com sucesso!');
      onUpdate();
    } catch (error) {
      setMessage('Erro ao atualizar perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-section">
      <h2>Meu Perfil</h2>
      
      <div className="profile-form">
        <div className="photo-upload-section">
          <div className="photo-preview">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" />
            ) : (
              <User size={48} />
            )}
          </div>
          <label className="btn-secondary">
            Escolher Foto
            <input 
              type="file" 
              accept="image/*" 
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div className="form-group">
          <label>Nome Completo *</label>
          <input
            type="text"
            className="form-input"
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            className="form-textarea"
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            rows="4"
            placeholder="Conte um pouco sobre sua experiência..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Telefone</label>
            <input
              type="tel"
              className="form-input"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+55 (11) 98765-4321"
            />
          </div>

          <div className="form-group">
            <label>Localização</label>
            <input
              type="text"
              className="form-input"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="São Paulo, SP"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Website/Portfolio</label>
          <input
            type="url"
            className="form-input"
            value={formData.website}
            onChange={(e) => setFormData({...formData, website: e.target.value})}
            placeholder="https://seuportfolio.com"
          />
        </div>

        {message && (
          <div className={`message ${message.includes('sucesso') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <button className="btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
};

// ==================== ARTIST PORTFOLIO ====================
const ArtistPortfolio = ({ profile }) => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('*')
        .eq('artist_id', profile.id)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setPortfolioItems(data || []);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setMessage('Imagem deve ter menos de 10MB');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('portfolio_images')
        .insert({
          artist_id: profile.id,
          image_url: urlData.publicUrl,
          title: '',
          description: '',
          order_index: portfolioItems.length
        });

      if (insertError) throw insertError;

      setMessage('Imagem adicionada com sucesso!');
      loadPortfolio();
    } catch (error) {
      setMessage('Erro ao fazer upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (item) => {
    try {
      const { error } = await supabase
        .from('portfolio_images')
        .update({
          title: item.title,
          description: item.description
        })
        .eq('id', item.id);

      if (error) throw error;

      setMessage('Imagem atualizada!');
      setEditingItem(null);
      loadPortfolio();
    } catch (error) {
      setMessage('Erro ao atualizar: ' + error.message);
    }
  };

  const handleDelete = async (itemId, imageUrl) => {
    if (!window.confirm('Tem certeza que deseja excluir esta imagem?')) return;

    try {
      const fileName = imageUrl.split('/').pop();
      await supabase.storage
        .from('portfolio-images')
        .remove([`${profile.id}/${fileName}`]);

      const { error } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setMessage('Imagem removida!');
      loadPortfolio();
    } catch (error) {
      setMessage('Erro ao excluir: ' + error.message);
    }
  };

  return (
    <div className="content-section">
      <div className="section-header">
        <h2>Meu Portfólio</h2>
        <label className="btn-primary">
          <PlusCircle size={18} />
          Adicionar Imagem
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {message && (
        <div className={`message ${message.includes('sucesso') || message.includes('atualizada') || message.includes('removida') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <p>Carregando portfólio...</p>
      ) : portfolioItems.length === 0 ? (
        <div className="empty-state">
          <Image size={48} />
          <p>Seu portfólio está vazio. Adicione suas primeiras imagens!</p>
        </div>
      ) : (
        <div className="portfolio-grid">
          {portfolioItems.map((item) => (
            <div key={item.id} className="portfolio-item">
              <img src={item.image_url} alt={item.title || 'Portfolio'} />
              
              {editingItem?.id === item.id ? (
                <div className="portfolio-edit">
                  <input
                    type="text"
                    className="form-input"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                    placeholder="Título"
                  />
                  <textarea
                    className="form-textarea"
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                    placeholder="Descrição"
                    rows="2"
                  />
                  <div className="portfolio-actions">
                    <button className="btn-primary btn-sm" onClick={() => handleUpdate(editingItem)}>
                      Salvar
                    </button>
                    <button className="btn-secondary btn-sm" onClick={() => setEditingItem(null)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="portfolio-info">
                  <h4>{item.title || 'Sem título'}</h4>
                  <p>{item.description || 'Sem descrição'}</p>
                  <div className="portfolio-actions">
                    <button className="btn-secondary btn-sm" onClick={() => setEditingItem(item)}>
                      Editar
                    </button>
                    <button className="btn-danger btn-sm" onClick={() => handleDelete(item.id, item.image_url)}>
                      Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== BROWSE PROJECTS (ARTIST) ====================
const BrowseProjects = ({ profile }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [proposalText, setProposalText] = useState('');
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          architect:architect_id (
            full_name,
            profile_photo
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!proposalText.trim()) {
      setMessage('Por favor, escreva uma proposta');
      return;
    }

    setApplying(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          project_id: selectedProject.id,
          artist_id: profile.id,
          proposal: proposalText,
          status: 'pending'
        });

      if (error) throw error;

      setMessage('Candidatura enviada com sucesso!');
      setProposalText('');
      setTimeout(() => {
        setSelectedProject(null);
        setMessage('');
        loadProjects();
      }, 2000);
    } catch (error) {
      setMessage('Erro ao enviar candidatura: ' + error.message);
    } finally {
      setApplying(false);
    }
  };

  if (selectedProject) {
    return (
      <div className="content-section">
        <button className="btn-secondary" onClick={() => setSelectedProject(null)}>
          ← Voltar
        </button>

        <div className="project-detail">
          <h2>{selectedProject.title}</h2>
          <p className="project-meta">
            Por: {selectedProject.architect?.full_name} | 
            Orçamento: {selectedProject.currency} {selectedProject.budget?.toLocaleString()} |
            Prazo: {new Date(selectedProject.deadline).toLocaleDateString()}
          </p>
          <p className="project-description">{selectedProject.description}</p>

          {selectedProject.reference_images && selectedProject.reference_images.length > 0 && (
            <div className="reference-images">
              <h3>Imagens de Referência</h3>
              <div className="images-grid">
                {selectedProject.reference_images.map((url, index) => (
                  <img key={index} src={url} alt={`Referência ${index + 1}`} />
                ))}
              </div>
            </div>
          )}

          <h3>Sua Proposta</h3>
          <textarea
            className="form-textarea"
            value={proposalText}
            onChange={(e) => setProposalText(e.target.value)}
            rows="6"
            placeholder="Explique como você abordaria este projeto, seu prazo de entrega, e por que você é o melhor artista para este trabalho..."
          />

          {message && (
            <div className={`message ${message.includes('sucesso') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button 
            className="btn-primary" 
            onClick={handleApply}
            disabled={applying}
          >
            {applying ? 'Enviando...' : 'Enviar Candidatura'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-section">
      <h2>Projetos Disponíveis</h2>

      {loading ? (
        <p>Carregando projetos...</p>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <Briefcase size={48} />
          <p>Nenhum projeto disponível no momento.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <h3>{project.title}</h3>
              <p className="project-budget">
                {project.currency} {project.budget?.toLocaleString()}
              </p>
              <p className="project-excerpt">
                {project.description?.substring(0, 120)}...
              </p>
              <p className="project-deadline">
                Prazo: {new Date(project.deadline).toLocaleDateString()}
              </p>
              <button 
                className="btn-primary"
                onClick={() => setSelectedProject(project)}
              >
                Ver Detalhes e Candidatar-se
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== MY APPLICATIONS (ARTIST) ====================
const MyApplications = ({ profile }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          project:project_id (
            title,
            budget,
            currency,
            deadline,
            architect:architect_id (
              full_name
            )
          )
        `)
        .eq('artist_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'Pendente', className: 'badge-pending' },
      accepted: { label: 'Aceito', className: 'badge-accepted' },
      rejected: { label: 'Rejeitado', className: 'badge-rejected' }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="content-section">
      <h2>Minhas Candidaturas</h2>

      {loading ? (
        <p>Carregando candidaturas...</p>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <Send size={48} />
          <p>Você ainda não se candidatou a nenhum projeto.</p>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map((app) => {
            const badge = getStatusBadge(app.status);
            return (
              <div key={app.id} className="application-card">
                <div className="application-header">
                  <div>
                    <h3>{app.project.title}</h3>
                    <p className="application-meta">
                      Por: {app.project.architect.full_name} | 
                      {app.project.currency} {app.project.budget?.toLocaleString()}
                    </p>
                  </div>
                  <span className={`status-badge ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="application-proposal">{app.proposal}</p>
                <p className="application-date">
                  Enviado em: {new Date(app.created_at).toLocaleDateString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ==================== ACTIVE PROJECTS (ARTIST) ====================
const ActiveProjects = ({ profile }) => {
  const [activeProjects, setActiveProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveProjects();
  }, []);

  const loadActiveProjects = async () => {
    try {
      // Get accepted applications for this artist
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          project:project_id (
            *,
            architect:architect_id (
              full_name,
              profile_photo
            )
          )
        `)
        .eq('artist_id', profile.id)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActiveProjects(data || []);
    } catch (error) {
      console.error('Error loading active projects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-section">
      <h2>Projetos Ativos</h2>

      {loading ? (
        <p>Carregando projetos ativos...</p>
      ) : activeProjects.length === 0 ? (
        <div className="empty-state">
          <FolderOpen size={48} />
          <p>Você não tem projetos ativos no momento. Candidate-se a projetos disponíveis!</p>
        </div>
      ) : (
        <div className="projects-grid">
          {activeProjects.map((app) => {
            const project = app.project;
            return (
              <div key={app.id} className="project-card">
                <div className="project-card-header">
                  <div className="architect-info-small">
                    <div className="artist-photo-small">
                      {project.architect.profile_photo ? (
                        <img src={project.architect.profile_photo} alt={project.architect.full_name} />
                      ) : (
                        <User size={24} />
                      )}
                    </div>
                    <span>{project.architect.full_name}</span>
                  </div>
                  <span className="status-badge badge-accepted">Em Progresso</span>
                </div>
                
                <h3>{project.title}</h3>
                <p className="project-budget">
                  {project.currency} {project.budget?.toLocaleString()}
                </p>
                <p className="project-excerpt">
                  {project.description?.substring(0, 100)}...
                </p>
                <p className="project-deadline">
                  Prazo: {new Date(project.deadline).toLocaleDateString()}
                </p>
                
                <button className="btn-primary">
                  Ver Detalhes e Enviar Trabalho
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ==================== BROWSE ARTISTS (ARCHITECT) ====================
const BrowseArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState(null);

  useEffect(() => {
    loadArtists();
  }, []);

  const loadArtists = async () => {
    try {
      const { data: artistsData, error: artistsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'artista')
        .order('created_at', { ascending: false });

      if (artistsError) throw artistsError;

      const artistsWithPortfolio = await Promise.all(
        artistsData.map(async (artist) => {
          const { data: portfolioData } = await supabase
            .from('portfolio_images')
            .select('*')
            .eq('artist_id', artist.id)
            .order('order_index', { ascending: true })
            .limit(4);

          return {
            ...artist,
            portfolio: portfolioData || []
          };
        })
      );

      setArtists(artistsWithPortfolio);
    } catch (error) {
      console.error('Error loading artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewFullProfile = async (artist) => {
    const { data: fullPortfolio } = await supabase
      .from('portfolio_images')
      .select('*')
      .eq('artist_id', artist.id)
      .order('order_index', { ascending: true });

    setSelectedArtist({
      ...artist,
      portfolio: fullPortfolio || []
    });
  };

  if (selectedArtist) {
    return (
      <div className="content-section">
        <button className="btn-secondary" onClick={() => setSelectedArtist(null)}>
          ← Voltar
        </button>

        <div className="artist-profile-view">
          <div className="artist-header">
            <div className="artist-photo-large">
              {selectedArtist.profile_photo ? (
                <img src={selectedArtist.profile_photo} alt={selectedArtist.full_name} />
              ) : (
                <User size={64} />
              )}
            </div>
            <div className="artist-info">
              <h2>{selectedArtist.full_name}</h2>
              {selectedArtist.location && <p>📍 {selectedArtist.location}</p>}
              {selectedArtist.bio && <p className="artist-bio">{selectedArtist.bio}</p>}
              {selectedArtist.website && (
                <a href={selectedArtist.website} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  Ver Website
                </a>
              )}
            </div>
          </div>

          <h3>Portfólio</h3>
          {selectedArtist.portfolio.length > 0 ? (
            <div className="portfolio-grid">
              {selectedArtist.portfolio.map((item) => (
                <div key={item.id} className="portfolio-item-view">
                  <img src={item.image_url} alt={item.title} />
                  {(item.title || item.description) && (
                    <div className="portfolio-info">
                      {item.title && <h4>{item.title}</h4>}
                      {item.description && <p>{item.description}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>Este artista ainda não adicionou trabalhos ao portfólio.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="content-section">
      <h2>Explorar Artistas</h2>

      {loading ? (
        <p>Carregando artistas...</p>
      ) : artists.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <p>Nenhum artista cadastrado ainda.</p>
        </div>
      ) : (
        <div className="artists-grid">
          {artists.map((artist) => (
            <div key={artist.id} className="artist-card">
              <div className="artist-photo">
                {artist.profile_photo ? (
                  <img src={artist.profile_photo} alt={artist.full_name} />
                ) : (
                  <User size={32} />
                )}
              </div>
              <h3>{artist.full_name || 'Artista'}</h3>
              {artist.location && <p className="artist-location">📍 {artist.location}</p>}
              {artist.bio && <p className="artist-bio-excerpt">{artist.bio.substring(0, 80)}...</p>}
              
              {artist.portfolio.length > 0 && (
                <div className="artist-portfolio-preview">
                  {artist.portfolio.slice(0, 3).map((item) => (
                    <div key={item.id} className="portfolio-preview-item">
                      <img src={item.image_url} alt="Portfolio" />
                    </div>
                  ))}
                </div>
              )}

              <button className="btn-primary" onClick={() => viewFullProfile(artist)}>
                Ver Perfil Completo
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== POST PROJECT (ARCHITECT) ====================
const PostProject = ({ profile, onProjectPosted }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    currency: 'USD',
    deadline: ''
  });
  const [referenceImages, setReferenceImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + referenceImages.length > 5) {
      setMessage('Máximo de 5 imagens de referência');
      return;
    }
    setReferenceImages([...referenceImages, ...files]);
  };

  const removeImage = (index) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.budget || !formData.deadline) {
      setMessage('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const imageUrls = [];

      for (const file of referenceImages) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${profile.id}/${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('project-references')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('project-references')
          .getPublicUrl(fileName);
        
        imageUrls.push(urlData.publicUrl);
      }

      const { error } = await supabase
        .from('projects')
        .insert({
          architect_id: profile.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          budget: parseFloat(formData.budget),
          currency: formData.currency,
          deadline: formData.deadline,
          reference_images: imageUrls,
          status: 'open'
        });

      if (error) throw error;

      setMessage('Projeto publicado com sucesso!');
      setFormData({
        title: '',
        description: '',
        category: '',
        budget: '',
        currency: 'USD',
        deadline: ''
      });
      setReferenceImages([]);
      
      if (onProjectPosted) {
        setTimeout(() => onProjectPosted(), 1500);
      }
    } catch (error) {
      setMessage('Erro ao publicar projeto: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="content-section">
      <h2>Publicar Novo Projeto</h2>

      <div className="project-form">
        <div className="form-group">
          <label>Título do Projeto *</label>
          <input
            type="text"
            className="form-input"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="Ex: Renderização de Casa Moderna"
          />
        </div>

        <div className="form-group">
          <label>Descrição *</label>
          <textarea
            className="form-textarea"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows="5"
            placeholder="Descreva o projeto em detalhes..."
          />
        </div>

        <div className="form-group">
          <label>Categoria</label>
          <select
            className="form-input"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            <option value="">Selecione uma categoria</option>
            <option value="residential">Residencial</option>
            <option value="commercial">Comercial</option>
            <option value="interior">Design de Interiores</option>
            <option value="landscape">Paisagismo</option>
            <option value="other">Outro</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Orçamento *</label>
            <input
              type="number"
              className="form-input"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
              placeholder="5000"
            />
          </div>

          <div className="form-group">
            <label>Moeda</label>
            <select
              className="form-input"
              value={formData.currency}
              onChange={(e) => setFormData({...formData, currency: e.target.value})}
            >
              <option value="USD">USD ($)</option>
              <option value="BRL">BRL (R$)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Prazo de Entrega *</label>
          <input
            type="date"
            className="form-input"
            value={formData.deadline}
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Imagens de Referência (até 5)</label>
          <div className="reference-images-upload">
            {referenceImages.map((file, index) => (
              <div key={index} className="reference-preview">
                <img src={URL.createObjectURL(file)} alt={`Ref ${index + 1}`} />
                <button
                  className="remove-image-btn"
                  onClick={() => removeImage(index)}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            {referenceImages.length < 5 && (
              <label className="add-reference-btn">
                <PlusCircle size={24} />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
        </div>

        {message && (
          <div className={`message ${message.includes('sucesso') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={uploading}
        >
          {uploading ? 'Publicando...' : 'Publicar Projeto'}
        </button>
      </div>
    </div>
  );
};

// ==================== MY PROJECTS (ARCHITECT) ====================
const MyProjects = ({ profile }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('architect_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewProjectDetails = async (project) => {
    const { data: applications } = await supabase
      .from('applications')
      .select(`
        *,
        artist:artist_id (
          full_name,
          profile_photo,
          bio
        )
      `)
      .eq('project_id', project.id)
      .order('created_at', { ascending: false });

    setSelectedProject({
      ...project,
      applications: applications || []
    });
  };

  const handleAcceptApplication = async (applicationId) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'accepted' })
        .eq('id', applicationId);

      if (error) throw error;

      // Reload project details
      viewProjectDetails(selectedProject);
    } catch (error) {
      alert('Erro ao aceitar candidatura: ' + error.message);
    }
  };

  const handleRejectApplication = async (applicationId) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId);

      if (error) throw error;

      // Reload project details
      viewProjectDetails(selectedProject);
    } catch (error) {
      alert('Erro ao rejeitar candidatura: ' + error.message);
    }
  };

  if (selectedProject) {
    return (
      <div className="content-section">
        <button className="btn-secondary" onClick={() => setSelectedProject(null)}>
          ← Voltar
        </button>

        <div className="project-detail-view">
          <h2>{selectedProject.title}</h2>
          <p className="project-meta">
            Orçamento: {selectedProject.currency} {selectedProject.budget?.toLocaleString()} | 
            Prazo: {new Date(selectedProject.deadline).toLocaleDateString()} |
            Status: {selectedProject.status}
          </p>
          <p className="project-description">{selectedProject.description}</p>

          {selectedProject.reference_images && selectedProject.reference_images.length > 0 && (
            <div className="reference-images">
              <h3>Imagens de Referência</h3>
              <div className="images-grid">
                {selectedProject.reference_images.map((url, index) => (
                  <img key={index} src={url} alt={`Referência ${index + 1}`} />
                ))}
              </div>
            </div>
          )}

          <h3>Candidaturas Recebidas ({selectedProject.applications.length})</h3>
          {selectedProject.applications.length === 0 ? (
            <p>Nenhuma candidatura recebida ainda.</p>
          ) : (
            <div className="applications-list">
              {selectedProject.applications.map((app) => (
                <div key={app.id} className="application-card">
                  <div className="application-artist">
                    <div className="artist-photo-small">
                      {app.artist.profile_photo ? (
                        <img src={app.artist.profile_photo} alt={app.artist.full_name} />
                      ) : (
                        <User size={32} />
                      )}
                    </div>
                    <div>
                      <h4>{app.artist.full_name}</h4>
                      {app.artist.bio && <p className="artist-bio-small">{app.artist.bio.substring(0, 60)}...</p>}
                    </div>
                    <span className={`status-badge badge-${app.status}`}>
                      {app.status === 'pending' ? 'Pendente' : app.status === 'accepted' ? 'Aceito' : 'Rejeitado'}
                    </span>
                  </div>
                  <p className="application-proposal">{app.proposal}</p>
                  <div className="application-actions">
                    {app.status === 'pending' && (
                      <>
                        <button 
                          className="btn-primary btn-sm"
                          onClick={() => handleAcceptApplication(app.id)}
                        >
                          <Check size={16} /> Aceitar
                        </button>
                        <button 
                          className="btn-danger btn-sm"
                          onClick={() => handleRejectApplication(app.id)}
                        >
                          <X size={16} /> Rejeitar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="content-section">
      <h2>Meus Projetos</h2>

      {loading ? (
        <p>Carregando projetos...</p>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <Briefcase size={48} />
          <p>Você ainda não publicou nenhum projeto.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <h3>{project.title}</h3>
              <p className="project-budget">
                {project.currency} {project.budget?.toLocaleString()}
              </p>
              <p className="project-excerpt">
                {project.description?.substring(0, 100)}...
              </p>
              <p className="project-status">
                Status: {project.status}
              </p>
              <button 
                className="btn-primary"
                onClick={() => viewProjectDetails(project)}
              >
                Ver Detalhes
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== MAIN APP ====================
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode !== null) {
    setDarkMode(savedDarkMode === 'true');
  }
  
  checkUser();
    }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const checkUser = async () => {
  try {
    // Check for existing session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      setUser(session.user);
      
      // Get user profile
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileData && !error) {
        setProfile(profileData);
        setUserType(profileData.user_type);
        setCurrentPage('dashboard');
      } else {
        // Profile doesn't exist, sign out
        console.error('Profile not found:', error);
        await supabase.auth.signOut();
      }
    }
  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    setLoading(false);
  }
};

  const handleSignOut = async () => {
  await supabase.auth.signOut();
  setUser(null);
  setProfile(null);
  setUserType(null);
  setCurrentPage('home');
  setActiveTab('home');
};

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setCurrentPage('login');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="logo-icon">3D</div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (currentPage === 'dashboard' && profile) {
    return (
      <div className="app-container">
        <CollapsibleSidebar
          userType={userType}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSignOut={handleSignOut}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        
        <main className="main-content">
          <div className="content-wrapper">
            {activeTab === 'home' && (
              <div className="content-section">
                <h1>Bem-vindo, {profile.full_name || 'Usuário'}! 👋</h1>
                <p>Selecione uma opção no menu lateral para começar.</p>
              </div>
            )}
            
            {userType === 'artista' && activeTab === 'profile' && (
              <ArtistProfile profile={profile} onUpdate={checkUser} />
            )}
            
            {userType === 'artista' && activeTab === 'portfolio' && (
              <ArtistPortfolio profile={profile} />
            )}

            {userType === 'artista' && activeTab === 'browse-projects' && (
              <BrowseProjects profile={profile} />
            )}

            {userType === 'artista' && activeTab === 'my-applications' && (
              <MyApplications profile={profile} />
            )}

            {userType === 'artista' && activeTab === 'active-projects' && (
              <ActiveProjects profile={profile} />
            )}

            {userType === 'arquiteto' && activeTab === 'browse-artists' && (
              <BrowseArtists />
            )}

            {userType === 'arquiteto' && activeTab === 'post-project' && (
              <PostProject profile={profile} onProjectPosted={() => setActiveTab('my-projects')} />
            )}

            {userType === 'arquiteto' && activeTab === 'my-projects' && (
              <MyProjects profile={profile} />
            )}

            {userType === 'arquiteto' && activeTab === 'applications' && (
              <div className="content-section">
                <h2>Candidaturas Recebidas</h2>
                <p>Veja as candidaturas em "Meus Projetos" → Selecione um projeto</p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (currentPage === 'select-type') {
    return <UserTypeSelection onSelect={handleUserTypeSelect} />;
  }

  if (currentPage === 'login') {
    return (
      <LoginPage 
        userType={userType}
        onBack={() => setCurrentPage('select-type')}
        onLoginSuccess={checkUser}
      />
    );
  }

  return <LandingPage onNavigate={setCurrentPage} />;
}

export default App;