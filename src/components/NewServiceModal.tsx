import React, { useState } from 'react';
import { X, Sparkles, Clock, DollarSign, Tag } from 'lucide-react';
import type { Service, ServiceCategory } from '../types';

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

  if (!isOpen) return null;

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
      badge: badge ? (badge as Service['badge']) : undefined
    };

    onSave(service);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'var(--accent-gold-light)', padding: '0.5rem', borderRadius: '10px', color: 'var(--accent-gold)' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3>{initialData ? 'Editar Serviço' : 'Novo Serviço no Catálogo'}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Defina o valor, tempo de cabine e detalhes do procedimento</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
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
                rows={3}
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
              Salvar Serviço
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
