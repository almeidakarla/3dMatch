// ArtistProfile.js
// Save this as: src/ArtistProfile.js

import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const ArtistProfile = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    bio: '',
    profile_photo: '',
    phone: '',
    location: '',
    website: ''
  });

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          bio: data.bio || '',
          profile_photo: data.profile_photo || '',
          phone: data.phone || '',
          location: data.location || '',
          website: data.website || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Por favor, selecione uma imagem válida');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploadingPhoto(true);
    setMessage('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/profile-photo.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Update profile with new photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo: urlData.publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, profile_photo: urlData.publicUrl }));
      setMessage('✅ Foto atualizada com sucesso!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      setMessage(`❌ Erro ao fazer upload: ${error.message}`);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          phone: profile.phone,
          location: profile.location,
          website: profile.website
        })
        .eq('id', userId);

      if (error) throw error;

      setMessage('✅ Perfil salvo com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage(`❌ Erro ao salvar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Carregando perfil...</div>;
  }

  return (
    <div className="artist-profile-editor">
      <h2 className="section-title">Meu Perfil</h2>
      <p className="subtitle">Atualize suas informações profissionais</p>

      {message && (
        <div className={`message ${message.includes('✅') ? 'message-success' : 'message-error'}`}>
          {message}
        </div>
      )}

      <div className="profile-editor-grid">
        {/* Left Column - Photo */}
        <div className="profile-photo-section">
          <div className="profile-photo-container">
            {profile.profile_photo ? (
              <img 
                src={profile.profile_photo} 
                alt="Profile" 
                className="profile-photo-preview"
              />
            ) : (
              <div className="profile-photo-placeholder">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>

          <label className="btn-secondary upload-photo-btn">
            {uploadingPhoto ? 'Fazendo upload...' : 'Alterar Foto'}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploadingPhoto}
              style={{ display: 'none' }}
            />
          </label>
          <p className="photo-hint">JPG, PNG ou GIF (máx. 5MB)</p>
        </div>

        {/* Right Column - Form */}
        <div className="profile-form-section">
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Nome Completo *</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Seu nome completo"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio Profissional</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Conte sobre sua experiência e especialidades..."
                rows="4"
                className="form-textarea"
              />
              <p className="form-hint">
                Esta bio aparecerá no seu perfil público para arquitetos
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Localização</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="Cidade, Estado"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Website / Portfólio Online</label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                placeholder="https://seusite.com"
                className="form-input"
              />
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile;