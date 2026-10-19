import React, { useState } from 'react';
import { X, Sparkles, Clock, DollarSign, Tag, Image as ImageIcon, Upload, Trash2, Check } from 'lucide-react';
import type { Service, ServiceCategory } from '../types';
import { NAIL_PHOTO_PRESETS } from '../utils/nailPresets';

interface NewServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Service) => void;
  initialData?: Service | null;
}

const CATEGORIES: ServiceCategory[] = [
  'Alongamento',
  'Manutenção',
  'Esmaltação & Gel',
  'Mãos & Pés',
  'SPA & Tratamentos',
  'Nail Art'
];

export const NewServiceModal: React.FC<NewServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<ServiceCategory>(initialData?.category || 'Alongamento');
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : '120');
  const [durationMinutes, setDurationMinutes] = useState(initialData?.durationMinutes ? String(initialData.durationMinutes) : '90');
  const [description, setDescription] = useState(initialData?.description || '');
  const [badge, setBadge] = useState<string>(initialData?.badge || '');
  const [imageUrl, setImageUrl] = useState<string>(initialData?.imageUrl || '');
  const [showPresets, setShowPresets] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const service: Service = {
      id: initialData?.id || 'srv-' + Date.now(),
      name,
      category,
      price: parseFloat(price) || 0,
      durationMinutes: parseInt(durationMinutes) || 60,
      description,
      badge: badge ? (badge as Service['badge']) : undefined,
      imageUrl: imageUrl.trim() || undefined
    };

    onSave(service);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'var(--accent-gold-light)', padding: '0.5rem', borderRadius: '10px', color: 'var(--accent-gold)' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3>{initialData ? 'Editar Serviço' : 'Novo Serviço no Catálogo'}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Defina fotos, valores e tempos do procedimento</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Foto do Serviço */}
            <div className="form-group">
              <label className="form-label">
                <ImageIcon size={16} /> Foto do Procedimento / Unha
              </label>

              {imageUrl ? (
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '180px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1.5px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <img
                    src={imageUrl}
                    alt="Pré-visualização"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="btn btn-danger-outline"
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      padding: '0.4rem 0.65rem',
                      fontSize: '0.75rem',
                      borderRadius: '6px'
                    }}
                  >
                    <Trash2 size={13} /> Remover Foto
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  background: 'var(--surface-alt)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px dashed var(--border-color)'
                }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {/* Botão de Upload Local */}
                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.55rem 0.85rem',
                      background: 'var(--surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--primary)'
                    }}>
                      <Upload size={15} /> Escolher Foto do Aparelho
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                    </label>

                    {/* Botão da Galeria Pronta */}
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowPresets(!showPresets)}
                      style={{ fontSize: '0.825rem', padding: '0.55rem 0.85rem' }}
                    >
                      <Sparkles size={14} color="var(--accent-gold)" />
                      <span>{showPresets ? 'Fechar Galeria' : 'Escolher da Galeria de Unhas'}</span>
                    </button>
                  </div>

                  {/* Input de URL direta */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="url"
                      placeholder="Ou cole a URL da imagem (https://...)"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      style={{ fontSize: '0.825rem', padding: '0.45rem 0.75rem' }}
                    />
                  </div>

                  {/* Galeria de Fotos Prontas */}
                  {showPresets && (
                    <div style={{
                      marginTop: '0.5rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '0.5rem'
                    }}>
                      {NAIL_PHOTO_PRESETS.map(preset => (
                        <div
                          key={preset.id}
                          onClick={() => {
                            setImageUrl(preset.url);
                            setShowPresets(false);
                          }}
                          style={{
                            cursor: 'pointer',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1.5px solid var(--border-color)',
                            position: 'relative',
                            height: '75px',
                            transition: 'all 0.15s ease'
                          }}
                          title={preset.name}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            fontSize: '0.65rem',
                            padding: '2px 4px',
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {preset.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Nome do Serviço / Procedimento</label>
              <input
                type="text"
                placeholder="Ex: Banho de Gel com Francesinha"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Categoria</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as ServiceCategory)}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Tag size={15} /> Selo de Destaque
                </label>
                <select
                  value={badge}
                  onChange={e => setBadge(e.target.value)}
                >
                  <option value="">Nenhum</option>
                  <option value="Mais Pedido">Mais Pedido 🔥</option>
                  <option value="Tendência">Tendência ✨</option>
                  <option value="Especial">Especial ⭐</option>
                  <option value="Novo">Novo 🌟</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <DollarSign size={15} /> Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Clock size={15} /> Duração (em minutos)
                </label>
                <input
                  type="number"
                  step="5"
                  min="15"
                  placeholder="60"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descrição do Procedimento</label>
              <textarea
                rows={2}
                placeholder="Explique o que está incluso, benefícios e durabilidade estimada..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} /> Salvar Serviço
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
